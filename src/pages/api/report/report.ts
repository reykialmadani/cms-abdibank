// /api/report.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verifikasi token
    const token = req.headers.authorization?.split(' ')[1] || '';
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tidak diizinkan, silakan login terlebih dahulu' 
      });
    }
    
    // Mendapatkan admin berdasarkan userId dari token
    const admin = await prisma.admin.findUnique({
      where: {
        id: decodedToken.userId
      }
    });
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin tidak ditemukan' 
      });
    }

    // Tangani metode HTTP yang berbeda
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res, admin.id);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Metode tidak diizinkan' 
        });
    }
  } catch (error) {
    console.error('Error in /api/report:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server' 
    });
  }
}

// Fungsi untuk menangani permintaan GET
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '10', search = '', status = '' } = req.query;
  
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  // Bangun kondisi filter
  const where: any = {
    deleted_at: null,
    title: {
      contains: search as string,
      mode: 'insensitive'
    }
  };

  // Filter berdasarkan status jika disediakan
  if (status === 'active') {
    where.status = true;
  } else if (status === 'inactive') {
    where.status = false;
  }

  // Query untuk laporan (report)
  // Karena kita mencari laporan, kita perlu memfilter content yang memiliki report_type atau month/year
  // Hal ini karena kita menggunakan tabel content untuk menyimpan laporan
  where.OR = [
    { report_type: { not: null } },
    { report_year: { not: null } }
  ];

  try {
    // Ambil total count untuk pagination
    const totalCount = await prisma.content.count({ where });

    // Ambil data laporan
    const reports = await prisma.content.findMany({
      where,
      include: {
        admin: {
          select: {
            username: true
          }
        },
        sub_menu: {
          select: {
            sub_menu_name: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      },
      skip,
      take: limitNumber
    });

    // Mapper untuk mengubah data ke format yang lebih bersih
    const formattedReports = reports.map(report => {
      const { admin, sub_menu, ...reportData } = report;
      return {
        ...reportData,
        updater: admin?.username || null,
        sub_menu_name: sub_menu?.sub_menu_name || null
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedReports,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data laporan'
    });
  }
}

// Fungsi untuk menangani permintaan POST
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  adminId: number
) {
  try {
    const { 
      sub_menu_id, 
      title, 
      month, 
      year, 
      required_documents, 
      status, 
      updated_by = adminId 
    } = req.body;

    // Validasi input
    if (!sub_menu_id || !title || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Harap isi semua field yang diperlukan'
      });
    }

    // Buat laporan baru dengan menggunakan tabel content
    const newReport = await prisma.content.create({
      data: {
        sub_menu_id: parseInt(sub_menu_id),
        title,
        required_documents,
        status: status === 1,
        report_type: `${month}`, // Menggunakan kolom report_type untuk bulan
        report_year: year,
        updated_by: parseInt(updated_by.toString())
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Laporan berhasil dibuat',
      data: newReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat laporan'
    });
  }
}