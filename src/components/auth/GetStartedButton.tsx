"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function GetStartedButton() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isClerkConfigured) return;

    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    const userId = getCookie("mock_user_id");
    setIsLoggedIn(!!userId);
    setIsLoaded(true);
  }, []);

  const btnClass =
    "flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all duration-200 w-full sm:w-auto justify-center";

  if (!isClerkConfigured) {
    if (!isLoaded) {
      return <div className="h-12 w-44 rounded-xl bg-slate-800 animate-pulse" />;
    }

    if (isLoggedIn) {
      return (
        <button onClick={() => router.push("/dashboard")} className={btnClass}>
          <span>Go to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      );
    }

    return (
      <Link href="/signup" className="w-full sm:w-auto">
        <button className={btnClass}>
          <span>Get Started Free</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    );
  }

  return <ClerkGetStartedButton />;
}

function ClerkGetStartedButton() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const btnClass =
    "flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all duration-200 w-full sm:w-auto justify-center";

  if (!isLoaded) {
    return (
      <div className="h-12 w-44 rounded-xl bg-slate-800 animate-pulse" />
    );
  }

  if (isSignedIn) {
    return (
      <button onClick={() => router.push("/dashboard")} className={btnClass}>
        <span>Go to Dashboard</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Link href="/signup" className="w-full sm:w-auto">
      <button className={btnClass}>
        <span>Get Started Free</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </Link>
  );
}

