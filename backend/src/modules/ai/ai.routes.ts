import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { AppError } from '../../core/errors';
import { aiController } from './ai.controller';
import { extractNutritionBody } from './ai.schema';

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new AppError(400, 'Only image uploads are allowed', 'BAD_REQUEST'));
  },
});

const extract = Router();
extract.use(authenticate);
extract.post(
  '/extract-nutrition',
  imageUpload.single('image'),
  (req, res, next) => {
    if (req.file) return next();
    return validate({ body: extractNutritionBody })(req, res, next);
  },
  aiController.extractNutrition,
);

export const uploadRoutes = Router();
uploadRoutes.use(authenticate);
uploadRoutes.post('/image', imageUpload.single('image'), aiController.uploadImage);

export default extract;
