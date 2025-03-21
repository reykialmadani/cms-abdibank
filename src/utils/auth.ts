import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'BankAbdi@Secret#Key$ForJWT%Tokens&2025!';

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '5h' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload; 
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    // Tambahkan logging untuk debug
    console.log('Comparing password');
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password match:', match);
    return match;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    // Jika terjadi error pada perbandingan (misalnya format hash tidak valid), 
    // kita return false sebagai fallback yang aman
    return false;
  }
}
