import type { APIRoute } from 'astro';
import { getLiveProducts } from '../../lib/supabase';
import { slugify, clUrl } from '../../data/datos';

export const prerender = false;

// Función para escapar caracteres especiales de XML
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

export const GET: APIRoute = async () => {
  try {
    const products = await getLiveProducts();
    const siteUrl = 'https://nuditos.com.co';

    const itemsXml = products
      .filter(p => p.activo)
      .map(p => {
        const pSlug = slugify(p.name);
        const pUrl = `${siteUrl}/ramo/${pSlug}`;
        const pImg = p.imgs && p.imgs.length > 0 ? p.imgs[0] : p.img;
        const pImgUrl = clUrl(pImg, 1200);
        
        return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(p.desc || p.name)}</g:description>
      <g:link>${pUrl}</g:link>
      <g:image_link>${pImgUrl}</g:image_link>
      <g:brand>Nuditos Tejidos</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${p.price}.00 COP</g:price>
      <g:google_product_category>652</g:google_product_category>
      <g:shipping_label>envio_incluido</g:shipping_label>
    </item>`;
      })
      .join('');

    const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Nuditos Tejidos - Catálogo de Ramos Eternos</title>
    <link>${siteUrl}</link>
    <description>Ramos de crochet hechos a mano en Colombia con envío incluido.</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('[meta-feed] Error generating feed:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate feed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
