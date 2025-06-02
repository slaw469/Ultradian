import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path starts with /dashboard
  const isAuthRoute = pathname.startsWith("/dashboard");
  const token = await getToken({ req: request });

  if (isAuthRoute && !token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/assets (public files)
     * - auth routes (allow public access)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/assets|api/auth).*)",
  ],
};
