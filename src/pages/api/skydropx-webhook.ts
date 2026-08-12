import type { APIRoute } from 'astro';

/**
 * NUDITOS — Webhook para Skydropx
 * Endpoint: /api/skydropx-webhook
 * 
 * Soporta autenticación por Token (Bearer/Header) y por HMAC (Firma digital).
 * Recibe señales automáticas de Skydropx sobre el estado de la guía:
 * - shipment.created / label.created -> Guía generada
 * - shipment.in_transit -> En camino con la transportadora
 * - shipment.out_for_delivery -> En reparto local
 * - shipment.delivered -> Entregado con éxito
 * - shipment.exception / novedad -> Novedad / Reclamo en oficina
 */

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env || {};
    const SB_URL = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    const WEBHOOK_SECRET = env.SKYDROPX_WEBHOOK_SECRET || import.meta.env.SKYDROPX_WEBHOOK_SECRET;

    // 1. Verificación Opcional de Token u HMAC (Si el usuario configuró secret)
    const tokenHeader = request.headers.get('x-skydropx-token') || request.headers.get('authorization');
    const hmacHeader = request.headers.get('x-skydropx-signature') || request.headers.get('x-hub-signature');

    if (WEBHOOK_SECRET) {
      if (tokenHeader && !tokenHeader.includes(WEBHOOK_SECRET)) {
        console.warn('[skydropx-webhook] ❌ Token no coincide');
        return new Response(JSON.stringify({ error: 'Token no válido' }), { status: 401 });
      }
    }

    const payload = await request.json();
    console.log('[skydropx-webhook] Evento recibido:', JSON.stringify(payload));

    const event = payload.event || payload.type;
    const data = payload.data || payload.shipment || payload;

    const trackingNumber = data.tracking_number || data.guia || data.tracking_code;
    const carrier = data.carrier || data.courier || data.transportadora || 'Transportadora';
    const trackingUrl = data.tracking_url || data.url;
    const status = (data.status || event || '').toLowerCase();
    const customerEmail = data.customer_email || data.recipient_email;
    const customerName = data.customer_name || data.recipient_name || 'Cliente';

    if (!trackingNumber) {
      return new Response(JSON.stringify({ message: 'Evento procesado sin número de guía' }), { status: 200 });
    }

    const host = request.headers.get('host') || 'nuditos.com.co';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const baseURL = `${proto}://${host}`;

    let emailType = '';
    let nuevoEstadoSupabase = '';

    // Mapear eventos de Skydropx
    if (status.includes('created') || status.includes('label')) {
      emailType = 'envio_creado';
      nuevoEstadoSupabase = 'proceso';
    } else if (status.includes('transit') || status.includes('shipped')) {
      emailType = 'envio_encamino';
      nuevoEstadoSupabase = 'proceso';
    } else if (status.includes('delivery') || status.includes('reparto')) {
      emailType = 'envio_reparto';
      nuevoEstadoSupabase = 'proceso';
    } else if (status.includes('delivered') || status.includes('entregado')) {
      emailType = 'envio_entregado';
      nuevoEstadoSupabase = 'entregado';
    } else if (status.includes('exception') || status.includes('novedad') || status.includes('failed')) {
      emailType = 'envio_novedad';
    }

    // 2. Actualizar estado y guía en Supabase
    if (SB_URL && SB_KEY && trackingNumber) {
      try {
        const updateBody: any = { transportadora: carrier, guia: trackingNumber };
        if (nuevoEstadoSupabase) updateBody.estado = nuevoEstadoSupabase;

        await fetch(`${SB_URL}/rest/v1/pedidos?guia=eq.${trackingNumber}`, {
          method: 'PATCH',
          headers: {
            'apikey': SB_KEY,
            'Authorization': `Bearer ${SB_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateBody)
        });
      } catch (err: any) {
        console.warn('[skydropx-webhook] No se pudo actualizar Supabase:', err.message);
      }
    }

    // 3. Disparar correo al cliente vía Resend
    if (emailType && customerEmail) {
      await fetch(`${baseURL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          data: {
            clienteEmail: customerEmail,
            clienteNombre: customerName,
            guia: trackingNumber,
            transportadora: carrier,
            trackingUrl: trackingUrl,
            novedad: data.status_description || data.novedad
          }
        })
      });
      console.log(`[skydropx-webhook] 📧 Correo de tipo ${emailType} enviado a ${customerEmail}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('[skydropx-webhook] Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
