export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = await request.json();
    const { fullname, email, phone, items, discount, address, notes } = payload;

    // Obtener variables de entorno de Cloudflare de forma robusta
    const env = (locals as any).runtime?.env || {};
    
    const clean = (val: any) => {
      if (!val || val === 'undefined' || val === 'null') return null;
      return String(val).trim();
    };

    const SB_URL = clean(env.PUBLIC_SUPABASE_URL) || clean(import.meta.env.PUBLIC_SUPABASE_URL) || 'https://fpyhkxikxdwjhukltmqf.supabase.co';
    const SB_KEY = clean(env.SUPABASE_SERVICE_ROLE_KEY) || clean(import.meta.env.SUPABASE_SERVICE_ROLE_KEY) || clean(env.PUBLIC_SUPABASE_ANON_KEY) || clean(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
    const SB_ANON = clean(env.PUBLIC_SUPABASE_ANON_KEY) || clean(import.meta.env.PUBLIC_SUPABASE_ANON_KEY) || SB_KEY;

    if (!SB_KEY || SB_KEY.length < 20) {
       return new Response(JSON.stringify({ 
         error: 'key_missing', 
         message: 'No se detectó una llave de acceso válida.',
         diag: { url: !!SB_URL, key_len: SB_KEY?.length || 0 }
       }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (!fullname || !email || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Datos incompletos', message: 'Faltan campos obligatorios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. Obtener productos directamente con fetch (no depende de import.meta.env a nivel de módulo)
    const prodRes = await fetch(`${SB_URL}/rest/v1/productos?activo=eq.true&select=id,nombre,precio,precio_original,oferta,envio_gratis`, {
      headers: { 'apikey': SB_ANON, 'Authorization': `Bearer ${SB_ANON}` }
    });

    if (!prodRes.ok) {
       const errText = await prodRes.text();
       console.error('[init-wompi] Error cargando productos:', errText);
       return new Response(JSON.stringify({ error: 'catalog_error', message: 'Error de conexión con el catálogo.', detail: errText }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const allProducts = await prodRes.json();

    let subtotal = 0;
    items.forEach((item: any) => {
      const p = allProducts.find((x: any) => String(x.id) === String(item.id));
      if (p) {
        subtotal += (p.precio || 0) * item.qty;
      }
    });

    let finalTotal = subtotal;
    if (discount && discount.pct) {
      finalTotal = subtotal - Math.round(subtotal * (discount.pct / 100));
    }

    // 2. Obtener configuración de Wompi directamente
    const cfgRes = await fetch(`${SB_URL}/rest/v1/config?select=clave,valor`, {
      headers: { 'apikey': SB_ANON, 'Authorization': `Bearer ${SB_ANON}` }
    });

    if (!cfgRes.ok) {
       return new Response(JSON.stringify({ error: 'config_error', message: 'Error de conexión con la configuración.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const cfgRows = await cfgRes.json();
    const cfg: any = {};
    cfgRows.forEach((r: any) => { cfg[r.clave] = r.valor; });

    if (cfg.wompi_activo !== 'true') {
       return new Response(JSON.stringify({ error: 'gateway_inactive', message: 'Los pagos en línea no están activos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const wompiKey = cfg.wompi_key || '';
    const wompiIntegrity = cfg.wompi_integrity_secret || '';

    if (!wompiIntegrity || !wompiKey) {
        return new Response(JSON.stringify({ error: 'gateway_error', message: 'Configuración de pagos incompleta.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Crear pedido en Supabase
    const dbPayload = {
      cliente_nombre: fullname,
      cliente_email: email,
      cliente_telefono: phone,
      items: items.map((i: any) => `${i.qty}x ${i.name}`).join(', '),
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
      console.error('[init-wompi] Error Supabase pedidos:', errorText);
      return new Response(JSON.stringify({ error: 'db_error', message: 'Error al registrar pedido.', detail: errorText }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const orders = await res.json();
    if (!orders || orders.length === 0) {
       return new Response(JSON.stringify({ error: 'db_empty', message: 'El pedido fue rechazado por la base de datos.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    const savedOrder = orders[0];
    const orderId = savedOrder.id;

    // 4. Generar Firma de Integridad SHA-256
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
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[init-wompi] EXCEPCIÓN:', errorMsg);
    
    return new Response(JSON.stringify({ 
        error: 'server_exception', 
        message: 'Error inesperado en el servidor.',
        debug: errorMsg
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
