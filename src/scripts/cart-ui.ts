import { $cart, addToCart, changeQty, getCartTotal, $discount } from '../store/cart';
import { products, clUrl } from '../data/datos';
import { getIconSvg } from '../lib/icons';
import { SB_URL, SB_ANON } from '../lib/supabase-public';

// ─── Tracking de carrito en Supabase (antes en public/scripts/supabase.js) ────
const SB_HEADERS = {
  apikey: SB_ANON,
  Authorization: `Bearer ${SB_ANON}`,
  'Content-Type': 'application/json',
};

async function sbUpsertCarrito(sessionId: string, items: unknown[], total: number, estado = 'activo') {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/carritos?on_conflict=session_id`, {
      method: 'POST',
      headers: { ...SB_HEADERS, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ session_id: sessionId, items, total, estado }),
    });
    return res.ok;
  } catch { return false; }
}

async function sbTrackCartEvent(sessionId: string, eventName: string, data: Record<string, unknown> = {}) {
  try {
    await fetch(`${SB_URL}/rest/v1/cart_events`, {
      method: 'POST',
      headers: { ...SB_HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify({ session_id: sessionId, event: eventName, ...data }),
    });
  } catch { /* ignorar errores de tracking */ }
}

// ─── Sesión persistente del visitante ────────────────────────────────────────
function getOrCreateSessionId(): string {
  const KEY = 'nuditos_session_id';
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(KEY, sid);
  }
  return sid;
}


// Toast global de notificaciones
function showToast(msg: string) {
  const t = document.getElementById('toast');
  if (t) {
    t.innerHTML = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  }
}

// Sincronizar UI del carrito
function updateCartUI(cart: readonly any[]) {
  const badge = document.getElementById('cartCount');
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  const totalEl = document.getElementById('cartTotal');

  // Actualizar contador
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const badges = [document.getElementById('cartCount'), document.getElementById('mbCartCount')];
  
  badges.forEach(badge => {
    if (badge) {
      badge.textContent = totalItems.toString();
      badge.classList.toggle('hidden', totalItems === 0);
      badge.classList.add('bump');
      setTimeout(() => badge.classList.remove('bump'), 350);
    }
  });

  // Actualizar cuerpo del carrito
  if (body) {
    if (cart.length === 0) {
      body.className = "flex-1 overflow-y-auto w-full flex items-center justify-center";
      body.innerHTML = `
        <div class="flex flex-col items-center justify-center text-center px-6 py-12">
          <div class="text-7xl mb-6 opacity-30 grayscale drop-shadow-sm">🛍️</div>
          <h3 class="font-serif text-2xl text-stone-800 font-light mb-2">Tu bolsa está vacía</h3>
          <p class="text-stone-400 text-sm mb-8">Agrega tus ramos favoritos para continuar.</p>
          <a href="/catalogo" onclick="toggleCart()" class="bg-stone-900 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg active:scale-95 text-center decoration-none">
            Explorar Catálogo
          </a>
        </div>`;
      if (foot) { foot.classList.add('hidden'); foot.classList.remove('block'); }
    } else {
      body.className = "flex-1 overflow-y-auto w-full pb-4";
      if (foot) { foot.classList.remove('hidden'); foot.classList.add('block'); }
      
      body.innerHTML = cart.map((item, idx) => {
        const isUrl = item.img && item.img.startsWith('http');
        const imgUrl = isUrl ? clUrl(item.img, 160) : item.img;
        const thumb = item.img ? `<img src="${imgUrl}" alt="${item.name}" width="64" height="64" loading="lazy" decoding="async" class="w-full h-full object-cover rounded-xl shadow-inner">` : `<span class="text-3xl opacity-50 drop-shadow-sm">${item.emoji || '🌸'}</span>`;
        return `
          <div class="cart-item-wrap relative overflow-hidden group border-b border-stone-200/50 animate-cart-item" style="animation-delay: ${idx * 60}ms" data-id="${item.id}" data-qty="${item.qty}">
            <!-- Base roja oculta (Swipe Delete a la DERECHA) -->
            <div class="absolute inset-y-0 left-0 w-24 bg-rose-500 flex items-center justify-center cursor-pointer hover:bg-rose-600 transition-colors" onclick="changeQtyWithAnim(${item.id}, -999, this)">
              <div class="flex flex-col items-center gap-1">
                ${getIconSvg('delete-bin', 'text-white text-xl')}
                <span class="text-white text-[9px] uppercase font-bold tracking-widest">Borrar</span>
              </div>
            </div>
            
            <!-- Contenido deslizable del frente (Fondo sólido) -->
            <div class="cart-item-front relative bg-white sm:bg-white/60 flex items-center gap-4 py-4 md:py-5 px-6 md:px-8 hover:bg-white/90 transition-transform duration-300 transform translate-x-0 cursor-grab active:cursor-grabbing">
              <div class="w-16 h-16 shrink-0 bg-stone-50 rounded-2xl p-[3px] flex items-center justify-center border border-stone-200/60 shadow-sm leading-none group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300 cursor-pointer pointer-events-none">
                ${thumb}
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-center pointer-events-none">
                <h4 class="font-serif text-[15px] sm:text-base leading-tight text-stone-800 mb-0.5 truncate">${item.name}</h4>
                <div class="font-sans text-xs sm:text-sm font-bold text-violet-600 flex items-baseline gap-1">
                  $${(item.price * item.qty).toLocaleString('es-CO')}
                  ${item.qty > 1 ? `<span class="text-[10px] text-stone-400 font-normal">($${item.price.toLocaleString('es-CO')}/u)</span>` : ''}
                </div>
              </div>
              
              <!-- Controles de cantidad -->
              <div class="flex items-center gap-1.5 shrink-0 bg-stone-50 rounded-2xl px-2 py-1.5 border border-stone-200/50 cursor-pointer pointer-events-auto" onclick="event.stopPropagation()">
                <button class="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-stone-600 shadow-xs hover:bg-stone-900 hover:text-white transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" onclick="changeQtyWithAnim(${item.id}, -1, this)" aria-label="Restar 1 a ${item.name}">${getIconSvg('subtract', 'text-xs flex')}</button>
                <span class="text-xs font-bold w-5 text-center text-stone-800 tabular-nums">${item.qty}</span>
                <button class="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-stone-600 shadow-xs hover:bg-stone-900 hover:text-white transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" onclick="changeQtyWithAnim(${item.id}, 1, this)" aria-label="Sumar 1 a ${item.name}">${getIconSvg('add', 'text-xs flex')}</button>
              </div>

              <!-- Botón X de eliminar (Especial para PC) -->
              <button class="ml-1 w-9 h-9 flex items-center justify-center text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" onclick="event.stopPropagation(); changeQtyWithAnim(${item.id}, -999, this)" title="Eliminar ${item.name}" aria-label="Eliminar ${item.name}">
                ${getIconSvg('close', 'text-lg')}
              </button>
            </div>
          </div>`;
      }).join('');
      
      // Auto-iniciar Swipe y Hint
      setTimeout(() => {
        if ((window as any).initSwipeDelete) (window as any).initSwipeDelete();
        if ((window as any).triggerSwipeHint) (window as any).triggerSwipeHint();
      }, 80);
    }
  }

  // Actualizar total
  if (totalEl) {
    const subtotal = getCartTotal();
    const discount = $discount.get();
    let total = subtotal;

    const ds = document.getElementById('discSaved');
    const da = document.getElementById('discAmount');

    if (discount && ds && da) {
      const saved = Math.round(subtotal * discount.pct / 100);
      total = subtotal - saved;
      ds.classList.remove('hidden');
      da.textContent = `-$${saved.toLocaleString('es-CO')} COP`;
    } else if (ds) {
      ds.classList.add('hidden');
    }

    totalEl.textContent = `$${total.toLocaleString('es-CO')} COP`;
  }
}

// Suscribirse a cambios en el store
let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function syncCartToSupabase(cart: readonly any[], estado = 'activo') {
  if (_syncTimer) clearTimeout(_syncTimer);
  if (cart.length === 0) return; // no registrar carrito vacío
  _syncTimer = setTimeout(async () => {
    const sessionId = getOrCreateSessionId();
    const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    const items = cart.map(({ id, name, price, qty, img, slug }) => ({ id, name, price, qty, img, slug }));
    await sbUpsertCarrito(sessionId, items, total, estado);
  }, 1500);
}

$cart.subscribe(cart => {
  updateCartUI(cart);
  syncCartToSupabase(cart);
});

$discount.subscribe(() => {
  updateCartUI($cart.get());
});

// Asegurar que el carrito se renderice al entrar en una nueva página (View Transitions)
document.addEventListener('astro:page-load', () => {
  updateCartUI($cart.get());
});


(window as any).addToCart = (idOrProduct: number | string | any) => {
  let p: any = null;
  if (idOrProduct && typeof idOrProduct === 'object' && idOrProduct.id) {
    p = idOrProduct;
  } else {
    const id = idOrProduct;
    const live = (window as any).NUDITOS_LIVE_PRODUCTS || [];
    p = live.find((x: any) => String(x.id) === String(id)) || products.find(x => String(x.id) === String(id));
  }

  if (p && p.price > 0) {
    addToCart(p);
    
    showToast(`${getIconSvg('check')} ${p.name} agregado`);
    
    // Forzar aparición de la Navbar si estaba oculta
    const nav = document.querySelector('.nav-wrap');
    if (nav) nav.classList.remove('nav-hidden');
    
    // Animar ícono del carrito en la Navbar
    const navCartBtns = document.querySelectorAll('.nav-right .nav-icon-btn');
    navCartBtns.forEach(btn => {
      btn.classList.add('cart-bump-animation');
      setTimeout(() => btn.classList.remove('cart-bump-animation'), 400);
    });

    // Abrir automáticamente el panel lateral del carrito de forma limpia e idempotente
    if (typeof (window as any).openCart === 'function') {
      (window as any).openCart();
    } else {
      const panel = document.getElementById('cartPanel');
      if (panel && !panel.classList.contains('open') && typeof (window as any).toggleCart === 'function') {
        (window as any).toggleCart();
      }
    }

    sbTrackCartEvent(getOrCreateSessionId(), 'add_to_cart', { product_id: p.id, product_name: p.name, quantity: 1, cart_total: getCartTotal() });

    // Meta Pixel & TikTok Pixel AddToCart
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'AddToCart', {
        content_name: p.name,
        content_ids: [p.id.toString()],
        content_type: 'product',
        value: Number(p.price) || 0,
        currency: 'COP'
      });
    }
    if (typeof (window as any).ttq === 'object') {
      (window as any).ttq.track('AddToCart', {
        contents: [{
          content_id: p.id.toString(),
          content_name: p.name,
          content_type: 'product',
          price: Number(p.price) || 0,
          quantity: 1
        }],
        value: Number(p.price) || 0,
        currency: 'COP'
      });
    }

    document.querySelectorAll(`#padd-${p.id}`).forEach(btn => {
      btn.classList.add('added');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = getIconSvg('check');
      setTimeout(() => { 
        btn.classList.remove('added'); 
        btn.innerHTML = originalHTML; 
      }, 1300);
    });
  } else {
    console.warn('[cart] Producto no encontrado o sin precio:', idOrProduct, 'p:', p);
  }
};

(window as any).changeQtyWithAnim = (id: number | string, delta: number, btnEl: HTMLElement) => {
  const cart = $cart.get();
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;

  const newQty = item.qty + delta;
  
  if (newQty <= 0) {
    // Animación de colapso si se borra
    const wrap = btnEl.closest('.cart-item-wrap') as HTMLElement;
    if (wrap) {
      wrap.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      wrap.style.opacity = '0';
      wrap.style.transform = 'translateY(-10px)';
      wrap.style.height = `${wrap.offsetHeight}px`; // Fija altura
      setTimeout(() => { wrap.style.height = '0px'; wrap.style.padding = '0px'; wrap.style.margin = '0px'; wrap.style.border = 'none'; }, 20); // Colapsa
      setTimeout(() => { changeQty(id, delta); }, 300);
    } else {
      changeQty(id, delta);
    }
    sbTrackCartEvent(getOrCreateSessionId(), 'remove_item', { product_id: id, product_name: item.name });
  } else {
    changeQty(id, delta);
  }
};

(window as any).changeQty = (id: number, delta: number) => {
  changeQty(id, delta);
};

(window as any).clearCart = () => {
  $cart.set([]);
  $discount.set(null);
};

(window as any).checkoutWA = () => {
  const cart = $cart.get();
  const discount = $discount.get();
  const subtotal = getCartTotal();
  const WA_NUMBER = '573144931525';
  
  if (cart.length === 0) return showToast('Agrega productos para pedir');

  let text = `*NUEVO PEDIDO - NUDITOS TEJIDOS* 🌸\n\n`;
  text += `🛒 *Detalle de compra:*\n`;
  
  cart.forEach(i => {
    text += `- ${i.qty}x ${i.name} ($${(i.price * i.qty).toLocaleString('es-CO')})\n`;
  });

  text += `\n---`;
  text += `\nSubtotal: $${subtotal.toLocaleString('es-CO')} COP`;
  
  let total = subtotal;
  if (discount) {
    const saved = Math.round(subtotal * discount.pct / 100);
    total = subtotal - saved;
    text += `\nDescuento (${discount.pct}%): -$${saved.toLocaleString('es-CO')}`;
  }
  
  text += `\n✨ *Total: $${total.toLocaleString('es-CO')} COP*`;
  text += `\n---\n`;
  text += `\n¿Me podrías confirmar disponibilidad y tiempos de entrega? ¡Gracias! 💜`;
  
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  
  // Registrar eventos en Supabase
  const sid = getOrCreateSessionId();
  sbTrackCartEvent(sid, 'checkout_wa', { cart_total: total });

  syncCartToSupabase($cart.get(), 'checkout_wa');
  if (_syncTimer) { clearTimeout(_syncTimer); _syncTimer = null; }
  const items = $cart.get().map(({ id, name, price, qty, img }) => ({ id, name, price, qty, img }));
  sbUpsertCarrito(sid, items, total, 'checkout_wa');
};

// ✅ Redirigir al checkout completo (flujo real de Wompi está en checkout.astro)
(window as any).checkoutWompi = () => {
  const cart = $cart.get();
  if (cart.length === 0) return showToast('Agrega productos para pagar');
  window.location.href = '/checkout';
};


(window as any).applyDiscount = async () => {
  const input = document.getElementById('discountInput') as HTMLInputElement;
  const msg = document.getElementById('discountMsg');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  if (!code) return;

  msg.textContent = 'Verificando...';
  msg.classList.remove('hidden');

  let discountApplied = false;
  let pct = 0;

  // 1. Chequear campaña temporal activa
  try {
    const campDiscountRaw = localStorage.getItem('nuditos_active_campaign_discount');
    if (campDiscountRaw) {
      const campDiscount = JSON.parse(campDiscountRaw);
      if (campDiscount.code === code) {
        discountApplied = true;
        pct = campDiscount.pct;
      }
    }
  } catch(e){}

  // 2. Códigos fijos
  if (code === 'NUDITOS10') {
    discountApplied = true;
    pct = 10;
  }

  if (discountApplied) {
    $discount.set({ code, pct });
    msg.textContent = `✓ ${pct}% de descuento aplicado`;
    msg.className = 'text-[10px] uppercase font-bold tracking-widest mt-1 text-emerald-500';
    showToast(`🎉 ¡${pct}% de descuento aplicado!`);
  } else {
    $discount.set(null);
    msg.textContent = '✖ Código incorrecto o expirado.';
    msg.className = 'text-[10px] uppercase font-bold tracking-widest mt-1 text-rose-500';
  }
};

// ─── Swipe Hint (onboarding) ──────────────────────────────────────────────
(window as any).triggerSwipeHint = () => {
  const HINT_KEY = 'nuditos_swipe_hint_shown';
  if (localStorage.getItem(HINT_KEY)) return; // ya se mostró antes

  const firstFront = document.querySelector<HTMLElement>('#cartBody .cart-item-front');
  if (!firstFront) return;

  // Pequeño delay para que el usuario vea los items primero
  setTimeout(() => {
    // 1) Deslizar levemente a la derecha (revelar rojo)
    firstFront.style.transition = 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)';
    firstFront.style.transform = 'translateX(72px)';

    // 2) Volver al centro
    setTimeout(() => {
      firstFront.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1)';
      firstFront.style.transform = 'translateX(0px)';

      // 3) Limpiar inline styles para no interferir con el swipe real
      setTimeout(() => {
        firstFront.style.transition = '';
        firstFront.style.transform = '';
      }, 350);
    }, 480);

    localStorage.setItem(HINT_KEY, '1');
  }, 420);
};

// ─── Swipe to Delete Logic ──────────────────────────────────────────────────
(window as any).initSwipeDelete = () => {
  const list = document.getElementById('cartBody');
  if (!list) return;

  if (list.dataset.swipeBound === "1") return;
  list.dataset.swipeBound = "1";

  let startX = 0;
  let currentX = 0;
  let activeElem: HTMLElement | null = null;
  let isActive = false;

  const startDrag = (e: PointerEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.svg-subtract') || target.closest('.svg-add')) return;
      
      const front = target.closest('.cart-item-front') as HTMLElement;
      if (!front) return;
      
      activeElem = front;
      startX = ('touches' in e) ? e.touches[0].clientX : (e as PointerEvent).clientX;
      isActive = true;
      front.style.transition = 'none';
  };

  const moveDrag = (e: PointerEvent | TouchEvent) => {
      if (!isActive || !activeElem) return;
      const clientX = ('touches' in e) ? e.touches[0].clientX : (e as PointerEvent).clientX;
      const diff = clientX - startX;
      
      if (diff > 0) {
          e.preventDefault(); // Prevenir scroll nativo
          currentX = Math.min(diff, 100);
          activeElem.style.transform = `translateX(${currentX}px)`;
      } else {
         activeElem.style.transform = `translateX(0px)`;
      }
  };

  const endDrag = (e: Event) => {
      if (!isActive || !activeElem) return;
      isActive = false;
      
      const elToAnim = activeElem;
      const wrap = elToAnim.closest('.cart-item-wrap') as HTMLElement;
      const id = wrap?.dataset.id;

      if (currentX > 50 && id) {
          elToAnim.style.transform = `translateX(120%)`;
          setTimeout(() => {
              (window as any).changeQtyWithAnim(parseInt(id, 10), -999, elToAnim);
          }, 50);
      } else {
          elToAnim.style.transform = `translateX(0)`;
      }
      currentX = 0;
      activeElem = null;
  };

  list.addEventListener('pointerdown', startDrag);
  list.addEventListener('pointermove', moveDrag, {passive: false});
  list.addEventListener('pointerup', endDrag);
  list.addEventListener('pointercancel', endDrag);
  
  // Respaldo Táctil
  list.addEventListener('touchstart', startDrag, {passive: true});
  list.addEventListener('touchmove', moveDrag, {passive: false});
  list.addEventListener('touchend', endDrag);
};
