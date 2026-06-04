"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { ResumeBuilder } from "@/components/builder/ResumeBuilder";
import { Sparkles } from "lucide-react";

export default function ResumeBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#05050a]">
      {/* Editor Header */}
      <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 transition-smooth hover:bg-slate-900"
          >
            &larr; Dashboard
          </button>
          <div className="h-4 w-px bg-slate-900" />
          <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Smart Resume Builder</span>
          </h1>
        </div>
        <AuthButton />
      </header>

      {/* Editor Workspace */}
      <main className="flex-1 overflow-hidden relative">
        <ResumeBuilder id={id} />
      </main>
    </div>
  );
}
