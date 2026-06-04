"use client";

import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function AuthButton() {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 hidden md:inline">
          Welcome, {user?.firstName || "there"}
        </span>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 rounded-lg border border-indigo-500/30",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <button className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition-all duration-200">
          Log In
        </button>
      </Link>
      <Link href="/signup">
        <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Sign Up Free</span>
        </button>
      </Link>
    </div>
  );
}
