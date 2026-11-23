// Builds public/sitemap.xml from the live API. Runs before `vite build` so the
// fresh file is copied into dist. On failure it keeps the existing sitemap.
import fs from "fs";
import path from "path";

const BACKEND_URL = process.env.VITE_BACKEND_URL || "https://blognest-backend-yxsq.onrender.com";
const SITE_URL = "https://blognest.bylakshayjain.online";
const PAGE_SIZE = 50;
const MAX_PAGES = 100;

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

async function fetchAllPosts() {
  const posts = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`${BACKEND_URL}/api/v1/blog/bulk?page=${page}&limit=${PAGE_SIZE}`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const data = await res.json();
    posts.push(...(data.posts ?? []));
    if (!data.hasMore) break;
  }
  return posts;
}

async function generateSitemap() {
  try {
    const posts = await fetchAllPosts();
    const staticPages = [
      { url: "/", priority: "1.0" },
      { url: "/blogs", priority: "0.8" },
      { url: "/signup", priority: "0.5" },
      { url: "/signin", priority: "0.4" },
    ];

    const entries = [
      ...staticPages.map((p) => `  <url>\n    <loc>${SITE_URL}${p.url}</loc>\n    <priority>${p.priority}</priority>\n  </url>`),
      ...posts.map(
        (post) =>
          `  <url>\n    <loc>${SITE_URL}/blog/${escapeXml(post.id)}</loc>\n` +
          `    <lastmod>${new Date(post.date).toISOString().split("T")[0]}</lastmod>\n` +
          `    <priority>0.7</priority>\n  </url>`
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
    const outputPath = path.join("public", "sitemap.xml");
    fs.writeFileSync(outputPath, xml);
    console.log(`Sitemap generated with ${posts.length} posts: ${outputPath}`);
  } catch (error) {
    console.warn(`Sitemap generation skipped (${error.message}). Keeping the existing sitemap.`);
  }
}

generateSitemap();
