// /api/report/[id].ts
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

    // Dapatkan ID dari URL
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID laporan tidak valid' 
      });
    }

    const reportId = parseInt(id, 10);

    // Tangani metode HTTP yang berbeda
    switch (req.method) {
      case 'GET':
        return handleGet(reportId, res);
      case 'PUT':
        return handlePut(reportId, req, res, admin.id);
      case 'DELETE':
        return handleDelete(reportId, res, admin.id);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Metode tidak diizinkan' 
        });
    }
  } catch (error) {
    console.error('Error in /api/report/[id]:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server' 
    });
  }
}

// Fungsi untuk menangani permintaan GET berdasarkan ID
async function handleGet(id: number, res: NextApiResponse) {
  try {
    // Cari laporan berdasarkan ID
    const report = await prisma.content.findUnique({
      where: {
        id,
        deleted_at: null
      },
      include: {
        admin: {
          select: {
            username: true
          }
        },
        sub_menu: {
          select: {
            sub_menu_name: true,
            menu_id: true,
            menu: {
              select: {
                menu_name: true
              }
            }
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }

    // Pastikan ini adalah laporan (memiliki report_type atau report_year)
    if (!report.report_type && !report.report_year) {
      return res.status(404).json({
        success: false,
        message: 'Data bukan merupakan laporan'
      });
    }

    // Format respons
    const { admin, sub_menu, ...reportData } = report;
    
    const formattedReport = {
      ...reportData,
      month: report.report_type ? parseInt(report.report_type) : null,
      year: report.report_year,
      updater: admin?.username || null,
      sub_menu_name: sub_menu?.sub_menu_name || null,
      menu_name: sub_menu?.menu?.menu_name || null,
      menu_id: sub_menu?.menu_id || null
    };

    return res.status(200).json({
      success: true,
      data: formattedReport
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data laporan'
    });
  }
}

// Fungsi untuk menangani permintaan PUT (update)
async function handlePut(
  id: number,
  req: NextApiRequest,
  res: NextApiResponse,
  adminId: number
) {
  try {
    // Periksa apakah laporan ada
    const existingReport = await prisma.content.findUnique({
      where: {
        id,
        deleted_at: null
      }
    });

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }

    // Pastikan ini adalah laporan (memiliki report_type atau report_year)
    if (!existingReport.report_type && !existingReport.report_year) {
      return res.status(404).json({
        success: false,
        message: 'Data bukan merupakan laporan'
      });
    }

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

    // Update laporan
    const updatedReport = await prisma.content.update({
      where: { id },
      data: {
        sub_menu_id: parseInt(sub_menu_id.toString()),
        title,
        required_documents,
        status: status === 1 || status === true,
        report_type: `${month}`, // Menggunakan kolom report_type untuk bulan
        report_year: year,
        updated_by: parseInt(updated_by.toString()),
        updated_at: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan berhasil diperbarui',
      data: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui laporan'
    });
  }
}

// Fungsi untuk menangani permintaan DELETE
async function handleDelete(
  id: number,
  res: NextApiResponse,
  adminId: number
) {
  try {
    // Periksa apakah laporan ada
    const existingReport = await prisma.content.findUnique({
      where: {
        id,
        deleted_at: null
      }
    });

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }

    // Pastikan ini adalah laporan (memiliki report_type atau report_year)
    if (!existingReport.report_type && !existingReport.report_year) {
      return res.status(404).json({
        success: false,
        message: 'Data bukan merupakan laporan'
      });
    }

    // Soft delete laporan
    const deletedReport = await prisma.content.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: adminId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan berhasil dihapus',
      data: deletedReport
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus laporan'
    });
  }
}