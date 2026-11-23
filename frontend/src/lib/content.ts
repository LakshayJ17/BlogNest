import DOMPurify from "dompurify";

// Links in posts open in a new tab and can't reach back into BlogNest.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
});

/**
 * Sanitize post HTML before rendering. The server sanitizes on save too; this
 * protects against older posts and anything that slips past the server.
 */
export function safeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select", "iframe", "object", "embed"],
    FORBID_ATTR: ["id", "name"],
  });
}

/** Swap typographic dashes and quotes for plain punctuation in AI output. */
export function tidyPunctuation(text: string): string {
  return text
    .replace(/\s*\u2014\s*/g, ", ")
    .replace(/(\d)\s*\u2013\s*(\d)/g, "$1-$2")
    .replace(/\s*\u2013\s*/g, ", ")
    .replace(/,\s*([,.;:!?])/g, "$1")
    .replace(/^\s*,\s*/, "")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2010\u2011]/g, "-")
    .replace(/\u202F/g, " ")
    .replace(/\u2026/g, "...");
}

export function plainTextLength(html: string): number {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").trim().length;
}
