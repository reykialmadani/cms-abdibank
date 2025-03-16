// cms-abdi/src/pages/api/sub-menus/find-by-url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ApiResponse<T> = {
  error?: string;
  data?: T;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  if (req.method === 'GET') {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter diperlukan' });
      }
      
      const subMenu = await prisma.sub_menu.findFirst({
        where: {
          url: url as string,
          status: true
        },
        include: {
          menu: true
        }
      });
      
      if (!subMenu) {
        return res.status(404).json({ error: 'Sub menu tidak ditemukan' });
      }
      
      res.status(200).json({ data: subMenu });
    } catch (error) {
      console.error('Error finding sub_menu by URL:', error);
      res.status(500).json({ error: 'Gagal mencari sub_menu' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}