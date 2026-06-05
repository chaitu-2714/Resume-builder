"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithEmail: (email: string, name: string) => Promise<void>; // Quick Mock Login
  signInWithEmail: (email: string, pass: string) => Promise<void>; // Real Firebase Login
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>; // Real Firebase Sign Up
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set cookie
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Helper to read cookie
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to sync user state with cookies and database
  const syncUserSession = async (profile: UserProfile | null) => {
    if (profile) {
      setCookie("mock_user_id", profile.uid);
      setCookie("mock_user_name", profile.displayName);
      setCookie("mock_user_email", profile.email);
      setCookie("mock_user_avatar_url", profile.photoURL);
      setCookie("mock_user_provider", profile.provider);
      setUser(profile);

      // Trigger a database sync by hitting the resumes route or a sync route
      try {
        await fetch("/api/resumes", { method: "GET" });
      } catch (err) {
        console.warn("Database user sync during session initiation failed:", err);
      }
    } else {
      deleteCookie("mock_user_id");
      deleteCookie("mock_user_name");
      deleteCookie("mock_user_email");
      deleteCookie("mock_user_avatar_url");
      deleteCookie("mock_user_provider");
      setUser(null);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            const provider = firebaseUser.providerData?.[0]?.providerId || "email";
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Firebase User",
              photoURL: firebaseUser.photoURL || "",
              provider: provider === "google.com" ? "google" : provider === "apple.com" ? "apple" : "email/password",
            };
            await syncUserSession(profile);
          } else {
            await syncUserSession(null);
          }
        } catch (err) {
          console.error("Error processing auth state change:", err);
        } finally {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      // Local Mock Mode Session Persistence
      const mockId = getCookie("mock_user_id");
      if (mockId) {
        const profile: UserProfile = {
          uid: mockId,
          email: getCookie("mock_user_email") || "",
          displayName: getCookie("mock_user_name") || "Mock User",
          photoURL: getCookie("mock_user_avatar_url") || "",
          provider: getCookie("mock_user_provider") || "local",
        };
        setUser(profile);
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
      router.refresh();
    } else {
      // Mock Google Login
      const mockId = "mock_google_" + Math.random().toString(36).substring(2, 10);
      const profile: UserProfile = {
        uid: mockId,
        email: "google.user@gmail.com",
        displayName: "Google User",
        photoURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
        provider: "google",
      };
      await syncUserSession(profile);
      router.push("/dashboard");
      router.refresh();
    }
  };

  const loginWithApple = async () => {
    if (isFirebaseConfigured && auth) {
      const provider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
      router.refresh();
    } else {
      // Mock Apple Login
      const mockId = "mock_apple_" + Math.random().toString(36).substring(2, 10);
      const profile: UserProfile = {
        uid: mockId,
        email: "apple.user@icloud.com",
        displayName: "Apple User",
        photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
        provider: "apple",
      };
      await syncUserSession(profile);
      router.push("/dashboard");
      router.refresh();
    }
  };

  // Mock quick login/signup
  const loginWithEmail = async (email: string, name: string) => {
    const mockId = "mock_user_" + btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toLowerCase();
    const profile: UserProfile = {
      uid: mockId,
      email,
      displayName: name,
      photoURL: "",
      provider: "local",
    };
    await syncUserSession(profile);
    router.push("/dashboard");
    router.refresh();
  };

  // Real Firebase Email Login
  const signInWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push("/dashboard");
      router.refresh();
    } else {
      await loginWithEmail(email, "Local User");
    }
  };

  // Real Firebase Email Sign Up
  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (isFirebaseConfigured && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // Force refresh user profile parameters
        const profile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || "",
          displayName: name,
          photoURL: "",
          provider: "local",
        };
        await syncUserSession(profile);
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      await loginWithEmail(email, name);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    await syncUserSession(null);
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        loginWithGoogle, 
        loginWithApple, 
        loginWithEmail, 
        signInWithEmail, 
        signUpWithEmail, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a FirebaseAuthProvider");
  }
  return context;
}
