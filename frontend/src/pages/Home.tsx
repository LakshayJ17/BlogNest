import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowUpRight, MagicWand, Plus, Sparkle } from "@phosphor-icons/react";
import { useBlogs } from "../hooks";
import { useAuthStore } from "../store/auth";
import { LABELS } from "../lib/types";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BlogCard, StoryRow } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { buttonClasses, textLink } from "../components/ui/button";
import { SITE_URL } from "../config";

const FACTS = [
  { label: "Reading", value: "No account needed" },
  { label: "Sign in", value: "Email or Google" },
  { label: "AI help", value: "Drafts, summaries" },
];

const TOPIC_NOTES: Record<(typeof LABELS)[number], string> = {
  Technology: "Software, gadgets, and the people who build them",
  Music: "Records, gigs, and the songs on repeat",
  Sports: "Training logs, match notes, and the long game",
  Space: "Night skies, missions, and the very far away",
  Entertainment: "Film, TV, books, and everything worth a weekend",
  Hobby: "Side projects, crafts, and things made for fun",
};

const EDITOR_POINTS = [
  "Headings, quotes, lists, links, images, and code blocks",
  "A first draft from your title, written by AI, ready to rewrite",
  "A short AI summary readers can open on any long story",
  "Drafts that stay private until you publish",
];

const FAQS = [
  {
    q: "Do I need an account to read?",
    a: "No. Anyone can read and search stories. You need an account to write, like, or report a story.",
  },
  {
    q: "How does drafting with AI work?",
    a: "Type a title and choose Draft with AI. A structured first draft appears in the editor for you to rewrite. Stories drafted this way carry an AI assisted label.",
  },
  {
    q: "Can I edit a story after publishing it?",
    a: "Yes. Open your story and choose Edit. Your changes go live when you choose Update.",
  },
  {
    q: "Who can see my drafts?",
    a: "Only you. A draft stays private until you publish it, and you can delete it at any time.",
  },
  {
    q: "How are stories moderated?",
    a: "Signed-in readers can report a story. A moderator reviews every report and either keeps the story or takes it down.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const popular = useBlogs({ sort: "popular", limit: 4 });
  const latest = useBlogs({ sort: "latest", limit: 4 });

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin-dashboard" : "/blogs", { replace: true });
  }, [user, navigate]);

  return (
    <>
      <Helmet>
        <title>BlogNest | A blogging platform for people with something to say</title>
        <meta
          name="description"
          content="Write in a clean editor, get an AI first draft when the page is blank, and publish to readers who can summarize any story in one click."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BlogNest | A blogging platform for people with something to say" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${SITE_URL}/`} />
      </Helmet>

      <div className="flex min-h-[100dvh] flex-col">
        <Navbar />

        <main id="main" className="flex-1">
          {/* Hero: what BlogNest is, and the stories on it right now */}
          <section className="mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:pb-28 lg:pt-20">
            <div className="animate-enter lg:col-span-7">
              <p className="kicker">For writers and readers</p>
              <h1 className="mt-5 font-serif text-[2.75rem] font-normal leading-[1.03] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.5rem]">
                A blogging platform for people with something <em className="text-accent">to say.</em>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Write in a clean editor, get a first draft from AI when the page is blank, and publish to readers who
                can summarize any story in one click.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup" className={buttonClasses({ size: "lg" })}>
                  Start writing
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link to="/blogs" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                  Read the latest stories
                </Link>
              </div>
              <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-5">
                {FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{fact.label}</dt>
                    <dd className="mt-1.5 text-sm font-medium text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside
              aria-labelledby="popular-heading"
              className="animate-enter [animation-delay:120ms] lg:col-span-5 lg:border-l lg:border-line lg:pl-12"
            >
              <div className="flex items-baseline justify-between border-b-2 border-accent pb-3">
                <h2 id="popular-heading" className="font-serif text-2xl font-medium text-ink">
                  Most liked
                </h2>
                <Link to="/blogs?sort=popular" className={`${textLink} text-sm`}>
                  See all
                </Link>
              </div>
              <div className="divide-y divide-line" aria-busy={popular.status === "loading"}>
                {popular.status === "loading" &&
                  [0, 1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse py-5 pl-11" aria-hidden="true">
                      <div className="h-2.5 w-16 rounded-full bg-line" />
                      <div className="mt-3 h-4 w-11/12 rounded bg-line" />
                      <div className="mt-2 h-3 w-24 rounded-full bg-bone" />
                    </div>
                  ))}
                {popular.status === "ready" &&
                  popular.posts.map((post, index) => <StoryRow key={post.id} post={post} index={index} />)}
                {(popular.status === "error" || (popular.status === "ready" && popular.posts.length === 0)) && (
                  <p className="py-8 text-[15px] text-muted">
                    The first stories will show up here.{" "}
                    <Link to="/signup" className={textLink}>
                      Write one
                    </Link>
                  </p>
                )}
              </div>
            </aside>
          </section>

          {/* Contents: browse by topic */}
          <section aria-labelledby="topics-heading" className="border-t border-line">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="kicker">Contents</p>
                  <h2 id="topics-heading" className="mt-3 font-serif text-4xl font-normal tracking-[-0.025em] text-ink sm:text-5xl">
                    Browse by topic
                  </h2>
                </div>
                <p className="max-w-xs text-[15px] text-muted">Six topics, from launch notes to night skies.</p>
              </div>
              <ol className="mt-10 border-b border-line">
                {LABELS.map((label, index) => (
                  <li key={label} className="border-t border-line">
                    <Link
                      to={`/blogs?label=${encodeURIComponent(label)}`}
                      className="focus-ring group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-5 md:grid-cols-[3rem_minmax(0,18rem)_1fr_auto] md:py-6"
                    >
                      <span className="font-mono text-xs text-faint tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-serif text-3xl tracking-[-0.02em] text-ink transition-colors group-hover:text-accent md:text-[2.5rem]">
                        {label}
                      </span>
                      <span className="hidden text-[15px] text-muted md:block">{TOPIC_NOTES[label]}</span>
                      <ArrowUpRight
                        size={22}
                        aria-hidden="true"
                        className="self-center text-faint transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* The editor, shown as real UI */}
          <section aria-labelledby="editor-heading" className="border-t border-line bg-bone">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-28">
              <div className="lg:col-span-5">
                <p className="kicker">The editor</p>
                <h2 id="editor-heading" className="mt-3 font-serif text-4xl font-normal leading-[1.08] tracking-[-0.025em] text-ink sm:text-5xl">
                  A quiet page, with AI when you ask for it
                </h2>
                <ul className="mt-8 space-y-4">
                  {EDITOR_POINTS.map((point) => (
                    <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                      <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={buttonClasses({ size: "lg", className: "mt-10" })}>
                  Open the editor
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>

              <div className="lg:col-span-7" aria-hidden="true">
                <EditorMock />
              </div>
            </div>
          </section>

          {/* Latest stories */}
          <section aria-labelledby="latest-heading" className="border-t border-line">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
              <div className="flex items-end justify-between gap-6 border-b-2 border-accent pb-4">
                <div>
                  <p className="kicker">Latest</p>
                  <h2 id="latest-heading" className="mt-3 font-serif text-4xl font-normal tracking-[-0.025em] text-ink sm:text-5xl">
                    New on BlogNest
                  </h2>
                </div>
                <Link to="/blogs" className={`${textLink} shrink-0 text-sm`}>
                  All stories
                </Link>
              </div>
              <div className="grid gap-x-14 md:grid-cols-2" aria-busy={latest.status === "loading"}>
                {latest.status === "loading" &&
                  [0, 1].map((i) => (
                    <div key={i} className="border-b border-line">
                      <BlogSkeleton />
                    </div>
                  ))}
                {latest.status === "ready" &&
                  latest.posts.map((post) => <BlogCard key={post.id} post={post} className="border-b border-line" />)}
              </div>
            </div>
          </section>

          {/* Questions */}
          <section aria-labelledby="faq-heading" className="border-t border-line">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-28">
              <div className="lg:col-span-4">
                <p className="kicker">Questions</p>
                <h2 id="faq-heading" className="mt-3 font-serif text-4xl font-normal tracking-[-0.025em] text-ink sm:text-5xl">
                  Before you start
                </h2>
              </div>
              <div className="border-b border-line lg:col-span-8">
                {FAQS.map((item) => (
                  <details key={item.q} className="group border-t border-line">
                    <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-serif text-xl text-ink">{item.q}</span>
                      <Plus
                        size={18}
                        aria-hidden="true"
                        className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>
                    <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-muted">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing */}
          <section className="border-t border-line bg-bone">
            <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
              <p className="font-serif text-4xl font-normal leading-[1.06] tracking-[-0.03em] text-ink sm:text-5xl lg:col-span-8 lg:text-[3.75rem]">
                Every voice matters, and every story counts. <em className="text-accent">Yours included.</em>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
                <Link to="/signup" className={buttonClasses({ size: "lg" })}>
                  Create an account
                </Link>
                <Link to="/signin" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                  Sign in
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

/** Static, presentational copy of the editor UI for the landing page. */
function EditorMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-surface shadow-float">
      <div className="flex h-11 items-center justify-between border-b border-line px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </div>
        <span className="font-mono text-[11px] text-faint">New story</span>
        <div className="flex gap-1.5">
          <span className="rounded-md border border-line-strong px-2.5 py-1 text-[11px] text-ink">Save draft</span>
          <span className="rounded-md bg-accent px-2.5 py-1 text-[11px] text-white">Publish</span>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-9 sm:py-9">
        <p className="font-serif text-[1.75rem] leading-[1.15] tracking-[-0.02em] text-ink sm:text-[2.125rem]">
          A week without my phone
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-accent px-2.5 py-1.5 text-white">Technology</span>
          <span className="rounded-md border border-line-strong px-2.5 py-1.5 text-ink-soft">Hobby</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2.5 py-1.5 text-accent">
            <Sparkle size={11} weight="fill" />
            AI assisted
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-y border-line py-3 text-sm">
          <span className="text-muted">Blank page? Draft from your title.</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink">
            <MagicWand size={13} />
            Draft with AI
          </span>
        </div>

        <div className="mt-6 space-y-4 font-serif text-[1.0625rem] leading-relaxed text-ink-soft">
          <p>
            Day one was mostly reaching for a pocket that held nothing. By day three I had finished two books and
            learned the names of the birds outside my window.
          </p>
          <p className="text-muted">
            The surprise was not how much time I gained, but how much of it I had been handing out in thirty-second
            pieces.
          </p>
        </div>

        <div className="mt-7 rounded-lg border border-[#cfe8d7] bg-accent-soft/70 px-5 py-4">
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-accent uppercase">
            <Sparkle size={11} weight="fill" />
            AI summary
          </p>
          <p className="mt-2 font-serif text-[0.95rem] leading-relaxed text-ink-soft">
            A writer spends a week offline and finds the real cost of a phone was attention, given away a little at a
            time.
          </p>
        </div>
      </div>
    </div>
  );
}
