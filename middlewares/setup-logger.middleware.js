import Logger from 'pino';
import { randomUUID } from 'crypto';

// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const loggerOptions = {
  level: process.env.PINO_LOG_LEVEL
};

const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  loggerOptions.base = {};
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  }
}

const logger = Logger(
  loggerOptions,
  // Logger.destination(`${__dirname}/combined.log`)
  );

export const setupLoggerMiddleware = () => (ctx, next) => {
  ctx.logger = logger.child({
    // requestId: randomUUID(),
  });
  next();
};
