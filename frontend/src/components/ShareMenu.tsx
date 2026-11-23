import { FacebookLogo, LinkSimple, LinkedinLogo, ShareNetwork, WhatsappLogo, XLogo } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { Menu } from "./ui/Menu";
import { buttonClasses } from "./ui/button";

export function ShareMenu({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar instead.");
    }
  };

  // Use the device's share sheet where available (most phones).
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  if (canNativeShare && window.matchMedia("(pointer: coarse)").matches) {
    return (
      <button
        type="button"
        onClick={() => navigator.share({ title, url }).catch(() => undefined)}
        className={buttonClasses({ variant: "ghost", size: "sm" })}
      >
        <ShareNetwork size={16} aria-hidden="true" />
        Share
      </button>
    );
  }

  return (
    <Menu
      label="Share this story"
      triggerClassName={buttonClasses({ variant: "ghost", size: "sm" })}
      trigger={
        <>
          <ShareNetwork size={16} aria-hidden="true" />
          Share
        </>
      }
      items={[
        { label: "Copy link", icon: LinkSimple, onSelect: copyLink },
        { label: "Share on X", icon: XLogo, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
        { label: "Share on LinkedIn", icon: LinkedinLogo, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
        { label: "Share on Facebook", icon: FacebookLogo, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
        { label: "Share on WhatsApp", icon: WhatsappLogo, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
      ]}
    />
  );
}
