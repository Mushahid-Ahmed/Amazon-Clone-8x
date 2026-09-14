"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useStore } from "../../context/StoreContext";
import { ApiClientError } from "../../lib/api";

type Mode = "signin" | "signup";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-10">Loading…</div>}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, authUser, hydrated } = useStore();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const redirectTo = searchParams.get("redirect") ?? "/account";

  // Navigating during render is ignored by the App Router, so signed-in
  // visitors are sent to their destination from an effect instead.
  useEffect(() => {
    if (hydrated && authUser && !pending) router.replace(redirectTo);
  }, [authUser, hydrated, pending, redirectTo, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(name.trim(), email.trim(), password);
      }
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.isNetworkError ? "Network unavailable. Please try again." : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">{mode === "signin" ? "Sign in" : "Create account"}</h1>

        <div role="tablist" aria-label="Authentication mode" className="mt-5 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1 text-sm font-semibold">
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => { setMode("signin"); setError(""); }} className={`rounded px-3 py-2 ${mode === "signin" ? "bg-white shadow-sm text-amazon-navy" : "text-slate-600 hover:text-amazon-navy"}`}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => { setMode("signup"); setError(""); }} className={`rounded px-3 py-2 ${mode === "signup" ? "bg-white shadow-sm text-amazon-navy" : "text-slate-600 hover:text-amazon-navy"}`}>Create account</button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <label className="block text-sm font-semibold">
              Your name
              <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} autoComplete="name" className="mt-1 w-full rounded border border-slate-400 px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" />
            </label>
          )}
          <label className="block text-sm font-semibold">
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="mt-1 w-full rounded border border-slate-400 px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="mt-1 w-full rounded border border-slate-400 px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" />
          </label>

          {error && (
            <p role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button type="submit" disabled={pending} className="w-full rounded-full bg-amazon-yellow py-2.5 font-semibold hover:bg-amber-400 disabled:opacity-60">
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create your account"}
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-slate-600">
        By continuing, you agree to the <span className="text-amazon-link">Conditions of Use</span> and <span className="text-amazon-link">Privacy Notice</span>.
      </p>
      <p className="mt-4 text-center text-sm"><Link href="/" className="text-amazon-link hover:underline">← Back to shopping</Link></p>
    </div>
  );
}
