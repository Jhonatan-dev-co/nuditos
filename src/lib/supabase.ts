// Clean values helper
const clean = (v: any) => (typeof v === 'string' ? v.replace(/['"]/g, '').trim() : v);

// Static access for reliable bundling
const SB_URL = clean(import.meta.env.PUBLIC_SUPABASE_URL) || (typeof process !== 'undefined' ? clean(process.env.PUBLIC_SUPABASE_URL) : undefined);
const SB_ANON = clean(import.meta.env.PUBLIC_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' ? clean(process.env.PUBLIC_SUPABASE_ANON_KEY) : undefined);

if (!SB_URL || !SB_ANON) {
  console.error('[supabase.ts] ERROR: Supabase credentials missing!');
}
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

export async function getLiveProducts(): Promise<Product[]> {
  try {
    if (!SB_URL || !SB_ANON) throw new Error('Missing credentials');
    
    const res = await fetchWithTimeout(`${SB_URL}/rest/v1/productos?activo=eq.true&order=id.desc`, {
      headers: { 
        apikey: SB_ANON, 
        Authorization: `Bearer ${SB_ANON}` 
      }
    });
    
    if (!res.ok) {
        console.error('[supabase-fetcher] Response NOT OK:', res.status, res.statusText);
        throw new Error('Error al conectar con Supabase');
    }
    
    const rows = await res.json();
    if (!rows || rows.length === 0) {
      console.warn('[supabase-fetcher] No active products found in DB. Returning fallback.');
      return fallbackProducts;
    }

    return rows.map((p: any) => {
      // Manejar imgs dinámicamente (puede ser array, string o null)
      let imgsArr: string[] = [];
      if (Array.isArray(p.imgs)) {
        imgsArr = p.imgs;
      } else if (typeof p.imgs === 'string' && p.imgs.trim()) {
        imgsArr = p.imgs.split(',').map((s: string) => s.trim());
      }

      // Manejar categorías con normalización inteligente
      // Ej: "flores-amarillas" -> ["flores-amarillas", "amarillas"]
      let catsArr: string[] = [];
      if (p.categoria) {
        catsArr = p.categoria.split(',').map((s: string) => s.trim().toLowerCase()).filter((s: string) => s);
        
        // Mapeos inteligentes para que coincidan con los fallbacks o IDs comunes
        const smartMappings: Record<string, string[]> = {
          'flores-amarillas': ['amarillas', 'girasoles'],
          'flores-rosas':     ['rosas'],
          'personajes':       ['amigurumis'],
          'amigurumis':       ['personajes'],
          'macetas':          ['plantas'],
          'rosas-eternas':    ['rosas']
        };

        const extraCats: string[] = [];
        catsArr.forEach(c => {
          if (smartMappings[c]) extraCats.push(...smartMappings[c]);
          // Si contiene una palabra clave, añadirla
          if (c.includes('amarilla')) extraCats.push('amarillas');
          if (c.includes('rosa'))     extraCats.push('rosas');
        });
        
        catsArr = [...new Set([...catsArr, ...extraCats])];
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
    console.error('[supabase-fetcher] Error conectando a Supabase:', e.message || e);
    return fallbackProducts; // Always return something to avoid empty store
  }
}

export async function getLiveCategories(): Promise<any[]> {
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
}

export async function getLiveBanners(): Promise<any[]> {
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
}

export async function getLiveConfig() {
  if (!SB_URL || !SB_ANON) return null;
  try {
    const res = await fetchWithTimeout(`${SB_URL}/rest/v1/config?select=clave,valor`, {
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
}

/**
 * Retorna la configuración filtrada para uso público en el navegador (sin secretos)
 */
export async function getPublicConfig() {
  const config = await getLiveConfig();
  if (!config) return null;
  
  // Eliminamos de forma segura las llaves privadas antes de enviar al frontend
  const { wompiIntegrity, wompiEvents, ...safeConfig } = config;
  return safeConfig;
}

export async function getLiveProductBySlug(slug: string) {
  // Optimizamos obteniendo todos los productos activos y buscando por slugify
  // Se recomienda añadir una columna 'slug' en Supabase para una búsqueda directa .eq('slug', slug)
  const all = await getLiveProducts();
  return all.find(p => {
    const pSlug = slugify(p.name);
    return pSlug === slug;
  }) || null;
}

export async function getLivePosts(): Promise<any[]> {
  try {
    const res = await fetchWithTimeout(`${SB_URL}/rest/v1/posts?order=created_at.desc`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

