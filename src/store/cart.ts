import { persistentAtom } from '@nanostores/persistent';
import { slugify } from '../data/datos';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img?: string;
  emoji?: string;
  slug?: string;
}

export interface Discount {
  code: string;
  pct: number;
}

// Descuento activo
export const $discount = persistentAtom<Discount | null>('nuditos_discount', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Carrito persistente en localStorage
export const $cart = persistentAtom<CartItem[]>('nuditos_cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addToCart(product: any) {
  const current = $cart.get();
  const existing = current.find(item => String(item.id) === String(product.id));
  
  if (existing) {
    $cart.set(current.map(item => 
      String(item.id) === String(product.id) ? { ...item, qty: item.qty + 1 } : item
    ));
  } else {
    $cart.set([...current, { 
      id: Number(product.id) || product.id, 
      name: product.name, 
      price: Number(product.price) || 0, 
      qty: 1, 
      img: product.img, 
      emoji: product.emoji || '🌸',
      slug: product.slug || slugify(product.name)
    }]);
  }
}

export function removeFromCart(id: number | string) {
  $cart.set($cart.get().filter(item => String(item.id) !== String(id)));
}

export function changeQty(id: number | string, delta: number) {
  const current = $cart.get();
  const index = current.findIndex(item => String(item.id) === String(id));
  
  if (index === -1) return;
  
  const updated = [...current];
  updated[index].qty += delta;
  
  if (updated[index].qty <= 0) {
    updated.splice(index, 1);
  }
  
  $cart.set(updated);
}

export function clearCart() {
  $cart.set([]);
}

export function getCartTotal() {
  return $cart.get().reduce((acc, item) => acc + (item.price * item.qty), 0);
}
