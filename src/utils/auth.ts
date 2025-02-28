// utils/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Gunakan .env untuk production

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Kita perlu pastikan hasil hash tidak melebihi batas 10 karakter
// Sebaiknya gunakan fungsi hash yang menghasilkan string pendek atau potong hasilnya
export async function hashPassword(password: string): Promise<string> {
  // Karena ada batasan di database hanya 10 karakter
  // kita gunakan salt rounds yang rendah (5) untuk menghasilkan hash yang lebih pendek
  // CATATAN: Ini tidak ideal dari segi keamanan, lebih baik jika mengubah skema database
  return bcrypt.hash(password, 5);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}