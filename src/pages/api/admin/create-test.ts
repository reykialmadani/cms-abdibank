// pages/api/admin/create-test.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // Hash password menggunakan fungsi yang sama dengan yang kita gunakan saat login
    const hashedPassword = await hashPassword('admin123');
    
    // Cek apakah admin sudah ada
    const existingAdmin = await prisma.admin.findFirst({
      where: { username: 'admin' }
    });
    
    if (existingAdmin) {
      // Update password admin yang sudah ada
      const updatedAdmin = await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword }
      });
      
      return res.status(200).json({ 
        message: 'Admin sudah ada, password diperbarui',
        admin: {
          id: updatedAdmin.id,
          username: updatedAdmin.username
        }
      });
    } else {
      // Buat admin baru
      const newAdmin = await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: 'Administrator'
        }
      });
      
      return res.status(201).json({ 
        message: 'Admin test berhasil dibuat',
        admin: {
          id: newAdmin.id,
          username: newAdmin.username
        }
      });
    }
  } catch (error) {
    console.error('Error creating test admin:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat membuat admin test' });
  } finally {
    await prisma.$disconnect();
  }
}