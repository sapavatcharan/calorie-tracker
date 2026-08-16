"use client";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  async function onLogin() {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Enter your email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (next.email || next.password) return;
    setBusy(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-[400px] space-y-4">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em]">Log in</h1>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <Button type="button" className="w-full" disabled={busy} onClick={() => void onLogin()}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
        <p className="text-[14px] text-muted">
          No account?{" "}
          <Link href="/register" className="text-emerald hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
