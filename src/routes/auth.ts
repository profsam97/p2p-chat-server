
import { Router } from 'express';
import { AuthController } from '../Controllers/auth';
import { validateAuthPayload } from '../Middlewares/auth';

const router = Router();
// routes for auth
router.post('/signup',
  validateAuthPayload ,
  AuthController.signup as any
);

router.post('/login',
  validateAuthPayload as any,
  AuthController.login as any
);

export default router;