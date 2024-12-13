
import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  mobile: string;
  password: string;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  createdAt: Date;
}

// Extend Express Request type properly
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignupDTO extends LoginDTO {
  mobile: string;
  fullname: string;
}

export interface SocketData {
  userId: string;
}

export interface DirectMessageData {
  recipientId: string;
  content: string;
}

// Custom request query interface
export interface SearchQuery {
  query?: string;
}