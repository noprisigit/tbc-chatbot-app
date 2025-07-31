import winston from "winston";
import PrismaTransport from "./prismaTransport";

// Tentukan level log sesuain dengan RFC5424
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Tentukan level log berdasarkan environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Warna untuk setiap level log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Tentukan format log
const format = winston.format.combine(
  // Tambahkan timestamp dengan format yang mudah dibaca
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Format untuk console dengan warna
  winston.format.colorize({ all: true }),
  // Tentukan format output log
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Tentukan 'transports' (tujuan output log)
const transports: winston.transport[] = [
  // Selalu tampilkan log di console
  new winston.transports.Console(),
  // Simpan log dengan level 'error' ke dalam file error.log
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Simpan semua log ke dalam file all.log
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// transports.push(new PrismaTransport());
// console.log('Logging ke database diaktifkan untuk mode produksi.');

// Buat instance logger dengan konfigurasi di atas
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;