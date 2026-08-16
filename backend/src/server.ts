import app from './app';
import { config } from './config';
import { logger } from './core/logger';

app.listen(config.PORT, () => {
  logger.info(
    `API on :${config.PORT} geminiApi=${config.GEMINI_API_VERSION} geminiChat=${config.GEMINI_CHAT_MODELS.join(',')} geminiVision=${config.GEMINI_VISION_MODELS.join(',')}`,
  );
});
