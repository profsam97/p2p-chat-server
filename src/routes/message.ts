
import { MessageController } from '../Controllers/message';
import { authenticateToken } from '../Middlewares/auth';
import {Router} from "express";

const router = Router();

// routes for messages
router.get('/messages/:contactId',
  authenticateToken ,
  MessageController.fetchMessages as any
);

router.get('/messages',
  authenticateToken,
  MessageController.unreadMessage as any
)
export default router;