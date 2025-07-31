import { promises as fs } from 'fs';
/**
 * Membaca beberapa baris terakhir dari sebuah file secara efisien.
 * @param filePath - Path lengkap ke file.
 * @param numLines - Jumlah baris yang ingin dibaca.
 * @returns Array of strings, setiap elemen adalah satu baris log.
 */
export async function readLastLines(filePath: string, numLines: number): Promise<string[]> {
  try {
    const handle = await fs.open(filePath, 'r');
    const stats = await handle.stat();
    const fileSize = stats.size;

    let lineCount = 0;
    let buffer = Buffer.alloc(Math.min(fileSize, 1024)); // Baca 1KB chunk
    let position = fileSize;
    let lines: string[] = [];
    let lastChunk = '';

    while (position > 0 && lineCount < numLines) {
      position -= buffer.length;
      if (position < 0) {
        buffer = Buffer.alloc(buffer.length + position);
        position = 0;
      }

      await handle.read(buffer, 0, buffer.length, position);
      const chunk = buffer.toString('utf8');

      const combined = chunk + lastChunk;
      const currentLines = combined.split('\n');
      lastChunk = currentLines.shift() || '';

      lines = currentLines.reverse().concat(lines);
      lineCount = lines.length;
    }

    await handle.close();

    // Ambil hanya sejumlah baris yang diminta
    return lines.slice(-numLines);

  } catch (error) {
    // Jika file tidak ada, kembalikan array kosong
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}