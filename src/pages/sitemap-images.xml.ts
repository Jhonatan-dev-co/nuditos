import { getLiveProducts } from '../lib/supabase';
import { slugify, clUrl } from '../data/datos';

export const prerender = false;

function escapeXml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET({ site }: { site: URL | undefined }) {
  const products = await getLiveProducts();
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  products.forEach(p => {
    // Si no está activo, no lo incluimos
    if (p.activo === false) return;

    // Recolectar todas las imágenes (principal + galería)
    const imgs: string[] = [];
    if (p.img) imgs.push(clUrl(p.img, 1200));
    if (p.imgs && Array.isArray(p.imgs)) {
      p.imgs.forEach((i: string) => {
        if (i && i !== p.img) imgs.push(clUrl(i, 1200));
      });
    }

    if (imgs.length === 0) return;

    const productUrl = `${siteUrl}/ramo/${slugify(p.name)}`;
    const altText = p.altText || p.name; // Usa el alt_text de Supabase si existe

    xml += `
  <url>
    <loc>${productUrl}</loc>`;
    
    imgs.forEach(img => {
      // Aseguramos que la URL sea absoluta
      const absoluteImgUrl = img.startsWith('http') ? img : `${siteUrl}${img}`;
      xml += `
    <image:image>
      <image:loc>${absoluteImgUrl}</image:loc>
      <image:title>${escapeXml(altText)}</image:title>
    </image:image>`;
    });

    xml += `
  </url>`;
  });

  xml += `
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    }
  });
}
