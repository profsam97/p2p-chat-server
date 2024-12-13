import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contact';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import messageRoutes from './routes/message';

import { SocketService } from './services/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);
app.use('/api/users', userRoutes);
new SocketService(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});