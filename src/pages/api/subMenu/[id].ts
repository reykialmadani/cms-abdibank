import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type SubMenuUpdateInput = {
  menu_id?: number
  sub_menu_name?: string
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
  const submenuId = parseInt(id as string)
  
  if (isNaN(submenuId)) {
    return res.status(400).json({ error: 'ID tidak valid' })
  }

  if (req.method === 'GET') {
    try {
      const submenu = await prisma.sub_menu.findUnique({
        where: { id: submenuId },
        include: {
          menu: true // Mengambil data menu yang berelasi
        }
      })
      
      if (!submenu) {
        return res.status(404).json({ error: 'Submenu tidak ditemukan' })
      }
      
      res.status(200).json({ data: submenu })
    } catch (error) {
        console.error(error)
      res.status(500).json({ error: 'Gagal mengambil data submenu' })
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { menu_id, sub_menu_name, order_position, url, status, updated_by } = req.body as SubMenuUpdateInput
      
      // Jika menu_id berubah, periksa apakah valid
      if (menu_id) {
        const menuExists = await prisma.menu.findUnique({
          where: { id: menu_id }
        })
        
        if (!menuExists) {
          return res.status(400).json({ error: 'Menu ID tidak valid' })
        }
      }
      
      const updatedSubmenu = await prisma.sub_menu.update({
        where: { id: submenuId },
        data: {
          ...(menu_id !== undefined && { menu_id }),
          ...(sub_menu_name && { sub_menu_name }),
          ...(order_position !== undefined && { order_position }),
          ...(url !== undefined && { url }),
          ...(status !== undefined && { status }),
          ...(updated_by !== undefined && { updated_by }),
          updated_at: new Date()
        }
      })
      
      res.status(200).json({ data: updatedSubmenu })
    } catch (error) {
      console.error('Error updating submenu:', error)
      res.status(400).json({ error: 'Gagal memperbarui submenu' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.sub_menu.delete({
        where: { id: submenuId }
      })
      
      res.status(200).json({ message: 'Submenu berhasil dihapus' })
    } catch (error) {
        console.error('Error deleting submenu:', error)
      res.status(400).json({ error: 'Gagal menghapus submenu' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}