import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function LoginPage() {
  if (!isClerkConfigured) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#05050a]">
      <SignIn path="/login" routing="path" signUpUrl="/signup" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
