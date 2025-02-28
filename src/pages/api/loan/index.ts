import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type LoanCreateInput = {
  content_id: number
  loan_type: string
  nominal: string
  annual_interest_rate: number
  interest_type: string
  loan_term: string
  collateral: string
  cost: string
  provisions: number
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
      const loans = await prisma.loan.findMany({
        include: {
          content: true // Mengambil data content yang berelasi
        }
      })
      res.status(200).json({ data: loans })
    } catch (error) {
      console.error('Error fetching loans:', error)
      res.status(500).json({ error: 'Gagal mengambil data loan' })
    }
  } else if (req.method === 'POST') {
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
      } = req.body as LoanCreateInput
      
      if (!content_id) {
        return res.status(400).json({ error: 'content_id is required' })
      }
      
      // Cek apakah content_id valid
      const contentExists = await prisma.content.findUnique({
        where: { id: content_id }
      })
      
      if (!contentExists) {
        return res.status(400).json({ error: 'Content ID tidak valid' })
      }
      
      const newLoan = await prisma.loan.create({
        data: {
          content_id,
          loan_type,
          nominal,
          annual_interest_rate,
          interest_type,
          loan_term,
          collateral,
          cost,
          provisions,
          updated_by: updated_by || null
        }
      })
      res.status(201).json({ data: newLoan })
    } catch (error) {
      console.error('Error creating loan:', error)
      res.status(400).json({ error: 'Gagal membuat loan baru' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}