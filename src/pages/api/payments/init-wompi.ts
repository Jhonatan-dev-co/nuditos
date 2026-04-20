import type { APIRoute } from 'astro';
import { getLiveProducts, getLiveConfig } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { fullname, email, phone, items, discount, address, notes } = payload;

    if (!fullname || !email || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Datos incompletos', message: 'Faltan campos obligatorios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. Recalcular total real desde la base de datos (Prevención Fraude)
    const allProducts = await getLiveProducts();
    let subtotal = 0;
    
    items.forEach((item: any) => {
      const p = allProducts.find(x => x.id === item.id);
      if (p) {
        const price = p.oferta && p.precioOferta > 0 ? p.precioOferta : p.price;
        subtotal += price * item.qty;
      }
    });

    let finalTotal = subtotal;
    if (discount && discount.pct) {
      finalTotal = subtotal - Math.round(subtotal * (discount.pct / 100));
    }

    // 2. Determinar configuración de Wompi (Directamente desde servidor)
    const config = await getLiveConfig();
    if (!config || !config.wompiActivo) {
       return new Response(JSON.stringify({ error: 'gateway_inactive', message: 'Los pagos en línea no están activos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Usar claves seguras
    const wompiIntegrity = config.wompiIntegrity;
    const wompiKey = config.wompiKey;

    if (!wompiIntegrity || !wompiKey) {
        console.error('[init-wompi] ERROR: Llaves de Wompi incompletas en la Base de Datos.');
        return new Response(JSON.stringify({ error: 'gateway_error', message: 'Error de configuración de pagos en el servidor.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Crear pedido como "pendiente" en Supabase de forma segura
    const SB_URL = import.meta.env.PUBLIC_SUPABASE_URL;
    const SB_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY; 
    
    const dbPayload = {
      cliente_nombre: fullname,
      cliente_email: email,
      cliente_telefono: phone,
      items: JSON.stringify(items.map(i => `${i.qty}x ${i.name}`).join(', ')),
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
      body: JSON.stringify(dbPayload),
    });

    if (!res.ok) {
      console.error('[init-wompi] Error al guardar pedido en BD:', await res.text());
      return new Response(JSON.stringify({ error: 'db_error', message: 'No se pudo registrar el pedido.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const savedOrder = (await res.json())[0];
    const orderId = savedOrder.id;

    // 4. Generar Firma de Integridad para Wompi (SHA256)
    const reference = `NUDITOS-${orderId}`;
    const amountInCents = Math.round(finalTotal * 100);
    const currency = 'COP';

    // sha256(referencia + monto_en_centavos + moneda + secreto_integridad)
    const rawString = `${reference}${amountInCents}${currency}${wompiIntegrity}`;
    const encoder = new TextEncoder();
    const dataUint8 = encoder.encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`[init-wompi] Inicializado pago OK para Orden ${orderId} | Total: ${finalTotal}`);

    // 5. Responder al cliente estrictamente con la data procesada
    return new Response(JSON.stringify({
        ok: true,
        widgetConfig: {
            publicKey: wompiKey,
            reference: reference,
            amountInCents: amountInCents,
            currency: currency,
            signature: { integrity: signature }
        }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error('[init-wompi] Excepción Crítica:', err.message);
    return new Response(JSON.stringify({ error: 'server_error', message: 'Error interno o red caída' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
