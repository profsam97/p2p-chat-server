import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { DirectMessageData, SocketData } from '../types';
import { PrismaClient } from '@prisma/client';
import { ContactController } from '../Controllers/contact';
const prisma = new PrismaClient();

// Store offline messages in memory
const offlineMessages = new Map<string, any[]>();

export class SocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.handleConnection();
  }

  private handleConnection() {
    this.io.on('connection', (socket: Socket) => {
      let userId: string | null = null;

      socket.on('authenticate', async (token: string) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SocketData;
          userId = decoded.userId;

          // Update user's online status
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true }
          });

          // Join personal room
          socket.join(`user:${userId}`);

          // Send stored offline messages
          const storedMessages = offlineMessages.get(userId) || [];
          if (storedMessages.length > 0) {
            socket.emit('offline-messages', storedMessages);
            offlineMessages.delete(userId);
          }
          console.log('works')
          // Broadcast online status
          this.io.emit('user-status-change', { userId, isOnline: true });
        } catch (error) {
          socket.emit('auth-error', 'Invalid token');
        }
      });

      socket.on('direct-message', async (data: DirectMessageData) => {
        try {
          if (!userId) {
            socket.emit('error', 'Not authenticated');
            return;
          }

          const { recipientId, content } = data;

          // Save message
          const message = await prisma.message.create({
            data: {
              content,
              senderId: userId,
              recipientId,
              read: false
            }
          });
          // checks if contact already exists 
         await  ContactController.checkIfContactExistAndAddToContacts(recipientId, userId)


         await prisma.contact.updateMany({
          where: {
            OR: [
              { userId, contactId: recipientId },
              { userId: recipientId, contactId: userId }
            ]
          },
          data: {
            lastMessage: content,
            lastMessageAt: new Date()
          }
        });
          // Check if recipient is online
          const recipientSocket = this.io.sockets.adapter.rooms.get(`user:${recipientId}`);

          if (recipientSocket) {
            console.log('online')
            // Send message directly to recipient
            this.io.to(`user:${recipientId}`).emit('new-message', message);

            // Send message back to sender for confirmation
            socket.emit('new-message', message);
          } else {
            // Store offline message
            if (!offlineMessages.has(recipientId)) {
              offlineMessages.set(recipientId, []);
            }
            offlineMessages.get(recipientId)?.push(message);

            // Send message back to sender
            socket.emit('new-message', message);
          }
        } catch (error) {
          console.error('Message sending error:', error);
          socket.emit('error', 'Failed to send message');
        }
      });
       // Add new event handler for marking messages as read
       socket.on('mark-messages-read', async (contactId: string) => {
        try {
          if (!userId) return;

          // Update all unread messages from this contact to read
          await prisma.message.updateMany({
            where: {
              senderId: contactId,
              recipientId: userId,
              read: false
            },
            data: { read: true }
          });

          // Emit event to update UI
          socket.emit('messages-marked-read', contactId);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      socket.on('disconnect', async () => {
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false }
          });

          this.io.emit('user-status-change', { userId, isOnline: false });
        }
      });
    });
  }
}