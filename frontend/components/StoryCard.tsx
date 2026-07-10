import Link from "next/link";
import { Story } from "@/lib/api";

export default function StoryCard({
  story,
  showVisibility,
}: {
  story: Story;
  showVisibility?: boolean;
}) {
  const preview =
    story.mode === "freeform"
      ? story.content
      : story.answers?.map((a) => a.answer).join(" ");

  return (
    <Link
      href={`/stories/${story.id}`}
      className="block bg-white border border-amber-200 rounded-2xl p-6 hover:border-amber-400 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xl font-semibold text-stone-900">{story.title}</h3>
        {showVisibility && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              story.visibility === "public"
                ? "bg-amber-100 text-amber-800"
                : "bg-stone-100 text-stone-600"
            }`}
          >
            {story.visibility}
          </span>
        )}
      </div>
      <p className="text-stone-500 text-sm line-clamp-3">{preview}</p>
    </Link>
  );
}
