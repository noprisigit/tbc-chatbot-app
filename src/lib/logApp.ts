import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type LogContext = 'whatsapp' | 'reminder' | 'auth' | 'bot' | 'cron' | 'gemini';

export const logApp = async (level: 'info' | 'error' | 'warn', message: string, context: LogContext) => {
  try {
    await prisma.log.create({
      data: {
        level,
        message,
        // Simpan sisa metadata jika ada
        context,
      },
    });
  } catch (err) {
    console.error('❌ Gagal menyimpan log:', err);
  }
}