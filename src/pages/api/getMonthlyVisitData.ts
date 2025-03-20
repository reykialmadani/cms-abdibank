// pages/api/getMonthlyVisitData.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requestedMonth = req.query.month ? parseInt(req.query.month as string, 10) - 1 : new Date().getMonth();
    const requestedYear = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

    // Dapatkan tanggal awal dan akhir bulan
    const startDate = new Date(requestedYear, requestedMonth, 1);
    const endDate = new Date(requestedYear, requestedMonth + 1, 0, 23, 59, 59, 999);

    // Dapatkan data kunjungan berdasarkan subMenuId
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

    const subMenus = await prisma.sub_menu.findMany({
      where: {
        id: {
          in: visits.map(visit => visit.subMenuId)
        }
      },
      include: {
        menu: true
      }
    });

    const formattedData = visits.map(visit => {
      const subMenu = subMenus.find(sm => sm.id === visit.subMenuId);
      return {
        subMenuId: visit.subMenuId,
        subMenuName: subMenu?.sub_menu_name || 'Unknown',
        menuName: subMenu?.menu?.menu_name || 'Unknown',
        visitCount: visit._count.id,
        month: requestedMonth + 1,
        year: requestedYear
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

      // Kelompokkan kunjungan harian berdasarkan subMenuId
      const dailyData = dailyVisits.reduce((acc, visit) => {
        const date = new Date(visit.timestamp).toISOString().split('T')[0];
        const subMenuId = visit.subMenuId;
        
        if (!acc[subMenuId]) {
          acc[subMenuId] = {};
        }
        
        if (!acc[subMenuId][date]) {
          acc[subMenuId][date] = 0;
        }
        
        acc[subMenuId][date] += visit._count.id;
        return acc;
      }, {});

      // Tambahkan data harian ke respons
      formattedData.forEach(item => {
        item.dailyVisits = dailyData[item.subMenuId] || {};
      });
    }

    // Log untuk debugging
    console.log("API Response:", {
      month: requestedMonth + 1,
      year: requestedYear,
      data: formattedData
    });

    res.status(200).json({
      month: requestedMonth + 1,
      year: requestedYear,
      data: formattedData
    });
  } catch (error) {
    console.error("Error fetching monthly visit data:", error);
    res.status(500).json({ 
      error: "Failed to fetch visit data", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}