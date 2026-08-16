import { describe, expect, it } from 'vitest';
import { parseModelList } from '../config';
import { AppError } from '../core/errors';
import { AI_BUSY_MESSAGE, retryDelayMs, withModelFallback } from '../core/geminiFallback';

function quota(message = '[429 Too Many Requests] quota exceeded') {
  const err = new Error(message) as Error & { status: number };
  err.status = 429;
  return err;
}

function missing(model: string) {
  const err = new Error(`This model models/${model} is no longer available`) as Error & { status: number };
  err.status = 404;
  return err;
}

describe('parseModelList', () => {
  it('trims, drops blanks, and uses fallback when empty', () => {
    expect(parseModelList('  a, ,b , ', 'x,y')).toEqual(['a', 'b']);
    expect(parseModelList('  ', 'one, two')).toEqual(['one', 'two']);
    expect(parseModelList(undefined, 'lite,flash')).toEqual(['lite', 'flash']);
  });
});

describe('withModelFallback', () => {
  it('skips models 1 and 2 on 429 and succeeds on 3', async () => {
    const tried: string[] = [];
    const result = await withModelFallback(['m1', 'm2', 'm3'], async (model) => {
      tried.push(model);
      if (model !== 'm3') throw quota();
      return `ok:${model}`;
    });
    expect(result).toBe('ok:m3');
    expect(tried).toEqual(['m1', 'm2', 'm3']);
  });

  it('throws 429 with the friendly message when every model is exhausted', async () => {
    await expect(
      withModelFallback(['a', 'b'], async () => {
        throw quota();
      }),
    ).rejects.toMatchObject({ statusCode: 429, message: AI_BUSY_MESSAGE });
  });

  it('skips an invalid model name and is not fatal', async () => {
    const result = await withModelFallback(['bogus', 'good'], async (model) => {
      if (model === 'bogus') throw missing('bogus');
      return 'served';
    });
    expect(result).toBe('served');
  });

  it('caps RetryInfo delay', () => {
    const err = quota() as Error & { errorDetails: { retryDelay: string }[] };
    err.errorDetails = [{ retryDelay: '54s' }];
    expect(retryDelayMs(err)).toBe(2000);
  });
});

describe('AppError 429', () => {
  it('is an AppError', () => {
    const err = new AppError(429, AI_BUSY_MESSAGE, 'RATE_LIMITED');
    expect(err).toBeInstanceOf(AppError);
  });
});
