import { slugify, categories } from '../data/datos';

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

  input.addEventListener('input', e => {
    const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
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
      results.innerHTML = `<div class="search-empty"><i class="ri-search-eye-line"></i><p>No encontramos "${q}"</p><small>Escríbenos por WhatsApp 🌸</small></div>`;
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
          <i class="ri-arrow-right-s-line"></i>
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
