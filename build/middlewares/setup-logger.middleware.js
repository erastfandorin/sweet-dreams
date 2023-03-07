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
exports.setupLoggerMiddleware = void 0;
const config = __importStar(require("../config.js"));
const pino_1 = __importDefault(require("pino"));
const crypto_1 = require("crypto");
// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const loggerOptions = {
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
const logger = (0, pino_1.default)(loggerOptions);
const setupLoggerMiddleware = () => (ctx, next) => {
    ctx.logger = logger.child({
        requestId: (0, crypto_1.randomUUID)(),
    });
    next();
};
exports.setupLoggerMiddleware = setupLoggerMiddleware;
