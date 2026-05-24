/**
 * Sitemap dinámico de Landings creadas desde Supabase — /sitemap-landings.xml
 * Se genera con SSR consumiendo las landings activas.
 */
import { getLiveLandings } from '../lib/supabase';

export const prerender = false;

function escapeXml(str: string): string {
  if (!str) return '';
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET({ site }: { site: URL | undefined }) {
  const landings = await getLiveLandings();
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';
  const now = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  landings.forEach((landing) => {
    if (!landing.slug) return;
    const lastmod = landing.updated_at || landing.created_at || now;
    const dateStr = new Date(lastmod).toISOString().split('T')[0];
    
    xml += `
  <url>
    <loc>${siteUrl}/l/${escapeXml(landing.slug)}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
