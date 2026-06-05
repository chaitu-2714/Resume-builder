import { cookies } from "next/headers";
import { prisma, checkDbConnection } from "./db";

// A utility to get the authenticated user ID safely.
// Reads authentication cookies set by either Firebase or the Mock provider
// and automatically syncs the user details to the PostgreSQL database.
// Returns null if the user is unauthenticated.
export async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value;
    
    if (userId) {
      const dbActive = await checkDbConnection();
      if (dbActive) {
        try {
          const email = cookieStore.get("mock_user_email")?.value || `${userId}@auth.com`;
          const name = cookieStore.get("mock_user_name")?.value || "User";
          const imageUrl = cookieStore.get("mock_user_avatar_url")?.value || null;
          const provider = cookieStore.get("mock_user_provider")?.value || "local";
          
          await prisma.user.upsert({
            where: { id: userId },
            update: { email, name, imageUrl, provider },
            create: { id: userId, email, name, imageUrl, provider },
          });
        } catch (dbError) {
          console.error("Failed to sync user session to database:", dbError);
        }
      }
      return userId;
    }
  } catch (e) {
    console.warn("Failed to read auth cookies on server:", e);
  }

  return null;
}
