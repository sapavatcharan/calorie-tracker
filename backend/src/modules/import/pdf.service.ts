import { PDFParse } from 'pdf-parse';
import { AppError, BadRequest } from '../../core/errors';

export async function extractTextFromPdf(file?: Express.Multer.File) {
  if (!file) throw BadRequest('PDF file is required');
  const parser = new PDFParse({ data: file.buffer });
  try {
    const result = await parser.getText();
    if (!result.text?.trim()) throw new AppError(422, 'Could not extract text from PDF', 'UNPROCESSABLE');
    return result.text;
  } finally {
    await parser.destroy();
  }
}
