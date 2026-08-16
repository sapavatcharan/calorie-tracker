import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { authController } from './auth.controller';
import { loginBody, registerBody } from './auth.schema';

const r = Router();
r.post('/register', validate({ body: registerBody }), authController.register);
r.post('/login', validate({ body: loginBody }), authController.login);
r.get('/me', authenticate, authController.me);
export default r;
