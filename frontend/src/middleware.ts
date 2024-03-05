import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const protectedRoutes = /^\/$/;

  if (protectedRoutes.test(req.nextUrl.pathname) && !req.cookies.has("token")) {
    console.log("in here");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return;
}
