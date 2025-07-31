import { NextFunction, Request, Response } from "express";
import { renderPage } from "../middlewares/renderPage";
import { promises as fs } from 'fs';
import logger from "../lib/logger";
import path from "path";
import { readLastLines } from "../lib/fileReader";
import { prisma } from "../lib/prisma";

interface ILogWhere {
  level?: string;
  context?: string;
}

export const renderLogPage = async (req: Request, res: Response, next: NextFunction) => {
  const { level, context } = req.query;

  const where: ILogWhere = {};
  if (level) where.level = level as string;
  if (context) where.context = context as string;

  try {
    const logs = await prisma.log.findMany({
      orderBy: { timestamp: 'desc'},
      take: 25
    });
   
    const formattedLogs = logs.map((log) => ({
      ...log,
      timestampFormatted: new Date(log.timestamp).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
      }),
    }));

    const [distinctLevels, distinctContexts] = await Promise.all([
      prisma.log.findMany({
        distinct: ['level'],
        select: { level: true },
      }),
      prisma.log.findMany({
        distinct: ['context'],
        select: { context: true },
      }),
    ]);

    const pageContent = await renderPage('log/log.index', {
      logs: formattedLogs,
      filter: {
        level: level || '',
        context: context || '',
      },
      distinctLevels: distinctLevels.map(l => l.level),
      distinctContexts: distinctContexts.map(c => c.context)
    });

    res.render('layout', {
      title: 'Log Sistem',
      body: pageContent
    });
  } catch (error) {
    logger.error('Gagal membaca file log:', error);
    res.status(500).send('Tidak dapat memuat log.');
  }
  
}