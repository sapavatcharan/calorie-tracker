import { v2 as cloudinary } from 'cloudinary';
import { AppError, BadRequest } from '../../core/errors';
import { config } from '../../config';

function ensureConfigured() {
  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    throw new AppError(503, 'Cloudinary is not configured', 'CLOUDINARY_UNAVAILABLE');
  }
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
}

export const cloudinaryService = {
  uploadImage: async (file?: Express.Multer.File) => {
    if (!file) throw BadRequest('Image file is required');
    ensureConfigured();

    const url = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'calorie-tracker' }, (err, result) => {
        if (err || !result?.secure_url) {
          const reason = err instanceof Error ? err.message : 'no secure_url returned';
          reject(new AppError(502, `Cloudinary upload failed: ${reason}`, 'UPLOAD_FAILED'));
          return;
        }
        resolve(result.secure_url);
      });
      stream.end(file.buffer);
    });

    return { url };
  },
};
