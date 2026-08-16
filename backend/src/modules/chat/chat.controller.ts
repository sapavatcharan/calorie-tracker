import { asyncHandler } from '../../core/asyncHandler';
import { chatService } from './chat.service';
import type { z } from 'zod';
import type { listHistoryQuery, messageBody } from './chat.schema';

export const chatController = {
  message: asyncHandler(async (req, res) => {
    const { message } = req.validated.body as z.infer<typeof messageBody>;
    res.json({ reply: await chatService.handleMessage(req.userId!, message) });
  }),
  history: asyncHandler(async (req, res) =>
    res.json(await chatService.listHistory(req.userId!, req.validated.query as z.infer<typeof listHistoryQuery>)),
  ),
  clear: asyncHandler(async (req, res) => {
    await chatService.clearHistory(req.userId!);
    res.status(204).send();
  }),
  remove: asyncHandler(async (req, res) => {
    await chatService.remove(req.userId!, (req.validated.params as { id: string }).id);
    res.status(204).send();
  }),
};
