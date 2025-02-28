import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Ambil semua admin
    const admins = await prisma.admin.findMany();
    return res.status(200).json(admins);
  }

  if (req.method === 'POST') {
    // Buat admin baru
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan Password diperlukan' });
    }

    try {
      const newAdmin = await prisma.admin.create({
        data: {
          username,
          password,
        },
      });
      return res.status(201).json(newAdmin);
    } catch (error) {
        console.error(error)
      return res.status(500).json({ error: 'Gagal membuat admin' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
