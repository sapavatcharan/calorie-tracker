import { asyncHandler } from '../../core/asyncHandler';
import { importService } from './import.service';
import type { z } from 'zod';
import type { confirmImportBody } from './import.schema';

export const importController = {
  preview: asyncHandler(async (req, res) => res.json(await importService.preview(req.file))),
  confirm: asyncHandler(async (req, res) =>
    res.status(201).json(await importService.confirm(req.userId!, (req.validated.body as z.infer<typeof confirmImportBody>).meals)),
  ),
};
