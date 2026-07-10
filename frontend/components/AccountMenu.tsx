"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountMenu() {
  const { user, logout, refresh } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const handleToggle = () => {
    if (!open) refresh();
    setOpen((v) => !v);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="bg-amber-800 text-amber-50 px-4 py-2 rounded-full hover:bg-amber-900 transition-colors"
      >
        {user.display_name}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-amber-200 rounded-xl shadow-lg py-4 px-5 z-10 text-left">
          <p className="font-semibold text-stone-900">{user.display_name}</p>
          <p className="text-sm text-stone-500 mb-3">{user.email}</p>
          <div className="flex flex-col gap-1 text-sm text-stone-600 border-t border-amber-100 pt-3 mb-3">
            <p>
              {user.story_count} {user.story_count === 1 ? "story" : "stories"} written
            </p>
            <p>
              {user.total_views} {user.total_views === 1 ? "person has" : "people have"} read your
              stories
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-amber-100 pt-3">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="text-sm text-amber-800 font-medium hover:underline"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 font-medium hover:underline text-left"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
