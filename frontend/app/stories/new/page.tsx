"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, Question, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StoryForm, { StoryFormValues } from "@/components/StoryForm";

export default function NewStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"freeform" | "questions" | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (mode === "questions" && questions.length === 0) {
      api.get<Question[]>("/questions").then(setQuestions);
    }
  }, [mode, questions.length]);

  if (authLoading || !user) return null;

  const handleSubmit = async (values: StoryFormValues) => {
    if (!mode) return;
    setError(null);
    setSubmitting(true);
    try {
      const story = await api.post<Story>("/stories", {
        mode,
        visibility: values.visibility,
        title: values.title,
        content: mode === "freeform" ? values.content : undefined,
        answers:
          mode === "questions"
            ? Object.entries(values.answers).map(([question_id, answer]) => ({
                question_id: Number(question_id),
                answer,
              }))
            : undefined,
      });
      router.push(`/stories/${story.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center px-6 py-16 bg-amber-50 min-h-screen">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Write a new story</h1>
        <p className="text-stone-500 mb-8">
          Choose how you&apos;d like to share, then write at your own pace.
        </p>

        {!mode ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode("freeform")}
              className="text-left bg-white border border-amber-200 rounded-2xl p-6 hover:border-amber-400 transition-colors"
            >
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Free-form life story</h2>
              <p className="text-stone-500 text-sm">
                Write your story in your own words, at your own pace.
              </p>
            </button>
            <button
              onClick={() => setMode("questions")}
              className="text-left bg-white border border-amber-200 rounded-2xl p-6 hover:border-amber-400 transition-colors"
            >
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Lessons learned</h2>
              <p className="text-stone-500 text-sm">
                Answer a few reflective questions to help others learn from your experience.
              </p>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl p-8">
            <button
              onClick={() => setMode(null)}
              className="text-sm text-amber-800 hover:underline mb-6"
            >
              ← Choose a different way to write
            </button>
            <StoryForm
              mode={mode}
              questions={questions}
              submitLabel="Publish story"
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </main>
  );
}
