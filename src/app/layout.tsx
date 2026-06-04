import type { Metadata } from "next";
import { ClerkMockProvider } from "@/components/auth/ClerkMockProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Resume Builder | AI-Powered Career Platform",
  description: "Create interview-ready, ATS-optimized professional resumes in minutes with AI assistance and expert templates.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkMockProvider>
      <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
        <body className="h-full bg-[#05050a] text-slate-100 flex flex-col antialiased" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkMockProvider>
  );
}
