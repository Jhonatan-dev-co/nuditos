import { $cart, addToCart, changeQty, getCartTotal, $discount } from '../store/cart';
import { products } from '../data/datos';

// Función para mostrar el toast (copiada de app.js para independencia)
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
      body.innerHTML = `<div class="cart-empty"><span class="cart-empty-icon">🌸</span><p>Tu bolsa está vacía</p><small>Agrega tus ramos favoritos</small></div>`;
      if (foot) foot.style.display = 'none';
    } else {
      if (foot) foot.style.display = 'block';
      body.innerHTML = cart.map(item => {
        const thumb = item.img ? `<img src="${item.img}" alt="${item.name}">` : (item.emoji || '🌸');
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
      ds.style.display = 'flex';
      da.textContent = `-$${saved.toLocaleString('es-CO')} COP`;
    } else if (ds) {
      ds.style.display = 'none';
    }

    totalEl.textContent = `$${total.toLocaleString('es-CO')} COP`;
  }
}

// Suscribirse a cambios en el store
$cart.subscribe(cart => {
  updateCartUI(cart);
});

$discount.subscribe(() => {
  updateCartUI($cart.get());
});

// Exponer funciones al objeto window para compatibilidad con onclick
(window as any).addToCart = (id: number) => {
  // Buscar primero en los productos inyectados dinámicamente
  const live = (window as any).NUDITOS_LIVE_PRODUCTS || [];
  const p = live.find((x: any) => x.id === id) || products.find(x => x.id === id);

  if (p && p.price > 0) {
    addToCart(p);
    showToast(`<i class="ri-check-line"></i> ${p.name} agregado`);
    
    // Feedback visual en el botón
    document.querySelectorAll(`#padd-${id}`).forEach(btn => {
      btn.classList.add('added');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="ri-check-line"></i>';
      setTimeout(() => { 
        btn.classList.remove('added'); 
        btn.innerHTML = originalHTML; 
      }, 1300);
    });
  } else {
    console.warn('[cart] Producto no encontrado o sin precio:', id);
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

  let text = `*NUEVO PEDIDO - NUDITOS TRJIDOS* 🌸\n\n`;
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
};

(window as any).checkoutWompi = () => {
  const subtotal = getCartTotal();
  const discount = $discount.get();
  const WOMPI_PUBLIC_KEY = 'pub_test_XXXXXXXXXXXXXXXX';
  
  let total = subtotal;
  if (discount) total = subtotal - Math.round(subtotal * discount.pct / 100);
  
  if (total === 0) {
    showToast('Agrega productos para pagar');
    return;
  }
  
  // En un caso real buscaríamos la key de la config
  window.open(`https://checkout.wompi.co/l/?public-key=${WOMPI_PUBLIC_KEY}&currency=COP&amount-in-cents=${total * 100}&reference=NUDITOS-${Date.now()}`, '_blank');
};

(window as any).applyDiscount = async () => {
  const input = document.getElementById('discountInput') as HTMLInputElement;
  const msg = document.getElementById('discountMsg');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  if (!code) return;

  msg.textContent = 'Verificando...';
  msg.className = 'discount-msg';

  // Por ahora validamos contra el código fijo o simulamos llamada a Supabase
  // En el futuro esto podría usar una función de supabase.ts
  if (code === 'NUDITOS10') {
    $discount.set({ code, pct: 10 });
    msg.textContent = '✓ 10% de descuento aplicado';
    msg.className = 'discount-msg ok';
    showToast('🎉 ¡10% de descuento aplicado!');
  } else {
    $discount.set(null);
    msg.textContent = 'Código incorrecto o no disponible.';
    msg.className = 'discount-msg err';
  }
};
