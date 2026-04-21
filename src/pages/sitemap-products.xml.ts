/**
 * Sitemap dinámico de páginas de producto — /ramo/[slug]
 * Se regenera en cada request (SSR) con la lista actualizada de Supabase.
 * Referenciado en robots.txt para que Google lo descubra automáticamente.
 */
import { getLiveProducts } from '../lib/supabase';

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
  const products = await getLiveProducts();
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';

  // Solo productos activos con slug válido
  const activeProducts = products.filter((p) => p.activo !== false && p.slug);

  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  activeProducts.forEach((p) => {
    const loc = `${siteUrl}/ramo/${escapeXml(p.slug)}`;
    xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
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
