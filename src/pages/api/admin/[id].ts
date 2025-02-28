import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/middleware/auth';
import { hashPassword } from '@/utils/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }

  if (req.method === 'GET') {
    try {
      // Ambil admin berdasarkan ID (tanpa menampilkan password)
      const admin = await prisma.admin.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          username: true,
          created_at: true,
          updated_at: true,
          bearer_token: true,
          // password dikeluarkan dari respons untuk keamanan
        },
      });

      if (!admin) return res.status(404).json({ error: 'Admin tidak ditemukan' });

      return res.status(200).json(admin);
    } catch (error) {
      console.error('Error fetching admin:', error);
      return res.status(500).json({ error: 'Gagal mengambil data admin' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { username, password } = req.body;
      
      // Persiapkan data untuk update
      const updateData: any = {};
      if (username) updateData.username = username;
      
      // Hash password jika disediakan
      if (password) {
        // Pastikan password maksimal 10 karakter sesuai dengan schema
        if (password.length > 10) {
          return res.status(400).json({ error: 'Password tidak boleh lebih dari 10 karakter' });
        }
        updateData.password = await hashPassword(password);
      }

      // Update timestamp
      updateData.updated_at = new Date();

      const updatedAdmin = await prisma.admin.update({
        where: { id: Number(id) },
        data: updateData,
        select: {
          id: true,
          username: true,
          created_at: true,
          updated_at: true,
          bearer_token: true,
          // password dikeluarkan dari respons
        },
      });
      
      return res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error('Error updating admin:', error);
      return res.status(500).json({ error: 'Gagal mengupdate admin' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Pastikan admin yang akan dihapus bukan admin yang sedang login
      if (req.user && Number(req.user.userId) === Number(id)) {
        return res.status(403).json({ error: 'Tidak dapat menghapus akun yang sedang aktif' });
      }
      
      await prisma.admin.delete({
        where: { id: Number(id) },
      });
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting admin:', error);
      return res.status(500).json({ error: 'Gagal menghapus admin' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

// Wrap handler dengan middleware autentikasi
export default authMiddleware(handler);