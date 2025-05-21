// /api/report/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID laporan tidak valid" });
    }

    if (id === "filter") {
      return handleFilteredReports(req, res);
    }

    const idStr = id.toString();

    if (idStr.startsWith("report=")) {
      const reportType = idStr.split("report=")[1];
      return handleReportTypeFilter(reportType, req, res);
    }

    const reportId = parseInt(idStr, 10);
    if (isNaN(reportId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID laporan harus berupa angka" });
    }

    switch (req.method) {
      case "GET":
        return handleGet(reportId, res);
      case "PUT":
      case "DELETE":
        return res.status(403).json({
          success: false,
          message: `Metode ${req.method} tidak diizinkan pada endpoint publik`,
        });
      default:
        return res
          .status(405)
          .json({ success: false, message: "Metode tidak diizinkan" });
    }
  } catch (error) {
    console.error("Error in /api/report/[id]:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
}

// Utility: menentukan kategori laporan
function getKategori(report: any): string {
  if (report.report_type === "tata-kelola") return "Tata Kelola";
  if (report.report_type === "publikasi") return "Publikasi";
  if (report.report_type && report.report_year) return "Laporan Bulanan";
  if (report.report_year && !report.report_type) return "Laporan Tahunan";
  return "";
}
function getNamaBulan(
  bulan: string | number | null | undefined
): string | null {
  const bulanMap = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const index = parseInt(bulan as string, 10);
  if (!isNaN(index) && index >= 1 && index <= 12) {
    return bulanMap[index - 1];
  }
  return null;
}

// Handler: GET berdasarkan ID
async function handleGet(id: number, res: NextApiResponse) {
  try {
    const report = await prisma.content.findUnique({
      where: { id, deleted_at: null },
      include: {
        admin: { select: { username: true } },
        sub_menu: {
          select: {
            sub_menu_name: true,
            menu_id: true,
            menu: { select: { menu_name: true } },
          },
        },
      },
    });

    if (!report || (!report.report_type && !report.report_year)) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan atau bukan laporan",
      });
    }

    const { admin, sub_menu, ...reportData } = report;

    return res.status(200).json({
      success: true,
      data: {
        ...reportData,
        kategori: getKategori(report),
        month: !["tata-kelola", "publikasi"].includes(report.report_type || "")
          ? getNamaBulan(report.report_type!)
          : null,
        year: report.report_year,
        updater: admin?.username || null,
        sub_menu_name: sub_menu?.sub_menu_name || null,
        menu_name: sub_menu?.menu?.menu_name || null,
      },
    });
  } catch (error) {
    console.error("Error fetching report by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data laporan",
    });
  }
}

// Handler: laporan berdasarkan tipe
async function handleReportTypeFilter(
  reportType: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = "1", limit = "10", search = "", status = "" } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const where: any = { deleted_at: null };

  if (search) {
    where.title = { contains: search as string, mode: "insensitive" };
  }
  if (status === "active") where.status = true;
  if (status === "inactive") where.status = false;

  switch (reportType.toLowerCase()) {
    case "tahunan":
      where.report_year = { not: null };
      where.report_type = null;
      break;
    case "bulanan":
      where.report_year = { not: null };
      where.report_type = { notIn: ["tata-kelola", "publikasi"] };
      break;
    case "tata-kelola":
      where.report_type = "tata-kelola";
      break;
    case "publikasi":
      where.report_type = "publikasi";
      break;
    default:
      return res.status(400).json({
        success: false,
        message:
          "Tipe laporan tidak valid. Gunakan: tahunan, bulanan, tata-kelola, atau publikasi",
      });
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

    const formattedReports = reports.map((report) => ({
      ...report,
      kategori: getKategori(report),
      updater: report.admin?.username || null,
      sub_menu_name: report.sub_menu?.sub_menu_name || null,
      month: !["tata-kelola", "publikasi"].includes(report.report_type || "")
        ? getNamaBulan(report.report_type)
        : null,
    }));

    return res.status(200).json({
      success: true,
      reportType,
      data: formattedReports,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    console.error(`Error fetching ${reportType} reports:`, error);
    return res.status(500).json({
      success: false,
      message: `Terjadi kesalahan saat mengambil data laporan ${reportType}`,
    });
  }
}

// Handler: filter dinamis berdasarkan query
async function handleFilteredReports(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    type,
    year,
    month,
    page = "1",
    limit = "10",
    search = "",
    status = "",
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const where: any = { deleted_at: null };

  if (search) {
    where.title = { contains: search as string, mode: "insensitive" };
  }
  if (status === "active") where.status = true;
  if (status === "inactive") where.status = false;

  if (type) {
    switch (type.toString().toLowerCase()) {
      case "tahunan":
        where.report_year = { not: null };
        where.report_type = null;
        break;
      case "bulanan":
        where.report_year = { not: null };
        where.report_type = { notIn: ["tata-kelola", "publikasi"] };
        break;
      case "tata-kelola":
        where.report_type = "tata-kelola";
        break;
      case "publikasi":
        where.report_type = "publikasi";
        break;
    }
  }

  if (year) {
    where.report_year = year.toString();
  }

  if (
    month &&
    !["tata-kelola", "publikasi"].includes(month.toString().toLowerCase())
  ) {
    where.report_type = month.toString();
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

    const formattedReports = reports.map((report) => ({
      ...report,
      kategori: getKategori(report),
      updater: report.admin?.username || null,
      sub_menu_name: report.sub_menu?.sub_menu_name || null,
    }));

    return res.status(200).json({
      success: true,
      filters: { type, year, month },
      data: formattedReports,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching filtered reports:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data laporan terfilter",
    });
  }
}
