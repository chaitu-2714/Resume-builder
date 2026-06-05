"use client";

import React from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { Sparkles, Terminal, ShieldCheck, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#05050a] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 h-[350px] w-[350px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Header */}
      <header className="h-16 border-b border-slate-900/60 bg-slate-950/30 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            ✦
          </div>
          <span className="font-bold text-sm tracking-tight text-white">SmartResumeBuilder</span>
        </div>
        <AuthButton />
      </header>

      {/* Main content area */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-20 z-10">
        <div className="w-full max-w-4xl text-center space-y-12 animate-fade-in px-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-indigo-400 text-xs font-bold shadow-lg shadow-indigo-500/5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Generation Career Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Build Interview-Ready Resumes <br />
              <span className="text-indigo-400 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Optimized by AI</span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Smart Resume Builder acts like an expert recruiter. Get real-time ATS keyword matching, tailored bullet points, cover letters, and live professional templates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GetStartedButton />
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-900/60 max-w-3xl mx-auto text-left">
            {[
              { icon: ShieldCheck, title: "ATS Check & Match", desc: "Compare your resume to target JDs and extract missing skills instantly." },
              { icon: Terminal, title: "AI Bullet Optimizer", desc: "Craft quantified achievement statements with recruiter action verbs." },
              { icon: Award, title: "Custom Templates", desc: "Switch design styles, layout components, and fonts with one-click preview." }
            ].map((pill, idx) => {
              const Icon = pill.icon;
              return (
                <div key={idx} className="p-4 bg-slate-950/20 rounded-xl border border-slate-900/60 space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-200">{pill.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{pill.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
