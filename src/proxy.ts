import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/resume-builder",
  "/profile"
];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected) {
    const userId = req.cookies.get("mock_user_id")?.value;
    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.svg, .png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|[^?]*\\.(?:html|css|js|gif|svg|png|webp|jpg|jpeg|curl|ico|csv|docx|pdf|xlsx|zip|webmanifest)).*)',
  ],
};
