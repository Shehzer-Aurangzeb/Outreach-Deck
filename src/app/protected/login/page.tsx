"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
    >
      {pending ? "Verifying..." : "Continue"}
    </button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") === "1";
  const next = searchParams.get("next") ?? "/";

  // Sanitize next to prevent open redirect
  const safeNext = next.startsWith("/") ? next : "/";

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          Incorrect password. Please try again.
        </div>
      )}

      {/* Native form — works pre-hydration */}
      <form
        method="POST"
        action={`/protected/login/verify?next=${encodeURIComponent(safeNext)}`}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
            placeholder="Enter password"
          />
        </div>

        <SubmitButton />
      </form>
    </>
  );
}

export default function StagingLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Password Required
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              This site is password protected.
            </p>
          </div>

          <Suspense fallback={<div className="h-32 animate-pulse" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
