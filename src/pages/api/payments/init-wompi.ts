export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = await request.json();
    const { fullname, email, phone, waUser, items, discount, address, notes, direccion, barrio, ciudad, departamento, codigoPostal } = payload;

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

    if (!fullname || !email || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Datos incompletos', message: 'Faltan campos obligatorios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. Obtener productos directamente de Supabase para validar precios inmutables
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
    const validatedItems: Array<{ id: number; name: string; qty: number; price: number }> = [];

    items.forEach((item: any) => {
      const p = allProducts.find((x: any) => String(x.id) === String(item.id));
      if (p) {
        const qty = Math.max(1, Math.min(Math.floor(Number(item.qty) || 1), 99));
        const price = Number(p.precio) || 0;
        subtotal += price * qty;
        validatedItems.push({
          id: p.id,
          name: p.nombre || item.name || 'Ramo Nuditos',
          qty,
          price
        });
      }
    });

    if (validatedItems.length === 0 || subtotal <= 0) {
      return new Response(JSON.stringify({ error: 'invalid_items', message: 'Los productos seleccionados no son válidos.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Obtener configuración de Wompi y Descuentos directamente
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

    // 3. Validación estricta de cupones y descuentos del lado del servidor (prevención de fraude)
    let validDiscountPct = 0;
    if (discount && typeof discount === 'object' && discount.code) {
      const submittedCode = String(discount.code).trim().toUpperCase();
      
      // Chequear descuento global activo
      if (cfg.descuento_activo === 'true' && submittedCode === (cfg.descuento_codigo || 'NUDITOS10').toUpperCase()) {
        validDiscountPct = Math.min(Math.max(parseInt(cfg.descuento_porcentaje) || 10, 0), 50);
      } else {
        // Chequear tabla de cupones de Supabase
        try {
          const cupRes = await fetch(`${SB_URL}/rest/v1/cupones?codigo=eq.${encodeURIComponent(submittedCode)}&activo=eq.true&select=porcentaje`, {
            headers: { 'apikey': SB_ANON, 'Authorization': `Bearer ${SB_ANON}` }
          });
          if (cupRes.ok) {
            const cupRows = await cupRes.json();
            if (Array.isArray(cupRows) && cupRows.length > 0 && cupRows[0].porcentaje) {
              validDiscountPct = Math.min(Math.max(parseInt(cupRows[0].porcentaje) || 0, 0), 50);
            }
          }
        } catch {
          // Ignorar si tabla cupones no existe
        }
      }
    }

    let finalTotal = subtotal;
    if (validDiscountPct > 0) {
      finalTotal = Math.max(0, subtotal - Math.round(subtotal * (validDiscountPct / 100)));
    }

    // 4. Crear pedido en Supabase
    const cleanFullname = String(fullname).trim().slice(0, 150);
    const cleanEmail = String(email).trim().toLowerCase().slice(0, 150);
    const cleanPhone = String(phone).replace(/[^\d+ ()-]/g, '').slice(0, 30);
    const cleanWaUser = waUser ? (String(waUser).trim().startsWith('@') ? String(waUser).trim().slice(0, 60) : `@${String(waUser).trim().slice(0, 60)}`) : null;
    
    const dbPayload = {
      cliente_nombre: cleanFullname,
      cliente_email: cleanEmail,
      cliente_telefono: cleanWaUser ? `${cleanPhone} (${cleanWaUser})` : cleanPhone,
      items: validatedItems.map((i) => `${i.qty}x ${i.name}`).join(', '),
      total: finalTotal,
      estado: 'pendiente',
      direccion: direccion ? String(direccion).trim().slice(0, 200) : null,
      departamento: departamento ? String(departamento).trim().slice(0, 100) : null,
      ciudad: ciudad ? String(ciudad).trim().slice(0, 100) : null,
      barrio: barrio ? String(barrio).trim().slice(0, 100) : null,
      codigo_postal: codigoPostal ? String(codigoPostal).trim().slice(0, 20) : null,
      notas: `${address ? String(address).trim() : ''}${notes ? ' | ' + String(notes).trim() : ''}${cleanWaUser ? ' | WA Username: ' + cleanWaUser : ''}`.slice(0, 500),
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

    // 5. Generar Firma de Integridad SHA-256 oficial
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
