"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<Story>(`/stories/${id}`)
      .then(setStory)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [id]);

  if (notFound) {
    return (
      <main className="flex flex-col items-center px-6 py-24 bg-amber-50 min-h-screen text-center">
        <p className="text-stone-600">This story is private or doesn&apos;t exist.</p>
        <Link href="/stories" className="text-amber-800 font-medium hover:underline mt-4">
          Back to stories
        </Link>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="flex flex-col items-center px-6 py-24 bg-amber-50 min-h-screen">
        <p className="text-stone-500">Loading...</p>
      </main>
    );
  }

  const isOwner = user?.id === story.user_id;

  return (
    <main className="flex flex-col items-center px-6 py-16 bg-amber-50 min-h-screen">
      <article className="w-full max-w-2xl bg-white border border-amber-200 rounded-2xl p-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-stone-900">{story.title}</h1>
          {isOwner && (
            <Link
              href={`/stories/${story.id}/edit`}
              className="text-sm text-amber-800 hover:underline whitespace-nowrap"
            >
              Edit
            </Link>
          )}
        </div>

        {story.mode === "freeform" ? (
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{story.content}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {story.answers?.map((a) => (
              <div key={a.question_id}>
                <h3 className="font-semibold text-stone-900 mb-1">{a.prompt}</h3>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{a.answer}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
