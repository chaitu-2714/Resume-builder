"use client";

import React, { useState } from "react";
import { SignUp, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Mail, User, ShieldAlert, AlertCircle, GraduationCap, Briefcase, RefreshCw } from "lucide-react";
import Link from "next/link";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [careerLevel, setCareerLevel] = useState("Experienced");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle to show the full Clerk Widget
  const [showFullClerk, setShowFullClerk] = useState(false);

  // Clerk hooks
  const { signUp } = useSignUp();
  const isSignUpLoaded = !!signUp;

  // Client-side cookie setting helpers
  const setCookie = (name: string, value: string, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsLoading(true);
    setError(null);
    // Generate mock user ID based on email
    const mockId = "mock_user_" + btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toLowerCase();
    
    setCookie("mock_user_id", mockId);
    setCookie("mock_user_name", name);
    setCookie("mock_user_email", email);

    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 800);
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setError(null);

    if (isClerkConfigured) {
      if (!isSignUpLoaded) {
        setError("Authentication service is loading. Please try again in a moment.");
        setIsLoading(false);
        return;
      }

      if (provider === "google") {
        try {
          await signUp.sso({
            strategy: "oauth_google",
            redirectCallbackUrl: "/login/sso-callback",
            redirectUrl: "/dashboard",
          });
        } catch (err: any) {
          setError(err?.message || "Google Sign-Up failed.");
          setIsLoading(false);
        }
      } else {
        try {
          await signUp.sso({
            strategy: "oauth_apple",
            redirectCallbackUrl: "/login/sso-callback",
            redirectUrl: "/dashboard",
          });
        } catch (err: any) {
          setError(err?.message || "Apple Sign-Up failed.");
          setIsLoading(false);
        }
      }
      return;
    }

    // Fallback Mock social login
    const mockId = `mock_${provider}_` + Math.random().toString(36).substring(2, 10);
    const mockName = provider === "google" ? "Google User" : "Apple User";
    const mockEmail = provider === "google" ? "google.user@gmail.com" : "apple.user@icloud.com";

    setCookie("mock_user_id", mockId);
    setCookie("mock_user_name", mockName);
    setCookie("mock_user_email", mockEmail);

    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 800);
  };

  // If the user chooses to view the full Clerk interface
  if (isClerkConfigured && showFullClerk) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#05050a] space-y-4 px-4">
        <SignUp path="/signup" routing="path" signInUrl="/login" fallbackRedirectUrl="/dashboard" />
        <button 
          onClick={() => setShowFullClerk(false)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-smooth"
        >
          &larr; Back to Custom Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05050a] px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="w-full max-w-md bg-slate-950/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 mb-2">
            ✦
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400">
            {isClerkConfigured ? "Sign up for a new account" : "Join the smart resume builder local demo space"}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex gap-2.5 items-start bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mock auth note */}
        {!isClerkConfigured && (
          <div className="flex gap-2.5 items-start bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3.5 text-[11px] text-indigo-200/80 leading-normal">
            <ShieldAlert className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>Developer Mode Fallback:</strong> Clerk is unconfigured. Use a social provider, or fill in details below to register a mock profile.
            </span>
          </div>
        )}

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-smooth outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            )}
            <span>Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin("apple")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-smooth outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-1.01 2.94.99.08 2.08-.47 2.84-1.33z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-900/60" />
          <span className="flex-shrink mx-3 text-[9px] uppercase font-bold tracking-widest text-slate-500">
            {isClerkConfigured ? "Or register options" : "Or register with"}
          </span>
          <div className="flex-grow border-t border-slate-900/60" />
        </div>

        {/* Display options depending on whether Clerk is active */}
        {isClerkConfigured ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowFullClerk(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200"
            >
              <span>Sign Up with Email / Code</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Smith"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-100 placeholder-slate-600 text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-smooth"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.smith@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-100 placeholder-slate-600 text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-smooth"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">Career Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Fresher", label: "Entry", icon: GraduationCap },
                  { id: "Experienced", label: "Pro", icon: Briefcase },
                  { id: "Switcher", label: "Switcher", icon: RefreshCw },
                ].map((lvl) => {
                  const Icon = lvl.icon;
                  const active = careerLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCareerLevel(lvl.id)}
                      className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-bold transition-smooth outline-none ${
                        active
                          ? "border-indigo-500 bg-indigo-500/10 text-white"
                          : "border-slate-900 bg-slate-950/30 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                      <span>{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name || !email}
              className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign Up Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <span className="text-xs text-slate-500">Already have an account? </span>
          <Link href="/login" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-smooth">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
