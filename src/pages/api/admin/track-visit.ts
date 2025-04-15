// API handler untuk tracking kunjungan dengan masa berlaku 1 jam
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import Cors from "cors";

// Inisialisasi middleware CORS
const cors = Cors({
  methods: ["POST", "GET", "OPTIONS"],
  origin: "http://localhost:3000",
  credentials: true,
});

// Helper function untuk menjalankan middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Jalankan middleware CORS terlebih dahulu
  await runMiddleware(req, res, cors);

  // Tangani permintaan OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { sessionId, ipAddress, subMenuId, timestamp } = req.body;

      // Cek apakah ada sessionId atau ipAddress, minimal salah satu harus ada
      if ((!sessionId && !ipAddress) || !subMenuId) {
        return res.status(400).json({
          error: "Missing required fields",
          received: { sessionId, ipAddress, subMenuId, timestamp },
        });
      }

      const subMenuIdNumber = parseInt(String(subMenuId), 10);
      if (isNaN(subMenuIdNumber)) {
        return res
          .status(400)
          .json({ error: "subMenuId must be a valid number" });
      }

      // Periksa apakah subMenu dengan ID yang diberikan ada
      const subMenuExists = await prisma.sub_menu.findUnique({
        where: { id: subMenuIdNumber },
      });

      if (!subMenuExists) {
        return res
          .status(404)
          .json({ error: "Sub menu not found with the given ID" });
      }

      console.log("Received data:", {
        sessionId,
        ipAddress,
        subMenuId: subMenuIdNumber,
        timestamp,
      });
      // Hitung waktu 10 menit yang lalu
      const tenMinutesAgo = new Date();
      tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

      // Periksa apakah IP address atau sessionId ini sudah pernah mengunjungi subMenu ini dalam 10 menit terakhir
      const existingVisit = await prisma.visit.findFirst({
        where: {
          subMenuId: subMenuIdNumber,
          OR: [{ ipAddress: ipAddress }, { sessionId: sessionId }],
          timestamp: {
            gte: tenMinutesAgo, // Hanya cek kunjungan dalam 10 menit terakhir
          },
        },
      });

      // Jika sudah ada kunjungan dalam 1 jam terakhir, jangan buat record baru
      if (existingVisit) {
        return res.status(200).json({
          message:
            "Visit already recorded for this IP/session and subMenu within the last hour",
          visit: existingVisit,
        });
      }

      // Buat record kunjungan baru jika belum ada sebelumnya dalam 1 jam terakhir
      const visit = await prisma.visit.create({
        data: {
          sessionId: sessionId || "",
          ipAddress: ipAddress || null,
          subMenuId: subMenuIdNumber,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      });

      console.log("Created visit record:", visit);
      res.status(200).json({
        message: "Visit tracked successfully!",
        visit,
      });
    } catch (error) {
      console.error("Error tracking visit:", error);
      res.status(500).json({
        error: "Failed to track visit",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
