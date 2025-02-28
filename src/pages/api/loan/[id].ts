import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type LoanUpdateInput = {
  content_id?: number
  loan_type?: string
  nominal?: string
  annual_interest_rate?: number
  interest_type?: string
  loan_term?: string
  collateral?: string
  cost?: string
  provisions?: number
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
  const loanId = parseInt(id as string)
  
  if (isNaN(loanId)) {
    return res.status(400).json({ error: 'ID tidak valid' })
  }

  if (req.method === 'GET') {
    try {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
          content: {
            include: {
              sub_menu: {
                include: {
                  menu: true // Mengambil data menu yang berelasi dengan sub_menu
                }
              }
            }
          }
        }
      })
      
      if (!loan) {
        return res.status(404).json({ error: 'Loan tidak ditemukan' })
      }
      
      res.status(200).json({ data: loan })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Gagal mengambil data loan' })
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { 
        content_id,
        loan_type,
        nominal,
        annual_interest_rate,
        interest_type,
        loan_term,
        collateral,
        cost,
        provisions,
        updated_by
      } = req.body as LoanUpdateInput
      
      // Jika content_id berubah, periksa apakah valid
      if (content_id) {
        const contentExists = await prisma.content.findUnique({
          where: { id: content_id }
        })
        
        if (!contentExists) {
          return res.status(400).json({ error: 'Content ID tidak valid' })
        }
      }
      
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          ...(content_id !== undefined && { content_id }),
          ...(loan_type !== undefined && { loan_type }),
          ...(nominal !== undefined && { nominal }),
          ...(annual_interest_rate !== undefined && { annual_interest_rate }),
          ...(interest_type !== undefined && { interest_type }),
          ...(loan_term !== undefined && { loan_term }),
          ...(collateral !== undefined && { collateral }),
          ...(cost !== undefined && { cost }),
          ...(provisions !== undefined && { provisions }),
          ...(updated_by !== undefined && { updated_by }),
          updated_at: new Date()
        }
      })
      
      res.status(200).json({ data: updatedLoan })
    } catch (error) {
      console.error('Error updating loan:', error)
      res.status(400).json({ error: 'Gagal memperbarui loan' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.loan.delete({
        where: { id: loanId }
      })
      
      res.status(200).json({ message: 'Loan berhasil dihapus' })
    } catch (error) {
      console.error('Error deleting loan:', error)
      res.status(400).json({ error: 'Gagal menghapus loan' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}