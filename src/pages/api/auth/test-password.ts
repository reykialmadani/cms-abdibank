// pages/api/auth/test-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, comparePassword } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { plainPassword } = req.body;
  
  if (!plainPassword) {
    return res.status(400).json({ error: 'Password diperlukan' });
  }
  
  try {
    // Hash password
    const hashedPassword = await hashPassword(plainPassword);
    
    // Test comparison
    const isMatch = await comparePassword(plainPassword, hashedPassword);
    
    return res.status(200).json({
      originalPassword: plainPassword,
      hashedResult: hashedPassword,
      comparisonMatch: isMatch,
      isHashValid: hashedPassword.startsWith('$2')
    });
  } catch (error) {
    console.error('Error testing password functions:', error);
    return res.status(500).json({ 
      error: 'Terjadi kesalahan saat testing fungsi password',
      details: (error as Error).message
    });
  }
}