
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginDTO, SignupDTO } from '../types';

const prisma = new PrismaClient();

export class AuthController {
  static async signup(
    req: Request<{}, {}, SignupDTO>,
    res: Response
  ): Promise<Response> {
                  // the func responsible for handling request to sign up a new user
    try {
      const { email, mobile, password , fullname} = req.body;

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { mobile }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          mobile,
          name: fullname,
          password: hashedPassword,
          isOnline: false
        }
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return res.status(201).json({ token, id : user.id, email: user.email });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  static async login(
    req: Request<{}, {}, LoginDTO>,
    res: Response
  ): Promise<Response> {
    // the func responsible for handling request to login in an existing user
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return res.json({ token, id: user.id });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Failed to login' });
    }
  }
}