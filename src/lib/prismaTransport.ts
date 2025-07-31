import Transport from 'winston-transport';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LogInfo {
  level: string;
  message: string;
  [key: string]: any;
}

export default class PrismaTransport extends Transport {
  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  // Fungsi log yang akan dipanggil oleh Winston setiap kali ada log baru
  async log(info: LogInfo, callback: () => void) {
    // Pastikan proses logging berjalan di background tanpa memblokir
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, ...meta } = info;

    try {
      // Simpan log ke database menggunakan Prisma
      await prisma.log.create({
        data: {
          level,
          message,
          // Simpan sisa metadata jika ada
          meta: Object.keys(meta).length > 0 ? meta : undefined,
        },
      });
    } catch (error) {
      console.error('Gagal menyimpan log ke database:', error);
    }

    // Panggil callback untuk menandakan proses selesai
    callback();
  }
}
