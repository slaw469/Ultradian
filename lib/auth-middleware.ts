import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function withAuth(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: { redirectTo?: string },
) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    const redirectUrl = options?.redirectTo || "/auth/login";
    const url = req.nextUrl.clone();
    url.pathname = redirectUrl;
    url.search = `?callbackUrl=${req.nextUrl.pathname}${req.nextUrl.search}`;
    return NextResponse.redirect(url);
  }

  return handler();
}
