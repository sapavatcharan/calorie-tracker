import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { goalController } from './goals.controller';
import { createGoalBody, updateGoalBody, listGoalsQuery, idParam } from './goals.schema';

const r = Router();
r.use(authenticate);
r.post('/', validate({ body: createGoalBody }), goalController.create);
r.get('/', validate({ query: listGoalsQuery }), goalController.list);
r.get('/current', goalController.current);
r.patch('/:id', validate({ params: idParam, body: updateGoalBody }), goalController.update);
r.delete('/:id', validate({ params: idParam }), goalController.remove);
export default r;
