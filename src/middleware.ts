// import { getToken } from "next-auth/jwt";
// import { NextRequest, NextResponse } from "next/server";

// // Define routes based on role
// const adminRoutes = ["/Dashboard"];
// const userRoutes = ["/Home", "/user-profile", "/event", "/community"];

// export async function middleware(request: NextRequest) {
//   // Retrieve the JWT token from the request
//   const token = await getToken({ req: request });
//   const url = request.nextUrl;

//   // If no token and the user tries to access a protected route, redirect to sign-in page
//   if (!token) {
//     if (
//       adminRoutes.includes(url.pathname) ||
//       userRoutes.includes(url.pathname)
//     ) {
//       return NextResponse.redirect(new URL("/sign-in", request.url));
//     }
//     return NextResponse.next(); // Allow public routes
//   }

//   // If authenticated and trying to access sign-in or sign-up pages, redirect based on role
//   if (
//     url.pathname.startsWith("/sign-in") ||
//     url.pathname.startsWith("/sign-up") ||
//     url.pathname.startsWith("/verify") ||
//     url.pathname === "/"
//   ) {
//     if (token.role === "admin") {
//       return NextResponse.redirect(new URL("/admin/dashboard", request.url));
//     } else if (token.role === "user") {
//       return NextResponse.redirect(new URL("/Home", request.url));
//     }
//   }

//   // Redirect users based on their role
//   if (token.role === "ADMIN" && !adminRoutes.includes(url.pathname)) {
//     return NextResponse.redirect(new URL("/admin/dashboard", request.url));
//   }

//   if (token.role === "USER" && !userRoutes.includes(url.pathname)) {
//     return NextResponse.redirect(new URL("/Home", request.url));
//   }

//   // If the user is already authenticated and trying to access an appropriate page, allow the request
//   return NextResponse.next();
// }

// // Apply middleware to the following routes
// export const config = {
//   matcher: [
//     "/Dashboard",
//     "/sign-in",
//     "/sign-up",
//     "/Home",
//     "/user-profile",
//     "/event",
//     "/community",
//     "/verify",
//     "/admin/dashboard",
//     "/post",
//     "/",

//   ],
// };

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Define routes based on role
const adminRoutes = ["/admin/dashboard", "/admin/user-details"];
const userRoutes = [
  "/Home",
  "/user-profile",
  "/Events",
  "/group",
  "/posts",
  "/library",
  "/chat",
  "/news",
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If no token, redirect to sign-in page for protected routes
  if (!token) {
    if (
      adminRoutes.includes(url.pathname) ||
      userRoutes.includes(url.pathname)
    ) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next(); // Allow public routes
  }

  // Redirect based on role
  if (
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up") ||
    url.pathname.startsWith("/verify") ||
    url.pathname === "/"
  ) {
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (token.role === "USER" || token.role === "TEACHER") {
      return NextResponse.redirect(new URL("/Home", request.url));
    }
  }

  // Restrict admin routes
  if (token.role === "ADMIN" && !adminRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Restrict user routes
  if (token.role === "USER" && !userRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/Home", request.url));
  }

  if (token.role === "TEACHER" && !userRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/Home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/Home",
    "/user-profile",
    "/Events",
    "/group",
    "/verify",
    "/admin",
    "/admin/user-details",
    "/admin/dashboard",
    "/posts",
    "/library",
    "/chat",
    "/Home",
    "/news",
    "/",
  ],
};
