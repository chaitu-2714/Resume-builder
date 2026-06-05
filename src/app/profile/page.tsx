"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { ArrowLeft, Mail, User as UserIcon, Calendar, Shield, LogOut, CheckCircle2, CloudLightning } from "lucide-react";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Presentational Layout
interface ProfileLayoutProps {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: string;
  createdAt: string;
  handleLogout: () => Promise<void>;
}

function ProfileLayout({ id, name, email, avatarUrl, provider, createdAt, handleLogout }: ProfileLayoutProps) {
  const router = useRouter();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedProvider = provider === "google" 
    ? "Google Sign-In" 
    : provider === "apple" 
      ? "Apple ID" 
      : provider === "email/password" || provider === "local" 
        ? "Local Email / Password"
        : provider.toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#05050a] relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[120px]" />

      <header className="h-16 border-b border-slate-900/60 bg-slate-950/30 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            ✦
          </div>
          <span className="font-bold text-sm tracking-tight text-white">SmartResumeBuilder</span>
        </div>
        <AuthButton />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12 md:py-20 z-10 overflow-y-auto">
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
          {/* Back Action */}
          <div className="flex items-center">
            <button 
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-smooth group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-smooth" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Card */}
            <div className="lg:col-span-1 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-3xl overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center font-bold text-3xl text-indigo-400 bg-indigo-600/10 shadow-xl shadow-indigo-500/10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    initials || "U"
                  )}
                </div>
                {provider === "google" && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 shadow shadow-slate-950">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  </span>
                )}
                {provider === "apple" && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 shadow shadow-slate-950">
                    <svg className="h-3.5 w-3.5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-1.01 2.94.99.08 2.08-.47 2.84-1.33z"/>
                    </svg>
                  </span>
                )}
              </div>

              <div className="space-y-1 w-full truncate">
                <h2 className="text-xl font-bold text-white tracking-tight truncate">{name}</h2>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-indigo-400 text-xs font-semibold shadow-sm">
                <Shield className="h-3.5 w-3.5" />
                <span>Account Active</span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all duration-200 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out Session</span>
              </button>
            </div>

            {/* Profile Details Card */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Account Information</h2>
                <p className="text-xs text-slate-500 mt-1">Details about your authentication profile</p>
              </div>

              <div className="border-t border-slate-900/60 pt-6 space-y-4">
                {/* Full name field */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-900/40 gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Display Name</span>
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-xs">{name}</span>
                </div>

                {/* Email address field */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-900/40 gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Email Address</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate max-w-xs">{email}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>

                {/* Provider field */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-900/40 gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <CloudLightning className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Linked Provider</span>
                  </span>
                  <span className="text-xs font-bold text-slate-200">{formattedProvider}</span>
                </div>

                {/* Created Date field */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-900/40 gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Created Since</span>
                  </span>
                  <span className="text-xs font-bold text-slate-200">{createdAt}</span>
                </div>

                {/* User ID field */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-900/40 gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Unique User ID</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-900 truncate max-w-full sm:max-w-xs">{id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponent for real Clerk Profile
function ClerkProfileView() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const id = user.id;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Clerk User";
  const email = user.primaryEmailAddress?.emailAddress || "";
  const avatarUrl = user.imageUrl || "";
  const provider = user.externalAccounts?.[0]?.provider || "email/password";
  let createdAt = "June 2026";
  if (user.createdAt) {
    createdAt = user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  return (
    <ProfileLayout
      id={id}
      name={name}
      email={email}
      avatarUrl={avatarUrl}
      provider={provider}
      createdAt={createdAt}
      handleLogout={handleLogout}
    />
  );
}

// Subcomponent for Mock Profile
function MockProfileView() {
  const router = useRouter();
  const [mockUser, setMockUser] = useState<{ id: string; name: string; email: string; avatarUrl: string; provider: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to read cookies
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  useEffect(() => {
    const userId = getCookie("mock_user_id");
    const name = getCookie("mock_user_name");
    const email = getCookie("mock_user_email");
    const avatarUrl = getCookie("mock_user_avatar_url") || "";
    
    if (userId && name && email) {
      const mockProvider = userId.startsWith("mock_google_") 
        ? "google" 
        : userId.startsWith("mock_apple_") 
          ? "apple" 
          : "local";
      
      setMockUser({ id: userId, name, email, avatarUrl, provider: mockProvider });
    } else {
      router.push("/login");
    }
    setIsLoaded(true);
  }, [router]);

  const handleLogout = async () => {
    document.cookie = "mock_user_id=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_name=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_email=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_avatar_url=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    
    router.push("/");
    router.refresh();
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#05050a] space-y-4">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (!mockUser) return null;

  return (
    <ProfileLayout
      id={mockUser.id}
      name={mockUser.name}
      email={mockUser.email}
      avatarUrl={mockUser.avatarUrl}
      provider={mockUser.provider}
      createdAt="June 2026"
      handleLogout={handleLogout}
    />
  );
}

export default function ProfilePage() {
  return (
    <>
      {isClerkConfigured ? (
        <ClerkProfileView />
      ) : (
        <MockProfileView />
      )}
    </>
  );
}
