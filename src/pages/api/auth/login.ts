// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateToken, comparePassword } from '../../../utils/auth';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;
  
  try {
    const admin = await prisma.admin.findFirst({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Username atau password tidak valid' });
    }

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password tidak valid' });
    }

    // Generate JWT token
    const token = generateToken(admin.id);
    
    // Update bearer_token di database
    const bearerToken = uuidv4();
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        bearer_token: bearerToken,
        updated_at: new Date()
      }
    });
    
    // Kirim token ke client
    return res.status(200).json({ 
      token,  // JWT token untuk otorisasi API
      bearer_token: bearerToken,  // Bearer token yang disimpan di database
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
}