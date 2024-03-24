import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const protectedRoutes = /^\/$|^\/journeys$/;
  const logoutRoute = /^\/logout$/;
  const loginSingupRoutes = /^\/(login|signup)$/;

  if (protectedRoutes.test(req.nextUrl.pathname) && !req.cookies.has("token")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (loginSingupRoutes.test(req.nextUrl.pathname) && req.cookies.has("token")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  //   check token expiry
  let token = req.cookies.get("token");
  if (token) {
    let decoded_token = jwt.decode(token.value) as jwt.JwtPayload;
    if (decoded_token.exp! < Date.now() / 1000) {
      let response = NextResponse.redirect(
        new URL("/logout?message=session-expired", req.url)
      );
      response.cookies.delete("token");
      response.cookies.delete("username");
      return response;
    }
  }

  // logout user
  if (logoutRoute.test(req.nextUrl.pathname)) {
    let response = NextResponse.next();
    response.cookies.delete("token");
    response.cookies.delete("username");
    return response;
  }

  return;
}
