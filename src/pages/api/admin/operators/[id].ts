// pages/api/admins/operators/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hashPassword } from '../../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Cek otentikasi
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autentikasi diperlukan' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  
  if (!payload || !payload.userId) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  // Dapatkan admin dari database
  const admin = await prisma.admin.findUnique({
    where: { id: Number(payload.userId) },
  });

  if (!admin) {
    return res.status(401).json({ error: 'Pengguna tidak ditemukan' });
  }

  // Periksa apakah pengguna adalah admin
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' });
  }

  // Dapatkan ID operator dari path
  const { id } = req.query;
  const operatorId = Number(id);

  if (isNaN(operatorId)) {
    return res.status(400).json({ error: 'ID operator tidak valid' });
  }

  try {
    // Cek apakah operator ada
    const operator = await prisma.admin.findUnique({
      where: {
        id: operatorId,
      },
    });

    if (!operator) {
      return res.status(404).json({ error: 'Operator tidak ditemukan' });
    }

    if (req.method === 'GET') {
      // Ambil detail operator
      return res.status(200).json({
        operator: {
          id: operator.id,
          username: operator.username,
          role: operator.role,
          created_at: operator.created_at,
          updated_at: operator.updated_at,
        },
      });
    } else if (req.method === 'PUT') {
      // Perbarui operator
      const { username, password, role } = req.body;
      
      // Periksa apakah username sudah digunakan oleh pengguna lain
      if (username && username !== operator.username) {
        const existingUser = await prisma.admin.findFirst({
          where: {
            username,
            NOT: {
              id: operatorId,
            },
          },
        });

        if (existingUser) {
          return res.status(400).json({ error: 'Username sudah digunakan' });
        }
      }

      // Persiapkan data untuk update
      const updateData: any = {};
      
      if (username) updateData.username = username;
      if (role) updateData.role = role;
      
      // Jika password disediakan, hash dan update
      if (password) {
        updateData.password = await hashPassword(password);
      }

      // Update operator
      const updatedOperator = await prisma.admin.update({
        where: {
          id: operatorId,
        },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        operator: {
          id: updatedOperator.id,
          username: updatedOperator.username,
          role: updatedOperator.role,
          updated_at: updatedOperator.updated_at,
        },
      });
    } else if (req.method === 'DELETE') {
      // Cegah penghapusan diri sendiri
      if (operatorId === admin.id) {
        return res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' });
      }

      // Hapus operator
      await prisma.admin.delete({
        where: {
          id: operatorId,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Operator berhasil dihapus',
      });
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Metode ${req.method} tidak diizinkan` });
    }
  } catch (error) {
    console.error('Error in operator API:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  } finally {
    await prisma.$disconnect();
  }
}