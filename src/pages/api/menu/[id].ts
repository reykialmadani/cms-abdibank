import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type MenuUpdateInput = {
  menu_name?: string
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
  const { id } = req.query
  const menuId = parseInt(id as string)
  
  if (isNaN(menuId)) {
    return res.status(400).json({ error: 'ID tidak valid' })
  }

  if (req.method === 'GET') {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id: menuId },
        include: {
          sub_menu: true // Mengambil submenu yang berelasi
        }
      })
      
      if (!menu) {
        return res.status(404).json({ error: 'Menu tidak ditemukan' })
      }
      
      res.status(200).json({ data: menu })
    } catch (error) {
        console.error(error)
      res.status(500).json({ error: 'Gagal mengambil data menu' })
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { menu_name, order_position, url, status, updated_by } = req.body as MenuUpdateInput
      
      const updatedMenu = await prisma.menu.update({
        where: { id: menuId },
        data: {
          ...(menu_name && { menu_name }),
          ...(order_position !== undefined && { order_position }),
          ...(url !== undefined && { url }),
          ...(status !== undefined && { status }),
          ...(updated_by !== undefined && { updated_by }),
          updated_at: new Date()
        }
      })
      
      res.status(200).json({ data: updatedMenu })
    } catch (error) {
      console.error('Error updating menu:', error)
      res.status(400).json({ error: 'Gagal memperbarui menu' })
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah menu memiliki submenu
      const submenuCount = await prisma.sub_menu.count({
        where: { menu_id: menuId }
      })
      
      if (submenuCount > 0) {
        return res.status(400).json({ 
          error: 'Menu tidak dapat dihapus karena memiliki submenu yang terkait' 
        })
      }
      
      await prisma.menu.delete({
        where: { id: menuId }
      })
      
      res.status(200).json({ message: 'Menu berhasil dihapus' })
    } catch (error) {
        console.error('Error deleting menu:', error)
      res.status(400).json({ error: 'Gagal menghapus menu' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
