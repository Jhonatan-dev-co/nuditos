/**
 * Sitemap dinámico del Blog — /sitemap-blog.xml
 * Incluye posts dinámicos de Supabase + posts estáticos existentes.
 * Referenciado en robots.txt para descubrimiento automático.
 */
import { getLivePosts } from '../lib/supabase';

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
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';
  const now = new Date().toISOString().split('T')[0];

  // Posts dinámicos de Supabase
  const livePosts = await getLivePosts();

  // Páginas de aterrizaje de alto valor SEO (Landings)
  const seoPages = [
    { url: '/blog', prio: '0.8', freq: 'daily' },
    { url: '/regalos-para-novia', prio: '0.9', freq: 'weekly' },
    { url: '/regalos-dia-de-la-madre', prio: '0.9', freq: 'weekly' },
    { url: '/flores-eternas', prio: '0.9', freq: 'weekly' },
    { url: '/ramos-de-flores-bogota', prio: '0.9', freq: 'weekly' },
    { url: '/ramos-de-flores-medellin', prio: '0.9', freq: 'weekly' },
    { url: '/ramos-de-flores-cali', prio: '0.9', freq: 'weekly' },
    { url: '/ramos-de-flores-barranquilla', prio: '0.9', freq: 'weekly' },
    { url: '/ramos-de-flores-bucaramanga', prio: '0.9', freq: 'weekly' },
    { url: '/preguntas-frecuentes', prio: '0.6', freq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${seoPages.map(page => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.prio}</priority>
  </url>`).join('')}`;

  // Agregar posts dinámicos de Supabase
  livePosts.forEach(post => {
    if (!post.slug) return;
    const lastmod = post.updated_at || post.created_at || now;
    const dateStr = new Date(lastmod).toISOString().split('T')[0];
    
    xml += `
  <url>
    <loc>${siteUrl}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    addedSlugs.add(post.slug);
  });

  // Agregar posts estáticos que no estén ya incluidos
  staticSlugs.forEach(slug => {
    if (addedSlugs.has(slug)) return;
    xml += `
  <url>
    <loc>${siteUrl}/blog/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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
