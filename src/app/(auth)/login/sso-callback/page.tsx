"use client";

import React, { useEffect } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isClerkConfigured) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#05050a] space-y-4">
      <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-slate-400 animate-pulse">Completing Sign-In...</p>
      {isClerkConfigured && <AuthenticateWithRedirectCallback />}
    </div>
  );
}
