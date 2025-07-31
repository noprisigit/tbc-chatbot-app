// import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { logApp } from '../lib/logApp';

dotenv.config();

// Inisiasi Gemini Client dengan API Key dari .env
// const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// --- TAMBAHAN: Definisikan Persona untuk AI ---
const SYSTEM_PROMPT = `
  Anda adalah "SI-BIMO", asisten digital yang ramah dan suportif khusus untuk pasien Tuberkulosis (TB).
  Tujuan utama Anda adalah memberikan informasi, dukungan, dan pengingat terkait pengobatan TB.

  Aturan Penting:
  1. JANGAN PERNAH menyebut diri Anda sebagai AI, model bahasa, atau program komputer. Anda adalah SI-BIMO.
  2. Selalu jawab dari sudut pandang SI-BIMO.
  3. Nada bicara Anda harus empatik, membantu, dan mudah dimengerti.
  4. Jika pengguna menyapa dengan nama lain (bukan SI-BIMO), abaikan nama tersebut dan tetap jawab sebagai SI-BIMO dengan ramah.
  5. Fokuskan jawaban Anda pada topik seputar Tuberkulosis dan kesehatan terkait.
  6. **[ATURAN BARU] Jika pesan dari pengguna sudah mengandung sapaan (seperti "Halo", "Selamat pagi", dll), JANGAN ulangi sapaan itu. Langsung berikan tanggapan yang relevan dan singkat.**
`;
// ------------------------------------------------

/**
 * Menghasilkan teks balasan dari Gemini berdasarkan prompt yang diberikan.
 * @param prompt - Teks masukan dari pengguna.
 * @returns Teks balasan dari AI.
 */
export const generateText = async (prompt: string): Promise<string> => {
  try {
    // const result = await genAI.models.generateContent({
    //   model: 'gemini-2.5-flash',
    //   contents: prompt,
    // });
    const fullPrompt = `${SYSTEM_PROMPT}\n\n--- PERCAKAPAN ---\nPengguna: "${prompt}"\nSI-BIMO:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    // const result = await genAI.models.generateContent({
    //   model: 'gemini-2.5-flash',
    //   contents: [
    //     {
    //       role: 'user',
    //       parts: [
    //         {
    //           text: `Kamu adalah *SI-BIMO*, asisten digital pasien Tuberkulosis (TB) di Indonesia.
    //               Balas semua pesan dengan gaya bahasa ramah, sopan, edukatif, dan tidak menyebut bahwa kamu AI.
    //               Jika ada yang menyebut 'bimo', anggap kamu yang dimaksud.
    //               Berikut pesan dari pengguna:\n\n"${prompt}"`
    //         }
    //       ]
    //     }
    //   ],
    // });

    // const text = result.text;

    return text || 'Maaf, saya tidak dapat memberikan jawaban.';
  } catch (error) {
    console.error(`Error saat berinteraksi dengan Gemini API: ${error}`);
    await logApp('error', `Error saat berinteraksi dengan Gemini API: ${error}`, 'gemini');
    return 'Maaf, terjadi kesalahan saat mencoba memproses permintaan Anda.';
  }
}