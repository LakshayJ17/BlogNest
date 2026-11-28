import { z } from "zod";

export const POST_LABELS = [
    "Technology",
    "Music",
    "Sports",
    "Space",
    "Entertainment",
    "Hobby",
    "AI Generated",
] as const;

export const MAX_TITLE_LENGTH = 150;
// Measured on the cleaned HTML too (cleaning can grow text: "&" becomes "&amp;").
// About 20,000 words of formatted text.
export const MAX_CONTENT_LENGTH = 150_000;
// Most posts returned by one list call (drafts, profile).
export const MAX_LIST_POSTS = 100;

/** A string field with a clear message when it is missing or not text. */
const requiredString = (label: string) =>
    z.string({ error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`) });

const email = requiredString("Email")
    .trim()
    .toLowerCase()
    .max(254, "Email is too long")
    .email("Enter a valid email address");

const newPassword = requiredString("Password")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[a-z]/, "Password needs a lowercase letter")
    .regex(/[A-Z]/, "Password needs an uppercase letter")
    .regex(/\d/, "Password needs a number")
    .regex(/[^A-Za-z0-9]/, "Password needs a special character");

// Cloudflare Turnstile token from the signup and sign-in forms (at most 2048 characters).
const captchaToken = z.string().max(2048, "Invalid security check").optional();

export const signupSchema = z.object({
    name: z.string().trim().max(60, "Name must be at most 60 characters").optional(),
    email,
    password: newPassword,
    captchaToken,
});

// Sign-in must not apply the new-password rules, or older accounts with
// shorter passwords would be locked out.
export const signinSchema = z.object({
    email,
    password: requiredString("Password").min(1, "Password is required").max(128, "Incorrect email or password"),
    captchaToken,
});

export const googleAuthSchema = z.object({
    credential: requiredString("Google credential").min(1, "Missing Google credential").max(4096),
});

const title = requiredString("Title")
    .trim()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`);

const content = requiredString("Content")
    .min(1, "Content is required")
    .max(MAX_CONTENT_LENGTH, "Your post is too long");

const labelList = z
    .array(z.enum(POST_LABELS, { message: "Unknown label" }))
    .max(POST_LABELS.length);

const labels = labelList.optional().transform((value) => Array.from(new Set(value ?? [])));

// For edits: undefined means "leave labels unchanged".
const optionalLabels = labelList
    .optional()
    .transform((value) => (value ? Array.from(new Set(value)) : undefined));

const postId = requiredString("Post id").trim().min(1, "Missing post id").max(64);

export const createPostSchema = z.object({ title, content, labels });

export const updateDraftSchema = z.object({
    title,
    content,
    labels,
    status: z.enum(["draft", "published"]).default("draft"),
});

export const updatePublishedSchema = z.object({ id: postId, title, content, labels: optionalLabels });

export const aiPostSchema = z.object({
    title: title.refine((t) => t.length >= 3, "Write a slightly longer title first"),
});

export const aiSummarySchema = z.object({ postId });

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const listPostsQuerySchema = z.object({
    q: z.preprocess(emptyToUndefined, z.string().trim().max(100, "Search is too long").optional()),
    label: z.preprocess(emptyToUndefined, z.enum(POST_LABELS, { message: "Unknown label" }).optional()),
    sort: z.preprocess(emptyToUndefined, z.enum(["latest", "popular"]).default("latest")),
    page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(500).default(1)),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(12)),
});

export const adminUsersQuerySchema = z.object({
    filter: z.preprocess(emptyToUndefined, z.enum(["newest", "suspended"], { message: "Unknown filter" }).default("newest")),
});
