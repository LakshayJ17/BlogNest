import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8787';
const SITE_URL = 'https://blognest.bylakshayjain.online';

async function generateSitemap() {
  try {
    // Fetch all blogs
    const response = await axios.get(`${BACKEND_URL}/api/v1/blog/bulk`);
    const blogs = response.data.posts || [];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0' },
      { url: '/blogs', priority: '0.8' },
      { url: '/signin', priority: '0.5' },
      { url: '/signup', priority: '0.5' },
    ];

    staticPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic blog pages
    blogs.forEach((blog) => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/blog/${blog.id}</loc>\n`;
      xml += `    <lastmod>${new Date(blog.date).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';

    // Write to public folder
    const outputPath = path.join('public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log('✅ Sitemap generated:', outputPath);
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error.message);
  }
}

generateSitemap();