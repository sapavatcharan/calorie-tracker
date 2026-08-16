import { asyncHandler } from '../../core/asyncHandler';
import { authService } from './auth.service';
import type { z } from 'zod';
import type { loginBody, registerBody } from './auth.schema';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const body = req.validated.body as z.infer<typeof registerBody>;
    res.status(201).json(await authService.register(body));
  }),
  login: asyncHandler(async (req, res) => {
    const body = req.validated.body as z.infer<typeof loginBody>;
    res.json(await authService.login(body));
  }),
  me: asyncHandler(async (req, res) => {
    res.json(await authService.me(req.userId!));
  }),
};
