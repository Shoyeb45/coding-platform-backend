
// src/utils/logger.ts
import pino from 'pino';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

// const logDir = path.join(__dirname, "../logs");
// // create logs dir if not exists
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir, { recursive: true });
// }

// const logFile = path.join(__dirname, "../logs", "app.log");
// Create base logger
export const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',

  // Production configuration
  ...(config.nodeEnv === 'production' && {
    // Structured JSON logging for production
    formatters: {
      level: (label) => ({ level: label }),
    },
  }),


  // Development configuration  
  ...(config.nodeEnv === 'development' && {
    // Pretty printing for development
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }
  // ,pino.destination(logFile)
),

  // Base fields for all logs
  //   base: {
  //     service: 'coding-platform',
  //     version: process.env.npm_package_version || '1.0.0',
  //     environment: config.nodeEnv,
  //   },

});