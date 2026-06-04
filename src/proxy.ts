import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isClerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/resume-builder(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isClerkConfigured) {
    try {
      if (isProtectedRoute(req)) {
        const { userId, redirectToSignIn } = await auth();
        if (!userId) {
          return redirectToSignIn();
        }
      }
    } catch (e) {
      console.warn("Clerk proxy execution failed:", e);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|webp|jpg|jpeg|curl|ico|csv|docx|pdf|xlsx|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
