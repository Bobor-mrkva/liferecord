"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center px-6 py-16 bg-amber-50 min-h-screen">
      <div className="w-full max-w-md bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Reset your password</h1>
        <p className="text-stone-500 mb-8">
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>

        {sent ? (
          <p className="text-stone-700">
            If an account exists for that email, we&apos;ve sent a reset link. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-amber-200 rounded-lg px-4 py-3 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="you@example.com"
              />
            </label>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-800 text-amber-50 px-6 py-3 rounded-full font-medium hover:bg-amber-900 transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-sm text-stone-500 mt-6 text-center">
          <Link href="/login" className="text-amber-800 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
