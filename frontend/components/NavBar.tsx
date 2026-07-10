"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AccountMenu from "@/components/AccountMenu";

export default function NavBar() {
  const { user, loading } = useAuth();

  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-amber-100 border-b border-amber-300">
      <Link href="/" className="text-2xl font-semibold tracking-tight text-amber-900">
        Liferecord
      </Link>
      <div className="flex gap-4 text-sm items-center">
        <Link href="/stories" className="text-stone-600 hover:text-amber-900 transition-colors">
          Read stories
        </Link>
        {loading ? null : user ? (
          <>
            <Link href="/dashboard" className="text-stone-600 hover:text-amber-900 transition-colors">
              My stories
            </Link>
            <AccountMenu />
          </>
        ) : (
          <>
            <Link href="/login" className="text-stone-600 hover:text-amber-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-amber-800 text-amber-50 px-4 py-2 rounded-full hover:bg-amber-900 transition-colors"
            >
              Start sharing
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
