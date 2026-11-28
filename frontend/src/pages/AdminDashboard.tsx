import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { Flag, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { api, getErrorMessage } from "../lib/api";
import type { PostPreview } from "../lib/types";
import { PageShell } from "../components/PageShell";
import { Avatar } from "../components/Avatar";
import { PostedDate } from "../components/PostedDate";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { buttonClasses } from "../components/ui/button";
import { cn } from "../lib/utils";

interface Stats {
  totalUsers: number;
  totalBlogs: number;
  reportedBlogs: number;
}

interface AdminAction {
  id: string;
  action: "dismiss_reports" | "remove_post" | "suspend_user" | "unsuspend_user";
  postId: string | null;
  targetUserId: string | null;
  details: { title?: string; reportsAtAction?: number; name?: string } | null;
  createdAt: string;
  admin: { name: string };
}

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  joinedAt: string;
  role: "user" | "admin";
  suspendedAt: string | null;
  _count: { posts: number };
}

type MemberFilter = "newest" | "suspended";

/** Who the suspend dialog is about. Stories is unknown when suspending from the review queue. */
interface SuspendTarget {
  id: string;
  name: string;
  stories?: number;
}

const ghostDanger = "text-tag-red hover:bg-tag-red-bg hover:text-tag-red";

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reported, setReported] = useState<PostPreview[]>([]);
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<PostPreview | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("newest");
  const [members, setMembers] = useState<Member[]>([]);
  const [membersStatus, setMembersStatus] = useState<"loading" | "ready" | "error">("loading");
  const [suspending, setSuspending] = useState<SuspendTarget | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadActions = useCallback(async () => {
    const { data } = await api.get<{ actions: AdminAction[] }>("/admin/actions");
    setActions(data.actions);
  }, []);

  const fetchOverview = useCallback(async () => {
    const [details, queue] = await Promise.all([
      api.get<Stats>("/admin/all-details"),
      api.get<{ posts: PostPreview[] }>("/admin/reported"),
      loadActions(),
    ]);
    setStats(details.data);
    setReported(queue.data.posts);
  }, [loadActions]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      await fetchOverview();
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load the dashboard."));
      setStatus("error");
    }
  }, [fetchOverview]);

  const loadMembers = useCallback(async (filter: MemberFilter, quiet = false) => {
    if (!quiet) setMembersStatus("loading");
    try {
      const { data } = await api.get<{ users: Member[] }>("/admin/users", { params: { filter } });
      setMembers(data.users);
      setMembersStatus("ready");
    } catch {
      if (!quiet) setMembersStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadMembers(memberFilter);
  }, [loadMembers, memberFilter]);

  // A suspension hides or restores stories everywhere, so refresh every list
  // in the background. The action itself already worked.
  const refreshAfterAccountChange = () => {
    fetchOverview().catch(() => undefined);
    void loadMembers(memberFilter, true);
  };

  // After an action, show its new log entry. The action itself already worked,
  // so a failure here only leaves the log a step behind until the next load.
  const refreshActions = () => {
    loadActions().catch(() => undefined);
  };

  useEffect(() => {
    void load();
  }, [load]);

  const dropFromQueue = (id: string, removed: boolean) => {
    setReported((current) => current.filter((p) => p.id !== id));
    setStats((s) =>
      s
        ? { ...s, reportedBlogs: Math.max(0, s.reportedBlogs - 1), totalBlogs: s.totalBlogs - (removed ? 1 : 0) }
        : s
    );
  };

  const dismiss = async (post: PostPreview) => {
    setBusyId(post.id);
    try {
      await api.post(`/admin/${post.id}/dismiss`);
      dropFromQueue(post.id, false);
      refreshActions();
      toast.success("Reports cleared. The story stays up.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const suspend = async () => {
    if (!suspending) return;
    setBusyUserId(suspending.id);
    try {
      await api.post(`/admin/users/${suspending.id}/suspend`);
      // Their stories are hidden now, so they leave the review queue at once.
      setReported((current) => current.filter((p) => p.authorId !== suspending.id));
      refreshAfterAccountChange();
      toast.success(`${suspending.name} is suspended. Their stories are hidden.`);
      setSuspending(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyUserId(null);
    }
  };

  const liftSuspension = async (member: Member) => {
    setBusyUserId(member.id);
    try {
      await api.post(`/admin/users/${member.id}/unsuspend`);
      refreshAfterAccountChange();
      toast.success(`${member.name} can sign in again. Their stories are back.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyUserId(null);
    }
  };

  const remove = async () => {
    if (!removing) return;
    setBusyId(removing.id);
    try {
      await api.delete(`/admin/${removing.id}`);
      dropFromQueue(removing.id, true);
      refreshActions();
      toast.success("Story removed");
      setRemoving(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageShell className="max-w-5xl">
      <Helmet>
        <title>Moderation | BlogNest</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="border-b border-line-strong pb-6">
        <p className="kicker">Admin</p>
        <h1 className="mt-3 font-serif text-[2.75rem] font-medium leading-[1.05] tracking-[-0.025em] text-ink">Moderation</h1>
      </header>

      {status === "error" && (
        <div className="mt-8">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      {status !== "error" && (
        <>
          <dl className="grid grid-cols-3 divide-x divide-line border-b border-line">
            <StatCard label="Members" value={stats?.totalUsers} />
            <StatCard label="Published stories" value={stats?.totalBlogs} />
            <StatCard label="Open reports" value={stats?.reportedBlogs} alert />
          </dl>

          <section className="mt-14" aria-labelledby="queue-heading" aria-busy={status === "loading"}>
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <h2 id="queue-heading" className="font-serif text-2xl font-medium tracking-[-0.01em] text-ink">
                Review queue
              </h2>
              <p className="font-mono text-xs text-muted">Most reported first</p>
            </div>

            {status === "loading" && (
              <div className="divide-y divide-line" aria-hidden="true">
                {[0, 1].map((i) => (
                  <div key={i} className="animate-pulse py-7">
                    <div className="h-3 w-40 rounded-full bg-line" />
                    <div className="mt-4 h-5 w-2/3 rounded bg-line" />
                    <div className="mt-3 h-3 w-full rounded-full bg-bone" />
                  </div>
                ))}
              </div>
            )}

            {status === "ready" && reported.length === 0 && (
              <EmptyState
                className="border-t-0"
                icon={ShieldCheck}
                title="Nothing to review"
                description="No one has reported a story. New reports show up here."
              />
            )}

            {status === "ready" && reported.length > 0 && (
              <ul className="divide-y divide-line border-b border-line">
                {reported.map((post) => (
                  <li key={post.id} className="grid gap-5 py-7 md:grid-cols-[1fr_auto] md:gap-10">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-tag-red-bg px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] text-tag-red uppercase">
                          <Flag size={11} weight="fill" aria-hidden="true" />
                          {post.numberOfReports} {post.numberOfReports === 1 ? "report" : "reports"}
                        </span>
                        <span className="flex items-center gap-2 text-[13px] text-muted">
                          <Avatar name={post.author?.name ?? "Anonymous"} src={post.author?.avatar} size="xs" />
                          {post.author?.name}
                          <span aria-hidden="true" className="text-faint">/</span>
                          <PostedDate date={post.date} className="font-mono text-xs" />
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-[1.375rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
                        <Link to={`/blog/${post.id}`} className="link-draw focus-ring rounded-sm">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 font-serif text-[1.0625rem] leading-relaxed text-muted">{post.excerpt}</p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-stretch">
                      <button
                        type="button"
                        onClick={() => dismiss(post)}
                        disabled={busyId === post.id}
                        className={buttonClasses({ variant: "secondary", size: "sm" })}
                      >
                        Keep, clear reports
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemoving(post)}
                        disabled={busyId === post.id}
                        className={buttonClasses({ variant: "danger", size: "sm" })}
                      >
                        Remove story
                      </button>
                      {post.authorId && (
                        <button
                          type="button"
                          onClick={() =>
                            setSuspending({ id: post.authorId!, name: post.author?.name ?? "This author" })
                          }
                          disabled={busyId === post.id || busyUserId === post.authorId}
                          className={buttonClasses({ variant: "ghost", size: "sm", className: ghostDanger })}
                        >
                          Suspend author
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-14" aria-labelledby="members-heading" aria-busy={membersStatus === "loading"}>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 id="members-heading" className="font-serif text-2xl font-medium tracking-[-0.01em] text-ink">
                Members
              </h2>
              <div role="group" aria-label="Show members" className="flex gap-1">
                {(["newest", "suspended"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={memberFilter === filter}
                    onClick={() => setMemberFilter(filter)}
                    className={cn(
                      "focus-ring cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition-colors",
                      memberFilter === filter ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-bone hover:text-ink"
                    )}
                  >
                    {filter === "newest" ? "Newest" : "Suspended"}
                  </button>
                ))}
              </div>
            </div>

            {membersStatus === "loading" && (
              <div className="divide-y divide-line" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3 py-5">
                    <div className="h-8 w-8 rounded-full bg-line" />
                    <div className="h-3 w-48 rounded-full bg-line" />
                  </div>
                ))}
              </div>
            )}

            {membersStatus === "error" && (
              <div className="mt-6">
                <ErrorState message="Couldn't load members." onRetry={() => loadMembers(memberFilter)} />
              </div>
            )}

            {membersStatus === "ready" && members.length === 0 && (
              <EmptyState
                className="border-t-0"
                icon={UsersThree}
                title={memberFilter === "suspended" ? "No suspended accounts" : "No members yet"}
                description={
                  memberFilter === "suspended"
                    ? "Accounts you suspend show up here, so you can lift the suspension later."
                    : "New accounts show up here as people sign up."
                }
              />
            )}

            {membersStatus === "ready" && members.length > 0 && (
              <ul className="divide-y divide-line border-b border-line">
                {members.map((member) => (
                  <li key={member.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={member.name} src={member.avatar} size="sm" />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium text-ink">
                          <span className="truncate">{member.name}</span>
                          {member.role === "admin" && <MemberTag tone="green">Admin</MemberTag>}
                          {member.suspendedAt && <MemberTag tone="red">Suspended</MemberTag>}
                        </p>
                        {/* Wraps to two lines on narrow screens instead of cutting off the details. */}
                        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 font-mono text-xs text-muted">
                          <span className="max-w-full truncate">{member.email}</span>
                          <span aria-hidden="true" className="hidden text-faint sm:inline">/</span>
                          <span>
                            {member.suspendedAt
                              ? `suspended ${formatDay(member.suspendedAt)}`
                              : `joined ${formatDay(member.joinedAt)}`}
                            <span aria-hidden="true" className="px-1.5 text-faint">/</span>
                            {member._count.posts} {member._count.posts === 1 ? "story" : "stories"}
                          </span>
                        </p>
                      </div>
                    </div>
                    {member.role !== "admin" &&
                      (member.suspendedAt ? (
                        <button
                          type="button"
                          onClick={() => liftSuspension(member)}
                          disabled={busyUserId === member.id}
                          className={buttonClasses({ variant: "secondary", size: "sm" })}
                        >
                          Lift suspension
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSuspending({ id: member.id, name: member.name, stories: member._count.posts })}
                          disabled={busyUserId === member.id}
                          className={buttonClasses({ variant: "ghost", size: "sm", className: ghostDanger })}
                        >
                          Suspend
                        </button>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {status === "ready" && (
            <section className="mt-14" aria-labelledby="log-heading">
              <div className="flex items-baseline justify-between border-b border-line pb-3">
                <h2 id="log-heading" className="font-serif text-2xl font-medium tracking-[-0.01em] text-ink">
                  Moderation log
                </h2>
                <p className="font-mono text-xs text-muted">Last 50 actions</p>
              </div>

              {actions.length === 0 ? (
                <p className="py-7 text-sm text-muted">No moderation actions yet. Each one you take is recorded here.</p>
              ) : (
                <ol className="divide-y divide-line border-b border-line">
                  {actions.map((entry) => (
                    <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                      <p className="min-w-0 text-[15px] text-ink">
                        <span className="font-medium">{entry.admin.name}</span> {describeAction(entry)}{" "}
                        {isAccountAction(entry) ? (
                          <span className="font-medium">{entry.details?.name ?? "an account"}</span>
                        ) : (
                          <span className="font-serif italic">{entry.details?.title ?? "a story"}</span>
                        )}
                      </p>
                      <time dateTime={entry.createdAt} className="font-mono text-xs text-muted tabular-nums">
                        {formatLogTime(entry.createdAt)}
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}
        </>
      )}

      {removing && (
        <ConfirmDialog
          open
          title="Remove this story?"
          description={`"${removing.title}" will be taken down for everyone.`}
          confirmLabel="Remove"
          busy={busyId === removing.id}
          onConfirm={remove}
          onCancel={() => setRemoving(null)}
        />
      )}

      {suspending && (
        <ConfirmDialog
          open
          title={`Suspend ${suspending.name}?`}
          description={suspendDescription(suspending)}
          confirmLabel="Suspend"
          busy={busyUserId === suspending.id}
          onConfirm={suspend}
          onCancel={() => setSuspending(null)}
        />
      )}
    </PageShell>
  );
};

function formatLogTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function suspendDescription({ stories }: SuspendTarget): string {
  const hidden =
    stories === undefined
      ? "Every story they've published will be hidden until you lift the suspension."
      : stories === 0
        ? "They haven't published any stories. You can lift the suspension at any time."
        : `Their ${stories} published ${stories === 1 ? "story" : "stories"} will be hidden until you lift the suspension.`;
  return `They'll be signed out and can't sign in again. ${hidden}`;
}

function isAccountAction(entry: AdminAction): boolean {
  return entry.action === "suspend_user" || entry.action === "unsuspend_user";
}

function describeAction(entry: AdminAction): string {
  if (entry.action === "suspend_user") return "suspended";
  if (entry.action === "unsuspend_user") return "lifted the suspension on";
  if (entry.action === "remove_post") return "removed";
  const count = entry.details?.reportsAtAction ?? 0;
  return `cleared ${count} ${count === 1 ? "report" : "reports"} on`;
}

function MemberTag({ tone, children }: { tone: "red" | "green"; children: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] uppercase",
        tone === "red" ? "bg-tag-red-bg text-tag-red" : "bg-tag-green-bg text-tag-green"
      )}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, alert }: { label: string; value?: number; alert?: boolean }) {
  return (
    <div className="px-4 py-6 first:pl-0 sm:px-6">
      <dt className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{label}</dt>
      <dd className={`mt-2 font-serif text-4xl font-medium tabular-nums ${alert && value ? "text-tag-red" : "text-ink"}`}>
        {value ?? <span className="inline-block h-9 w-12 animate-pulse rounded bg-line" />}
      </dd>
    </div>
  );
}
