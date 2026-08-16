import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { NotFound } from './core/errors';
import { config } from './config';
import authRoutes from './modules/auth/auth.routes';
import mealRoutes from './modules/meals/meals.routes';
import goalRoutes from './modules/goals/goals.routes';
import weightRoutes from './modules/weight/weight.routes';
import reportRoutes from './modules/reports/reports.routes';
import aiRoutes, { uploadRoutes } from './modules/ai/ai.routes';
import chatRoutes from './modules/chat/chat.routes';
import importRoutes from './modules/import/import.routes';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL ?? true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const aiLimiter = rateLimit({ windowMs: 60_000, max: 20 });
app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 30 }), authRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/import', importRoutes);

app.use((_req, _res, next) => next(NotFound('Route not found')));
app.use(errorHandler);

export default app;
