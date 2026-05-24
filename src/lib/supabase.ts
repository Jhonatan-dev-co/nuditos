const SB_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SB_ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

import { slugify, type Product, products as fallbackProducts } from '../data/datos';

async function fetchWithTimeout(url: string, options: any, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// ════════ MEMORY CACHE (Advanced Speed Optimization) ════════
interface CacheItem {
  data: any;
  timestamp: number;
}

const memoryCache: Record<string, CacheItem> = {};
const CACHE_TTL = 120000; // 2 minutos (120,000 ms)

async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = CACHE_TTL): Promise<T> {
  const now = Date.now();
  const cached = memoryCache[key];
  if (cached && (now - cached.timestamp < ttl)) {
    return cached.data;
  }
  try {
    const freshData = await fetcher();
    // Cache positive hits only, and ensure non-empty arrays to prevent caching failed/empty responses
    if (freshData !== null && freshData !== undefined && (!Array.isArray(freshData) || freshData.length > 0)) {
      memoryCache[key] = { data: freshData, timestamp: now };
    }
    return freshData;
  } catch (error) {
    if (cached) {
      console.warn(`[Supabase Cache Fallback] Error fetching fresh data for ${key}, using cached fallback.`);
      return cached.data;
    }
    throw error;
  }
}

export async function getLiveProducts(): Promise<Product[]> {
  return getCached('live_products', async () => {
    try {
      const res = await fetchWithTimeout(`${SB_URL}/rest/v1/productos?activo=eq.true&order=id.desc`, {
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

        // Manejar cats (múltiples categorías separadas por coma)
        let catsArr: string[] = [];
        if (p.categoria) {
          catsArr = p.categoria.split(',').map((s: string) => s.trim().toLowerCase()).filter((s: string) => s);
        }

        return {
          id:             p.id,
          name:           p.nombre          || '',
          price:          p.precio          || 0,
          precioOriginal: p.precio_original || 0,
          desc:           p.descripcion     || '',
          cat:            catsArr[0]        || '', // Fallback a la primera categoría
          cats:           catsArr, // Múltiples categorías
          orden:          p.orden           || 0,
          emoji:          p.emoji           || '🌸',
          img:            p.img             || '',
          imgs:           imgsArr,
          stock:          p.stock,
          badge:          p.badge           || '',
          badgeClass:     p.badge_class     || '',
          oferta:         p.oferta          || false,
          envioGratis:    p.envio_gratis    || false,
          destacado:      p.destacado       || false,
          activo:         p.activo          !== false,
          metaTitle:      p.meta_title      || null,
          metaDescription:p.meta_description || null,
          altText:        p.alt_text        || null,
          seoKeywords:    p.seo_keywords    || null
        };
      });

    } catch (e) {
      console.error('[supabase-fetcher] Error conectando a Supabase:', e);
      return [];
    }
  });
}

export async function getLiveCategories(): Promise<any[]> {
  return getCached('live_categories', async () => {
    try {
      const res = await fetchWithTimeout(`${SB_URL}/rest/v1/categorias?order=orden.asc`, {
        headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
      });
      if (!res.ok) return [];
      
      const rows = await res.json();
      return rows.map((c: any) => {
        let icon = c.icon || c.emoji || '';
        let name = c.nombre || c.name || '';
        if (name.toLowerCase().includes('lindsas')) {
          name = name.replace(/lindsas/gi, 'lindas');
        }

        return { 
          ...c, 
          icon, 
          name, 
          nombre: name,
          metaTitle:       c.meta_title       || null,
          metaDescription: c.meta_description || null,
          descripcionSeo:  c.descripcion_seo  || null,
          showInHome:      c.show_in_home     !== false
        };
      });
    } catch {
      return [];
    }
  });
}

export async function getLiveBanners(): Promise<any[]> {
  return getCached('live_banners', async () => {
    try {
      const res = await fetchWithTimeout(`${SB_URL}/rest/v1/banners?order=orden.asc`, {
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
        mobileImgUrl: b.mobile_img_url || '',
        subtitle: b.subtitle  || '',
        ctaText:  b.cta_text  || '',
        ctaUrl:   b.cta_url   || '',
        videoUrl: b.video_url || '',
        mobileVideoUrl: b.mobile_video_url || '',
      }));
    } catch {
      return [];
    }
  });
}

export async function getLiveConfig() {
  if (!SB_URL || !SB_ANON) return null;
  return getCached('live_config', async () => {
    try {
      const res = await fetchWithTimeout(`${SB_URL}/rest/v1/config?select=clave,valor`, {
        headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
      });
      if (!res.ok) return null;
      const rows = await res.json();
      const m: any = {};
      rows.forEach((r: any) => { m[r.clave] = r.valor; });
      
      return {
        descuentoActivo:      m.descuento_activo    === 'true',
        descuentoCodigo:      m.descuento_codigo    || 'NUDITOS10',
        descuentoPorcentaje:  parseInt(m.descuento_porcentaje) || 10,
        descuentoTexto:       m.descuento_texto     || '',
        carruselHero:         JSON.parse(m.carrusel_hero  || '[]'),
        ramoDestacado:        parseInt(m.ramo_destacado)  || 0,
        wompiActivo:          m.wompi_activo        === 'true',
        wompiKey:             m.wompi_key           || '',
        wompiIntegrity:       m.wompi_integrity_secret || '',
        wompiEvents:          m.wompi_events_secret    || '',
        catViews:             JSON.parse(m.cat_views || '{}'),
        seleccionNuditos:     JSON.parse(m.seleccion_nuditos || '[]'),
        metaPixelActivo:      m.meta_pixel_activo === 'true',
        metaPixelId:          m.meta_pixel_id || '',
        socialProofMode:      m.social_proof_mode || 'trust_badges',
        seoTitle:             m.seo_title || '',
        seoDescription:       m.seo_description || '',
        seoOgImage:           m.seo_og_image || '',
        socialInstagram:      m.social_instagram || '',
        socialWhatsapp:       m.social_whatsapp || '',
        gaId:                 m.ga_id || '',
        gaActive:             m.ga_active === 'true',
      };
    } catch (e) {
      console.error('[supabase-config]', e);
      return null;
    }
  });
}

export async function getPublicConfig() {
  const config = await getLiveConfig();
  if (!config) return null;
  const { wompiIntegrity, wompiEvents, ...safeConfig } = config;
  return safeConfig;
}

export async function getLiveProductBySlug(slug: string) {
  const all = await getLiveProducts();
  return all.find(p => slugify(p.name) === slug) || null;
}

export async function getLivePosts(): Promise<any[]> {
  return getCached('live_posts', async () => {
    try {
      const res = await fetchWithTimeout(
        `${SB_URL}/rest/v1/posts?select=*&order=created_at.desc`,
        { headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` } }
      );
      if (!res.ok) return [];
      const rows = await res.json();
      return rows.map((p: any) => ({
        ...p,
        image: p.image || p.img || '',
        excerpt: p.excerpt || p.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '',
        category: p.category || p.categoria || 'Nuditos',
        meta_title: p.meta_title || p.title || '',
        meta_description: p.meta_description || '',
        seo_keywords: p.seo_keywords || '',
      }));
    } catch {
      return [];
    }
  });
}

export async function getPostBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetchWithTimeout(
      `${SB_URL}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
      { headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    const p = rows[0];
    return {
      ...p,
      image: p.image || p.img || '',
      excerpt: p.excerpt || p.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '',
      category: p.category || p.categoria || 'Nuditos',
      meta_title: p.meta_title || p.title || '',
      meta_description: p.meta_description || '',
      seo_keywords: p.seo_keywords || '',
    };
  } catch {
    return null;
  }
}

export async function getLiveTestimonios(): Promise<any[]> {
  return getCached('live_testimonios', async () => {
    try {
      const res = await fetchWithTimeout(`${SB_URL}/rest/v1/testimonios?activo=eq.true&order=created_at.desc`, {
        headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  });
}

export async function getLiveLandings(): Promise<any[]> {
  return getCached('live_landings', async () => {
    try {
      const res = await fetchWithTimeout(`${SB_URL}/rest/v1/landings?is_active=eq.true&select=slug,created_at,updated_at`, {
        headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  });
}
