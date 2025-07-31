import { NextFunction, Request, Response } from "express";
import { renderPage } from "../middlewares/renderPage";
import { prisma } from "../lib/prisma";
import logger from "../lib/logger";
import { restartAllReminderSchedulers } from "../jobs/reminder.job";

export const renderReminderPage = async (req: Request, res: Response, next: NextFunction) => {
  const pageContent = await renderPage('reminder/reminder.index');

  res.render('layout', {
    title: 'Manajemen Jadwal',
    body: pageContent
  });
}

export const getRemindersDataTable = async (req: Request, res: Response) => {
  try {
    const reminders = await prisma.reminderSchedule.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: reminders });
  } catch (error) {
    logger.error(`GET /api/customers error : ${error}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const createNewReminder = async (req: Request, res: Response) => {
  const { message, cron, status } = req.body;

  if (!message || !cron) {
    return res.status(400).json({ error: 'Message dan cron wajib diisi' });
  }

  try {
    const newReminder = await prisma.reminderSchedule.create({
      data: {
        message,
        cron,
        status: status || 'active',
      },
    });

    // Restart scheduler
    await restartAllReminderSchedulers();

    res.json(newReminder);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambahkan reminder' });
  }
}

export const getReminderById = async(req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const reminder = await prisma.reminderSchedule.findUnique({
      where: { id: id },
    });

    if (!reminder)
      return res.status(404).json({ error: 'Data tidak ditemukan' });

    res.json({ data: reminder });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
}

export const updateReminderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, cron, status } = req.body;

  try {
    const updated = await prisma.reminderSchedule.update({
      where: { id: id },
      data: { message, cron, status },
    });

    // Restart scheduler
    await restartAllReminderSchedulers();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui reminder' });
  }
}

export const deleteReminderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.reminderSchedule.delete({ where: { id: id } });

    // Restart scheduler
    await restartAllReminderSchedulers();

    res.json({ message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus reminder' });
  }
}

export const updateReminderStatusById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const reminder = await prisma.reminderSchedule.findUnique({
      where: { id: id },
    });

    if (!reminder) return res.status(404).json({ error: 'Reminder tidak ditemukan' });

    const updated = await prisma.reminderSchedule.update({
      where: { id: id },
      data: {
        status: reminder.status === 'active' ? 'inactive' : 'active',
      },
    });

    // Restart scheduler
    await restartAllReminderSchedulers();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal ubah status' });
  }
}