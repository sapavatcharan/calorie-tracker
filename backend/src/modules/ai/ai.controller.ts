import { asyncHandler } from '../../core/asyncHandler';
import { BadRequest } from '../../core/errors';
import { logger } from '../../core/logger';
import { cloudinaryService } from './cloudinary.service';
import { extractNutritionFromBuffer, extractNutritionFromImage } from './gemini.service';
import type { z } from 'zod';
import type { extractNutritionBody } from './ai.schema';

export const aiController = {
  uploadImage: asyncHandler(async (req, res) => {
    if (!req.file) throw BadRequest('Image file is required');
    const nutrition = await extractNutritionFromBuffer(req.file.buffer, req.file.mimetype);
    let url: string | undefined;
    try {
      ({ url } = await cloudinaryService.uploadImage(req.file));
    } catch (err) {
      logger.error('Cloudinary upload failed; returning extraction without stored URL', err);
    }
    res.json({ url, ...nutrition });
  }),
  extractNutrition: asyncHandler(async (req, res) => {
    if (req.file) {
      res.json(await extractNutritionFromBuffer(req.file.buffer, req.file.mimetype));
      return;
    }
    const imageUrl = (req.validated.body as z.infer<typeof extractNutritionBody>).imageUrl;
    res.json(await extractNutritionFromImage(imageUrl));
  }),
};
