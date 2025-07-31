# --- Tahap 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Menginstal Chromium & dependensinya
RUN apk add --no-cache chromium udev ttf-freefont

# Memberikan izin kepemilikan folder /app kepada user 'node'
RUN chown -R node:node /app

# Beralih ke user 'node' yang tidak memiliki hak root
USER node

# Menyalin file package.json dan package-lock.json
COPY package*.json ./

# Menginstal dependensi
RUN npm install

# --- PERBAIKAN: Salin semua file proyek SEKARANG ---
# Ini akan menyalin folder 'prisma' dan semua source code lainnya
COPY . .

# Menjalankan proses build dan generate
RUN npm run build
RUN npx prisma generate

# Menyiapkan untuk produksi
RUN npm prune --production


# --- Tahap 2: Production ---
FROM node:20-alpine

WORKDIR /app

# Menginstal Chromium di image produksi
RUN apk add --no-cache chromium udev ttf-freefont

# Memberikan izin kepemilikan
# Salin hasil build dan dependensi dari tahap builder
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Beralih ke user node untuk menjalankan aplikasi
USER node

# Port yang akan diekspos
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["node", "dist/index.js"]