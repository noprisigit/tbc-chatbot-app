import { Request, Response } from "express";
import { renderPage } from "../middlewares/renderPage";
import { prisma } from "../lib/prisma";
import { startOfDay, endOfDay } from 'date-fns';

export const renderDashboardPage = async (req: Request, res: Response) => {
  try {
    const [
      totalCustomers,
      totalActiveSchedules,
      totalInactiveSchedules,
      logsToday,
      latestLogs,
    ] = await Promise.all([
      prisma.customer.count({ where: { status: 'active' } }),
      prisma.reminderSchedule.count({ where: { status: 'active' } }),
      prisma.reminderSchedule.count({ where: { status: 'inactive' } }),
      prisma.log.count({
        where: {
          timestamp: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          },
        },
      }),
      prisma.log.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    const pageContent = await renderPage('dashboard/dashboard.index', {
      totalCustomers,
      totalActiveSchedules,
      totalInactiveSchedules,
      logsToday,
      latestLogs,
    });

    res.render('layout', {
      title: 'Dashboard',
      body: pageContent,
    });
  } catch (err) {
    console.error('❌ Gagal load dashboard:', err);
    res.status(500).send('Gagal load dashboard');
  }
}