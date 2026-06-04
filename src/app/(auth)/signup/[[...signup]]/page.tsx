import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#05050a]">
      <SignUp path="/signup" routing="path" signInUrl="/login" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
