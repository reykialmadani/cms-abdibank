import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: "Metode tidak diizinkan",
        });
    }
  } catch (error) {
    console.error("Error in /api/report:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

interface ReportQuery extends Record<string, string | string[] | undefined> {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  report_type?: string;
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = "1",
    limit = "10",
    search = "",
    status = "",
    report_type = "",
  } = req.query as ReportQuery;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const where: Record<string, unknown> = {
    deleted_at: null,
    title: {
      contains: search,
      mode: "insensitive",
    },
  };

  if (status === "active") {
    where.status = true;
  } else if (status === "inactive") {
    where.status = false;
  }

  if (report_type) {
    switch (report_type) {
      case "tahunan":
        where.report_year = { not: null };
        where.report_type = null;
        break;
      case "bulanan":
        where.report_type = { not: null };
        where.report_year = { not: null };
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
    where.OR = [
      { report_type: { not: null } },
      { report_year: { not: null } },
    ];
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
        updater: admin?.username ?? null,
        sub_menu_name: sub_menu?.sub_menu_name ?? null,
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

interface ReportPostBody {
  sub_menu_id: string;
  title: string;
  month?: string;
  year?: string;
  report_type?: "tahunan" | "bulanan" | "tata-kelola" | "publikasi" | null;
  required_documents?: string;
  status?: boolean | number;
  updated_by?: string | number | null;
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      sub_menu_id,
      title,
      month,
      year,
      report_type,
      required_documents,
      status,
      updated_by = null,
    }: ReportPostBody = req.body;

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
      return res.status(400).json({
        success: false,
        message: "Laporan tahunan memerlukan tahun",
      });
    }

    const reportData: {
      sub_menu_id: number;
      title: string;
      required_documents?: string;
      status: boolean;
      updated_by: number | null;
      report_type?: string | null;
      report_year?: string;
    } = {
      sub_menu_id: parseInt(sub_menu_id, 10),
      title,
      required_documents,
      status: status === true || status === 1,
      updated_by: updated_by ? parseInt(updated_by.toString(), 10) : null,
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
        reportData.report_year = year || new Date().getFullYear().toString();
        break;
    }

    const newReport = await prisma.content.create({ data: reportData });

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
