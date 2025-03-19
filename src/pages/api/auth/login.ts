// pages/api/auth/login.ts 
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateToken, comparePassword } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log("Request body:", req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    console.log("Input tidak lengkap:", { username: !!username, password: !!password });
    return res.status(400).json({ error: 'Username dan password diperlukan' });
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: { username },
    });

    console.log("Admin ditemukan:", admin ? {
      id: admin.id,
      username: admin.username,
      passwordPrefix: admin.password ? admin.password.substring(0, 10) + '...' : 'tidak ada'
    } : "Admin tidak ditemukan");

    if (!admin) {
      return res.status(401).json({ error: 'Username atau password tidak valid (admin tidak ditemukan)' });
    }

    const isPasswordValid = await comparePassword(password, admin.password);
    
    console.log("Hasil perbandingan password:", {
      inputPassword: password ? '**** (tidak ditampilkan)' : 'kosong',
      isValid: isPasswordValid
    });
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password tidak valid (password tidak cocok)' });
    }

    // Generate token
    const token = generateToken(admin.id);
    
    // Kirim token ke client
    return res.status(200).json({ 
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  } finally {
    await prisma.$disconnect();
  }
}