
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export class ContactController {
  static async fetchContacts(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
                  // the func responsible for handling request to fetch contacts for a user 
            try {
                const userId = req.user?.userId
              // Fetch contacts with their user details
              const contacts = await prisma.contact.findMany({
                where: { userId },
                include: {
                  contact: {
                    select: {
                      id: true,
                      email: true,
                      mobile: true,
                      name: true,
                      isOnline: true
                    }
                  }
                },

                orderBy: [
                  { lastMessageAt: 'desc' },
                {   createdAt: 'desc'}
              ]
              })

              // Transform the result to match the Contact interface
              const formattedContacts = contacts.map(contact => ({
                id: contact.contact.id,
                email: contact.contact.email,
                isOnline: contact.contact.isOnline,
                mobile: contact.contact.mobile,
                name: contact.contact.name,
                lastMessage: contact.lastMessage,
                timestamp: contact.lastMessageAt?.toLocaleTimeString(),
              }))

             return res.status(200).json(formattedContacts)
            } catch (error) {
              return res.status(500).json({ error: 'Failed to fetch contacts' })
            }

    }
    static async AddContact(
        req: AuthRequest,
        res: Response
      ): Promise<Response> {
              // the func responsible for handling request to add contact for a user 

        try {
            const userId = req.user?.userId
          const { contactId } = req.body

          // Prevent adding self as contact
          if (contactId === userId) {
            return res.status(400).json({ error: 'Cannot add yourself as a contact' })
          }

          // Check if contact already exists
          const existingContact = await prisma.contact.findUnique({
            where: {
              userId_contactId: {
                userId: userId as string,
                contactId
              }
            }
          })

          if (existingContact) {
            return res.status(200).json({ message: 'Contact already exists' })
          }

          // Create new contact
          const newContact = await prisma.contact.create({
            data: {
              userId: userId as string,
              contactId
            },
            include: {
              contact: {
                select: {
                  id: true,
                  email: true,
                  mobile: true,
                  name: true,
                  isOnline: true
                }
              }
            }
          })

        return   res.status(201).json({
            id: newContact.contact.id,
            email: newContact.contact.email,
            name: newContact.contact.name,
            isOnline: newContact.contact.isOnline,
            mobile: newContact.contact.mobile
          })
        } catch (error) {
         return  res.status(500).json({ error: 'Failed to add contact' })

        }
      }
      static async checkIfContactExistAndAddToContacts(userId: string, contactId: string) {
        try {
          const existingContact = await prisma.contact.findUnique({
            where: {
              userId_contactId: {
                userId: userId as string,
                contactId
              }
            }
          })
          if(existingContact) {
            return
          }
  
          // Create new contact
        await prisma.contact.create({
            data: {
              userId: userId as string,
              contactId
            },
            include: {
              contact: {
                select: {
                  id: true,
                  email: true,
                  mobile: true,
                  name: true,
                  isOnline: true
                }
              }
            }
          })
        } catch (error) {
            console.log(error)
        }
      
      }
}
