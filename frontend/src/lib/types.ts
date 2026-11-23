export const LABELS = ["Technology", "Music", "Sports", "Space", "Entertainment", "Hobby"] as const;
export const AI_LABEL = "AI Generated";
export const FILTER_LABELS = [...LABELS, AI_LABEL] as const;

export type PostStatus = "draft" | "published";

export interface Author {
  name: string;
  avatar?: string | null;
  bio?: string;
}

/** Shape returned by list endpoints: excerpt instead of full HTML. */
export interface PostPreview {
  id: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
  date: string;
  status: PostStatus;
  labels: string[];
  authorId?: string;
  author?: Author;
  numberOfReports?: number;
  _count: { likes: number };
}

export interface Post extends Omit<PostPreview, "excerpt" | "author" | "authorId"> {
  content: string;
  authorId: string;
  author: Author;
  isAIGenerated?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar?: string | null;
  joinedAt: string;
  role: "user" | "admin";
  posts: PostPreview[];
  likedPostIds: string[];
}
