
import { Router } from 'express';
import { authenticateToken } from '../Middlewares/auth';
import {ContactController} from "../Controllers/contact";

const router = Router();
// routes for contacts

router.get('/fetch',
  authenticateToken ,
  ContactController.fetchContacts as any
);

router.post('/add',
    authenticateToken as any,
  ContactController.AddContact as any
);

export  default router