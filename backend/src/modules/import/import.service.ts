import { prisma } from '../../lib/prisma';
import { extractTextFromPdf } from './pdf.service';
import { extractMealsFromPdfText } from '../ai/gemini.service';
import type { z } from 'zod';
import type { confirmImportBody } from './import.schema';

export const importService = {
  preview: async (file?: Express.Multer.File) => {
    const text = await extractTextFromPdf(file);
    const meals = await extractMealsFromPdfText(text);
    return { preview: meals };
  },

  confirm: async (userId: string, meals: z.infer<typeof confirmImportBody>['meals']) => {
    const created = await prisma.$transaction(
      meals.map((meal) => prisma.mealEntry.create({ data: { ...meal, userId } })),
    );
    return { imported: created.length };
  },
};
