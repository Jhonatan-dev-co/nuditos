/* ══════════════════════════════════════════
   NUDITOS v6 — Lógica principal
   js/app.js
   ══════════════════════════════════════════ */

const WA_NUMBER      = '573144931525';
const WOMPI_PUBLIC_KEY = 'pub_test_XXXXXXXXXXXXXXXX';

// let cart = []; // Ahora en Nanostores
// let appliedDiscount = null; // Ahora en Nanostores
let activeFilter = null;
let modalSwiperInstance = null;
let catSwipers = {};

/* ════════════════════════════
   SLUG
════════════════════════════ */
function slugify(text) {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

/* ════════════════════════════
   SUPABASE — Carga de datos
════════════════════════════ */
let _sbProducts = null;
let _sbConfig   = null;
let _sbBanners  = null;
let _sbCategories = null;


async function loadStoreData() {
  const CACHE_KEY = 'nuditos_sb_data';
  const CACHE_TS  = 'nuditos_sb_ts';
  const TTL = 30 * 60 * 1000;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const ts     = parseInt(localStorage.getItem(CACHE_TS) || '0');
    if (cached) {
      const d = JSON.parse(cached);
      if (d.products)   _sbProducts = d.products;
      if (d.config)     _sbConfig   = d.config;
      if (d.banners)    _sbBanners  = d.banners;
      if (d.categories) _sbCategories = d.categories;
    }

    if (_sbProducts && _sbConfig && (Date.now() - ts < TTL)) return;
  } catch {}

  try {
    const [products, config, banners, categoriesSB] = await Promise.all([
      sbGetProducts(),
      sbGetConfig(),
      sbGetBanners(),
      sbGetCategories(),
    ]);
    if (products)     _sbProducts = products;
    if (config)       _sbConfig   = config;
    if (banners)      _sbBanners  = banners;
    if (categoriesSB) _sbCategories = categoriesSB;

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      products:   _sbProducts,
      config:     _sbConfig,
      banners:    _sbBanners,
      categories: _sbCategories,
    }));

    localStorage.setItem(CACHE_TS, Date.now().toString());
  } catch {}
}

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
/* ════════════════════════════
   CATEGORÍAS
════════════════════════════ */
function getCategories() {
  if (window.NUDITOS_CATEGORIES) return window.NUDITOS_CATEGORIES;
  if (_sbCategories) return _sbCategories;
  return categories;
}

function renderSkeletons(targetId = 'catalogRows') {
  const target = document.getElementById(targetId);
  if (!target) return;
  const skeletonCard = `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line short"></div>
      <div class="skeleton skeleton-line price"></div>
    </div>`;
  target.innerHTML = `<div class="products-grid">${skeletonCard.repeat(4)}</div>`;
}


/* ════════════════════════════
   SCROLL AL CATÁLOGO
════════════════════════════ */
function scrollToCatalog() {
  // Intenta el id "catalogSection", si no existe busca el primer cat-section
  const target =
    document.getElementById('catalogSection') ||
    document.querySelector('.cat-sticky') ||
    document.getElementById('catalogRows');
  if (!target) return;
  const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 60;
  const pillsH = document.querySelector('.cat-sticky')?.offsetHeight || 52;
  const offset = navH + pillsH;
  const top    = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.addEventListener('astro:page-load', async () => {
  if (typeof AOS !== 'undefined') AOS.init({ duration: 700, once: true, offset: 30, easing: 'ease-out-cubic' });
  // renderSkeletons(); // Ya no es necesario con el render estático
  await loadStoreData();
  const cfg = getConfig();
  renderBanner(cfg);
  // renderHero(cfg); // Ahora renderizado estáticamente por Astro
  // renderMomento(cfg); // Ahora renderizado estáticamente por Astro
  loadMetaPixel(cfg);
  renderCatPills();
  // renderCatalog(); // Ahora renderizado estáticamente por Astro
  // renderCart(); // Ahora en Nanostores (cart-ui.ts)
  // initSearch(); // Eliminado: ahora manejado por SearchOverlay.astro y search-ui.ts

  // Burbuja de WhatsApp después de 5s
  setTimeout(() => {
    const bub = document.getElementById('waBubble');
    if (bub) bub.classList.add('show');
  }, 5000);
});


/* ════════════════════════════
   META PIXEL
════════════════════════════ */
function loadMetaPixel(cfg) {
  if (!cfg || !cfg.metaPixelActivo || !cfg.metaPixelId) return;
  if (window.fbq) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
  n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
  t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', cfg.metaPixelId);
  fbq('track', 'PageView');
}

/* ════════════════════════════
   BANNER
════════════════════════════ */
function renderBanner(cfg) {
  if (!cfg.descuentoActivo) return;
  const bannerText = document.getElementById('bannerText');
  const discountBanner = document.getElementById('discountBanner');
  if (!bannerText || !discountBanner) return;
  
  bannerText.innerHTML = `${cfg.descuentoTexto} — código <strong>${cfg.descuentoCodigo}</strong>`;
  discountBanner.classList.add('visible');
}


/* ════════════════════════════
   HERO
════════════════════════════ */
function renderHero(cfg) {
  const wrap = document.getElementById('heroSlides');
  if (!wrap) return;

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
            <a href="/ramo/${slugify(p.name)}" class="btn-hero"><i class="ri-eye-line"></i> Ver producto</a>
            <a href="/catalogo" class="btn-hero-ghost"><i class="ri-grid-line"></i> Ver catálogo</a>
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
    preventClicks: false,
    preventClicksPropagation: false,
    touchStartPreventDefault: false,
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
  const target = document.getElementById('ramoMomento');
  if (!p || !target) return;
  const vis = p.img ? `<img src="${p.img}" alt="${p.name}">` : `<span class="momento-emoji">${p.emoji}</span>`;
  target.innerHTML = `

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
      <a href="/ramo/${slugify(p.name)}" class="btn-momento-ghost">
        <i class="ri-eye-line"></i> Ver detalle
      </a>
    </div>`;
}

/* ════════════════════════════
   CATEGORÍAS PILLS
════════════════════════════ */
function renderCatPills() {
  const ap = activeProducts();
  const catRow = document.getElementById('catRow');
  if (!catRow) return;

  let cats = getCategories();
  if (!cats.find(c => c.id === 'todos')) {
    cats = [{ id: 'todos', name: 'Todos', icon: '🌸' }, ...cats];
  }

  catRow.innerHTML = cats.map((c, i) => {
    const count = c.id === 'todos' ? ap.length : ap.filter(p => p.cat?.toLowerCase() === c.id?.toLowerCase()).length;
    if (count === 0 && c.id !== 'todos') return '';
    const icon = c.icon || '🌸';
    const name = c.nombre || c.name || 'Sin nombre';
    return `<button class="cat-pill${(activeFilter||'todos') === c.id ? ' active' : ''}" onclick="filterCat('${c.id}',this)">
      ${icon} ${name}<span class="cat-count">${count}</span>
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
  const rows = document.getElementById('catalogRows');
  const filtered = document.getElementById('filteredView');
  if (!rows || !filtered) return;

  rows.style.display = 'block';
  filtered.style.display = 'none';

  Object.values(catSwipers).forEach(s => { try { s.destroy(true, true); } catch {} });
  catSwipers = {};

  const container = document.getElementById('catalogRows');
  container.innerHTML = '';

  getCategories().filter(c => c.id !== 'todos').forEach(cat => {
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
    <div class="swiper cat-swiper hide-mobile" id="catSwiper-${catId}">
      <div class="swiper-wrapper">
        ${items.map(p => `<div class="swiper-slide cat-slide">${buildCard(p)}</div>`).join('')}
      </div>
      <div class="swiper-pagination cat-pagination" id="catPag-${catId}"></div>
    </div>
    <div class="products-grid show-mobile">
      ${items.map(p => buildCard(p)).join('')}
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
   BUILD CARD — con link a página de producto
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
    
  const productSlug = slugify(p.name);
  const cat = getCategories().find(c => c.id === p.cat);
  
  const addBtn = p.price > 0
    ? `<button class="p-add-btn" id="padd-${p.id}" onclick="event.preventDefault();event.stopPropagation();addToCart(${p.id})" aria-label="Agregar al carrito"><i class="ri-shopping-bag-3-line"></i></button>`
    : `<a class="p-add-btn p-wa-btn" href="https://wa.me/${WA_NUMBER}?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.name)}" target="_blank" onclick="event.stopPropagation()" aria-label="Consultar por WhatsApp"><i class="ri-whatsapp-line"></i></a>`;

  let priceHtml;
  if (p.price > 0) {
    if (p.oferta && p.precioOriginal > 0) {
      priceHtml = `<span class="p-price-original">$${p.precioOriginal.toLocaleString('es-CO')}</span> $${p.price.toLocaleString('es-CO')}`;
    } else {
      priceHtml = `$${p.price.toLocaleString('es-CO')}`;
    }
  } else {
    priceHtml = `<span class="price-consultar">Consultar</span>`;
  }

  return `
    <a class="product-card" href="/ramo/${productSlug}" style="text-decoration:none;color:inherit;display:block">
      <div class="product-img-wrap">
        ${badgeHtml}${imgContent}
        <div class="card-overlay">
          <span class="card-overlay-btn"><i class="ri-eye-line"></i> Ver detalle</span>
        </div>
        ${addBtn}
      </div>
      <div class="p-info">
        <div class="p-category"><i class="ri-price-tag-3-line"></i> ${cat ? (cat.nombre || cat.name) : ''}</div>
        <div class="p-name">${p.name}</div>
        <div class="p-price-row">
          <div class="p-price">${priceHtml}</div>
          ${p.envioGratis ? `<div class="p-envio-gratis-icon" title="Envío gratis"><i class="ri-truck-line"></i></div>` : ''}
        </div>
      </div>
    </a>`;
}

/* ════════════════════════════
   BUILD LIST ITEM — con link
════════════════════════════ */
function buildListItem(p) {
  const thumb = p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : `<span>${p.emoji}</span>`;
  const price = p.price > 0 ? `$${p.price.toLocaleString('es-CO')}` : 'Consultar';
  return `
    <a class="product-list-item" href="/ramo/${slugify(p.name)}" style="text-decoration:none;color:inherit;display:flex">
      <div class="list-item-img">${thumb}</div>
      <div class="list-item-info">
        <div class="list-item-name">${p.name}</div>
        <div class="list-item-desc">${p.desc}</div>
        <div class="list-item-price">${price}</div>
      </div>
      <div class="list-item-actions">
        ${p.price > 0
          ? `<button class="p-add-btn" id="padd-${p.id}" onclick="event.preventDefault();event.stopPropagation();addToCart(${p.id})" aria-label="Agregar al carrito"><i class="ri-shopping-bag-3-line"></i></button>`
          : `<a class="p-add-btn p-wa-btn" href="https://wa.me/${WA_NUMBER}?text=Hola!%20Me%20interesa%20${encodeURIComponent(p.name)}" target="_blank" onclick="event.stopPropagation()" aria-label="Consultar por WhatsApp"><i class="ri-whatsapp-line"></i></a>`}
        <i class="ri-arrow-right-s-line list-arrow"></i>
      </div>
    </a>`;
}

/* ════════════════════════════
   FILTROS
════════════════════════════ */
function filterCat(catId, el) {
  // Deseleccionar si se vuelve a hacer clic en la misma categoría activa
  if (el && el.classList.contains('active') && catId !== 'todos') {
    clearFilter();
    return;
  }

  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  if (el) {
    el.classList.add('active');
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  if (catId === 'todos') { clearFilter(); return; }
  filterCatByName(catId);
  scrollToCatalog(); // Asegurar que el usuario vea los resultados
}

function filterCatByName(catId) {
  const rows = document.getElementById('catalogRows');
  const filtered = document.getElementById('filteredView');
  const grid = document.getElementById('filteredGrid');
  if (!filtered || !grid) return;

  activeFilter = catId;
  const cats = getCategories();
  const c = cats.find(x => x.id === catId);
  if (!c) { clearFilter(); return; }

  // UI
  if (rows) rows.style.display = 'none';
  filtered.style.display = 'block';
  document.getElementById('filteredTitle').innerText = c.nombre || c.name;
  
  // Skeletons antes de mostrar
  renderSkeletons('filteredGrid');
  filtered.scrollIntoView({ behavior: 'smooth', block: 'start' });

  setTimeout(() => {
    const ap = activeProducts();
    const items = catId === 'todos' ? ap : ap.filter(p => p.cat?.toLowerCase() === catId.toLowerCase());
    
    if (items.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;padding:4rem 0;text-align:center;color:var(--text-soft)">No hay productos en esta categoría aún.</div>';
    } else {
      const view = getCatView(catId);
      grid.className = view === 'list' ? 'filtered-list' : 'filtered-grid';
      grid.innerHTML = view === 'list'
        ? items.map(p => buildListItem(p)).join('')
        : items.map(p => buildCard(p)).join('');
    }
  }, 300);
}

function renderSkeletons(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>`).join('');
}

function clearFilter() {
  activeFilter = null;
  document.querySelectorAll('.cat-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
  
  const rows = document.getElementById('catalogRows');
  const filtered = document.getElementById('filteredView');
  if (rows) rows.style.display = 'block';
  if (filtered) filtered.style.display = 'none';

  if (typeof window.initCatSwipersGlobal === 'function') {
    setTimeout(window.initCatSwipersGlobal, 10);
  }
}

/* ════════════════════════════
   BÚSQUEDA — con links
════════════════════════════ */
/* initSearch eliminada para evitar duplicados con SearchOverlay.astro */

/* renderSearchResults eliminada */

function toggleSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchInput').focus(), 100);
}
function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.classList.remove('open');
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  const results = document.getElementById('searchResults');
  if (results) results.innerHTML = '';
  document.body.style.overflow = '';
}

/* ════════════════════════════
   MODAL (se mantiene para compatibilidad)
════════════════════════════ */
function openModal(id) {
  // Redirige a la página del producto
  const p = getProducts().find(x => x.id === id);
  if (p) window.location.href = `/ramo/${slugify(p.name)}`;
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
/* addToCart migrado a Nanostores */

/* changeQty y updateCartBadge migrados */

/* Funciones de renderizado y lógica de negocio portadas a Nanostores */

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartPanel').classList.toggle('open');
  const isOpen = document.getElementById('cartPanel').classList.contains('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

/* Checkout migrado a Nanostores */

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
