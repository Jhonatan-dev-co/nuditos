/**
 * Google Merchant Center Product Feed
 * Endpoint: /feed/google-merchant.xml
 * 
 * Este feed permite que tus productos aparezcan en:
 * - Google Shopping (pestaña "Shopping")
 * - Google Images Shopping
 * - Google Search resultados enriquecidos
 * 
 * Registra este URL en: https://merchant.google.com
 * Formato: RSS 2.0 con extensiones Google Shopping (g:)
 */
import { getLiveProducts, getLiveCategories } from '../../lib/supabase';
import { slugify, clUrl } from '../../data/datos';

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
  const [products, categories] = await Promise.all([
    getLiveProducts(),
    getLiveCategories()
  ]);

  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';
  const catMap = Object.fromEntries((categories || []).map((c: any) => [c.id, c.nombre || c.name || '']));

  // Solo productos activos con precio y nombre
  const activeProducts = products.filter(p => 
    p.activo !== false && p.name && (p.price > 0 || (p.oferta && p.precioOferta > 0))
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Nuditos Tejidos — Ramos de Crochet y Regalos Artesanales</title>
  <link>${siteUrl}</link>
  <description>Ramos de flores tejidos a mano (crochet) que no se marchitan. Regalos eternos con envío a toda Colombia.</description>`;

  activeProducts.forEach(p => {
    const slug = p.slug || slugify(p.name);
    const productUrl = `${siteUrl}/ramo/${slug}`;
    const imageUrl = p.img ? (p.img.startsWith('http') ? clUrl(p.img, 1200) : `${siteUrl}${p.img}`) : '';
    const price = p.oferta && p.precioOferta > 0 ? p.precioOferta : p.price;
    const salePrice = p.oferta && p.precioOriginal > 0 ? p.precioOriginal : null;
    const inStock = p.stock === undefined || p.stock === null || p.stock > 0;
    const categoryName = catMap[p.cat] || 'Ramos de Crochet';
    
    // Descripción optimizada para Google Shopping
    const description = p.desc 
      ? `${p.desc} | Ramo tejido a mano por Nuditos Tejidos. Flores eternas de crochet con envío a toda Colombia.`
      : `${p.name} - Ramo de flores tejido a mano (crochet). El regalo perfecto que no se marchita. Envío a toda Colombia. Hecho con hilos premium.`;

    // Additional images
    const additionalImages = (p.imgs || [])
      .filter((img: string) => img && img !== p.img)
      .slice(0, 9) // Google permite hasta 10 imágenes total
      .map((img: string) => img.startsWith('http') ? clUrl(img, 1200) : `${siteUrl}${img}`);

    xml += `
  <item>
    <g:id>NUD-${p.id}</g:id>
    <g:title>${escapeXml(p.name)} — Ramo Tejido a Crochet</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${productUrl}</g:link>
    <g:image_link>${imageUrl}</g:image_link>`;

    additionalImages.forEach((img: string) => {
      xml += `
    <g:additional_image_link>${img}</g:additional_image_link>`;
    });

    xml += `
    <g:price>${price} COP</g:price>`;

    if (salePrice && salePrice > price) {
      xml += `
    <g:sale_price>${price} COP</g:sale_price>`;
    }

    xml += `
    <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
    <g:condition>new</g:condition>
    <g:brand>Nuditos Tejidos</g:brand>
    <g:google_product_category>Arts &amp; Entertainment &gt; Hobbies &amp; Creative Arts &gt; Arts &amp; Crafts &gt; Floral Arranging</g:google_product_category>
    <g:product_type>${escapeXml(categoryName)} &gt; Crochet</g:product_type>
    <g:identifier_exists>false</g:identifier_exists>
    <g:is_bundle>false</g:is_bundle>
    <g:shipping>
      <g:country>CO</g:country>
      <g:service>Envío Nacional</g:service>
      <g:price>0 COP</g:price>
    </g:shipping>
    <g:custom_label_0>Hecho a mano</g:custom_label_0>
    <g:custom_label_1>Crochet Colombia</g:custom_label_1>
    <g:custom_label_2>${escapeXml(categoryName)}</g:custom_label_2>
  </item>`;
  });

  xml += `
</channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
