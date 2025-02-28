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

  // Tambahkan log untuk debugging
  console.log("Login request received:", JSON.stringify(req.body));
  
  const { username, password } = req.body;
  
  // Validasi input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password diperlukan' });
  }

  try {
    // Log untuk debugging
    console.log("Searching for admin with username:", username);
    
    // Cari admin berdasarkan username - gunakan findFirst untuk menghindari error jika username bukan unique field
    const admin = await prisma.admin.findFirst({
      where: { username },
    });

    // Log untuk debugging
    console.log("Admin found:", admin ? "Yes" : "No");

    if (!admin) {
      return res.status(401).json({ error: 'Username atau password tidak valid' });
    }

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, admin.password);
    
    // Log untuk debugging
    console.log("Password valid:", isPasswordValid ? "Yes" : "No");
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password tidak valid' });
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
  }
}