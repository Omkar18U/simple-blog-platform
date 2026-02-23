import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect /admin routes — only ADMIN role
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protect /write route — must be authenticated
    if (pathname.startsWith("/write") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protect /bookmarks route — must be authenticated
    if (pathname.startsWith("/bookmarks") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes — always accessible
        if (
          pathname === "/" ||
          pathname.startsWith("/explore") ||
          pathname.startsWith("/trending") ||
          pathname.startsWith("/post/") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/posts") ||
          pathname.startsWith("/search") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/user/") ||
          pathname.startsWith("/api/users")
        ) {
          return true;
        }

        // All other routes require auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/write/:path*",
    "/bookmarks/:path*",
  ],
};
