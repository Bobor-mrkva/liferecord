"use client";

import { useEffect, useState } from "react";
import { api, Story } from "@/lib/api";
import StoryCard from "@/components/StoryCard";

export default function PublicStoriesPage() {
  const [stories, setStories] = useState<Story[] | null>(null);

  useEffect(() => {
    api.get<Story[]>("/stories").then(setStories);
  }, []);

  return (
    <main className="flex flex-col items-center px-6 py-16 bg-amber-50 min-h-screen">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Stories from our community</h1>
        <p className="text-stone-500 mb-8">Life stories and lessons, shared publicly.</p>

        {!stories ? (
          <p className="text-stone-500">Loading...</p>
        ) : stories.length === 0 ? (
          <p className="text-stone-500">No public stories yet. Be the first to share yours.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
