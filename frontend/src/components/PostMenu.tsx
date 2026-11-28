import { useState } from "react";
import { DotsThree, Flag, LinkSimple, PencilSimpleLine, Prohibit, Trash } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { api, getErrorMessage } from "../lib/api";
import { SITE_URL } from "../config";
import { useAuthStore } from "../store/auth";
import { ConfirmDialog } from "./ConfirmDialog";
import { Menu } from "./ui/Menu";

interface PostMenuProps {
  postId: string;
  authorId?: string;
  isDraft?: boolean;
  /** Called when the story leaves public view: deleted, removed, or its author suspended. */
  onDeleted?: (id: string) => void;
}

type Pending = "delete" | "report" | "suspend" | null;

export function PostMenu({ postId, authorId, isDraft = false, onDeleted }: PostMenuProps) {
  const user = useAuthStore((s) => s.user);
  const fetchUserData = useAuthStore((s) => s.fetchUserData);
  const [confirm, setConfirm] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const isAdmin = user?.role === "admin";
  const isOwner = Boolean(user && authorId && user.id === authorId);
  const canDelete = isOwner || (isAdmin && !isDraft);
  const canReport = !isOwner && !isAdmin && !isDraft;
  const canSuspend = isAdmin && !isOwner && !isDraft && Boolean(authorId);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/blog/${postId}`);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  const askToReport = () => {
    if (!user) {
      toast.info("Sign in to report a story.", { toastId: "report-signin" });
      return;
    }
    setConfirm("report");
  };

  const runConfirmed = async () => {
    setBusy(true);
    try {
      if (confirm === "delete") {
        await api.delete(isAdmin ? `/admin/${postId}` : `/blog/${postId}`);
        toast.success(isAdmin ? "Story removed" : isDraft ? "Draft deleted" : "Story deleted");
        onDeleted?.(postId);
        if (isOwner) void fetchUserData();
      } else if (confirm === "report") {
        await api.post(`/blog/report/${postId}`);
        toast.success("Thanks. Our team will review this story.");
      } else if (confirm === "suspend") {
        await api.post(`/admin/users/${authorId}/suspend`);
        toast.success("Author suspended. Their stories are hidden.");
        onDeleted?.(postId);
      }
      setConfirm(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Menu
        label="More actions"
        placement="top"
        triggerClassName="focus-ring relative z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-bone hover:text-ink"
        trigger={<DotsThree size={20} weight="bold" aria-hidden="true" />}
        items={[
          { label: "Edit story", icon: PencilSimpleLine, to: `/publish/${postId}`, hidden: !isOwner || isDraft },
          { label: "Copy link", icon: LinkSimple, onSelect: copyLink, hidden: isDraft },
          { label: "Report story", icon: Flag, onSelect: askToReport, hidden: !canReport },
          { label: "Suspend author", icon: Prohibit, tone: "danger", onSelect: () => setConfirm("suspend"), hidden: !canSuspend },
          {
            label: isAdmin ? "Remove story" : isDraft ? "Delete draft" : "Delete story",
            icon: Trash,
            tone: "danger",
            onSelect: () => setConfirm("delete"),
            hidden: !canDelete,
          },
        ]}
      />

      {confirm === "delete" && (
        <ConfirmDialog
          open
          title={isAdmin ? "Remove this story?" : isDraft ? "Delete this draft?" : "Delete this story?"}
          description={
            isAdmin
              ? "It will be taken down for everyone and leave the review queue."
              : isDraft
                ? "This can't be undone."
                : "This can't be undone. The story will disappear from BlogNest."
          }
          confirmLabel={isAdmin ? "Remove" : "Delete"}
          busy={busy}
          onConfirm={runConfirmed}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === "suspend" && (
        <ConfirmDialog
          open
          title="Suspend this author?"
          description="They'll be signed out and can't sign in again, and every story they've published will be hidden. You can lift the suspension from the dashboard."
          confirmLabel="Suspend"
          busy={busy}
          onConfirm={runConfirmed}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === "report" && (
        <ConfirmDialog
          open
          tone="primary"
          title="Report this story?"
          description="Report stories that are spam, hateful, harmful, or break the law. A moderator will review it."
          confirmLabel="Report"
          busy={busy}
          onConfirm={runConfirmed}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
