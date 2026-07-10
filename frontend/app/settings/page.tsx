"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, formatDuration, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";

function useCountdown(initialMs: number) {
  const [remaining, setRemaining] = useState(initialMs);
  const [prevInitialMs, setPrevInitialMs] = useState(initialMs);

  if (initialMs !== prevInitialMs) {
    setPrevInitialMs(initialMs);
    setRemaining(initialMs);
  }

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  return remaining;
}

export default function SettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) return null;

  return (
    <main className="flex flex-col items-center px-6 py-16 bg-amber-50 min-h-screen">
      <div className="w-full max-w-md flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-stone-900">Account settings</h1>
        <NameForm user={user} onSaved={refresh} />
        <PasswordForm user={user} onSaved={refresh} />
      </div>
    </main>
  );
}

function NameForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useCountdown(user.name_change_cooldown_ms);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.patch<User>("/auth/me", { display_name: displayName });
      onSaved();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-stone-900 mb-1">Your name</h2>
      <p className="text-stone-500 text-sm mb-6">You can change your name once every 24 hours.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={cooldown > 0}
          className="border border-amber-200 rounded-lg px-4 py-3 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-stone-50 disabled:text-stone-400"
        />
        {cooldown > 0 && (
          <p className="text-sm text-stone-500">
            You can change your name again in {formatDuration(cooldown)}.
          </p>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-700 text-sm">Name updated.</p>}
        <button
          type="submit"
          disabled={submitting || cooldown > 0}
          className="self-start bg-amber-800 text-amber-50 px-5 py-2.5 rounded-full font-medium hover:bg-amber-900 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save name"}
        </button>
      </form>
    </div>
  );
}

function PasswordForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useCountdown(user.password_change_cooldown_ms);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match — please check both fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      onSaved();
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-stone-900 mb-1">Password</h2>
      <p className="text-stone-500 text-sm mb-6">You can change your password once every 5 minutes.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">Current password</span>
          <PasswordInput
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            placeholder="Your current password"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">New password</span>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">Confirm new password</span>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder="Type your new password again"
          />
        </label>
        {cooldown > 0 && (
          <p className="text-sm text-stone-500">
            You can change your password again in {formatDuration(cooldown)}.
          </p>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-700 text-sm">Password updated.</p>}
        <button
          type="submit"
          disabled={submitting || cooldown > 0}
          className="self-start bg-amber-800 text-amber-50 px-5 py-2.5 rounded-full font-medium hover:bg-amber-900 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
