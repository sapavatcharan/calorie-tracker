import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config';
import { AppError } from '../../core/errors';
import { withModelFallback } from '../../core/geminiFallback';
import { NutritionSchema } from './ai.schema';
import { MealsArraySchema } from '../import/import.schema';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

const PROMPT = `Analyze the image (a nutrition label or a plate of food) and return ONLY JSON:
{"foodName":string,"calories":number,"protein"?:number,"carbs"?:number,"fat"?:number,"quantity"?:number,"micronutrients":{<name>:number}}
Rules: numbers not strings; omit unknown optional fields; micronutrients only if visible (empty object if none); for a plate with no label, estimate calories. No markdown, no prose.`;

const PDF_PROMPT = `Extract meals from this document text. Return ONLY a JSON array of objects:
[{"foodName":string,"mealType":"BREAKFAST"|"LUNCH"|"DINNER"|"SNACKS","quantity":number,"calories":number,"protein"?:number,"carbs"?:number,"fat"?:number,"micronutrients"?:{<name>:number}}]
Rules: numbers not strings; mealType must be one of those four; omit unknown optional fields. No markdown, no prose.`;

const FETCH_UA = 'CalorieTracker/1.0 (nutrition extraction; +http://localhost)';
const FETCH_URL_FAILED = "Couldn't fetch that image URL — try uploading the file instead";

function parseJsonOutput(text: string): unknown {
  const stripped = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    throw new AppError(422, 'AI returned unparseable output', 'UNPROCESSABLE');
  }
}

async function generateJsonContent(
  parts: string | Array<string | { inlineData: { data: string; mimeType: string } }>,
) {
  return withModelFallback(config.GEMINI_VISION_MODELS, async (modelName) => {
    const model = genAI.getGenerativeModel(
      {
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      },
      { apiVersion: config.GEMINI_API_VERSION },
    );
    return model.generateContent(parts);
  });
}

async function extractNutritionFromInline(data: string, mimeType: string) {
  const mime = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  const result = await generateJsonContent([PROMPT, { inlineData: { data, mimeType: mime } }]);
  const text = result.response.text();

  const raw = parseJsonOutput(text);
  const parsed = NutritionSchema.safeParse(raw);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new AppError(422, `AI output missing required fields (${detail})`, 'UNPROCESSABLE');
  }
  return parsed.data;
}

export async function extractNutritionFromBuffer(buffer: Buffer, mimeType = 'image/jpeg') {
  return extractNutritionFromInline(buffer.toString('base64'), mimeType);
}

function fetchUrlFailed() {
  return new AppError(422, FETCH_URL_FAILED, 'UNPROCESSABLE');
}

export async function extractNutritionFromImage(imageUrl: string) {
  let res: Response;
  try {
    res = await fetch(imageUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': FETCH_UA,
        Accept: 'image/*,*/*;q=0.8',
      },
    });
  } catch {
    throw fetchUrlFailed();
  }
  if (!res.ok) throw fetchUrlFailed();
  const mimeType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';
  if (!mimeType.startsWith('image/')) throw fetchUrlFailed();
  const b64 = Buffer.from(await res.arrayBuffer()).toString('base64');
  return extractNutritionFromInline(b64, mimeType);
}

export async function extractMealsFromPdfText(text: string) {
  const result = await generateJsonContent(`${PDF_PROMPT}\n\n${text}`);
  const rawText = result.response.text();
  const raw = parseJsonOutput(rawText);
  const parsed = MealsArraySchema.safeParse(raw);
  if (!parsed.success) throw new AppError(422, 'AI output missing required fields', 'UNPROCESSABLE');
  return parsed.data;
}
