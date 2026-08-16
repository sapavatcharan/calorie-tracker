"use client";

import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen md:flex">
        <Navigation />
        <div className="min-w-0 flex-1">
          <main className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-6 md:px-6 md:pb-8">
            <div className="w-full min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
