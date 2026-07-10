"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <>
        <p className="text-red-600">This reset link is invalid or has expired.</p>
        <p className="text-sm text-stone-500 mt-6 text-center">
          <Link href="/forgot-password" className="text-amber-800 font-medium hover:underline">
            Request a new link
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">New password</span>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">Confirm new password</span>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
            placeholder="Re-enter your new password"
          />
        </label>

        {error && (
          <p className="text-red-600 text-sm">
            {error}
            {error.includes("invalid or has expired") && (
              <>
                {" "}
                <Link href="/forgot-password" className="font-medium hover:underline">
                  Request a new link
                </Link>
              </>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-800 text-amber-50 px-6 py-3 rounded-full font-medium hover:bg-amber-900 transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Set new password"}
        </button>
      </form>

      <p className="text-sm text-stone-500 mt-6 text-center">
        <Link href="/login" className="text-amber-800 font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-col items-center px-6 py-16 bg-amber-50 min-h-screen">
      <div className="w-full max-w-md bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Choose a new password</h1>
        <p className="text-stone-500 mb-8">Enter a new password for your account.</p>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
