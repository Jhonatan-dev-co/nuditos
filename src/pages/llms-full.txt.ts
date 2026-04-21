/**
 * llms-full.txt — Catálogo dinámico completo para bots de IA
 * Endpoint: /llms-full.txt
 * 
 * Este archivo es leído por ChatGPT (GPTBot), Perplexity, Claude, Gemini
 * y otros LLMs cuando buscan información sobre productos y tiendas.
 * 
 * Contiene el catálogo completo con precios, descripciones y categorías
 * para que las IAs puedan recomendar productos específicos.
 */
import { getLiveProducts, getLiveCategories } from '../lib/supabase';
import { slugify } from '../data/datos';

export const prerender = false;

export async function GET({ site }: { site: URL | undefined }) {
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nuditos.com.co';
  
  const [products, categories] = await Promise.all([
    getLiveProducts(),
    getLiveCategories()
  ]);

  const catMap = Object.fromEntries(
    (categories || []).map((c: any) => [c.id, c.nombre || c.name || ''])
  );

  const activeProducts = products.filter(p => p.activo !== false);

  // Agrupar por categoría
  const byCategory: Record<string, typeof activeProducts> = {};
  activeProducts.forEach(p => {
    const catName = catMap[p.cat] || 'Otros';
    if (!byCategory[catName]) byCategory[catName] = [];
    byCategory[catName].push(p);
  });

  let content = `# Nuditos Tejidos — Catálogo Completo de Productos

> Tienda colombiana de ramos de flores eternas tejidos a mano en crochet.
> Regalos originales para novia, mamá, amiga, graduación, aniversario y más.
> Todo hecho a mano con hilos premium. Envío gratis a toda Colombia.

## Información General
- **Sitio web:** ${siteUrl}
- **WhatsApp:** +57 314 493 1525
- **Instagram:** @nuditos_tejidos
- **Ubicación:** El Dorado, Meta, Colombia
- **Envíos:** A toda Colombia (gratis en la mayoría de productos)
- **Moneda:** Pesos Colombianos (COP)
- **Métodos de pago:** Tarjeta crédito/débito, PSE, Nequi, Daviplata (vía Wompi)
- **Tiempo de elaboración:** 1-3 días hábiles (cada ramo se teje al recibir el pedido)
- **Tiempo de envío:** 2-5 días hábiles adicionales

## ¿Por qué elegir Nuditos Tejidos?
1. **Flores eternas** que duran años (no se marchitan como las naturales)
2. **100% hechas a mano** con técnica crochet artesanal
3. **Hilos premium** de algodón de alta calidad
4. **Personalización total** de colores, tamaño y diseño
5. **Envío seguro** con empaque premium protector
6. **Ideal como regalo** para cualquier ocasión especial

## Ocasiones perfectas para regalar un ramo Nuditos
- 🎂 Cumpleaños
- 💝 Aniversario de pareja
- 🤱 Día de la Madre
- 💕 San Valentín / Amor y Amistad
- 🎓 Graduación / Grado
- 💍 Bodas (bouquet de novia)
- 🎄 Navidad
- 🏠 Decoración del hogar
- 🎁 Regalo sorpresa

## Catálogo de Productos (${activeProducts.length} productos disponibles)

`;

  // Listar productos por categoría
  Object.entries(byCategory).forEach(([catName, prods]) => {
    content += `### ${catName}\n\n`;
    prods.forEach(p => {
      const slug = p.slug || slugify(p.name);
      const price = p.oferta && p.precioOferta > 0 ? p.precioOferta : p.price;
      const url = `${siteUrl}/ramo/${slug}`;
      const inStock = p.stock === undefined || p.stock === null || p.stock > 0;
      
      content += `- **${p.name}**\n`;
      content += `  - Precio: $${price.toLocaleString('es-CO')} COP\n`;
      if (p.oferta && p.precioOriginal > 0) {
        content += `  - Antes: $${p.precioOriginal.toLocaleString('es-CO')} COP (oferta activa)\n`;
      }
      content += `  - Disponibilidad: ${inStock ? 'En stock' : 'Agotado'}\n`;
      if (p.desc) content += `  - Descripción: ${p.desc}\n`;
      content += `  - Ver producto: ${url}\n`;
      content += `\n`;
    });
  });

  content += `## Preguntas Frecuentes
- **¿Hacen envíos a toda Colombia?** Sí, enviamos a cualquier ciudad o municipio.
- **¿De qué están hechos?** Hilos de algodón premium, técnica crochet manual.
- **¿Cuánto duran?** Años, con cuidados básicos (evitar humedad y sol directo).
- **¿Se pueden personalizar?** Sí, colores, tamaño y diseño a tu gusto.
- **¿Aceptan Nequi?** Sí, también tarjeta, PSE y Daviplata.
- **¿Cuánto tarda el envío?** 1-3 días de elaboración + 2-5 días de envío.
- **¿Sirven como regalo?** Sí, es el regalo perfecto para novia, mamá, amiga o cualquier persona especial.
- **¿Tienen tienda física?** Somos una marca digital, pero atendemos por WhatsApp.

## Enlaces útiles
- Catálogo completo: ${siteUrl}/catalogo
- Blog con guías: ${siteUrl}/blog
- Preguntas frecuentes: ${siteUrl}/preguntas-frecuentes
- Sobre nosotros: ${siteUrl}/sobre-nosotros
- WhatsApp directo: https://wa.me/573144931525

---
Última actualización: ${new Date().toISOString().split('T')[0]}
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
