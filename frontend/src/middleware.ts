import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const protectedRoutes = /^\/$/;
  const logoutRoute = /^\/logout$/;
  const loginSingupRoutes = /^\/(login|signup)$/;

  console.log(req.cookies.getAll());

  if (protectedRoutes.test(req.nextUrl.pathname) && !req.cookies.has("access_token")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (loginSingupRoutes.test(req.nextUrl.pathname) && req.cookies.has("access_token")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  //   if (logoutRoute.test(req.nextUrl.pathname)) {
  //     console.log("in here");

  //     req.cookies.delete("access_token");
  //     console.log();
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }

  return;
}
