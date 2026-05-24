/**
 * Sitemap dinámico de páginas estáticas e institucionales — /sitemap-static.xml
 * Se genera con SSR usando la URL base real de producción de forma segura.
 */
export const prerender = false;

export async function GET({ site }: { site: URL | undefined }) {
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Lista de páginas estáticas e institucionales del negocio con su relevancia
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/catalogo', priority: '0.9', changefreq: 'daily' },
    { loc: '/flores-eternas', priority: '0.9', changefreq: 'weekly' },
    { loc: '/regalos-dia-de-la-madre', priority: '0.9', changefreq: 'weekly' },
    { loc: '/regalos-para-novia', priority: '0.8', changefreq: 'weekly' },
    { loc: '/regalo-para-esposa', priority: '0.8', changefreq: 'weekly' },
    { loc: '/regalos-san-valentin', priority: '0.8', changefreq: 'weekly' },
    { loc: '/regalos-amor-y-amistad', priority: '0.8', changefreq: 'weekly' },
    { loc: '/regalos-de-aniversario', priority: '0.8', changefreq: 'weekly' },
    { loc: '/regalos-para-amiga', priority: '0.7', changefreq: 'weekly' },
    { loc: '/flores-amarillas', priority: '0.7', changefreq: 'weekly' },
    { loc: '/flores-tejidas-a-crochet', priority: '0.7', changefreq: 'weekly' },
    { loc: '/amigurumis-para-regalar', priority: '0.7', changefreq: 'weekly' },
    { loc: '/regalos-originales-colombia', priority: '0.7', changefreq: 'weekly' },
    
    // SEO Local (Páginas de Ciudades)
    { loc: '/ramos-de-flores-bogota', priority: '0.6', changefreq: 'weekly' },
    { loc: '/ramos-de-flores-medellin', priority: '0.6', changefreq: 'weekly' },
    { loc: '/ramos-de-flores-cali', priority: '0.6', changefreq: 'weekly' },
    { loc: '/ramos-de-flores-barranquilla', priority: '0.6', changefreq: 'weekly' },
    { loc: '/ramos-de-flores-bucaramanga', priority: '0.6', changefreq: 'weekly' },
    { loc: '/detalles-a-domicilio-bogota', priority: '0.6', changefreq: 'weekly' },
    { loc: '/detalles-a-domicilio-medellin', priority: '0.6', changefreq: 'weekly' },
    { loc: '/detalles-a-domicilio-cali', priority: '0.6', changefreq: 'weekly' },
    { loc: '/regalos-originales-bogota', priority: '0.6', changefreq: 'weekly' },
    { loc: '/flores-tejidas-bogota', priority: '0.6', changefreq: 'weekly' },
    
    // Institucionales
    { loc: '/sobre-nosotros', priority: '0.5', changefreq: 'monthly' },
    { loc: '/preguntas-frecuentes', priority: '0.5', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  staticPages.forEach((page) => {
    const fullLoc = page.loc === '/' ? siteUrl : `${siteUrl}${page.loc}`;
    xml += `
  <url>
    <loc>${fullLoc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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
