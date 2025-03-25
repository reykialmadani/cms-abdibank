// pages/_middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Hanya berlaku untuk halaman admin yang bukan login
  if (!path.startsWith('/admins') || path === '/admins/login') {
    return NextResponse.next();
  }
  
  // Periksa token dan role
  const token = request.cookies.get('bearerToken')?.value;
  const role = request.cookies.get('userRole')?.value;
  
  // Redirect ke login jika tidak ada token/role
  if (!token || !role) {
    return NextResponse.redirect(new URL('/admins/login', request.url));
  }
  
  // Halaman operator hanya untuk admin
  if (path.startsWith('/admins/operator') && role !== 'admin') {
    return NextResponse.redirect(new URL('/admins/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admins/:path*']
};