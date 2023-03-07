import * as config from '../config.js';
import Logger, { Logger as LoggerType } from 'pino';
import { randomUUID } from 'crypto';
import { Context, Middleware } from 'telegraf';
// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const loggerOptions: Logger.LoggerOptions = {
  level: process.env.PINO_LOG_LEVEL,
};

if (config.isDevelopment) {
  loggerOptions.base = {};
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

const logger = Logger(
  loggerOptions,
  // Logger.destination(`${__dirname}/combined.log`)
);

declare module 'telegraf' {
  interface Context {
    logger: LoggerType;
  }
}

export const setupLoggerMiddleware: () => Middleware<Context> = () => (ctx, next) => {
  ctx.logger = logger.child({
    requestId: randomUUID(),
  });
  next();
};
