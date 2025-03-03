import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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

  try {
    // Dapatkan semua admin (tanpa menampilkan password)
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data admin' });
  } finally {
    await prisma.$disconnect();
  }
}