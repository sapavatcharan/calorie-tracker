import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { weightController } from './weight.controller';
import { createWeightBody, listWeightQuery, idParam } from './weight.schema';

const r = Router();
r.use(authenticate);
r.post('/', validate({ body: createWeightBody }), weightController.create);
r.get('/', validate({ query: listWeightQuery }), weightController.list);
r.delete('/:id', validate({ params: idParam }), weightController.remove);
export default r;
