import type { APIRoute } from 'astro';
import { getLiveProducts, getLiveConfig } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const orderData = await request.json();
    const { fullname, email, phone, items, total, discount, address, notes } = orderData;

    if (!fullname || !email || !items) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
    }

    // 1. Recalcular total en el servidor para evitar fraudes
    const allProducts = await getLiveProducts();
    const config = await getLiveConfig();
    
    let subtotalCalculated = 0;
    const itemsList = Array.isArray(items) ? items : [];
    
    itemsList.forEach((item: any) => {
      const p = allProducts.find(x => x.id === item.id);
      if (p) {
        const price = p.oferta && p.precioOferta > 0 ? p.precioOferta : p.price;
        subtotalCalculated += price * item.qty;
      }
    });

    let finalTotal = subtotalCalculated;
    if (discount && discount.pct) {
      finalTotal = subtotalCalculated - Math.round(subtotalCalculated * (discount.pct / 100));
    }

    // Pequeño margen de diferencia por redondeos si es necesario (ej: 2 pesos)
    if (Math.abs(finalTotal - total) > 5) {
       console.warn(`[create-order] Diferencia de precio detectada: Calc ${finalTotal} vs Recibido ${total}`);
       // Opcional: Bloquear si la diferencia es sospechosa
       // finalTotal = total; // Por ahora confiamos pero logueamos
    }

    // 2. Guardar en Supabase usando SERVICE ROLE (Seguro)
    const SB_URL = import.meta.env.PUBLIC_SUPABASE_URL;
    const SB_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SB_KEY) {
      throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
    }

    const payload = {
      cliente_nombre: fullname,
      cliente_email: email,
      cliente_telefono: phone,
      items: JSON.stringify(itemsList.map(i => `${i.qty}x ${i.name}`).join(', ')),
      total: finalTotal,
      estado: 'pendiente',
      notas: `${address}${notes ? ' | ' + notes : ''}`,
    };

    const res = await fetch(`${SB_URL}/rest/v1/pedidos`, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[create-order] Supabase error:', errText);
      return new Response(JSON.stringify({ error: 'Error al guardar el pedido' }), { status: 500 });
    }

    const rows = await res.json();
    return new Response(JSON.stringify({ ok: true, pedido: rows[0] }), { status: 200 });

  } catch (err) {
    console.error('[create-order] Internal error:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
