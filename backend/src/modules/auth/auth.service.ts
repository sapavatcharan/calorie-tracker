import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Conflict, Unauthorized } from '../../core/errors';
import { config } from '../../config';
import type { z } from 'zod';
import type { loginBody, registerBody } from './auth.schema';

const publicUser = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

function signToken(userId: string) {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as SignOptions);
}

export const authService = {
  register: async (data: z.infer<typeof registerBody>) => {
    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw Conflict('Email already registered');

    const password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email, password, name: data.name },
      select: publicUser,
    });
    return { token: signToken(user.id), user };
  },

  login: async (data: z.infer<typeof loginBody>) => {
    const email = data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Unauthorized('Invalid email or password');

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) throw Unauthorized('Invalid email or password');

    const { password: _pw, ...safe } = user;
    return { token: signToken(user.id), user: safe };
  },

  me: async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUser });
    if (!user) throw Unauthorized('User not found');
    return { user };
  },
};
