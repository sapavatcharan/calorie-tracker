import { isProd } from '../config';

export const logger = {
  info: (...a: unknown[]) => {
    if (!isProd) console.warn('[info]', ...a);
  },
  warn: (...a: unknown[]) => console.warn('[warn]', ...a),
  error: (...a: unknown[]) => console.error('[error]', ...a),
};
