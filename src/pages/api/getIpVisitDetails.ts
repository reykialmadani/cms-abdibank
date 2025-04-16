// File: src/pages/api/getIpVisitDetails.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma"; // Sesuaikan path sesuai struktur proyek Anda

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Log request untuk debugging
    console.log("API Request getIpVisitDetails:", req.query);
    
    const requestedMonth = req.query.month ? parseInt(req.query.month as string, 10) - 1 : new Date().getMonth();
    const requestedYear = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
    
    const startDate = new Date(requestedYear, requestedMonth, 1);
    const endDate = new Date(requestedYear, requestedMonth + 1, 0, 23, 59, 59, 999);
    
    console.log("Date range for IP details:", { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });

    // Kita akan menggunakan approach raw untuk mendapatkan hasil yang spesifik
    // karena kita perlu menggabungkan dan menghitung data
    try {
      const results = await prisma.$queryRaw`
        SELECT 
          v."ipAddress",
          sm."sub_menu_name" AS "subMenuName",
          m."menu_name" AS "menuName",
          COUNT(*) AS "visitCount",
          MAX(v."timestamp") AS "lastVisit"
        FROM "Visit" v
        JOIN "sub_menu" sm ON v."subMenuId" = sm.id
        LEFT JOIN "menu" m ON sm."menu_id" = m.id
        WHERE 
          v."timestamp" >= ${startDate}
          AND v."timestamp" <= ${endDate}
          AND v."ipAddress" IS NOT NULL
        GROUP BY v."ipAddress", sm."sub_menu_name", m."menu_name"
        ORDER BY v."ipAddress", "visitCount" DESC
      `;

      console.log(`Query executed successfully. Found ${Array.isArray(results) ? results.length : 0} results`);
      
      // Pastikan hasil adalah array
      const ipDetails = Array.isArray(results) ? results : [];
      
      // Kirim response
      res.status(200).json({
        month: requestedMonth + 1,
        year: requestedYear,
        ipDetails: ipDetails
      });
    } catch (queryError) {
      console.error("Error executing raw query:", queryError);
      
      // Jika raw query gagal, coba pendekatan alternatif dengan Prisma API
      console.log("Trying alternative approach with Prisma API...");
      
      // Dapatkan semua kunjungan dengan IP dalam rentang tanggal
      const visits = await prisma.visit.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate
          },
          ipAddress: {
            not: null
          }
        },
        include: {
          sub_menu: {
            include: {
              menu: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      console.log(`Found ${visits.length} visits with IP addresses`);

      // Transformasi data manual
      const ipDetailsMap = new Map();
      
      for (const visit of visits) {
        if (!visit.ipAddress) continue;
        
        // Key menggabungkan IP dan halaman untuk keunikan
        const key = `${visit.ipAddress}-${visit.subMenuId}`;
        
        if (!ipDetailsMap.has(key)) {
          ipDetailsMap.set(key, {
            ipAddress: visit.ipAddress,
            subMenuName: visit.sub_menu?.sub_menu_name || 'Unknown',
            menuName: visit.sub_menu?.menu?.menu_name || 'Unknown',
            visitCount: 1,
            lastVisit: visit.timestamp.toISOString()
          });
        } else {
          const existing = ipDetailsMap.get(key);
          existing.visitCount += 1;
          
          // Update lastVisit jika kunjungan ini lebih baru
          const currentVisitTime = new Date(visit.timestamp).getTime();
          const existingLastVisitTime = new Date(existing.lastVisit).getTime();
          
          if (currentVisitTime > existingLastVisitTime) {
            existing.lastVisit = visit.timestamp.toISOString();
          }
        }
      }
      
      // Convert map to array
      const ipDetails = Array.from(ipDetailsMap.values());
      
      console.log(`Returning ${ipDetails.length} unique IP-page combinations using alternative approach`);
      
      // Kirim hasil
      res.status(200).json({
        month: requestedMonth + 1,
        year: requestedYear,
        ipDetails: ipDetails
      });
    }
  } catch (error) {
    console.error("API Error in getIpVisitDetails:", error);
    
    res.status(500).json({
      error: "Failed to fetch IP visit details",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}