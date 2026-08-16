import 'dotenv/config';
import { z } from 'zod';

export const DEFAULT_GEMINI_CHAT_MODELS =
  'gemini-flash-lite-latest,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-latest,gemini-3.5-flash';
export const DEFAULT_GEMINI_VISION_MODELS =
  'gemini-flash-lite-latest,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-latest,gemini-3.5-flash';

export function parseModelList(value: unknown, fallback: string): string[] {
  const raw = typeof value === 'string' && value.trim() ? value : fallback;
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5050),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_CHAT_MODELS: z.preprocess(
    (v) => parseModelList(v, DEFAULT_GEMINI_CHAT_MODELS),
    z.array(z.string().min(1)).min(1),
  ),
  GEMINI_VISION_MODELS: z.preprocess(
    (v) => parseModelList(v, DEFAULT_GEMINI_VISION_MODELS),
    z.array(z.string().min(1)).min(1),
  ),
  GEMINI_API_VERSION: z.string().min(1).default('v1beta'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`);
  process.exit(1);
}
export const config = parsed.data;
export const isProd = config.NODE_ENV === 'production';
