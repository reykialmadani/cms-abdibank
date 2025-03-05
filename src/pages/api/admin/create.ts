import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyToken } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Periksa otentikasi
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autentikasi diperlukan' });
  }

  const token = authHeader.substring(7); // Hapus 'Bearer ' dari string
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }

  // Dapatkan data admin baru
  const { username, password } = req.body;

  // Validasi input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password diperlukan' });
  }

  try {
    // Periksa apakah username sudah ada
    const existingAdmin = await prisma.admin.findFirst({
      where: { username }
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Buat admin baru
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    // Kembalikan data admin baru (tanpa password)
    return res.status(201).json({
      message: 'Admin berhasil dibuat',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat membuat admin' });
  } finally {
    await prisma.$disconnect();
  }
}