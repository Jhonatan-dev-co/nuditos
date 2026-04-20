export const prerender = false;

import type { APIRoute } from 'astro';
import { getLiveProducts, getLiveConfig } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { fullname, email, phone, items, discount, address, notes } = payload;

    // Log de entrada para depuración
    console.log('[init-wompi] Recibiendo solicitud para:', email);

    if (!fullname || !email || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Datos incompletos', message: 'Faltan campos obligatorios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. Recalcular total real desde la base de datos (Prevención Fraude)
    const allProducts = await getLiveProducts();
    if (!allProducts || allProducts.length === 0) {
       console.error('[init-wompi] No se pudieron cargar los productos de Supabase.');
       return new Response(JSON.stringify({ error: 'server_error', message: 'Error de conexión con el catálogo.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    let subtotal = 0;
    items.forEach((item: any) => {
      // Búsqueda robusta por ID numérico o string
      const p = allProducts.find(x => String(x.id) === String(item.id));
      if (p) {
        // En nuestro mapeo de supabase.ts, 'price' ya es el precio final (oferta o normal)
        subtotal += (p.price || 0) * item.qty;
      } else {
        console.warn(`[init-wompi] Producto ID ${item.id} no encontrado en catálogo vivo.`);
      }
    });

    let finalTotal = subtotal;
    if (discount && discount.pct) {
      finalTotal = subtotal - Math.round(subtotal * (discount.pct / 100));
    }

    // 2. Determinar configuración de Wompi
    const config = await getLiveConfig();
    if (!config || !config.wompiActivo) {
       return new Response(JSON.stringify({ error: 'gateway_inactive', message: 'Los pagos en línea no están activos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const wompiIntegrity = config.wompiIntegrity;
    const wompiKey = config.wompiKey;

    if (!wompiIntegrity || !wompiKey) {
        console.error('[init-wompi] ERROR: Llaves de Wompi incompletas en config.');
        return new Response(JSON.stringify({ error: 'gateway_error', message: 'Configuración de pagos incompleta.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Crear pedido en Supabase
    // Priorizamos variables de entorno de Cloudflare (Runtime) sobre import.meta.env si es necesario
    const SB_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://fpyhkxikxdwjhukltmqf.supabase.co';
    const SB_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY; 
    
    if (!SB_KEY) {
       console.error('[init-wompi] No se encontró SB_KEY para persistir el pedido.');
       return new Response(JSON.stringify({ error: 'server_auth_error', message: 'Error de autenticación interna.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const dbPayload = {
      cliente_nombre: fullname,
      cliente_email: email,
      cliente_telefono: phone,
      items: items.map(i => `${i.qty}x ${i.name}`).join(', '),
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
      const errorText = await res.text();
      console.error('[init-wompi] Error Supabase:', errorText);
      return new Response(JSON.stringify({ error: 'db_error', message: 'Error al registrar pedido.', detail: errorText }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const orders = await res.json();
    if (!orders || orders.length === 0) {
       return new Response(JSON.stringify({ error: 'db_empty', message: 'El pedido fue rechazado por la base de datos.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    const savedOrder = orders[0];
    const orderId = savedOrder.id;

    // 4. Generar Firma de Integridad
    const reference = `NUDITOS-${orderId}`;
    const amountInCents = Math.round(finalTotal * 100);
    const currency = 'COP';

    const rawString = `${reference}${amountInCents}${currency}${wompiIntegrity}`;
    const encoder = new TextEncoder();
    const dataUint8 = encoder.encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

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
    // CAPTURADOR GLOBAL DE ERRORES: Evita devolver HTML 500
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[init-wompi] EXCEPCIÓN CRÍTICA:', errorMsg);
    
    return new Response(JSON.stringify({ 
        error: 'server_exception', 
        message: 'Ocurrió un error inesperado en el servidor',
        debug: errorMsg
    }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
    });
  }
};
