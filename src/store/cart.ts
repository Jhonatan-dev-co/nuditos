import { persistentAtom } from '@nanostores/persistent';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img?: string;
  emoji?: string;
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
  const existing = current.find(item => item.id === product.id);
  
  if (existing) {
    $cart.set(current.map(item => 
      item.id === product.id ? { ...item, qty: item.qty + 1 } : item
    ));
  } else {
    $cart.set([...current, { 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      qty: 1, 
      img: product.img, 
      emoji: product.emoji 
    }]);
  }
}

export function removeFromCart(id: number) {
  $cart.set($cart.get().filter(item => item.id !== id));
}

export function changeQty(id: number, delta: number) {
  const current = $cart.get();
  const index = current.findIndex(item => item.id === id);
  
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
