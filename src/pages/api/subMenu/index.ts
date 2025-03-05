import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, sub_menu } from '@prisma/client'

const prisma = new PrismaClient()

type SubMenuCreateInput = {
  menu_id: number
  sub_menu_name: string
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
  res: NextApiResponse<ApiResponse<sub_menu[] | sub_menu | null>>
) {
  if (req.method === 'GET') {
    try {
      const submenus = await prisma.sub_menu.findMany({
        orderBy: {
          order_position: 'asc'
        },
        include: {
          menu: true
        }
      })
      res.status(200).json({ data: submenus })
    } catch (error) {
      console.error('Error fetching submenus:', error)
      res.status(500).json({ error: 'Gagal mengambil data submenu' })
    }
  } else if (req.method === 'POST') {
    try {
      const { menu_id, sub_menu_name, order_position, url, status, updated_by } = req.body as SubMenuCreateInput

      if (!menu_id || !sub_menu_name) {
        return res.status(400).json({ error: 'menu_id and sub_menu_name are required' })
      }

      const menuExists = await prisma.menu.findUnique({
        where: { id: menu_id }
      })

      if (!menuExists) {
        return res.status(400).json({ error: 'Menu ID tidak valid' })
      }

      const newSubmenu = await prisma.sub_menu.create({
        data: {
          menu_id,
          sub_menu_name,
          order_position: order_position || 1,
          url: url || '',
          status: status !== undefined ? status : true,
          updated_by: updated_by || null
        }
      })
      res.status(201).json({ data: newSubmenu })
    } catch (error) {
      console.error('Error creating submenu:', error)
      res.status(400).json({ error: 'Gagal membuat submenu baru' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
