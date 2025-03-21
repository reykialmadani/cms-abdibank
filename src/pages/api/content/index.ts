import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ContentCreateInput = {
  sub_menu_id: number;
  title: string;
  description?: string;
  required_documents?: string;
  thumbnail?: string;
  status?: boolean;
  updated_by?: number | null;
  report_type?: string;
  report_year?: string;
};

type ApiResponse<T> = {
  error?: string;
  data?: T;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  if (req.method === "GET") {
    // console.log("kocakkk");
    try {
      const contents = await prisma.content.findMany({
        include: {
          sub_menu: true,
        },
      });
      res.status(200).json({ data: contents });
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ error: "Gagal mengambil data content" });
    }
  } else if (req.method === "POST") {
    try {
      const {
        sub_menu_id,
        title,
        description,
        required_documents,
        thumbnail,
        status,
        updated_by,
        report_type,
        report_year,
      } = req.body as ContentCreateInput;

      if (!sub_menu_id || !title) {
        return res
          .status(400)
          .json({ error: "sub_menu_id and title are required" });
      }

      // Cek apakah sub_menu_id valid
      const submenuExists = await prisma.sub_menu.findUnique({
        where: { id: sub_menu_id },
      });

      if (!submenuExists) {
        return res.status(400).json({ error: "Sub Menu ID tidak valid" });
      }

      // Persiapkan data untuk membuat content baru
      const contentData: any = {
        sub_menu_id,
        title,
        description: description || null,
        required_documents: required_documents || null,
        thumbnail: thumbnail || null,
        status: status !== undefined ? status : true,
        updated_by: updated_by || null,
      };

      if (report_type) {
        contentData.report_type = report_type;
      }

      if (report_year) {
        contentData.report_year = report_year;
      }

      const newContent = await prisma.content.create({
        data: contentData,
      });

      res
        .status(201)
        .json({ data: newContent, message: "Content berhasil dibuat" });
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(400).json({ error: "Gagal membuat content baru" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
