import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Define routes based on role
const adminRoutes = ["/Dashboard"];
const userRoutes = ["/Home", "/user-profile", "/event", "/community"];

export async function middleware(request: NextRequest) {
  // Retrieve the JWT token from the request
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect authenticated users trying to access sign-in or sign-up pages
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    if (token.role === "admin") {
      return NextResponse.redirect(new URL("/Dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/Home", request.url)); // Default user redirection
    }
  }

  // Handle unauthenticated access to protected pages
  if (!token) {
    if (
      url.pathname.startsWith("/Dashboard") ||
      url.pathname.startsWith("/Home") ||
      url.pathname.startsWith("/user-profile") ||
      url.pathname.startsWith("/event") ||
      url.pathname.startsWith("/community")
    ) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Redirect based on user role when trying to access admin or user-only routes
  if (token) {
    if (token.role === "admin" && !adminRoutes.includes(url.pathname)) {
      return NextResponse.redirect(new URL("/Dashboard", request.url));
    } else if (token.role === "user" && !userRoutes.includes(url.pathname)) {
      return NextResponse.redirect(new URL("/Home", request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Apply middleware to the following routes
export const config = {
  matcher: [
    "/Dashboard",
    "/sign-in",
    "/sign-up",
    "/Home",
    "/user-profile",
    "/event",
    "/community",
    "/verify",
    "/",
  ],
};
