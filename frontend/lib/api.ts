export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Something went wrong");
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export type User = {
  id: number;
  email: string;
  display_name: string;
  name_changed_at: string | null;
  password_changed_at: string | null;
  life_story_count: number;
  lesson_count: number;
  total_views: number;
  name_change_cooldown_ms: number;
  password_change_cooldown_ms: number;
  preferred_locale: string | null;
  preferred_theme_mode: "light" | "dark" | "system" | null;
};

export type Question = {
  id: number;
  prompt: string;
  sort_order: number;
};

export type StoryAnswer = {
  question_id: number;
  prompt: string;
  answer: string;
};

export type Story = {
  id: number;
  user_id: number;
  mode: "freeform" | "questions";
  visibility: "public" | "private";
  title: string;
  content: string | null;
  is_anonymous: boolean;
  author_display_name: string | null;
  view_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  answers?: StoryAnswer[];
};

export type Translation = {
  language: string;
  title: string;
  content: string | null;
  answers?: StoryAnswer[];
};

export type TreeBubble = {
  id: number;
  tree_id: number;
  name: string;
  birth_year: number | null;
  location: string | null;
  notes: string | null;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
};

export type TreeConnection = {
  id: number;
  tree_id: number;
  from_bubble_id: number;
  to_bubble_id: number;
  label: string;
  from_handle: string | null;
  to_handle: string | null;
  created_at: string;
};

export type FamilyTree = {
  id: number;
  user_id: number;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
  bubbles: TreeBubble[];
  connections: TreeConnection[];
  owner_display_name?: string;
};

export type TreeMatch = {
  bubble_id: number;
  name: string;
  birth_year: number | null;
  location: string | null;
  tree_id: number;
  tree_owner_id: number;
  tree_owner_display_name: string;
};

export type TreeMatches = {
  eligible: boolean;
  matches: TreeMatch[];
};

export function formatDuration(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hour${hours === 1 ? "" : "s"}${minutes ? ` ${minutes} minute${minutes === 1 ? "" : "s"}` : ""}`;
}
