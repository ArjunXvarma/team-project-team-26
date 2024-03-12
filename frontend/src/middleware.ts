import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const protectedRoutes = /^\/$/;
  const logoutRoute = /^\/logout$/;
  const loginSingupRoutes = /^\/(login|signup)$/;

  if (protectedRoutes.test(req.nextUrl.pathname) && !req.cookies.has("token")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (loginSingupRoutes.test(req.nextUrl.pathname) && req.cookies.has("token")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (logoutRoute.test(req.nextUrl.pathname)) {
    let response = NextResponse.next();
    response.cookies.delete("token");
    response.cookies.delete("username");
    return response;
  }

  return;
}
