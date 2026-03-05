/* ══════════════════════════════════════════
   NUDITOS v6 — Lógica principal
   js/app.js
   ══════════════════════════════════════════ */

const WA_NUMBER      = '573144931525';
const WOMPI_PUBLIC_KEY = 'pub_test_XXXXXXXXXXXXXXXX'; // Cambia por tu llave real de Wompi

let cart = [];
let appliedDiscount = null;
let activeFilter = null;
let modalSwiperInstance = null;
let catSwipers = {};

/* ════════════════════════════
   SUPABASE — Carga de datos
════════════════════════════ */
let _sbProducts = null;
let _sbConfig   = null;
let _sbBanners  = null;

async function loadStoreData() {
  const CACHE_KEY = 'nuditos_sb_data';
  const CACHE_TS  = 'nuditos_sb_ts';
  const TTL = 30 * 60 * 1000; // 30 minutos

  // 1. Mostrar cache inmediatamente si existe (velocidad)
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const ts     = parseInt(localStorage.getItem(CACHE_TS) || '0');
    if (cached) {
      const d = JSON.parse(cached);
      if (d.products) _sbProducts = d.products;
      if (d.config)   _sbConfig   = d.config;
      if (d.banners)  _sbBanners  = d.banners;
    }
    // 2. Si el cache es reciente (< 30 min) no hace falta recargar
    if (_sbProducts && _sbConfig && (Date.now() - ts < TTL)) return;
  } catch {}

  // 3. Actualizar desde Supabase en segundo plano (frescura)
  try {
    const [products, config, banners] = await Promise.all([
      sbGetProducts(),
      sbGetConfig(),
      sbGetBanners(),
    ]);
    if (products) _sbProducts = products;
    if (config)   _sbConfig   = config;
    if (banners)  _sbBanners  = banners;

    // Guardar cache actualizado
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      products: _sbProducts,
      config:   _sbConfig,
      banners:  _sbBanners,
    }));
    localStorage.setItem(CACHE_TS, Date.now().toString());
  } catch {
    // Supabase no disponible → usa datos.js como fallback
  }
}

// Llamar esto desde el admin después de guardar cualquier cambio
function invalidarCacheTienda() {
  try {
    localStorage.removeItem('nuditos_sb_data');
    localStorage.removeItem('nuditos_sb_ts');
  } catch {}
}

/* ════════════════════════════
   PRODUCTOS
════════════════════════════ */
function getProducts() {
  if (_sbProducts) return _sbProducts;
  // Fallback: datos.js
  return products;
}
const activeProducts = () => getProducts().filter(p => p.activo !== false);

/* ════════════════════════════
   CONFIG
════════════════════════════ */
function getConfig() {
  if (_sbConfig) return { ...CONFIG_DEFAULT, ..._sbConfig };
  return { ...CONFIG_DEFAULT };
}

/* ════════════════════════════
   BANNERS EDITORIALES
════════════════════════════ */
function getEditorialBanners() {
  if (_sbBanners) return _sbBanners;
  return [
    { afterCat: 'rosas',    emoji: '🌸', title: 'Flores que <em>jamás se marchitan</em>' },
    { afterCat: 'noche',    emoji: '🌙', title: 'Arte tejido <em>puntada a puntada</em>' },
    { afterCat: 'especial', emoji: '✨', title: 'Regalos que <em>dejan huella</em>' },
  ];
}

/* ════════════════════════════
   INIT
════════════════════════════ */
function renderSkeletons() {
  const catalog = document.getElementById('catalogRows');
  if (!catalog) return;
  const skeletonCard = `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line short"></div>
      <div class="skeleton skeleton-line price"></div>
    </div>`;
  const grid = `<div style="padding:2rem 1.2rem 0"><div style="height:12px;width:80px;background:var(--cream-dark);border-radius:4px;margin-bottom:1rem"></div><div class="products-grid">${skeletonCard.repeat(6)}</div></div>`;
  catalog.innerHTML = grid + grid;
}

document.addEventListener('DOMContentLoaded', async () => {
  AOS.init({ duration: 700, once: true, offset: 30, easing: 'ease-out-cubic' });
  renderSkeletons();
  await loadStoreData();
  const cfg = getConfig();
  renderBanner(cfg);
  renderHero(cfg);
  renderMomento(cfg);
  renderCatPills();
  renderCatalog();
  renderCart();
  initSearch();
});

/* ════════════════════════════
   BANNER
════════════════════════════ */
function renderBanner(cfg) {
  if (!cfg.descuentoActivo) return;
  document.getElementById('bannerText').innerHTML =
    `${cfg.descuentoTexto} — código <strong>${cfg.descuentoCodigo}</strong>`;
  document.getElementById('discountBanner').classList.add('visible');
}

/* ════════════════════════════
   HERO
════════════════════════════ */
function renderHero(cfg) {
  const wrap = document.getElementById('heroSlides');
  wrap.innerHTML = cfg.carruselHero.map(id => {
    const p = getProducts().find(x => x.id === id);
    if (!p) return '';
    const bg = p.img
      ? `<div class="hero-slide-bg"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>`
      : `<div class="hero-slide-bg hero-slide-emoji">${p.emoji}</div>`;
    return `
      <div class="swiper-slide hero-slide">
        ${bg}<div class="hero-overlay"></div>
        <div class="hero-label"><i class="ri-scissors-cut-line"></i> Nueva colección</div>
        <div class="hero-content">
          <div class="hero-eyebrow"><i class="ri-map-pin-line"></i> Hecho a mano · Colombia</div>
          <h1>${heroTitle(p)}</h1>
          <div class="hero-price-tag">
            ${p.price > 0 ? `$${p.price.toLocaleString('es-CO')}<span> COP</span>` : `<span>Consultar precio</span>`}
          </div>
          <div class="hero-ctas">
            ${p.price > 0
              ? `<button class="btn-hero" onclick="addToCart(${p.id});toggleCart()"><i class="ri-shopping-bag-line"></i> Agregar</button>`
              : `<a href="https://wa.me/${WA_NUMBER}?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.name)}" target="_blank" class="btn-hero"><i class="ri-whatsapp-line"></i> Consultar</a>`}
            <a href="#catalogSection" class="btn-hero-ghost"><i class="ri-grid-line"></i> Ver catálogo</a>
          </div>
        </div>
      </div>`;
  }).join('');

  new Swiper('#heroSwiper', {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    effect: 'fade', fadeEffect: { crossFade: true }, speed: 900,
  });
}

function heroTitle(p) {
  const n = p.name.toLowerCase();
  if (n.includes('grado') || n.includes('goku') || n.includes('potter') || n.includes('amigurumi'))
    return 'Un regalo que <em>jamás olvidarán</em>';
  if (n.includes('noche') || n.includes('van gogh'))
    return 'Arte tejido <em>puntada a puntada</em>';
  if (n.includes('snoopy') || n.includes('kitty') || n.includes('coraline'))
    return 'Flores con <em>personalidad propia</em>';
  return 'Ramos que <em>duran para siempre</em>';
}

/* ════════════════════════════
   RAMO DEL MOMENTO
════════════════════════════ */
function renderMomento(cfg) {
  const p = getProducts().find(x => x.id === cfg.ramoDestacado);
  if (!p) return;
  const vis = p.img ? `<img src="${p.img}" alt="${p.name}">` : `<span class="momento-emoji">${p.emoji}</span>`;
  document.getElementById('ramoMomento').innerHTML = `
    <div class="momento-img">${vis}</div>
    <div class="momento-info">
      <div class="momento-eyebrow"><i class="ri-fire-line"></i> Ramo del momento</div>
      <div class="momento-name">${p.name}</div>
      <div class="momento-desc">${p.desc}</div>
    </div>
    <div class="momento-actions">
      <div class="momento-price">
        ${p.price > 0 ? `$${p.price.toLocaleString('es-CO')}<span> COP</span>` : `Consultar`}
      </div>
      ${p.price > 0 ? `<button class="btn-momento" onclick="addToCart(${p.id})"><i class="ri-shopping-bag-line"></i> Agregar</button>` : ''}
      <a href="https://wa.me/${WA_NUMBER}?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.name)}" target="_blank" class="btn-momento-ghost">
        <i class="ri-whatsapp-line"></i> Preguntar
      </a>
    </div>`;
}

/* ════════════════════════════
   CATEGORÍAS PILLS
════════════════════════════ */
function renderCatPills() {
  const ap = activeProducts();
  document.getElementById('catRow').innerHTML = categories.map((c, i) => {
    const count = c.id === 'todos' ? ap.length : ap.filter(p => p.cat?.toLowerCase() === c.id?.toLowerCase()).length;
    if (count === 0) return '';
    return `<button class="cat-pill${i === 0 ? ' active' : ''}" onclick="filterCat('${c.id}',this)">
      ${c.icon} ${c.name}<span class="cat-count">${count}</span>
    </button>`;
  }).join('');
}

/* ════════════════════════════
   VISTA POR CATEGORÍA
════════════════════════════ */
function getCatView(catId) {
  try {
    const cfg = getConfig();
    if (cfg.catViews && cfg.catViews[catId]) return cfg.catViews[catId];
  } catch {}
  return 'carousel';
}

/* ════════════════════════════
   RENDER CATÁLOGO
════════════════════════════ */
function renderCatalog() {
  document.getElementById('catalogRows').style.display = 'block';
  document.getElementById('filteredView').style.display = 'none';
  Object.values(catSwipers).forEach(s => { try { s.destroy(true, true); } catch {} });
  catSwipers = {};

  const container = document.getElementById('catalogRows');
  container.innerHTML = '';

  categories.filter(c => c.id !== 'todos').forEach(cat => {
    const items = activeProducts().filter(p => p.cat?.toLowerCase() === cat.id?.toLowerCase());
    if (!items.length) return;
    const view = getCatView(cat.id);

    const section = document.createElement('div');
    section.className = 'cat-section';
    section.innerHTML = `
      <div class="cat-section-header">
        <span class="cat-section-title">${cat.icon} ${cat.name}</span>
        <a href="#" class="cat-ver-todo" onclick="filterCatByName('${cat.id}');return false;">
          Ver todo <i class="ri-arrow-right-line"></i>
        </a>
      </div>
      ${buildCatContent(items, cat.id, view)}`;
    container.appendChild(section);

    if (view === 'carousel') initCatSwiper(cat.id);

    const banners = getEditorialBanners().filter(b => b.afterCat === cat.id);
    banners.forEach(banner => {
      const b = document.createElement('div');
      b.className = 'editorial-banner';
      if (banner.imgUrl) {
        b.style.backgroundImage = `url(${banner.imgUrl})`;
        b.style.backgroundSize = 'cover';
        b.style.backgroundPosition = 'center';
      }
      b.innerHTML = `
        ${!banner.imgUrl ? `<div class="editorial-banner-bg">${banner.emoji||'🌸'}</div>` : ''}
        <div class="editorial-banner-overlay">
          <div class="editorial-banner-title">${banner.title||''}</div>
        </div>`;
      container.appendChild(b);
    });
  });
}

function buildCatContent(items, catId, view) {
  if (view === 'list')
    return `<div class="products-list">${items.map(p => buildListItem(p)).join('')}</div>`;
  if (view === 'grid')
    return `<div class="products-grid">${items.map(p => buildCard(p)).join('')}</div>`;
  return `
    <div class="swiper cat-swiper" id="catSwiper-${catId}">
      <div class="swiper-wrapper">
        ${items.map(p => `<div class="swiper-slide cat-slide">${buildCard(p)}</div>`).join('')}
      </div>
      <div class="swiper-pagination cat-pagination" id="catPag-${catId}"></div>
    </div>`;
}

function initCatSwiper(catId) {
  setTimeout(() => {
    catSwipers[catId] = new Swiper(`#catSwiper-${catId}`, {
      slidesPerView: 1.4,
      spaceBetween: 14,
      grabCursor: true,
      freeMode: { enabled: true, momentum: true, momentumRatio: 0.5 },
      touchStartPreventDefault: false,
      touchMoveStopPropagation: false,
      passiveListeners: true,
      threshold: 8,
      touchAngle: 45,
      resistance: true,
      resistanceRatio: 0,
      pagination: { el: `#catPag-${catId}`, clickable: true, dynamicBullets: true },
      breakpoints: {
        480:  { slidesPerView: 2.2, spaceBetween: 16 },
        768:  { slidesPerView: 3.2, spaceBetween: 20 },
        1024: { slidesPerView: 4.2, spaceBetween: 22 },
        1280: { slidesPerView: 5,   spaceBetween: 24, freeMode: { enabled: false } },
      },
    });
  }, 60);
}

/* ════════════════════════════
   BUILD CARD
════════════════════════════ */
function badgeIcon(badge) {
  if (badge === 'Nuevo')    return '<i class="ri-sparkling-line"></i>';
  if (badge === 'Popular')  return '<i class="ri-fire-line"></i>';
  if (badge === 'Especial') return '<i class="ri-award-line"></i>';
  return '';
}

function buildCard(p) {
  const imgContent = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
    : `<span class="card-emoji">${p.emoji}</span>`;
  const badgeHtml = p.badge
    ? `<div class="p-badge ${p.badgeClass || ''} ${p.badge === 'Nuevo' ? 'badge-pulse' : ''}">${badgeIcon(p.badge)} ${p.badge}</div>`
    : (p.oferta ? `<div class="p-badge p-badge-oferta"><i class="ri-price-tag-3-fill"></i> Oferta</div>` : '');
  const envioTag = p.envioGratis ? `<div class="p-envio-gratis"><i class="ri-truck-line"></i> Envío gratis</div>` : '';
  let priceHtml;
  if (p.price > 0) {
    if (p.oferta && p.precioOriginal > 0) {
      priceHtml = `<span class="p-price-original">$${p.precioOriginal.toLocaleString('es-CO')}</span> $${p.price.toLocaleString('es-CO')}<small> COP</small>`;
    } else {
      priceHtml = `$${p.price.toLocaleString('es-CO')}<small> COP</small>`;
    }
  } else {
    priceHtml = `<span class="price-consultar"><i class="ri-whatsapp-line"></i> Consultar</span>`;
  }
  const cat = categories.find(c => c.id === p.cat);
  const addBtn = p.price > 0
    ? `<button class="p-add-btn" id="padd-${p.id}" onclick="event.stopPropagation();addToCart(${p.id})"><i class="ri-shopping-bag-line"></i></button>`
    : `<a class="p-add-btn p-wa-btn" href="https://wa.me/${WA_NUMBER}?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.name)}" target="_blank" onclick="event.stopPropagation()"><i class="ri-whatsapp-line"></i></a>`;

  return `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img-wrap">
        ${badgeHtml}${imgContent}
        <div class="card-overlay">
          <button class="card-overlay-btn" onclick="event.stopPropagation();openModal(${p.id})">
            <i class="ri-eye-line"></i> Ver detalle
          </button>
        </div>
        ${addBtn}
      </div>
      <div class="p-info">
        <div class="p-category"><i class="ri-price-tag-3-line"></i> ${cat ? cat.name : ''}</div>
        <div class="p-name">${p.name}</div>
        <div class="p-price">${priceHtml}</div>
        ${envioTag}
      </div>
    </div>`;
}

/* ════════════════════════════
   BUILD LIST ITEM
════════════════════════════ */
function buildListItem(p) {
  const thumb = p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : `<span>${p.emoji}</span>`;
  const price = p.price > 0 ? `$${p.price.toLocaleString('es-CO')} COP` : 'Consultar';
  return `
    <div class="product-list-item" onclick="openModal(${p.id})">
      <div class="list-item-img">${thumb}</div>
      <div class="list-item-info">
        <div class="list-item-name">${p.name}</div>
        <div class="list-item-desc">${p.desc}</div>
        <div class="list-item-price">${price}</div>
      </div>
      <div class="list-item-actions">
        ${p.price > 0
          ? `<button class="p-add-btn" id="padd-${p.id}" onclick="event.stopPropagation();addToCart(${p.id})"><i class="ri-shopping-bag-line"></i></button>`
          : `<a class="p-add-btn p-wa-btn" href="https://wa.me/${WA_NUMBER}?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.name)}" target="_blank" onclick="event.stopPropagation()"><i class="ri-whatsapp-line"></i></a>`}
        <i class="ri-arrow-right-s-line list-arrow"></i>
      </div>
    </div>`;
}

/* ════════════════════════════
   FILTROS
════════════════════════════ */
function filterCat(catId, el) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  if (catId === 'todos') { clearFilter(); return; }
  filterCatByName(catId);
}

function filterCatByName(catId) {
  const cat = categories.find(c => c.id === catId);
  const items = activeProducts().filter(p => p.cat?.toLowerCase() === catId?.toLowerCase());
  const view = getCatView(catId);
  document.getElementById('catalogRows').style.display = 'none';
  document.getElementById('filteredView').style.display = 'block';
  document.getElementById('filteredTitle').innerHTML = `${cat.icon} ${cat.name}`;
  const grid = document.getElementById('filteredGrid');
  grid.className = view === 'list' ? 'filtered-list' : 'filtered-grid';
  grid.innerHTML = view === 'list'
    ? items.map(p => buildListItem(p)).join('')
    : items.map(p => buildCard(p)).join('');
  document.getElementById('filteredView').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearFilter() {
  activeFilter = null;
  document.querySelectorAll('.cat-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
  renderCatalog();
}

/* ════════════════════════════
   BÚSQUEDA
════════════════════════════ */
function initSearch() {
  const overlay = document.createElement('div');
  overlay.id = 'searchOverlay';
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-box">
      <div class="search-input-wrap">
        <i class="ri-search-line"></i>
        <input type="text" id="searchInput" placeholder="Buscar ramos, amigurumis..." autocomplete="off">
        <button onclick="closeSearch()"><i class="ri-close-line"></i></button>
      </div>
      <div class="search-results" id="searchResults"></div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.body.appendChild(overlay);
  document.getElementById('searchInput').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    if (q.length < 2) { document.getElementById('searchResults').innerHTML = ''; return; }
    const found = activeProducts().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      (categories.find(c => c.id === p.cat)?.name.toLowerCase().includes(q))
    );
    renderSearchResults(found, q);
  });
}

function renderSearchResults(items, q) {
  const el = document.getElementById('searchResults');
  if (!items.length) {
    el.innerHTML = `<div class="search-empty"><i class="ri-search-eye-line"></i><p>No encontramos "${q}"</p><small>Escríbenos por WhatsApp 🌸</small></div>`;
    return;
  }
  el.innerHTML = items.map(p => {
    const thumb = p.img ? `<img src="${p.img}" alt="${p.name}">` : `<span>${p.emoji}</span>`;
    return `
      <div class="search-item" onclick="closeSearch();openModal(${p.id})">
        <div class="search-item-img">${thumb}</div>
        <div class="search-item-info">
          <div class="search-item-name">${p.name}</div>
          <div class="search-item-price">${p.price > 0 ? `$${p.price.toLocaleString('es-CO')} COP` : 'Consultar'}</div>
        </div>
        <i class="ri-arrow-right-s-line"></i>
      </div>`;
  }).join('');
}

function toggleSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchInput').focus(), 100);
}
function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  document.body.style.overflow = '';
}

/* ════════════════════════════
   MODAL
════════════════════════════ */
function openModal(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  const cat = categories.find(c => c.id === p.cat);
  const allImgs = p.imgs && p.imgs.length ? p.imgs : (p.img ? [p.img] : []);
  const slides = allImgs.length
    ? allImgs.map(src => `<div class="swiper-slide modal-slide"><img src="${src}" alt="${p.name}"></div>`).join('')
    : `<div class="swiper-slide modal-slide modal-slide-emoji">${p.emoji}</div>`;

  document.getElementById('modalBody').innerHTML = `
    <div class="swiper modal-swiper" id="modalSwiper">
      <div class="swiper-wrapper">${slides}</div>
      ${allImgs.length > 1 ? '<div class="swiper-pagination"></div>' : ''}
    </div>
    <div class="modal-info">
      <div class="modal-top-row">
        <div class="modal-category"><i class="ri-price-tag-3-line"></i> ${cat ? cat.name : ''}</div>
        ${p.badge ? `<div class="p-badge ${p.badgeClass||''}">${badgeIcon(p.badge)} ${p.badge}</div>` : ''}
      </div>
      <div class="modal-name">${p.name}</div>
      <div class="modal-desc"><i class="ri-information-line"></i> ${p.desc}</div>
      ${p.price > 0
        ? `<div class="modal-price"><i class="ri-price-tag-3-line"></i> $${p.price.toLocaleString('es-CO')}<span> COP</span></div>`
        : `<div class="modal-price modal-price-consultar"><i class="ri-whatsapp-line"></i> Consultar precio</div>`}
    </div>
    <div class="modal-actions">
      ${p.price > 0 ? `<button class="btn-add-cart" id="modalAddBtn" onclick="addToCart(${p.id});updateModalBtn(${p.id})"><i class="ri-shopping-bag-line"></i> Agregar al carrito</button>` : ''}
      <a href="https://wa.me/${WA_NUMBER}?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.name)}" target="_blank" class="btn-wa-modal">
        <i class="ri-whatsapp-line"></i> Preguntar por WhatsApp
      </a>
    </div>`;

  if (modalSwiperInstance) { try { modalSwiperInstance.destroy(true, true); } catch {} }
  setTimeout(() => {
    if (allImgs.length > 1) {
      modalSwiperInstance = new Swiper('#modalSwiper', {
        pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
        grabCursor: true,
      });
    }
    // Zoom en fotos al tocar/click
    document.querySelectorAll('.modal-slide img').forEach(img => {
      let zoomed = false;
      let startX, startY, lastX, lastY;
      img.addEventListener('click', (e) => {
        if (zoomed) {
          img.style.transform = 'scale(1)';
          img.style.cursor = 'zoom-in';
          img.style.objectPosition = 'center';
          zoomed = false;
        } else {
          const rect = img.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          img.style.transformOrigin = `${x}% ${y}%`;
          img.style.transform = 'scale(2.5)';
          img.style.cursor = 'zoom-out';
          zoomed = true;
        }
      });
      // Touch zoom
      img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      }, { passive: true });
    });
  }, 80);
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalBtn(id) {
  const btn = document.getElementById('modalAddBtn');
  if (!btn) return;
  btn.innerHTML = '<i class="ri-check-line"></i> ¡Agregado!';
  btn.classList.add('added');
  setTimeout(() => { btn.innerHTML = '<i class="ri-shopping-bag-line"></i> Agregar al carrito'; btn.classList.remove('added'); }, 1800);
}

/* ════════════════════════════
   CARRITO
════════════════════════════ */
function addToCart(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p || p.price === 0) return;
  const ex = cart.find(x => x.id === id);
  if (ex) ex.qty++;
  else cart.push({ ...p, qty: 1 });
  renderCart();
  updateCartBadge();
  document.querySelectorAll(`#padd-${id}`).forEach(btn => {
    btn.classList.add('added');
    btn.innerHTML = '<i class="ri-check-line"></i>';
    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = '<i class="ri-shopping-bag-line"></i>'; }, 1300);
  });
  const badge = document.getElementById('cartCount');
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 350);
  showToast(`<i class="ri-check-line"></i> ${p.name} agregado`);
}

function changeQty(id, d) {
  const i = cart.findIndex(x => x.id === id);
  if (i === -1) return;
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartCount');
  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

function renderCart() {
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty"><span class="cart-empty-icon">🌸</span><p>Tu bolsa está vacía</p><small>Agrega tus ramos favoritos</small></div>`;
    foot.style.display = 'none';
    return;
  }
  foot.style.display = 'block';
  body.innerHTML = cart.map(item => {
    const thumb = item.img ? `<img src="${item.img}" alt="${item.name}">` : item.emoji;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${thumb}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CO')} COP</div>
        </div>
        <div class="qty-wrap">
          <button class="qty-btn" onclick="changeQty(${item.id},-1)"><i class="ri-subtract-line"></i></button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)"><i class="ri-add-line"></i></button>
        </div>
      </div>`;
  }).join('');
  updateTotals();
}

function updateTotals() {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let total = sub;
  const ds = document.getElementById('discSaved');
  const da = document.getElementById('discAmount');
  if (appliedDiscount) {
    const sav = Math.round(sub * appliedDiscount.pct / 100);
    total = sub - sav;
    ds.style.display = 'flex';
    da.textContent = `-$${sav.toLocaleString('es-CO')} COP`;
  } else { ds.style.display = 'none'; }
  document.getElementById('cartTotal').textContent = `$${total.toLocaleString('es-CO')} COP`;
}

async function applyDiscount() {
  const code = document.getElementById('discountInput').value.trim().toUpperCase();
  const msg  = document.getElementById('discountMsg');
  const cfg  = getConfig();

  // Primero verificar en config local
  if (cfg.descuentoActivo && code === cfg.descuentoCodigo.toUpperCase()) {
    appliedDiscount = { code, pct: cfg.descuentoPorcentaje };
    msg.textContent = `✓ ${cfg.descuentoPorcentaje}% de descuento aplicado`;
    msg.className = 'discount-msg ok';
    updateTotals();
    showToast(`🎉 ${cfg.descuentoPorcentaje}% de descuento!`);
    return;
  }

  // Verificar en Supabase (cupones de tabla)
  msg.textContent = 'Verificando...';
  msg.className = 'discount-msg';
  const cupon = await sbCheckCupon(code);
  if (cupon) {
    appliedDiscount = { code, pct: cupon.porcentaje };
    msg.textContent = `✓ ${cupon.porcentaje}% de descuento aplicado`;
    msg.className = 'discount-msg ok';
    updateTotals();
    showToast(`🎉 ${cupon.porcentaje}% de descuento!`);
  } else {
    appliedDiscount = null;
    msg.textContent = 'Código incorrecto o no disponible.';
    msg.className = 'discount-msg err';
    updateTotals();
  }
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartPanel').classList.toggle('open');
  const isOpen = document.getElementById('cartPanel').classList.contains('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function checkoutWA() {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let total = sub, discMsg = '';
  const items = cart.map(i => `${i.qty}x ${i.name} ($${(i.price * i.qty).toLocaleString('es-CO')})`).join('\n');
  if (appliedDiscount) {
    const sav = Math.round(sub * appliedDiscount.pct / 100);
    total = sub - sav;
    discMsg = `\nDescuento (${appliedDiscount.pct}%): -$${sav.toLocaleString('es-CO')}`;
  }
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola Nuditos! 🌸\nQuiero pedir:\n\n${items}${discMsg}\n\nTotal: $${total.toLocaleString('es-CO')} COP`)}`, '_blank');
}

function checkoutWompi() {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let total = sub;
  if (appliedDiscount) total = sub - Math.round(sub * appliedDiscount.pct / 100);
  if (total === 0) { showToast('Agrega productos para pagar'); return; }
  const cfg = getConfig();
  const key = (cfg.wompiKey && cfg.wompiKey.length > 10) ? cfg.wompiKey : WOMPI_PUBLIC_KEY;
  window.open(`https://checkout.wompi.co/l/?public-key=${key}&currency=COP&amount-in-cents=${total * 100}&reference=NUDITOS-${Date.now()}`, '_blank');
}

/* ════════════════════════════
   MENÚ / FOOTER / TOAST / ESC
════════════════════════════ */
function toggleMenu() {
  document.getElementById('menuOverlay').classList.toggle('open');
  document.getElementById('menuPanel').classList.toggle('open');
  const isOpen = document.getElementById('menuPanel').classList.contains('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function toggleAcc(btn) {
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.footer-acc-btn').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
  if (!isOpen) { btn.classList.add('open'); btn.nextElementSibling.classList.add('open'); }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal(); closeSearch();
    if (document.getElementById('cartPanel').classList.contains('open')) toggleCart();
    if (document.getElementById('menuPanel').classList.contains('open')) toggleMenu();
  }
});
