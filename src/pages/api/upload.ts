// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable bodyParser to handle form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API upload handler called with method:", req.method);
  
  // Only accept POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  console.log("Upload directory:", uploadDir);
  
  try {
    await fs.access(uploadDir);
  } catch (error) {
    console.log("Creating upload directory...");
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Configure formidable
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  return new Promise((resolve, reject) => {
    // Parse form data
    form.parse(req, async (err, fields, files) => {
      console.log("Form parsing complete");
      
      if (err) {
        console.error('Error parsing form:', err);
        res.status(500).json({ error: 'Gagal mengupload file' });
        return resolve(true);
      }

      try {
        // Get uploaded file
        const fileField = files.file;
        if (!fileField) {
          console.error('No file uploaded');
          res.status(400).json({ error: 'Tidak ada file yang diupload' });
          return resolve(true);
        }

        const file = Array.isArray(fileField) ? fileField[0] : fileField;
        console.log("File received:", file.originalFilename);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype || '')) {
          console.error('Invalid file type:', file.mimetype);
          res.status(400).json({ error: 'Tipe file tidak diizinkan' });
          return resolve(true); 
        }

        // Generate unique filename
        const uniqueFilename = `${uuidv4()}${path.extname(file.originalFilename || '')}`;
        const destinationPath = path.join(uploadDir, uniqueFilename);
        console.log("Saving file to:", destinationPath);

        // Move file to permanent location
        await fs.rename(file.filepath, destinationPath);

        // Return file data
        const responseData = {
          data: {
            url: `/uploads/${uniqueFilename}`,
            name: file.originalFilename,
            type: file.mimetype,
            size: file.size,
          },
        };
        console.log("Response data:", responseData);
        
        res.status(200).json(responseData);
        return resolve(true);
      } catch (error) {
        console.error('Error handling file:', error);
        res.status(500).json({ error: 'Gagal memproses file' });
        return resolve(true);
      }
    });
  });
}