
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, SearchQuery } from '../types';

const prisma = new PrismaClient();

export class UserController {
  // the func responsible for handling request to search for users
  static async searchUsers(
    req: AuthRequest & { query: SearchQuery },
    res: Response
  ): Promise<Response> {
    try {
      const searchQuery = req.query.query;
      const userId = req.user?.userId;

      if (!searchQuery) {
        return res.status(400).json({ error: 'Invalid search query' });
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: searchQuery } },
            { mobile: { contains: searchQuery } },
            { name: { contains: searchQuery } }
          ],
          NOT: {
            id: userId
          }
        },
        select: {
          id: true,
          email: true,
          mobile: true,
          name: true,
          isOnline: true
        }
      });
      return res.json(users);
    } catch (error) {
      console.error('Search users error:', error);
      return res.status(500).json({ error: 'Failed to search users' });
    }
  }
}