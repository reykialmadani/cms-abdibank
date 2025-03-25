// pages/api/admins/operators/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hashPassword } from '../../../../utils/auth'; // Gunakan import, bukan require

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Cek otentikasi
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autentikasi diperlukan' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  
  if (!payload || !payload.userId) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  // Dapatkan admin dari database
  const admin = await prisma.admin.findUnique({
    where: { id: Number(payload.userId) },
  });

  if (!admin) {
    return res.status(401).json({ error: 'Pengguna tidak ditemukan' });
  }

  // Periksa apakah pengguna adalah admin
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' });
  }

  try {
    if (req.method === 'GET') {
      // Ambil daftar operator
      const operators = await prisma.admin.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return res.status(200).json({ operators });
    } else if (req.method === 'POST') {
      // Tambahkan operator baru
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password diperlukan' });
      }

      // Periksa apakah username sudah ada
      const existingUser = await prisma.admin.findFirst({
        where: {
          username: username,
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Buat operator baru
      const newOperator = await prisma.admin.create({
        data: {
          username,
          password: hashedPassword,
          role: role || 'operator', // Pastikan role ada
        },
      });

      return res.status(201).json({
        success: true,
        operator: {
          id: newOperator.id,
          username: newOperator.username,
          role: newOperator.role,
          created_at: newOperator.created_at,
        },
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Metode ${req.method} tidak diizinkan` });
    }
  } catch (error) {
    console.error('Error in operators API:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  } finally {
    await prisma.$disconnect();
  }
}
