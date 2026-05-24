import { slugify, categories } from '../data/datos';
import { getIconSvg } from '../lib/icons';

document.addEventListener('astro:page-load', () => {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput') as HTMLInputElement;
  const results = document.getElementById('searchResults');
  const closeBtn = document.getElementById('closeSearchBtn');

  if (!overlay || !input || !results || !closeBtn) return;

  function closeSearch() {
    overlay?.classList.remove('open');
    if (input) input.value = '';
    if (results) results.innerHTML = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });

  let searchTimer: any = null;
  input.addEventListener('input', e => {
    const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
    
    // Facebook Pixel Track - Search (Debounced)
    clearTimeout(searchTimer);
    if (q.length >= 3) {
      searchTimer = setTimeout(() => {
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Search', { search_string: q });
        }
      }, 700);
    }

    if (q.length < 2) { 
        results.innerHTML = ''; 
        return; 
    }
    
    const liveProducts = (window as any).NUDITOS_LIVE_PRODUCTS || [];
    const liveCategories = (window as any).NUDITOS_CATEGORIES || [];

    const found = liveProducts.filter((p: any) =>
      p.name.toLowerCase().includes(q) ||
      (p.desc && p.desc.toLowerCase().includes(q)) ||
      (liveCategories.find((c: any) => c.id === p.cat)?.name.toLowerCase().includes(q))
    );

    if (!found.length) {
      results.innerHTML = `
        <div class="flex flex-col items-center justify-center gap-4 py-8 px-4 text-center">
          <div class="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">${getIconSvg('search-eye')}</div>
          <p class="text-sm text-stone-500 font-medium">No encontramos resultados para <strong>"${q}"</strong></p>
          <a
            href="https://wa.me/573144931525?text=Hola%20Nuditos!%20Busco%20${encodeURIComponent(q)}"
            target="_blank"
            class="inline-flex items-center gap-2 bg-[#1a1220] text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md"
          >
            ${getIconSvg('whatsapp')} Atención personalizada por WhatsApp
          </a>
        </div>`;
      return;
    }

    results.innerHTML = found.map((p: any) => {
      // Optimización de imagen de búsqueda a 80px
      const thumbUrl = p.img && p.img.includes('res.cloudinary.com') 
        ? p.img.replace(/upload\/v?/, 'upload/q_auto,f_auto,w_80/') : p.img;
      const thumb = p.img ? `<img src="${thumbUrl}" alt="${p.name}" width="40" height="40">` : `<span>${p.emoji || '🌸'}</span>`;
      const priceText = p.price > 0 ? `$${p.price.toLocaleString('es-CO')} COP` : 'Consultar';
      return `
        <a class="search-item" href="/ramo/${slugify(p.name)}" style="text-decoration:none;color:inherit">
          <div class="search-item-img">${thumb}</div>
          <div class="search-item-info">
            <div class="search-item-name">${p.name}</div>
            <div class="search-item-price">${priceText}</div>
          </div>
          ${getIconSvg('arrow-right-s')}
        </a>`;
    }).join('');

    document.querySelectorAll('.search-item').forEach(el => {
        el.addEventListener('click', closeSearch);
    });
  });

  // Cerrar con tecla ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
  });

  (window as any).toggleSearch = () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 100);
  };
});
