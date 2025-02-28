import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type MenuCreateInput = {
  menu_name: string
  order_position?: number
  url?: string
  status?: boolean
  updated_by?: number | null
}

type ApiResponse<T> = {
  error?: string
  data?: T
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  if (req.method === 'GET') {
    try {
      const menus = await prisma.menu.findMany({
        orderBy: {
          order_position: 'asc'
        }
      })
      res.status(200).json({ data: menus })
    } catch (error) {
      console.error('Error fetching menus:', error)
      res.status(500).json({ error: 'Gagal mengambil data menu' })
    }
  } else if (req.method === 'POST') {
    try {
      const { menu_name, order_position, url, status, updated_by } = req.body as MenuCreateInput
      
      if (!menu_name) {
        return res.status(400).json({ error: 'menu_name is required' })
      }
      
      const newMenu = await prisma.menu.create({
        data: {
          menu_name,
          order_position: order_position || 1,
          url: url || '',
          status: status !== undefined ? status : true,
          updated_by: updated_by || null
        }
      })
      res.status(201).json({ data: newMenu })
    } catch (error) {
      console.error('Error creating menu:', error)
      res.status(400).json({ error: 'Gagal membuat menu baru' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}