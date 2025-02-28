import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type ContentUpdateInput = {
  sub_menu_id?: number
  title?: string
  description?: string | null
  required_documents?: string | null
  thumbnail?: string | null
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
  const contentId = parseInt(id as string)
  
  if (isNaN(contentId)) {
    return res.status(400).json({ error: 'ID tidak valid' })
  }

  if (req.method === 'GET') {
    try {
      const content = await prisma.content.findUnique({
        where: { id: contentId },
        include: {
          sub_menu: {
            include: {
              menu: true // Mengambil data menu yang berelasi dengan sub_menu
            }
          }
        }
      })
      
      if (!content) {
        return res.status(404).json({ error: 'Content tidak ditemukan' })
      }
      
      res.status(200).json({ data: content })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Gagal mengambil data content' })
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { 
        sub_menu_id, 
        title, 
        description, 
        required_documents, 
        thumbnail, 
        status, 
        updated_by 
      } = req.body as ContentUpdateInput
      
      // Jika sub_menu_id berubah, periksa apakah valid
      if (sub_menu_id) {
        const submenuExists = await prisma.sub_menu.findUnique({
          where: { id: sub_menu_id }
        })
        
        if (!submenuExists) {
          return res.status(400).json({ error: 'Sub Menu ID tidak valid' })
        }
      }
      
      const updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          ...(sub_menu_id !== undefined && { sub_menu_id }),
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(required_documents !== undefined && { required_documents }),
          ...(thumbnail !== undefined && { thumbnail }),
          ...(status !== undefined && { status }),
          ...(updated_by !== undefined && { updated_by }),
          updated_at: new Date()
        }
      })
      
      res.status(200).json({ data: updatedContent })
    } catch (error) {
      console.error('Error updating content:', error)
      res.status(400).json({ error: 'Gagal memperbarui content' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.content.delete({
        where: { id: contentId }
      })
      
      res.status(200).json({ message: 'Content berhasil dihapus' })
    } catch (error) {
      console.error('Error deleting content:', error)
      res.status(400).json({ error: 'Gagal menghapus content' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}