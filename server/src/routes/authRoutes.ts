import { Router } from 'express';
import { authController, loginSchema } from '../controllers/authController';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

export default router;
