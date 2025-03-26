// middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

declare module 'next' {
  interface NextApiRequest {
    user?: {
      userId: number;
      role: string;
    };
  }
}

type HandlerFunction = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function authMiddleware(handler: HandlerFunction) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token autentikasi diperlukan' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    try {
      // Verifikasi token dengan JWT
      const payload = verifyToken(token);
      
      if (!payload) {
        return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
      }
      
      // Verifikasi token ada di database
      const admin = await prisma.admin.findFirst({
        where: { 
          id: payload.userId,
          bearer_token: token 
        },
      });

      if (!admin) {
        return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
      }

      req.user = {
        userId: payload.userId,
        role: payload.role || 'admin'
      };

      return handler(req, res);
    } catch (error) {
      console.error('Error verifying bearer token:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan pada otentikasi' });
    }
  };
}

// Fungsi untuk memerlukan role tertentu
export function requireRole(roles: string[]) {
  return function(handler: HandlerFunction) {
    return authMiddleware((req, res) => {
      if (!req.user?.role || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Tidak memiliki izin yang cukup' });
      }
      return handler(req, res);
    });
  };
}

// Helper: Hanya admin
export const adminOnly = requireRole(['admin']);