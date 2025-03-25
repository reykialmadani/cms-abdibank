import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  console.log("CORS Middleware Called");

  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Origin", "*"); // Bisa ganti ke 'http://localhost:3001'
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, DELETE, PATCH, POST, PUT, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
  "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
  );

  // Tangani request OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { headers: res.headers, status: 204 });
  }

  return res;
}
export const config = {
  matcher: "/api/*",
};
