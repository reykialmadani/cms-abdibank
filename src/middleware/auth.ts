// middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../utils/auth';
import { PrismaClient } from '@prisma/client';

// Memperluas tipe NextApiRequest untuk menyertakan user
declare module 'next' {
  interface NextApiRequest {
    user?: {
      userId: number;
      iat: number;
      exp: number;
    };
  }
}

const prisma = new PrismaClient();

export function authMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Ambil token dari header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token autentikasi diperlukan' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verifikasi token JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
    }

    try {
      // Verifikasi apakah admin masih ada dan bearer_token masih valid
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.userId },
      });

      if (!admin) {
        return res.status(401).json({ error: 'Admin tidak ditemukan' });
      }

      // Tambahkan user info ke request
      req.user = decoded;
      
      // Lanjutkan ke handler API
      return handler(req, res);
    } catch (error) {
      console.error('Error verifying admin:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan pada otentikasi' });
    }
  };
}

// Fungsi alternatif yang menggunakan bearer_token untuk otorisasi
export function bearerAuthMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Ambil token dari header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token autentikasi diperlukan' });
    }

    // Extract token
    const bearerToken = authHeader.split(' ')[1];
    
    try {
      // Cari admin dengan bearer_token yang sesuai
      const admin = await prisma.admin.findFirst({
        where: { bearer_token: bearerToken },
      });

      if (!admin) {
        return res.status(401).json({ error: 'Token tidak valid' });
      }

      // Tambahkan user info ke request
      req.user = {
        userId: admin.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 jam
      };
      
      // Lanjutkan ke handler API
      return handler(req, res);
    } catch (error) {
      console.error('Error verifying bearer token:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan pada otentikasi' });
    }
  };
}