// /api/report.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Tangani metode HTTP yang berbeda tanpa proteksi token
    switch (req.method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
      default:
        return res
          .status(405)
          .json({ success: false, message: "Metode tidak diizinkan" });
    }
  } catch (error) {
    console.error("Error in /api/report:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
}

// Fungsi untuk menangani permintaan GET
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = "1",
    limit = "10",
    search = "",
    status = "",
    report_type = "", // Parameter baru untuk tipe laporan
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  // Bangun kondisi filter
  const where: any = {
    deleted_at: null,
    title: { contains: search as string, mode: "insensitive" },
  };

  // Filter berdasarkan status jika disediakan
  if (status === "active") {
    where.status = true;
  } else if (status === "inactive") {
    where.status = false;
  }

  // Filter berdasarkan tipe laporan
  if (report_type) {
    switch (report_type) {
      case "tahunan":
        where.report_year = { not: null };
        where.report_type = null; // Asumsi laporan tahunan tidak memiliki month/report_type
        break;
      case "bulanan":
        where.report_type = { not: null }; // Laporan bulanan memiliki bulan
        where.report_year = { not: null }; // Dan juga tahun
        break;
      case "tata-kelola":
        where.report_type = "tata-kelola";
        break;
      case "publikasi":
        where.report_type = "publikasi";
        break;
      default:
        where.OR = [
          { report_type: { not: null } },
          { report_year: { not: null } },
        ];
        break;
    }
  } else {
    where.OR = [{ report_type: { not: null } }, { report_year: { not: null } }];
  }

  try {
    const totalCount = await prisma.content.count({ where });

    const reports = await prisma.content.findMany({
      where,
      include: {
        admin: { select: { username: true } },
        sub_menu: { select: { sub_menu_name: true } },
      },
      orderBy: { updated_at: "desc" },
      skip,
      take: limitNumber,
    });

    const formattedReports = reports.map((report) => {
      const { admin, sub_menu, ...reportData } = report;

      let kategori = "";
      if (report.report_type === "tata-kelola") {
        kategori = "Tata Kelola";
      } else if (report.report_type === "publikasi") {
        kategori = "Publikasi";
      } else if (report.report_type && report.report_year) {
        kategori = "Laporan Bulanan";
      } else if (report.report_year && !report.report_type) {
        kategori = "Laporan Tahunan";
      }

      return {
        ...reportData,
        kategori,
        updater: admin?.username || null,
        sub_menu_name: sub_menu?.sub_menu_name || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedReports,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data laporan",
    });
  }
}

// Fungsi untuk menangani permintaan POST (jika tetap ingin dipakai tanpa proteksi)
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      sub_menu_id,
      title,
      month,
      year,
      report_type, // Bisa berisi: null, 'tata-kelola', 'publikasi'
      required_documents,
      status,
      updated_by = null,
    } = req.body;

    if (!sub_menu_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap. Harap isi semua field yang diperlukan",
      });
    }

    if (report_type === "bulanan" && (!month || !year)) {
      return res.status(400).json({
        success: false,
        message: "Laporan bulanan memerlukan bulan dan tahun",
      });
    }

    if (report_type === "tahunan" && !year) {
      return res
        .status(400)
        .json({ success: false, message: "Laporan tahunan memerlukan tahun" });
    }

    const reportData: any = {
      sub_menu_id: parseInt(sub_menu_id),
      title,
      required_documents,
      status: status === 1 || status === true,
      updated_by: updated_by ? parseInt(updated_by.toString()) : null,
    };

    switch (report_type) {
      case "bulanan":
        reportData.report_type = `${month}`;
        reportData.report_year = year;
        break;
      case "tahunan":
        reportData.report_year = year;
        break;
      case "tata-kelola":
      case "publikasi":
        reportData.report_type = report_type;
        reportData.report_year = year || new Date().getFullYear();
        break;
    }

    const newReport = await prisma.content.create({
      data: reportData,
    });

    return res.status(201).json({
      success: true,
      message: "Laporan berhasil dibuat",
      data: newReport,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat laporan",
    });
  }
}
