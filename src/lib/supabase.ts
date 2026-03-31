const SB_URL = 'https://fpyhkxikxdwjhukltmqf.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweWhreGlreGR3amh1a2x0bXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzE1OTIsImV4cCI6MjA4ODI0NzU5Mn0.U1fHtV23e3uTlaH9qoeibzbm1d6MEcUaFE7rDhnokgM';

import { slugify, type Product, products as fallbackProducts } from '../data/datos';

export async function getLiveProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/productos?activo=eq.true&order=id.asc`, {
      headers: { 
        apikey: SB_ANON, 
        Authorization: `Bearer ${SB_ANON}` 
      }
    });
    
    if (!res.ok) throw new Error('Error al conectar con Supabase');
    
    const rows = await res.json();
    return rows.map((p: any) => {
      // Manejar imgs dinámicamente (puede ser array, string o null)
      let imgsArr: string[] = [];
      if (Array.isArray(p.imgs)) {
        imgsArr = p.imgs;
      } else if (typeof p.imgs === 'string' && p.imgs.trim()) {
        imgsArr = p.imgs.split(',').map((s: string) => s.trim());
      }


      return {
        id:             p.id,
        name:           p.nombre          || '',
        price:          p.precio          || 0,
        precioOriginal: p.precio_original || 0,
        desc:           p.descripcion     || '',
        cat:            p.categoria       || '',
        emoji:          p.emoji           || '🌸',
        img:            p.img             || '',
        imgs:           imgsArr,
        stock:          p.stock,
        badge:          p.badge           || '',
        badgeClass:     p.badge_class     || '',
        oferta:         p.oferta          || false,
        envioGratis:    p.envio_gratis    || false,
        destacado:      p.destacado       || false,
        activo:         p.activo          !== false
      };
    });

  } catch (e) {
    console.error('[supabase-fetcher]', e);
    return fallbackProducts; // Retorna fallbacks si falla
  }
}

export async function getLiveCategories(): Promise<any[]> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/categorias?order=orden.asc`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getLiveBanners(): Promise<any[]> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/banners?order=orden.asc`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map((b: any) => ({
      id:       b.id,
      afterCat: b.after_cat || '',
      emoji:    b.emoji     || '🌸',
      title:    b.title     || '',
      imgUrl:   b.img_url   || '',
    }));
  } catch {
    return [];
  }
}

export async function getLiveConfig() {
  if (!SB_URL || !SB_ANON) return null;
  try {
    const res = await fetch(`${SB_URL}/rest/v1/config?select=clave,valor`, {
      headers: { 
        apikey: SB_ANON, 
        Authorization: `Bearer ${SB_ANON}` 
      }
    });
    if (!res.ok) return null;
    const rows = await res.json();
    
    // Convertir de clave-valor a objeto plano
    const m: any = {};
    rows.forEach((r: any) => { m[r.clave] = r.valor; });
    
    return {
      descuentoActivo:      m.descuento_activo    === 'true',
      descuentoCodigo:      m.descuento_codigo    || 'NUDITOS10',
      descuentoPorcentaje:  parseInt(m.descuento_porcentaje) || 10,
      descuentoTexto:       m.descuento_texto     || '10% de descuento en tu primer pedido',
      carruselHero:         JSON.parse(m.carrusel_hero  || '[]'),
      ramoDestacado:        parseInt(m.ramo_destacado)  || 0,
      wompiActivo:          m.wompi_activo        === 'true',
      wompiKey:             m.wompi_key           || '',
      catViews:             JSON.parse(m.cat_views || '{}'),
      metaPixelActivo:      m.meta_pixel_activo === 'true',
      metaPixelId:          m.meta_pixel_id || '',
    };
  } catch (e) {
    console.error('[supabase-config]', e);
    return null;
  }
}

export async function getLiveProductBySlug(slug: string) {
  const all = await getLiveProducts();
  return all.find(p => slugify(p.name) === slug) || null;
}

