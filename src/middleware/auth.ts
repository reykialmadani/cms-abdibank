// middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare module 'next' {
  interface NextApiRequest {
    user?: {
      userId: number;
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
    
   
    const bearerToken = authHeader.split(' ')[1];
    
    if (!bearerToken) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    
    try {
      
      const admin = await prisma.admin.findFirst({
        where: { bearer_token: bearerToken },
      });
      
      if (!admin) {
        return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
      }
    
      req.user = { userId: admin.id };
      
      // Lanjutkan ke handler API
      return handler(req, res);
    } catch (error) {
      console.error('Error verifying bearer token:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan pada otentikasi' });
    }
  };
}