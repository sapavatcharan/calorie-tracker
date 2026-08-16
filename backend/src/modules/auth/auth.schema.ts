import { z } from 'zod';

export const registerBody = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
});

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
