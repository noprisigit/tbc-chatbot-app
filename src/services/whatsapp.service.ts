import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import fs from 'fs-extra';
import QRCode from 'qrcode';
import path from 'path';
import logger from '../lib/logger';
import { generateText } from './gemini.service';
import { logApp } from '../lib/logApp';
import { prisma } from '../lib/prisma';


let client: Client;
let qrCodeData: string | null = null;
let isReady: boolean = false;

const SESSION_PATH = path.resolve('.wwebjs_auth', 'session-main');

function getExecutablePath() {
  // Di dalam container Docker, path-nya selalu ini
  if (process.env.NODE_ENV === 'production') {
    return '/usr/bin/chromium-browser';
  }
  // Untuk development di macOS
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  // Default untuk development di Linux lain
  return '/usr/bin/google-chrome';
}

export async function runWhatsappService() {
  logger.info('🤖 Memulai WhatsApp Bot...');
  await logApp('info', '🤖 Memulai WhatsApp Bot...', 'whatsapp');

  try {
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'main'
      }),
      puppeteer: {
        headless: true,
        executablePath: getExecutablePath(),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
        ],
        timeout: 60000,
      },
    });

    client.on('qr', async (qr) => {
      if (!isReady) {
        qrCodeData = await QRCode.toDataURL(qr);

        logger.info(`✅ QR Code diperbarui, scan di UI.`);
        await logApp('info', `✅ QR Code diperbarui, scan di UI.`, 'whatsapp');
      }
    });

    client.on('ready', async () => {
      isReady = true;
      qrCodeData = null;

      logger.info(`✅ WhatsApp sudah siap.`);
      await logApp('info', `✅ WhatsApp sudah siap.`, 'whatsapp');
    });

    client.on('auth_failure', async (msg) => {
      isReady = false;
      qrCodeData = null;

      logger.error(`❌ Gagal autentikasi: ${msg}`);
      await logApp('error', `❌ Gagal autentikasi: ${msg}`, 'whatsapp');
    });

    client.on('disconnected', async () => {
      isReady = false;
      qrCodeData = null;

      logger.warn('warn', `❌ WhatsApp terputus.`);
      await logApp('warn', `❌ WhatsApp terputus.`, 'whatsapp');
    });

    client.on('message', async (message: Message) => {
      const text = message.body?.trim();

      logger.info(`💬 Pesan diterima dari ${message.from}: "${message.body}`);
      await logApp(`info`, `💬 Pesan diterima dari ${message.from}: "${message.body}`, 'whatsapp');

      if (!text || text.length < 5) return;
      if (text.startsWith('!')) return;
      if (message.fromMe || message.from.includes('@g.us')) return;

      const chat = await message.getChat();

      // Tampilkan status lihat dan "typing..." di Whatsapp
      await chat.sendSeen();
      await chat.sendStateTyping();

      // const now = Date.now();
      // const lastReply = lastReplyTimestamps[senderId] || 0;
      // const delay =
      //   lastReply === 0
      //     ? Math.floor(Math.random() * 3000) + 3000
      //     : Math.floor(Math.random() * 30000) + 30000;

      setTimeout(async () => {
        try {
          await chat.clearState();

          let replyParts: string[] = [];

          const customer = await prisma.customer.findFirst({
            where: {
              phone: {
                equals: message.from.split('@')[0],
              }
            },
            select: {
              name: true
            }
          });

          const keywordPath = path.join(__dirname, '../../config', 'keywords.json');
          const keywordConfig = JSON.parse(fs.readFileSync(keywordPath, 'utf8'));

          const greetings: string[] = keywordConfig.greetings;
          const mentionedBimo: string[] = keywordConfig.bimoKeywords;

          const isGreeting = greetings.some(greet => text.toLowerCase().includes(greet));
          const isBimoMentioned = mentionedBimo.some((keyword) =>
            text.toLowerCase().includes(keyword)
          );

          if (isGreeting && isBimoMentioned && customer) {
            const greetingReply = `Halo ${customer.name}! 👋\nAda yang bisa *SI-BIMO* bantu hari ini? 😊`;
            replyParts.push(greetingReply);
          }

          if (isBimoMentioned) {
            const bimoReply =
              `*SI-BIMO* adalah layanan pendampingan digital bagi pasien Tuberkulosis (TB) yang bertujuan:\n` +
              `💊 Mengingatkan jadwal minum obat anti-TB secara tepat waktu\n` +
              `📅 Memberi notifikasi jadwal pengambilan obat\n` +
              `💬 Menyediakan fitur Q&A otomatis berbasis ChatGPT untuk meningkatkan pemahaman pasien tentang TB\n\n` +
              `Bersama *SI-BIMO*, pengobatan TB jadi lebih terpantau dan edukatif!`;
            replyParts.push(bimoReply);
          }

          let aiReply = await generateText(text);

          // Cegah AI menyebut "saya bukan BIMO"
          if (aiReply.toLowerCase().includes('saya adalah asisten ai') || aiReply.toLowerCase().includes('saya bukan bimo')) {
            aiReply = 'Baik! Silakan sampaikan pertanyaan atau keluhan Anda, saya siap membantu. 😊';
          }

          replyParts.push(aiReply);

          await message.reply(replyParts.join('\n\n'));

          logger.info(`🤖 Balasan AI dikirim ke ${message.from}`);
          await logApp('info', `🤖 Balasan AI dikirim ke ${message.from}`, 'whatsapp');
          // lastReplyTimestamps[senderId] = now;
        } catch (err) {
          logger.error(`❌ Error AI reply: ${err}`);
          await logApp('error', `❌ Error AI reply: ${err}`, 'whatsapp');

          await message.reply(
            'Maaf, terjadi kesalahan saat memproses pesan Anda.'
          );
        }
      }, 3000);
    });

    await client.initialize();
  } catch (err: any) {
    if (err.message.includes('SingletonLock')) {
      logger.error(`⚠️ SingletonLock error, mencoba membersihkan...`);
      await logApp('error', `⚠️ SingletonLock error, mencoba membersihkan...`, 'whatsapp');

      await fs.remove(SESSION_PATH);
      setTimeout(() => runWhatsappService(), 2000);
    }
  }
}

async function retryWhatsapp() {
  try {
    await client.destroy();
  } catch (e) {
    logger.error('Error saat menghancurkan client:', e);
    await logApp('error', `Error saat menghancurkan client: ${e}`, 'whatsapp');
  }

  // Coba untuk memulai ulang layanan setelah 5 detik
  logger.info('Mencoba memulai ulang layanan dalam 5 detik...');
  await logApp('info', 'Mencoba memulai ulang layanan dalam 5 detik...', 'whatsapp');
  setTimeout(() => runWhatsappService(), 5000);
}

export function getQrStatus() {
  return {
    isReady,
    qr: qrCodeData,
  };
}

export async function logoutWhatsapp() {
  if (client) {
    await client.logout();
    isReady = false;
    qrCodeData = null;

    logger.info('✅ Logout berhasil.');
    await logApp(`info`, '✅ Logout berhasil.', 'whatsapp');

    await retryWhatsapp();
  }
}

export function isClientReady() {
  return isReady && client && client.info;
}

export async function sendMessage(to: string, message: string) {
  if (!isClientReady()) {
    logger.warn('Whatsapp belum siap!');
    throw new Error('WhatsApp belum siap!');
  }

  const formatted = to.replace(/\D/g, '').replace(/^0/, '62');

  try {
    const numberId = await client.getNumberId(formatted);

    if (!numberId) {
      logger.error(`Nomor tidak ditemukan di WhatsApp: ${formatted}`);
      throw new Error(`Nomor tidak ditemukan di WhatsApp: ${formatted}`);
    }

    await client.sendMessage(numberId._serialized, message);
  } catch (error: any) {
    logger.error(`❌ Gagal mengirim ke ${to}: ${error.message}`);
    throw error;
  }
}