// pages/api/admin/verify-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../../../utils/auth';
import { authMiddleware } from '../../../middleware/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Metode ${req.method} tidak diizinkan` });
  }

  try {
    // Ambil data dari body request
    const { adminId, password } = req.body;

    // Validasi input
    if (!adminId || !password) {
      return res.status(400).json({ message: 'ID admin dan password diperlukan' });
    }

    // Validasi bahwa ID dari token dan ID yang akan diverifikasi sama
    // (hanya bisa memverifikasi password sendiri)
    if (Number(req.user?.userId) !== Number(adminId)) {
      return res.status(403).json({ message: 'Anda hanya dapat memverifikasi password akun Anda sendiri' });
    }

    // Dapatkan data admin dari database
    const admin = await prisma.admin.findUnique({
      where: { id: Number(adminId) },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, admin.password);
    return res.status(200).json({ valid: isPasswordValid });
  } catch (error) {
    console.error('Error saat verifikasi password:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    await prisma.$disconnect();
  }
}

export default authMiddleware(handler);