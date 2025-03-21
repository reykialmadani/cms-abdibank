// pages/api/storage/[filename].ts

import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;
  
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is required' });
  }

  // Log untuk debugging
  console.log(`API Route accessed: /api/storage/${filename}`);
  
  try {
    // Redirect ke URL /uploads/[filename]
    // Ini adalah solusi sementara untuk troubleshooting
    res.redirect(`/uploads/${filename}`);
  } catch (error) {
    console.error('Error in storage API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}