import { config } from 'dotenv';
config();

const DEVELOPMENT = "development";
const PRODUCTION = "production";

export const isDevelopment = process.env.NODE_ENV === DEVELOPMENT;
export const isProduction = process.env.NODE_ENV === PRODUCTION;

