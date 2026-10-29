"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleSignUp() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setError("");
      alert("Check your email for the confirmation link!");
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-emerald-950">
      {/* Golden-hour mosque, full bleed */}
      <Image
        src="/images/login-mosque.webp"
        alt="A Kerala mosque with a white minaret among coconut palms at golden hour"
        fill
        priority
        sizes="100vw"
        className="animate-slow-zoom object-cover object-[72%_center]"
      />
      {/* Overlays keep text readable over the photograph */}
      <div className="absolute inset-0 bg-linear-to-r from-emerald-950/50 via-emerald-950/10 via-45% to-transparent max-lg:bg-emerald-950/30" />
      <div className="absolute inset-0 bg-linear-to-t from-emerald-950/70 via-transparent via-35% to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-emerald-950/45 to-transparent" />
      <div className="absolute inset-0 bg-pattern opacity-[0.07] mix-blend-screen" />

      <div className="relative z-10 grid w-full lg:grid-cols-[minmax(0,560px)_1fr]">
        <div className="flex min-h-dvh flex-col justify-between gap-8 p-5 sm:p-10">
          <div className="flex items-center gap-3 text-white">
            <BrandMark className="size-10" />
            <div className="leading-tight">
              <p className="font-heading text-lg font-semibold">Mahallu</p>
              <p className="text-xs tracking-[0.2em] text-white/70 uppercase">Smart Manager</p>
            </div>
          </div>

          <div className="glass-strong animate-rise w-full max-w-md rounded-[1.75rem] p-7 ring-1 ring-white/50 sm:p-9 dark:ring-white/10">
            <p lang="ar" dir="rtl" className="text-center text-xl text-amber-700 dark:text-gold">
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <div className="mt-4 text-center">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to manage your Mahallu community
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-4">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@mahallu.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 bg-white/80 pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11 bg-white/80 pl-10"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                {loading && <Loader2 className="animate-spin" />}
                Sign In
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Separator className="flex-1" />
                <span>New to Mahallu?</span>
                <Separator className="flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleSignUp}
                disabled={loading}
                className="w-full"
              >
                Create Account
              </Button>
            </form>
          </div>

          <p className="text-xs text-white/70">
            Households · Finance · Madrasa · Welfare, in one place for your Mahallu.
          </p>
        </div>

        {/* Caption over the photograph on large screens */}
        <div className="hidden items-end justify-end p-10 lg:flex">
          <div className="glass-dark max-w-sm rounded-2xl p-5 text-white">
            <p className="font-heading text-xl leading-snug">
              &ldquo;Serving the community, one household at a time.&rdquo;
            </p>
            <p className="mt-2 text-xs tracking-[0.18em] text-white/70 uppercase">
              Mahallu Smart Manager
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
