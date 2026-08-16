import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { AppError } from '../../core/errors';
import { importController } from './import.controller';
import { confirmImportBody } from './import.schema';

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new AppError(400, 'Only PDF uploads are allowed', 'BAD_REQUEST'));
  },
});

const r = Router();
r.use(authenticate);
r.post('/pdf', pdfUpload.single('pdf'), importController.preview);
r.post('/pdf/confirm', validate({ body: confirmImportBody }), importController.confirm);
export default r;
