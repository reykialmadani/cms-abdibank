// Buat endpoint untuk reset password
// pages/api/admin/reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { username, newPassword } = req.body;
  
  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username dan password baru diperlukan' });
  }
  
  try {
    // Hash password baru
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password admin
    const admin = await prisma.admin.updateMany({
      where: { username },
      data: { password: hashedPassword }
    });
    
    if (admin.count === 0) {
      return res.status(404).json({ error: 'Admin tidak ditemukan' });
    }
    
    return res.status(200).json({ message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat reset password' });
  } finally {
    await prisma.$disconnect();
  }
}