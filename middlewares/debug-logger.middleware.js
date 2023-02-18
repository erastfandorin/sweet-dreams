import updateLogger from 'telegraf-update-logger';
const isDevelopment = process.env.NODE_ENV === "development";

export const debugLoggerMiddleware = options => (ctx, next) => {

  ctx.logger.trace({
    msg: 'update received',
    update: ctx.update,
  });


  return updateLogger({
    log: msg =>
      ctx.logger.debug({
        msg,
      }),
    colors: isDevelopment,
    ...options,
  })(ctx, next);
};
