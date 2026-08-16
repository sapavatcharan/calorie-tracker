"use client";

import { Landing } from "@/components/Landing";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  return <Landing />;
}
