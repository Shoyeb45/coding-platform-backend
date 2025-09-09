// middlewares/httpLogger.middleware.ts
import { logger } from '../utils/logger'; // your existing pino logger
import { config } from '../config';
export const httpLogger = (req: any, res: any, next: any) => {
  const start: number = Date.now();
  
  res.on('finish', () => {
    const duration: number = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    // Skip logging for these conditions
    const skipLog = (
      // Skip health checks and assets
      url.includes('/health') ||
      url.includes('/metrics') ||
      url.includes('/favicon') ||
      url.match(/\.(css|js|png|jpg|svg|ico|woff|woff2)$/) ||
      // Skip successful requests in production (only log errors)
      (config.nodeEnv === 'production' && statusCode < 400)
    );
    
    if (skipLog) return;
    
    // Clean, single-line format
    if (statusCode >= 500) {
      logger.error(`${method} ${url} ${statusCode} ${duration}ms ${ip}`);
    } else if (statusCode >= 400) {
      logger.warn(`${method} ${url} ${statusCode} ${duration}ms`);
    } else {
      logger.info(`${method} ${url} ${statusCode} ${duration}ms`);
    }
  });
  
  next();
};
