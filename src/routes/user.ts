
import { UserController } from '../Controllers/user';
import { authenticateToken } from '../Middlewares/auth';
import {Router} from "express";

const router = Router();
// routes for user
router.get('/search',
  authenticateToken ,
  UserController.searchUsers as any
);

export default router;