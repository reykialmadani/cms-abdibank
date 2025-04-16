import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

interface VisitData {
  subMenuId: number;
  subMenuName: string;
  menuName: string;
  visitCount: number;
  month: number;
  year: number;
  dailyVisits?: Record<string, number>;
  uniqueVisitors: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requestedMonth = req.query.month ? parseInt(req.query.month as string, 10) - 1 : new Date().getMonth();
    const requestedYear = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
    
    const startDate = new Date(requestedYear, requestedMonth, 1);
    const endDate = new Date(requestedYear, requestedMonth + 1, 0, 23, 59, 59, 999);
    
    // Group kunjungan berdasarkan subMenuId
    const visits = await prisma.visit.groupBy({
      by: ['subMenuId'],
      _count: {
        id: true
      },
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    // Hitung pengunjung unik (berdasarkan sessionId atau ipAddress)
    const uniqueVisitors = await Promise.all(
      visits.map(async (visit) => {
        const uniqueCount = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "ipAddress") as count
        FROM "Visit"
        WHERE "subMenuId" = ${visit.subMenuId}
        AND "timestamp" >= ${startDate}
        AND "timestamp" <= ${endDate}
        AND "ipAddress" IS NOT NULL
      `;
        return {
          subMenuId: visit.subMenuId,
          uniqueCount: Number(uniqueCount[0].count)
        };
      })
    );
    
    const subMenus = await prisma.sub_menu.findMany({
      where: {
        id: {
          in: visits.map(visit => visit.subMenuId)
        },
      },
      include: {
        menu: true,
      },
    });
    
    let formattedData: VisitData[] = visits.map(visit => {
      const subMenu = subMenus.find(sm => sm.id === visit.subMenuId);
      const uniqueVisitorInfo = uniqueVisitors.find(uv => uv.subMenuId === visit.subMenuId);
      
      return {
        subMenuId: visit.subMenuId,
        subMenuName: subMenu?.sub_menu_name || 'Unknown',
        menuName: subMenu?.menu?.menu_name || 'Unknown',
        visitCount: visit._count.id,
        uniqueVisitors: uniqueVisitorInfo?.uniqueCount || 0,
        month: requestedMonth + 1,
        year: requestedYear,
      };
    });
    
    if (req.query.daily === 'true') {
      const dailyVisits = await prisma.visit.groupBy({
        by: ['subMenuId', 'timestamp'],
        _count: {
          id: true
        },
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
      
      const dailyData: Record<number, Record<string, number>> = {};
      
      dailyVisits.forEach(visit => {
        const date = new Date(visit.timestamp).toISOString().split('T')[0];
        const subMenuId = visit.subMenuId;
        
        if (!dailyData[subMenuId]) {
          dailyData[subMenuId] = {};
        }
        
        dailyData[subMenuId][date] = (dailyData[subMenuId][date] || 0) + visit._count.id;
      });
      
      formattedData = formattedData.map(item => ({
        ...item,
        dailyVisits: dailyData[item.subMenuId] || {},
      }));
    }
    
    console.log("API Response:", {
      month: requestedMonth + 1,
      year: requestedYear,
      data: formattedData,
    });
    
    res.status(200).json({
      month: requestedMonth + 1,
      year: requestedYear,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching monthly visit data:", error);
    res.status(500).json({
      error: "Failed to fetch visit data",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}