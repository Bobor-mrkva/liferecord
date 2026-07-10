"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const writeHref = user ? "/stories/new" : "/signup";

  return (
    <main className="flex flex-col min-h-screen bg-amber-50 text-stone-800 font-[family-name:var(--font-geist-sans)]">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-24 gap-6 max-w-3xl mx-auto">
        <span className="text-sm font-medium tracking-widest uppercase text-amber-700">
          Every life is a story worth telling
        </span>
        <h1 className="text-5xl font-bold leading-tight text-stone-900">
          Your memories deserve<br />to live on
        </h1>
        <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
          Liferecord is a warm, simple place where elders can write and share their life
          stories — for family, for the world, and for generations to come.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link
            href={writeHref}
            className="bg-amber-800 text-amber-50 px-7 py-3 rounded-full text-base font-medium hover:bg-amber-900 transition-colors"
          >
            Write your story
          </Link>
          <Link
            href="/stories"
            className="border border-amber-800 text-amber-800 px-7 py-3 rounded-full text-base font-medium hover:bg-amber-100 transition-colors"
          >
            Read stories
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-white border-y border-amber-200 py-16 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-10 text-center">
          {[
            {
              icon: "✍️",
              title: "Write simply",
              desc: "No complicated tools. Just a clean page where you can type your memories at your own pace.",
            },
            {
              icon: "📖",
              title: "Share with family",
              desc: "Send a link to loved ones so they can read, comment, and treasure your stories forever.",
            },
            {
              icon: "🌿",
              title: "Preserved forever",
              desc: "Your stories are safely stored and available to those you choose, now and in the future.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="font-semibold text-lg text-stone-900">{f.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 max-w-3xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12 text-stone-900">How it works</h2>
        <ol className="flex flex-col gap-8">
          {[
            { step: "1", title: "Create an account", desc: "Sign up in seconds — no complicated setup needed." },
            { step: "2", title: "Write a memory", desc: "Use our gentle editor to write a story, big or small." },
            { step: "3", title: "Share it", desc: "Choose who can read it — family only, or the whole world." },
          ].map((s) => (
            <li key={s.step} className="flex gap-5 items-start">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-lg">
                {s.step}
              </span>
              <div>
                <h3 className="font-semibold text-stone-900">{s.title}</h3>
                <p className="text-stone-500 text-sm mt-1">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA banner */}
      <section className="bg-amber-800 text-amber-50 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to begin?</h2>
        <p className="text-amber-200 mb-8 max-w-md mx-auto">
          Join Liferecord today and start turning your memories into stories that last.
        </p>
        <Link
          href={writeHref}
          className="bg-amber-50 text-amber-900 px-8 py-3 rounded-full font-medium hover:bg-white transition-colors"
        >
          Get started — it&apos;s free
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 px-8 text-center text-stone-400 text-sm border-t border-amber-200">
        © {new Date().getFullYear()} Liferecord. Built with care.
      </footer>
    </main>
  );
}
