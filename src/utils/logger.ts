
// src/utils/logger.ts
import pino from 'pino';
import { config } from '../config';

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
  }),
  
  // Base fields for all logs
//   base: {
//     service: 'coding-platform',
//     version: process.env.npm_package_version || '1.0.0',
//     environment: config.nodeEnv,
//   },
  
});