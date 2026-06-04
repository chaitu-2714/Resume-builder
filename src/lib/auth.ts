import { auth } from "@clerk/nextjs/server";

// A utility to get the authenticated user ID safely
// Falls back to a mock user ID if Clerk is not configured
export async function getAuthUserId(): Promise<string> {
  const isClerkConfigured = 
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    !!process.env.CLERK_SECRET_KEY;

  if (isClerkConfigured) {
    try {
      const authSession = await auth();
      if (authSession.userId) {
        return authSession.userId;
      }
    } catch (e) {
      console.warn("Clerk authentication failed, using local fallback.", e);
    }
  }

  // Local development default user id
  return "local_user_default";
}
