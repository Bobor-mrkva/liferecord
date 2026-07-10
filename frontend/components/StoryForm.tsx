"use client";

import { useState } from "react";
import { Question } from "@/lib/api";
import VoiceTextarea from "@/components/VoiceTextarea";

export type StoryFormValues = {
  title: string;
  visibility: "public" | "private";
  content: string;
  answers: Record<number, string>;
};

type StoryFormProps = {
  mode: "freeform" | "questions";
  questions: Question[];
  initialValues?: Partial<StoryFormValues>;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: StoryFormValues) => void;
};

export default function StoryForm({
  mode,
  questions,
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: StoryFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    initialValues?.visibility ?? "private"
  );
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [answers, setAnswers] = useState<Record<number, string>>(
    initialValues?.answers ?? {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, visibility, content, answers });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-700">Title</span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-amber-200 rounded-lg px-4 py-3 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Give your story a title"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-stone-700 mb-1">Who can see this?</legend>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setVisibility("private")}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              visibility === "private"
                ? "bg-amber-800 text-amber-50 border-amber-800"
                : "border-amber-200 text-stone-600 hover:bg-amber-100"
            }`}
          >
            Private — only me
          </button>
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              visibility === "public"
                ? "bg-amber-800 text-amber-50 border-amber-800"
                : "border-amber-200 text-stone-600 hover:bg-amber-100"
            }`}
          >
            Public — anyone
          </button>
        </div>
      </fieldset>

      {mode === "freeform" ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">Your story</span>
          <VoiceTextarea
            required
            rows={14}
            value={content}
            onChange={setContent}
            placeholder="Write your life story here, in your own words, or click the mic to speak it..."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-stone-700">{q.prompt}</span>
              <VoiceTextarea
                rows={4}
                value={answers[q.id] ?? ""}
                onChange={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))}
                placeholder="Answer in your own time, by typing or speaking — you can leave this blank"
              />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-amber-800 text-amber-50 px-6 py-3 rounded-full font-medium hover:bg-amber-900 transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
