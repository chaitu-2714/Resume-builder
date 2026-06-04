import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignupPage() {
  if (!isClerkConfigured) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#05050a]">
      <SignUp path="/signup" routing="path" signInUrl="/login" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
