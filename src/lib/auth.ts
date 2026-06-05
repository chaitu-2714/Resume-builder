import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma, checkDbConnection } from "./db";

// A utility to get the authenticated user ID safely
// Falls back to a mock user ID from cookies if Clerk is not configured.
// Returns null if user is unauthenticated.
export async function getAuthUserId(): Promise<string | null> {
  const isClerkConfigured = 
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    !!process.env.CLERK_SECRET_KEY;

  if (isClerkConfigured) {
    try {
      const authSession = await auth();
      const userId = authSession?.userId;
      if (userId) {
        // Sync user details to Prisma database if they don't exist yet
        const dbActive = await checkDbConnection();
        if (dbActive) {
          try {
            const existing = await prisma.user.findUnique({ where: { id: userId } });
            if (!existing) {
              const userDetails = await currentUser();
              const email = userDetails?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.com`;
              const name = userDetails ? `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() : "Clerk User";
              const imageUrl = userDetails?.imageUrl || null;
              const provider = userDetails?.externalAccounts?.[0]?.provider || "clerk";
              
              await prisma.user.upsert({
                where: { id: userId },
                update: { email, name, imageUrl, provider },
                create: { id: userId, email, name, imageUrl, provider },
              });
            }
          } catch (dbError) {
            console.error("Failed to sync Clerk user to database:", dbError);
          }
        }
        return userId;
      }
      return null;
    } catch (e) {
      console.warn("Clerk authentication failed.", e);
      return null;
    }
  }

  // Local development mock user check
  try {
    const cookieStore = await cookies();
    const mockUserId = cookieStore.get("mock_user_id")?.value;
    if (mockUserId) {
      // Create/upsert the mock user in the DB if active
      const dbActive = await checkDbConnection();
      if (dbActive) {
        try {
          const mockEmail = cookieStore.get("mock_user_email")?.value || `${mockUserId}@mock.com`;
          const mockName = cookieStore.get("mock_user_name")?.value || "Local User";
          const mockAvatar = cookieStore.get("mock_user_avatar_url")?.value || null;
          const mockProvider = mockUserId.startsWith("mock_google_") ? "google" : mockUserId.startsWith("mock_apple_") ? "apple" : "local";
          
          await prisma.user.upsert({
            where: { id: mockUserId },
            update: { email: mockEmail, name: mockName, imageUrl: mockAvatar, provider: mockProvider },
            create: { id: mockUserId, email: mockEmail, name: mockName, imageUrl: mockAvatar, provider: mockProvider },
          });
        } catch (dbError) {
          console.error("Failed to sync mock user to database:", dbError);
        }
      }
      return mockUserId;
    }
  } catch (e) {
    console.warn("Failed to read mock cookies on server:", e);
  }


  return null;
}


