"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-11 h-11 mb-5"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "var(--color-accent)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <h1
            className="font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)",
              color: "var(--color-bright)",
              letterSpacing: "-0.02em",
            }}
          >
            Outreach Deck
          </h1>
          <p
            style={{
              color: "var(--color-muted)",
              fontSize: "var(--text-sm)",
              marginTop: "6px",
            }}
          >
            Your daily networking command center
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "var(--space-6)" }}>
          {status === "sent" ? (
            <div
              className="text-center animate-fade-in-up"
              style={{ padding: "var(--space-2) 0" }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 mb-4"
                style={{
                  backgroundColor: "var(--color-positive-subtle)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "var(--color-positive)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <h2
                className="font-medium mb-1"
                style={{ fontSize: "var(--text-lg)", color: "var(--color-bright)" }}
              >
                Check your inbox
              </h2>
              <p
                style={{
                  color: "var(--color-muted)",
                  fontSize: "var(--text-sm)",
                  marginBottom: "4px",
                }}
              >
                We sent a sign-in link to
              </p>
              <p className="font-medium" style={{ color: "var(--color-text)" }}>
                {email}
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 font-medium"
                style={{
                  color: "var(--color-accent)",
                  fontSize: "var(--text-sm)",
                  transition: "color var(--duration-base) var(--ease-out)",
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  required
                  autoFocus
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && (
                <div
                  className="mb-4 p-3 animate-fade-in-up"
                  style={{
                    backgroundColor: "var(--color-danger-subtle)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <p
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {errorMessage}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !email}
                className={`btn btn-primary w-full ${status === "loading" ? "btn-loading" : ""}`}
                style={{
                  opacity: !email || status === "loading" ? 0.6 : 1,
                  cursor: !email || status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading" ? "" : "Continue with Email"}
              </button>

              <p
                className="text-center mt-5"
                style={{ color: "var(--color-ghost)", fontSize: "var(--text-xs)" }}
              >
                We'll send you a magic link to sign in.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
