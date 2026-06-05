"use client";

import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Sparkles, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
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
    const name = getCookie("mock_user_name");
    const email = getCookie("mock_user_email");
    if (userId && name && email) {
      setUser({ name, email });
    }
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    document.cookie = "mock_user_id=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_name=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_email=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    setUser(null);
    router.push("/");
    router.refresh();
  };

  if (!isClerkConfigured) {
    if (!isLoaded) {
      return <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />;
    }

    if (user) {
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden md:inline">
            Welcome, {user.name.split(" ")[0]}
          </span>
          <div className="relative group">
            <button className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 shadow-md">
              {initials || "U"}
            </button>
            
            {/* Hover Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-900 bg-slate-950 p-2 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="px-3 py-2 border-b border-slate-900/60 mb-1">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 font-semibold px-3 py-2 rounded-lg transition-smooth"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
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

  // If Clerk is configured, use the real Clerk hooks
  return <ClerkAuthButton />;
}

function ClerkAuthButton() {
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

