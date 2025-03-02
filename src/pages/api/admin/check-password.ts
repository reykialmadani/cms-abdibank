// Buat endpoint sementara untuk memeriksa format password
// pages/api/admin/check-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const admin = await prisma.admin.findFirst({
      where: { username: 'reyki' }
    });
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin tidak ditemukan' });
    }
    
    return res.status(200).json({ 
      username: admin.username,
      passwordFormat: admin.password ? admin.password.substring(0, 7) + '...' : 'tidak ada',
      isBcryptFormat: admin.password?.startsWith('$2') || false
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  } finally {
    await prisma.$disconnect();
  }
}