"use client";

import React from "react";
import { useAuth } from "@/components/auth/FirebaseAuthContext";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function GetStartedButton() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const btnClass =
    "flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all duration-200 w-full sm:w-auto justify-center";

  if (loading) {
    return <div className="h-12 w-44 rounded-xl bg-slate-800 animate-pulse" />;
  }

  if (user) {
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
