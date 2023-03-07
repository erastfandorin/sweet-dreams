"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = exports.isDevelopment = exports.defaultSession = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.defaultSession = {
    isUserStartedBot: false,
    currentDreamPage: 1,
    step: 6,
};
const DEVELOPMENT = "development";
const PRODUCTION = "production";
exports.isDevelopment = process.env.NODE_ENV === DEVELOPMENT;
exports.isProduction = process.env.NODE_ENV === PRODUCTION;
