/* ══════════════════════════════════════════
   NUDITOS — Cliente Supabase (vanilla JS)
   js/supabase.js
   ══════════════════════════════════════════ */

const SB_URL  = 'https://fpyhkxikxdwjhukltmqf.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweWhreGlreGR3amh1a2x0bXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzE1OTIsImV4cCI6MjA4ODI0NzU5Mn0.U1fHtV23e3uTlaH9qoeibzbm1d6MEcUaFE7rDhnokgM';

// Token del admin (se llena al hacer login)
let _sbToken = null;

/* ════════════════════════════
   FETCH BASE
════════════════════════════ */
function _h(auth = false) {
  const token = auth && _sbToken ? _sbToken : SB_ANON;
  return {
    'apikey': SB_ANON,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

async function _get(table, params = '', auth = false) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: _h(auth) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function _post(table, data, auth = false, prefer = 'return=representation') {
  const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ..._h(auth), 'Prefer': prefer },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function _patch(table, filter, data, auth = false) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: _h(auth),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function _del(table, filter, auth = false) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers: _h(auth)
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

/* ════════════════════════════
   AUTH
════════════════════════════ */
async function sbSignIn(email, password) {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SB_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Email o contraseña incorrectos');
  const data = await res.json();
  _sbToken = data.access_token;
  try {
    localStorage.setItem('sb_session', JSON.stringify({
      token: data.access_token,
      expires: Date.now() + (data.expires_in * 1000)
    }));
  } catch {}
  return data;
}

async function sbSignOut() {
  try {
    await fetch(`${SB_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'apikey': SB_ANON, 'Authorization': `Bearer ${_sbToken}` }
    });
  } catch {}
  _sbToken = null;
  try { localStorage.removeItem('sb_session'); } catch {}
}

function sbRestoreSession() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || '{}');
    if (s.token && s.expires > Date.now() + 60000) {
      _sbToken = s.token;
      return true;
    }
  } catch {}
  _sbToken = null;
  try { localStorage.removeItem('sb_session'); } catch {}
  return false;
}

function sbIsAuth() { return !!_sbToken; }

/* ════════════════════════════
   CONVERSIÓN DE CAMPOS
   Supabase (snake_case) ↔ App (camelCase)
════════════════════════════ */
function sbToProduct(p) {
  return {
    id:             p.id,
    name:           p.nombre        || '',
    price:          p.precio        || 0,
    precioOriginal: p.precio_original || 0,
    precioOferta:   p.precio_oferta   || 0,
    desc:           p.descripcion   || '',
    cat:            p.categoria     || '',
    emoji:          p.emoji         || '🌸',
    img:            p.img           || '',
    imgs:           p.imgs          || [],
    stock:          p.stock,
    activo:         p.activo        !== false,
    destacado:      p.destacado     || false,
    badge:          p.badge         || '',
    badgeClass:     p.badge_class   || '',
    oferta:         p.oferta        || false,
    envioGratis:    p.envio_gratis  || false,
  };
}

function productToSb(p) {
  return {
    nombre:           p.name          || '',
    precio:           p.price         ?? 0,
    precio_original:  p.precioOriginal ?? 0,
    precio_oferta:    p.precioOferta   ?? 0,
    descripcion:      p.desc           || '',
    categoria:        p.cat            || '',
    emoji:            p.emoji          || '🌸',
    img:              p.img            || '',
    imgs:             Array.isArray(p.imgs) ? p.imgs : [],
    stock:            p.stock          ?? 99,
    activo:           p.activo         !== false,
    destacado:        p.destacado      || false,
    badge:            p.badge          || '',
    badge_class:      p.badgeClass     || '',
    oferta:           p.oferta         || false,
    envio_gratis:     p.envioGratis    || false,
  };
}

function sbToConfig(rows) {
  const m = {};
  rows.forEach(r => { m[r.clave] = r.valor; });
  return {
    descuentoActivo:      m.descuento_activo    === 'true',
    descuentoCodigo:      m.descuento_codigo    || 'NUDITOS10',
    descuentoPorcentaje:  parseInt(m.descuento_porcentaje) || 10,
    descuentoTexto:       m.descuento_texto     || '10% de descuento en tu primer pedido',
    carruselHero:         JSON.parse(m.carrusel_hero  || '[17,55,63]'),
    ramoDestacado:        parseInt(m.ramo_destacado)  || 17,
    wompiActivo:          m.wompi_activo        === 'true',
    wompiKey:             m.wompi_key           || '',
    catViews:             JSON.parse(m.cat_views || '{}'),
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
}

function sbToBanner(b) {
  return {
    id:       b.id,
    afterCat: b.after_cat || '',
    emoji:    b.emoji     || '🌸',
    title:    b.title     || '',
    imgUrl:   b.img_url   || '',
    subtitle: b.subtitle  || '',
    ctaText:  b.cta_text  || '',
    ctaUrl:   b.cta_url   || '',
  };
}

function sbToPedido(p) {
  return {
    id:             p.id,
    cliente:        p.cliente_nombre    || '',
    clienteEmail:   p.cliente_email     || '',
    tel:            p.cliente_telefono  || '',
    items:          typeof p.items === 'string' ? p.items : JSON.stringify(p.items || ''),
    total:          p.total             || 0,
    estado:         p.estado            || 'pendiente',
    guia:           p.guia              || '',
    transportadora: p.transportadora    || '',
    notas:          p.notas             || '',
    fecha:          p.created_at
      ? new Date(p.created_at).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })
      : '',
  };
}

function sbToCategory(c) {
  return {
    id:     c.id,
    nombre: c.nombre || '',
    icon:   c.icon   || '🌸',
    orden:  c.orden  || 0,
    activo: c.activo !== false
  };
}

function categoryToSb(c) {
  return {
    id:     c.id,
    nombre: c.nombre || '',
    icon:   c.icon   || '🌸',
    orden:  c.orden  || 0,
    activo: c.activo !== false
  };
}

/* ════════════════════════════
   API PÚBLICA (tienda)
════════════════════════════ */
async function sbGetCategories() {
  try {
    const rows = await _get('categorias', 'activo=eq.true&order=orden.asc');
    return rows.map(sbToCategory);
  } catch { return []; }
}

async function sbGetProducts() {
  try {
    const rows = await _get('productos', 'activo=eq.true&order=id.asc');
    return rows.map(sbToProduct);
  } catch { return null; }
}

async function sbGetConfig() {
  try {
    const rows = await _get('config', 'select=clave,valor');
    return sbToConfig(rows);
  } catch { return null; }
}

async function sbGetBanners() {
  try {
    const rows = await _get('banners', 'order=orden.asc');
    return rows.map(sbToBanner);
  } catch { return null; }
}

async function sbCheckCupon(codigo) {
  try {
    const rows = await _get('cupones', `codigo=eq.${encodeURIComponent(codigo)}&activo=eq.true`);
    return rows[0] || null;
  } catch { return null; }
}

async function sbInsertPedido(data) {
  try {
    return await _post('pedidos', data);
  } catch { return null; }
}

async function sbUpsertCarrito(sessionId, items, total, estado = 'activo') {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/carritos?on_conflict=session_id`, {
      method: 'POST',
      headers: {
        ..._h(false),
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        session_id: sessionId,
        items,
        total,
        estado
      })
    });
    return res.ok;
  } catch { return false; }
}

async function sbTrackCartEvent(sessionId, eventName, data = {}) {
  try {
    const payload = {
      session_id: sessionId,
      event: eventName,
      ...data
    };
    await _post('cart_events', payload, false, 'return=minimal');
  } catch { /* ignore errors in tracking */ }
}

/* ════════════════════════════
   API ADMIN (requiere auth)
════════════════════════════ */
async function sbAdminGetCategories() {
  const rows = await _get('categorias', 'order=orden.asc', true);
  return rows.map(sbToCategory);
}

async function sbAdminSaveCategory(c, isNew) {
  const data = categoryToSb(c);
  if (isNew) {
    return await _post('categorias', data, true);
  } else {
    // Para categorías usamos id (slug) como identificador único en el filtro
    return await _patch('categorias', `id=eq.${c.id}`, data, true);
  }
}

async function sbAdminDeleteCategory(id) {
  return await _del('categorias', `id=eq.${id}`, true);
}

async function sbAdminGetProducts() {

  const rows = await _get('productos', 'order=id.asc', true);
  return rows.map(sbToProduct);
}

async function sbAdminGetPedidos() {
  const rows = await _get('pedidos', 'order=created_at.desc', true);
  return rows.map(sbToPedido);
}

async function sbAdminSaveProduct(p) {
  const data = productToSb(p);

  if (p.id && !p._isNew) {
    // ── Producto existente → PATCH por id ──────────────────────────
    const result = await _patch('productos', `id=eq.${p.id}`, data, true);
    return result && result[0] ? sbToProduct(result[0]) : null;

  } else if (p.id && p._isNew) {
    // ── Tiene id pero es "nuevo" (migración desde datos.js) → UPSERT
    // Usamos resolution=merge-duplicates para no lanzar 409 si ya existe
    const result = await _post(
      'productos?on_conflict=id',
      { id: p.id, ...data },
      true,
      'resolution=merge-duplicates,return=representation'
    );
    return result && result[0] ? sbToProduct(result[0]) : null;

  } else {
    // ── Producto nuevo sin id → INSERT normal ──────────────────────
    const result = await _post('productos', data, true, 'return=representation');
    return result && result[0] ? sbToProduct(result[0]) : null;
  }
}

async function sbAdminDeleteProduct(id) {
  return _del('productos', `id=eq.${id}`, true);
}

async function sbAdminSaveConfig(cfg) {
  const updates = [
    { clave: 'descuento_activo',     valor: String(!!cfg.descuentoActivo) },
    { clave: 'descuento_codigo',     valor: cfg.descuentoCodigo    || 'NUDITOS10' },
    { clave: 'descuento_porcentaje', valor: String(cfg.descuentoPorcentaje || 10) },
    { clave: 'descuento_texto',      valor: cfg.descuentoTexto     || '' },
    { clave: 'carrusel_hero',        valor: JSON.stringify(cfg.carruselHero  || []) },
    { clave: 'ramo_destacado',       valor: String(cfg.ramoDestacado || 0) },
    { clave: 'wompi_activo',         valor: String(!!cfg.wompiActivo) },
    { clave: 'wompi_key',            valor: cfg.wompiKey            || '' },
    { clave: 'cat_views',            valor: JSON.stringify(cfg.catViews || {}) },
    { clave: 'meta_pixel_activo',    valor: String(!!cfg.metaPixelActivo) },
    { clave: 'meta_pixel_id',        valor: cfg.metaPixelId || '' },
    { clave: 'seo_title',           valor: cfg.seoTitle || '' },
    { clave: 'seo_description',     valor: cfg.seoDescription || '' },
    { clave: 'seo_og_image',        valor: cfg.seoOgImage || '' },
    { clave: 'social_instagram',    valor: cfg.socialInstagram || '' },
    { clave: 'social_whatsapp',     valor: cfg.socialWhatsapp || '' },
    { clave: 'ga_id',               valor: cfg.gaId || '' },
    { clave: 'ga_active',           valor: String(!!cfg.gaActive) },
  ];
  return _post('config?on_conflict=clave', updates, true, 'resolution=merge-duplicates');
}

/* ── BLOG ── */
async function sbAdminGetPosts() {
  try {
    return await _get('posts', 'order=created_at.desc', true);
  } catch(e) { 
    console.error('Error al cargar posts:', e);
    return []; 
  }
}

async function sbAdminSavePost(data, isNew) {
  if (isNew) {
    return await _post('posts', data, true);
  } else {
    return await _patch('posts', `id=eq.${data.id}`, data, true);
  }
}

async function sbAdminDeletePost(id) {
  return await _del('posts', `id=eq.${id}`, true);
}

async function sbAdminSaveBanners(banners) {
  try { await _del('banners', 'id=gt.0', true); } catch {}
  if (!banners.length) return true;
  const data = banners.map((b, i) => ({
    after_cat: b.afterCat || '',
    emoji:     b.emoji    || '🌸',
    title:     b.title    || '',
    img_url:   b.imgUrl   || '',
    subtitle:  b.subtitle || '',
    cta_text:  b.ctaText  || '',
    cta_url:   b.ctaUrl   || '',
    orden:     i + 1,
  }));
  return _post('banners', data, true, 'return=minimal');
}

async function sbAdminUpsertProducts(products) {
  const existing = products.filter(p => p.id && !p._isNew);
  if (!existing.length) return true;
  // Guardar uno por uno con PATCH para evitar conflictos
  for (const p of existing) {
    try {
      await _patch('productos', `id=eq.${p.id}`, productToSb(p), true);
    } catch(e) {
      console.warn('Error guardando producto', p.id, e);
    }
  }
  return true;
}

async function sbAdminSavePedido(data) {
  const sbData = {
    cliente_nombre:    data.cliente        || '',
    cliente_email:     data.clienteEmail   || '',
    cliente_telefono:  data.tel            || '',
    items:             data.items          || '',
    total:             data.total          || 0,
    estado:            data.estado         || 'pendiente',
    notas:             data.notas          || '',
    guia:              data.guia           || '',
    transportadora:    data.transportadora || '',
  };
  if (data.id && !data._isNew) {
    const r = await _patch('pedidos', `id=eq.${data.id}`, sbData, true);
    return r && r[0] ? sbToPedido(r[0]) : null;
  } else {
    const r = await _post('pedidos', sbData, true);
    return r && r[0] ? sbToPedido(r[0]) : null;
  }
}

async function sbAdminUpdateEstadoPedido(id, estado, guia, transportadora) {
  const data = { estado };
  if (guia           !== undefined) data.guia           = guia;
  if (transportadora !== undefined) data.transportadora = transportadora;
  return _patch('pedidos', `id=eq.${id}`, data, true);
}

async function sbAdminDeletePedido(id) {
  return _del('pedidos', `id=eq.${id}`, true);
}
