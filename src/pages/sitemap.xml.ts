/**
 * Sitemap Index dinámico principal — /sitemap.xml
 * Agrupa y le indica a los motores de búsqueda todos los sitemaps disponibles en el sitio.
 */
export const prerender = false;

export async function GET({ site }: { site: URL | undefined }) {
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';

  // Sitemaps que componen la tienda
  const sitemaps = [
    '/sitemap-static.xml',
    '/sitemap-products.xml',
    '/sitemap-blog.xml',
    '/sitemap-landings.xml',
    '/sitemap-images.xml'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  sitemaps.forEach((sm) => {
    xml += `
  <sitemap>
    <loc>${siteUrl}${sm}</loc>
  </sitemap>`;
  });

  xml += `
</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
