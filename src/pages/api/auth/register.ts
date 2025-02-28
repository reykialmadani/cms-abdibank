// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/auth';
import { authMiddleware } from '@/middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;
  
  // Validasi input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password diperlukan' });
  }

  // Validasi panjang password (max 10 karakter sesuai schema)
  if (password.length > 10) {
    return res.status(400).json({ error: 'Password tidak boleh lebih dari 10 karakter' });
  }

  try {
    // Cek apakah username sudah digunakan
    const existingAdmin = await prisma.admin.findFirst({
      where: { username },
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
        password: hashedPassword,
        bearer_token: uuidv4(), // Menghasilkan UUID manual jika diperlukan
        created_at: new Date(),
        updated_at: new Date()
      },
      select: {
        id: true,
        username: true,
        created_at: true,
        updated_at: true,
        bearer_token: true
        // password tidak disertakan dalam respons
      }
    });
    
    return res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error registering admin:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
}

// Gunakan middleware autentikasi agar hanya admin yang bisa membuat admin baru
export default authMiddleware(handler);