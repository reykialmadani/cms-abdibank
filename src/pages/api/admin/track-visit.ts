import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import Cors from 'cors';

// Inisialisasi middleware CORS
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS'],
  origin: 'http://localhost:3000', // URL frontend Anda
  credentials: true,
});

// Helper function untuk menjalankan middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Jalankan middleware CORS terlebih dahulu
  await runMiddleware(req, res, cors);
  
  // Tangani permintaan OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === "POST") {
    try {
      const { sessionId, subMenuId, timestamp } = req.body;
      
      if (!sessionId || !subMenuId) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          received: { sessionId, subMenuId, timestamp } 
        });
      }
      
      const subMenuIdNumber = parseInt(String(subMenuId), 10);
      
      if (isNaN(subMenuIdNumber)) {
        return res.status(400).json({ error: "subMenuId must be a valid number" });
      }
      
      // Periksa apakah subMenu dengan ID yang diberikan ada
      const subMenuExists = await prisma.sub_menu.findUnique({
        where: { id: subMenuIdNumber }
      });
      
      if (!subMenuExists) {
        return res.status(404).json({ error: "Sub menu not found with the given ID" });
      }
      
      console.log("Received data:", { sessionId, subMenuId: subMenuIdNumber, timestamp });
      
      // Buat record kunjungan baru
      const visit = await prisma.visit.create({
        data: {
          sessionId,
          subMenuId: subMenuIdNumber,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      });
      
      console.log("Created visit record:", visit);
      
      res.status(200).json({ message: "Visit tracked successfully!", visit });
    } catch (error) {
      console.error("Error tracking visit:", error);
      res.status(500).json({
        error: "Failed to track visit",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}