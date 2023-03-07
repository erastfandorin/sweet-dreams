import { config } from 'dotenv';
config();

export const defaultSession = {
  isUserStartedBot: false,
  currentDreamPage: 1,
  step: 6,
};

const DEVELOPMENT = "development";
const PRODUCTION = "production";

export const isDevelopment = process.env.NODE_ENV === DEVELOPMENT;
export const isProduction = process.env.NODE_ENV === PRODUCTION;

