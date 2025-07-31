import { PrismaClient } from '@prisma/client';
import * as cron from 'node-cron';
import { logApp } from '../lib/logApp';
import logger from '../lib/logger';
import { sendMessage } from '../services/whatsapp.service';

// const scheduledJobs: Map<string, cron.> = new Map();
const prisma = new PrismaClient();
const scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

export const runRemindersSchedulerFromDB = async () => {
  const schedules = await prisma.reminderSchedule.findMany({
    where: { status: 'active' }
  });

  for (const schedule of schedules) {
    if (scheduledJobs.has(schedule.id)) continue;

    const task = cron.schedule(schedule.cron, async () => {
      logger.info(`⏰ Kirim reminder berdasarkan jadwal DB - ID: ${schedule.id}`);
      await logApp('info', `⏰ Kirim reminder berdasarkan jadwal DB - ID: ${schedule.id}`, 'reminder');

      try {
        const customers = await prisma.customer.findMany({
          where: { status: 'active' }
        });

        for (const customer of customers) {
          const message = schedule.message.replace('{{name}}', customer.name);
          await sendMessage(customer.phone, message);

          logger.info(`✅ Reminder terkirim ke ${customer.phone}`);
          await logApp('info', `✅ Reminder terkirim ke ${customer.phone}`, 'reminder');

          await new Promise<void>((r) => setTimeout(r, 3000));
        }
      } catch (err) {
        logger.error(`❌ Gagal kirim reminder dari jadwal ${schedule.id}:`);
        await logApp('error', `❌ Gagal kirim reminder dari jadwal ${schedule.id}:`, 'reminder');
      }
    });

    scheduledJobs.set(schedule.id, task);
  }

  logger.info(`✅ ${schedules.length} pengingat dari DB dijadwalkan`);
  await logApp('info', `✅ ${schedules.length} pengingat dari DB dijadwalkan`, 'reminder');
}

export const restartAllReminderSchedulers = async () => {
  scheduledJobs.forEach((task) => task.stop());
  scheduledJobs.clear();

  await runRemindersSchedulerFromDB();

  logger.info(`✅ Rerun all active schedules`);
  await logApp('info', `✅ Rerun all active schedules`, 'reminder');
}