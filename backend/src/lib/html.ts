import sanitizeHtml from "sanitize-html";

const SAFE_COLOR =
    /^([a-z]{3,20}|#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*(,\s*(0|1|0?\.\d+)\s*)?\))$/i;

// Everything the story editor (Tiptap, and TinyMCE for older stories) and the AI writer can produce, and nothing
// that can run script: no event handlers, no javascript: URLs, no iframes,
// no <style>/<script>, and a short allowlist of inline styles.
const POST_HTML_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
        "strong", "b", "em", "i", "u", "s", "strike", "del", "ins", "sub", "sup", "mark", "small",
        "blockquote", "pre", "code", "ul", "ol", "li", "a", "img", "figure", "figcaption",
        "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
        "span", "div",
    ],
    allowedAttributes: {
        a: ["href", "title", "target", "rel"],
        img: ["src", "alt", "title", "width", "height"],
        th: ["colspan", "rowspan", "scope"],
        td: ["colspan", "rowspan"],
        ol: ["start", "type"],
        "*": ["style"],
    },
    allowedClasses: {
        pre: ["language-*"],
        code: ["language-*"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
    allowProtocolRelative: false,
    allowedStyles: {
        "*": {
            "text-align": [/^(left|right|center|justify)$/],
            color: [SAFE_COLOR],
            "background-color": [SAFE_COLOR],
            "padding-left": [/^\d{1,3}(px|em|rem)$/],
            "text-decoration": [/^(underline|line-through|none)$/],
        },
    },
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
        }),
    },
};

export function sanitizePostHtml(html: string): string {
    return sanitizeHtml(html, POST_HTML_OPTIONS).trim();
}

function decodeBasicEntities(text: string): string {
    return text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
}

/** Strip all markup and return readable text, with spaces between blocks. */
export function toPlainText(html: string): string {
    // Headings and list items usually lack end punctuation; add a period so
    // excerpts read as sentences instead of running together.
    const punctuated = html.replace(/([^.!?:;,\s>])(\s*)<\/(h[1-6]|li)>/gi, "$1.$2</$3>");
    const spaced = punctuated.replace(
        /<\/(p|div|h[1-6]|li|blockquote|pre|tr|td|th|figcaption)>|<br\s*\/?>/gi,
        " $&"
    );
    const text = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} });
    return decodeBasicEntities(text).replace(/\s+/g, " ").trim();
}

export function readingMinutes(plainText: string): number {
    const words = plainText ? plainText.split(" ").length : 0;
    return Math.max(1, Math.round(words / 225));
}

function excerpt(plainText: string, max = 280): string {
    if (plainText.length <= max) return plainText;
    const cut = plainText.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
}

/** Replace full HTML content with a short plain-text excerpt for list views. */
export function withPreview<T extends { content: string }>(post: T) {
    const { content, ...rest } = post;
    const text = toPlainText(content);
    return { ...rest, excerpt: excerpt(text), readingMinutes: readingMinutes(text) };
}

/** Swap typographic dashes for plain punctuation in generated text. */
export function tidyPunctuation(text: string): string {
    return text
        .replace(/\s*\u2014\s*/g, ", ")
        .replace(/(\d)\s*\u2013\s*(\d)/g, "$1-$2")
        .replace(/\s*\u2013\s*/g, ", ")
        .replace(/,\s*([,.;:!?])/g, "$1")
        .replace(/>\s*,\s*/g, ">")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u2010\u2011]/g, "-")
        .replace(/\u202F/g, " ")
        .replace(/\u2026/g, "...");
}
