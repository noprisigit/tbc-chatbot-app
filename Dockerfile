# --- Tahap 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Menginstal dependensi OS yang dibutuhkan
RUN apk add --no-cache chromium udev ttf-freefont

# 1. Salin file package.json dan prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instal dependensi
RUN npm install --unsafe-perm

# 3. Salin sisa file proyek
COPY . .

# 4. Jalankan build
RUN npm run build


# --- Tahap 2: Production ---
FROM node:20-alpine

WORKDIR /app

# Menginstal dependensi OS di image produksi
RUN apk add --no-cache chromium udev ttf-freefont

# Menyalin file-file yang sudah siap dari tahap builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package*.json ./

# --- PERBAIKAN: Salin folder prisma ke tahap produksi ---
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Beralih ke user 'node' untuk keamanan
USER node

# Port yang akan diekspos
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["node", "dist/index.js"]