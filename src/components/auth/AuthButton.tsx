"use client";

import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Sparkles, LogOut, Settings, X, ShieldAlert, Mail, User as UserIcon, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; avatarUrl: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const setCookie = (name: string, value: string, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  };

  useEffect(() => {
    if (isClerkConfigured) return;
    
    const userId = getCookie("mock_user_id");
    const name = getCookie("mock_user_name");
    const email = getCookie("mock_user_email");
    const avatarUrl = getCookie("mock_user_avatar_url") || "";
    if (userId && name && email) {
      setUser({ id: userId, name, email, avatarUrl });
      setEditName(name);
      setEditEmail(email);
      setEditAvatarUrl(avatarUrl);
    }
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    document.cookie = "mock_user_id=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_name=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_email=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    document.cookie = "mock_user_avatar_url=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    setUser(null);
    setIsModalOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCookie("mock_user_name", editName);
    setCookie("mock_user_email", editEmail);
    setCookie("mock_user_avatar_url", editAvatarUrl);

    setUser({
      ...user,
      name: editName,
      email: editEmail,
      avatarUrl: editAvatarUrl
    });

    setIsModalOpen(false);
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

      const isGoogle = user.id.startsWith("mock_google_");
      const isApple = user.id.startsWith("mock_apple_");

      return (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden md:inline">
            Welcome, {user.name.split(" ")[0]}
          </span>
          <div className="relative group">
            <button className="h-8 w-8 rounded-lg overflow-hidden border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 bg-indigo-600/10 shadow-md">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                initials || "U"
              )}
            </button>
            
            {/* Hover Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-900 bg-slate-950 p-2 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="px-3 py-2 border-b border-slate-900/60 mb-1">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                
                {/* Social Badge */}
                {isGoogle && (
                  <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400 font-semibold">
                    Google Connected
                  </span>
                )}
                {isApple && (
                  <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] text-slate-300 font-semibold">
                    Apple Connected
                  </span>
                )}
              </div>
              
              <Link
                href="/profile"
                className="w-full flex items-center gap-1.5 text-left text-xs text-slate-300 hover:bg-slate-900 hover:text-white font-semibold px-3 py-2 rounded-lg transition-smooth mb-0.5"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                <span>View Profile</span>
              </Link>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center gap-1.5 text-left text-xs text-slate-300 hover:bg-slate-900 hover:text-white font-semibold px-3 py-2 rounded-lg transition-smooth mb-0.5"
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 font-semibold px-3 py-2 rounded-lg transition-smooth"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Manage Profile Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c0c16] p-6 shadow-2xl z-10 animate-fade-in space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-400" />
                    <span>Manage Demo Account</span>
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="p-1 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-smooth"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center font-bold text-lg text-indigo-400 bg-indigo-600/10 shadow-lg shadow-indigo-500/10">
                    {editAvatarUrl ? (
                      <img src={editAvatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      initials || "U"
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-slate-950 border border-slate-900 text-slate-400">
                      {isGoogle ? "Google Sign-In Account" : isApple ? "Apple Sign-In Account" : "Local Email Account"}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
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
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-100 placeholder-slate-600 text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-smooth"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">Custom Avatar Image URL</label>
                    <input
                      type="url"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-100 placeholder-slate-700 text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-smooth"
                    />
                  </div>

                  {/* Preset Avatar Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">Or choose a preset picture</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Pro", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
                        { label: "Exec", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
                        { label: "Creative", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
                        { label: "Grad", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" }
                      ].map((preset) => {
                        const active = editAvatarUrl === preset.url;
                        return (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setEditAvatarUrl(preset.url)}
                            className="relative h-12 rounded-xl overflow-hidden border border-slate-900 hover:border-indigo-500 transition-smooth group"
                          >
                            <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                            {active && (
                              <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-smooth"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-smooth shadow-lg shadow-indigo-600/10"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
        <Link href="/profile" className="text-xs text-slate-400 hover:text-indigo-400 transition-smooth">
          Profile
        </Link>
        <div className="h-4 w-px bg-slate-900" />
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

