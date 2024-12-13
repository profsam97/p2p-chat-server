
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export class MessageController {
  static async fetchMessages(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
      // the func responsible for handling request to fetch messages 

    try {
        const { contactId } = req.params;
        const userId = req.user?.userId;
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId, recipientId: contactId },
              { senderId: contactId, recipientId: userId }
            ]
          },
          orderBy: { createdAt: 'asc' }
        });
        return res.json(messages);

      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
  }
  static async unreadMessage(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
          // the func responsible for handling request to fetch unread messages 

    try {
        const userId = req.user?.userId;
      const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'],
        where: {
          recipientId: userId,
          read: false
        },
       _count : {
         id: true
       }
      });
   const countsMap = unreadCounts.reduce((acc, curr) => {
        acc[curr.senderId] = curr._count.id;
        return acc;
      }, {} as Record<string, number>);

    return   res.json(countsMap);
    }
     catch (error) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
  }
}