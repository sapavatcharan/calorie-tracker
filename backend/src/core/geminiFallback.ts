import { AppError, TooManyRequests } from './errors';
import { logger } from './logger';

export const AI_BUSY_MESSAGE = 'The AI is busy right now — please try again in a minute.';

const MAX_RETRY_WAIT_MS = 2_000;

function errText(err: unknown): string {
  if (err instanceof Error) return `${err.message} ${err.name}`;
  return String(err);
}

function errStatus(err: unknown): number | undefined {
  const status = (err as { status?: number; statusCode?: number })?.status ?? (err as { statusCode?: number })?.statusCode;
  return typeof status === 'number' ? status : undefined;
}

export function isInvalidModelError(err: unknown): boolean {
  const status = errStatus(err);
  const text = errText(err).toLowerCase();
  if (status === 404) return true;
  return (
    text.includes('not found') ||
    text.includes('no longer available') ||
    text.includes('is not found') ||
    text.includes('unknown model') ||
    text.includes('invalid model') ||
    text.includes('invalid argument')
  );
}

export function isRetryableGeminiError(err: unknown): boolean {
  if (err instanceof AppError && err.statusCode === 429) return true;
  const status = errStatus(err);
  const text = errText(err).toLowerCase();
  if (status === 429) return true;
  if (isInvalidModelError(err)) return true;
  return (
    text.includes('too many requests') ||
    text.includes('resource_exhausted') ||
    text.includes('quota') ||
    text.includes('rate-limit') ||
    text.includes('rate limit') ||
    text.includes('resource exhausted')
  );
}

export function retryDelayMs(err: unknown): number {
  const details = (err as { errorDetails?: { retryDelay?: string }[] })?.errorDetails ?? [];
  const fromDetail = details.map((d) => d.retryDelay).find((d) => d);
  const message = errText(err);
  const match = /retry in ([\d.]+)\s*(ms|s)/i.exec(message);
  const raw = fromDetail ?? (match ? `${match[1]}${match[2]}` : undefined);
  if (!raw) return 0;
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const ms = raw.toLowerCase().includes('ms') ? n : n * 1000;
  return Math.min(MAX_RETRY_WAIT_MS, Math.max(0, ms));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withModelFallback<T>(models: string[], run: (model: string) => Promise<T>): Promise<T> {
  const chain = models.map((m) => m.trim()).filter(Boolean);
  if (chain.length === 0) throw TooManyRequests(AI_BUSY_MESSAGE);

  for (const model of chain) {
    try {
      const result = await run(model);
      logger.info(`gemini served model=${model}`);
      return result;
    } catch (err) {
      if (isInvalidModelError(err)) {
        logger.warn(`gemini skip invalid model=${model}`);
        continue;
      }
      if (isRetryableGeminiError(err)) {
        const wait = retryDelayMs(err);
        logger.warn(`gemini fallback model=${model} waitMs=${wait}`);
        if (wait > 0) await sleep(wait);
        continue;
      }
      throw err;
    }
  }

  throw TooManyRequests(AI_BUSY_MESSAGE);
}
