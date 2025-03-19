// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/auth';
import { authMiddleware } from '@/middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function registerHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;

  // Validasi input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password diperlukan' });
  }

  // Validasi panjang password 
  if (password.length > 10) {
    return res.status(400).json({ error: 'Password tidak boleh lebih dari 10 karakter' });
  }

  try {
    const existingAdmin = await prisma.admin.findFirst({
      where: { username },
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    let uniqueToken: string;
    let tokenExists = true;

    while (tokenExists) {
      uniqueToken = uuidv4();
      const existingToken = await prisma.admin.findFirst({
        where: { bearer_token: uniqueToken },
      });
      tokenExists = !!existingToken;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Buat admin baru
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        bearer_token: uniqueToken,
        created_at: new Date(),
        updated_at: new Date()
      },
      select: {
        id: true,
        username: true,
        created_at: true,
        updated_at: true,
        bearer_token: true 
      }
    });

    return res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error registering admin:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
}

// Middleware kondisional berdasarkan keberadaan admin
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminCount = await prisma.admin.count();

    if (adminCount === 0) {
      return registerHandler(req, res);
    } 

    return authMiddleware(registerHandler)(req, res);
  } catch (error) {
    console.error('Error checking admin count:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat pengecekan admin' });
  }
}