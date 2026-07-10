"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[] | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) api.get<Story[]>("/stories/mine").then(setStories);
  }, [user]);

  if (authLoading || !user) return null;

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this story? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/stories/${id}`);
      setStories((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex flex-col items-center px-6 py-16 bg-amber-50 min-h-screen">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-1">My stories</h1>
            <p className="text-stone-500">Welcome back, {user.display_name}.</p>
          </div>
          <Link
            href="/stories/new"
            className="bg-amber-800 text-amber-50 px-5 py-3 rounded-full font-medium hover:bg-amber-900 transition-colors whitespace-nowrap"
          >
            + New story
          </Link>
        </div>

        {!stories ? (
          <p className="text-stone-500">Loading...</p>
        ) : stories.length === 0 ? (
          <p className="text-stone-500">
            You haven&apos;t written any stories yet.{" "}
            <Link href="/stories/new" className="text-amber-800 font-medium hover:underline">
              Start your first one
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {stories.map((story) => {
              const preview =
                story.mode === "freeform"
                  ? story.content
                  : story.answers?.map((a) => a.answer).join(" ");
              return (
                <div
                  key={story.id}
                  className="bg-white border border-amber-200 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-stone-900">{story.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                            story.visibility === "public"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {story.visibility}
                        </span>
                      </div>
                      <p className="text-stone-500 text-sm line-clamp-2">{preview}</p>
                    </div>
                    <div className="flex gap-3 text-sm whitespace-nowrap">
                      <Link
                        href={`/stories/${story.id}`}
                        className="text-amber-800 font-medium hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/stories/${story.id}/edit`}
                        className="text-amber-800 font-medium hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(story.id)}
                        disabled={deletingId === story.id}
                        className="text-red-600 font-medium hover:underline disabled:opacity-50"
                      >
                        {deletingId === story.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
