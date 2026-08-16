import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { mealController } from './meals.controller';
import { createMealBody, updateMealBody, listMealsQuery, idParam } from './meals.schema';

const r = Router();
r.use(authenticate);
r.post('/', validate({ body: createMealBody }), mealController.create);
r.get('/', validate({ query: listMealsQuery }), mealController.list);
r.get('/:id', validate({ params: idParam }), mealController.get);
r.patch('/:id', validate({ params: idParam, body: updateMealBody }), mealController.update);
r.delete('/:id', validate({ params: idParam }), mealController.remove);
export default r;
