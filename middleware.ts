import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = ["/signin", "/api/auth"];
  const isPublicPath = publicPaths.some(pp => path.startsWith(pp));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Redirect to signin if no token and requesting a protected path
  if (!token) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply to all paths except static files, favicon, etc.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};