import { NextFunction, Request, Response } from "express";
import logger from "../lib/logger";

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  // Catat informasi saat request diterima
  const start = new Date().getTime();
  const { method, url, ip } = req;
  const userAgent = req.get('user-agent') || 'unknown';

  res.on('finish', () => {
    // Catat informasi saat response selesai dikirim
    const duration = new Date().getTime() - start;
    const { statusCode } = res;
    const message = `${method} ${url} ${statusCode} ${duration}ms - ${userAgent} ${ip}`;

    // Gunakan level 'http' yang sudah kita definisikan
    if (statusCode >= 400) {
      logger.error(message);
    } else {
      logger.http(message);
    }
  });

  next();
}