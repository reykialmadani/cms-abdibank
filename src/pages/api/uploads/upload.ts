import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// Konfigurasi formidable untuk disable parsing body secara otomatis
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads'); // Ubah ke 'uploads' untuk konsistensi

// Pastikan direktori upload ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Upload error:', err);
          res.status(500).json({ error: 'Upload gagal: ' + err.message });
          return resolve(true);
        }

        const file = files.file;
        if (!file || Array.isArray(file)) {
          res.status(400).json({ error: 'File invalid' });
          return resolve(true);
        }

        // Rename file untuk menghindari konflik nama
        const timestamp = Date.now();
        const originalFilename = file.originalFilename || 'unknown';
        const newFilename = `${timestamp}-${originalFilename.replace(/\s+/g, '-')}`;
        
        const oldPath = file.filepath;
        const newPath = path.join(uploadDir, newFilename);

        try {
          // Rename file jika nama berbeda
          if (oldPath !== newPath) {
            fs.renameSync(oldPath, newPath);
          }

          // Buat URL yang dapat diakses dari front-end
          // Gunakan URL relatif yang valid dari root domain
          const fileUrl = `/uploads/${newFilename}`;

          // Kembalikan URL file
          res.status(200).json({
            data: {
              url: fileUrl,
              name: originalFilename,
              size: file.size,
              type: file.mimetype,
            }
          });
          return resolve(true);
        } catch (error) {
          console.error('File processing error:', error);
          res.status(500).json({ error: 'Gagal memproses file' });
          return resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}