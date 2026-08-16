import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { chatController } from './chat.controller';
import { idParam, listHistoryQuery, messageBody } from './chat.schema';

const r = Router();
r.use(authenticate);
r.post('/message', validate({ body: messageBody }), chatController.message);
r.get('/history', validate({ query: listHistoryQuery }), chatController.history);
r.delete('/history', chatController.clear);
r.delete('/history/:id', validate({ params: idParam }), chatController.remove);
export default r;
