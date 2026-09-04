import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SITE_NAME = 'Patna Finder';

// RSS feed — powers the "Follow" button inside Google Discover
export const revalidate = 1800;

function escapeXml(str: string) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let items = '';
  try {
    const res = await api.getBlogPosts({ per_page: 20 });
    const posts = Array.isArray(res) ? res : res.data || [];
    items = posts
      .map((p: any) => {
        const url = `${SITE_URL}/blog/${p.slug}`;
        const pub = p.published_at ? new Date(p.published_at).toUTCString() : new Date().toUTCString();
        return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pub}</pubDate>
      <description>${escapeXml(p.excerpt || p.meta_description || '')}</description>
      <category>${escapeXml(p.category || '')}</category>
    </item>`;
      })
      .join('\n');
  } catch {
    // API down — serve an empty channel rather than an error page
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Patna Pulse Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Latest news, stories, guides &amp; events from Patna, Bihar</description>
    <language>en-in</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
