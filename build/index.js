"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const config = __importStar(require("./config.js"));
const express_1 = __importDefault(require("express"));
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
// import LocalSession from 'telegraf-session-local';
const commands = __importStar(require("./commands/commands.js"));
const setup_logger_middleware_js_1 = require("./middlewares/setup-logger.middleware.js");
const debug_logger_middleware_js_1 = require("./middlewares/debug-logger.middleware.js");
process.once('SIGINT', () => exports.bot.stop('SIGINT'));
process.once('SIGTERM', () => exports.bot.stop('SIGTERM'));
// process.on("uncaughtException", (error) => logger.error(error));
const app = (0, express_1.default)();
exports.bot = new telegraf_1.Telegraf(String(process.env.TELEGRAM_API_TOKEN), {
    telegram: { webhookReply: false },
});
// bot.use(new LocalSession({ database: '/tmp/db.json' }).middleware());
exports.bot.use((0, telegraf_1.session)({ defaultSession: () => ({ ...config.defaultSession }) }));
exports.bot.use((0, setup_logger_middleware_js_1.setupLoggerMiddleware)());
exports.bot.use((0, debug_logger_middleware_js_1.debugLoggerMiddleware)());
exports.bot.start((ctx) => commands.start(ctx));
exports.bot.command('allDreams', async (ctx) => commands.getAllDreams(ctx));
exports.bot.action(/dreamId.*/, (ctx) => commands.getCurrentDream(ctx));
exports.bot.action(['dreamListMinus', 'dreamListPlus'], (ctx) => commands.changeDreamPage(ctx));
exports.bot.action('sendDream', async (ctx) => commands.sendDream(ctx));
exports.bot.on((0, filters_1.message)('text'), (ctx) => commands.checkDreamText(ctx));
if (config.isDevelopment) {
    exports.bot.launch();
    app.listen(process.env.BOT_PORT, () => console.log(`My server is running on ${process.env.BOT_PORT}`));
}
else if (config.isProduction) {
    exports.bot
        .launch({
        webhook: {
            domain: String(process.env.DOMAIN),
            port: Number(process.env.BOT_PORT || 8000),
        },
    })
        .then(() => console.log('Webhook bot listening on port', process.env.BOT_PORT));
}
