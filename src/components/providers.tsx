"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import AppPreloader from "@/components/AppPreloader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppPreloader />
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  );
}
