"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkMockProvider({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  // Safe fallback wrapper for local development
  return <>{children}</>;
}
