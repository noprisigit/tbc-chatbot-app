import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding...');

  // 1. Hash password untuk setiap user
  const hashedPasswordAdmin = await bcrypt.hash('password', 12);
  const hashedPasswordUser = await bcrypt.hash('password', 12);

  // 2. Buat data user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' }, // Cari user berdasarkan email
    update: {}, // Jika sudah ada, jangan lakukan apa-apa
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPasswordAdmin,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Regular User',
      password: hashedPasswordUser,
    },
  });

  console.log('✨ Seeding selesai. User yang dibuat:');
  console.log(adminUser);
  console.log(regularUser);
}

// Jalankan fungsi main dan pastikan koneksi ditutup setelah selesai
main()
  .catch((e) => {
    console.error('❌ Terjadi error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Tutup koneksi Prisma
    await prisma.$disconnect();
  });