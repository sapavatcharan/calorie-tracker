"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!rounded-[8px] !border !border-line !bg-surface !text-ink !shadow-none !text-[14px]",
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
