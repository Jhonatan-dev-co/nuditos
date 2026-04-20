export const prerender = false;

import type { APIRoute } from 'astro';
import { getLiveConfig } from '../../../lib/supabase';

async function updatePedidoStatus(pedidoId: string, statusText: string, sbToken: string, sbUrl: string) {
  try {
    const res = await fetch(`${sbUrl}/rest/v1/pedidos?id=eq.${pedidoId}`, {
      method: 'PATCH',
      headers: {
        'apikey': sbToken,
        'Authorization': `Bearer ${sbToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        estado: statusText,
      })
    });
    return res.ok;
  } catch (e) {
    console.error('[wompi-webhook] Error de red actualizando pedido:', e);
    return false;
  }
}

async function verifyWebhookSignature(body: any, eventsSecret: string) {
  if (!eventsSecret || !body.signature || !body.signature.checksum) return false;
  const { data, timestamp, signature } = body;
  const transaction = data.transaction;
  
  // Wompi docs: Para eventos referidos a transacciones, las propiedades por defecto
  // de checksum para eventos son: id, status, amount_in_cents, timestamp y el secreto
  const rawString = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${timestamp}${eventsSecret}`;

  const encoder = new TextEncoder();
  const dataUint8 = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === signature.checksum;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env || {};
    const SB_URL = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    const body = await request.json();
    console.log('[wompi-webhook] Evento recibido. ID Transacción:', body?.data?.transaction?.id);

    const config = await getLiveConfig();
    const eventSecret = config?.wompiEvents;

    // 1. Validar la firma siempre y cuando esté configurada
    if (eventSecret) {
      const isValid = await verifyWebhookSignature(body, eventSecret);
      if (!isValid) {
        console.warn('[wompi-webhook] ❌ Rechazado: Firma de evento inválida.');
        return new Response(JSON.stringify({ error: 'invalid_signature' }), { status: 200, headers: { 'Content-Type': 'application/json' }  });
      }
    } else {
        console.log('[wompi-webhook] ⚠️ Advertencia: Validando evento sin firma de seguridad.');
    }

    // 2. Procesar el Evento
    const { event, data } = body;
    if (event === 'transaction.updated') {
      const trans = data.transaction;
      
      const reference = trans.reference; // Ej: NUDITOS-123456789
      const match = reference.match(/NUDITOS-(\d+)/);
      const pedidoId = match ? match[1] : null;

      if (pedidoId && SB_URL && SB_KEY) {
        const finalStatus = trans.status === 'APPROVED' ? 'pagado' : (trans.status === 'DECLINED' || trans.status === 'ERROR' ? 'cancelado' : 'pendiente');
        
        console.log(`[wompi-webhook] Actualizando pedido ${pedidoId} a estado [${finalStatus}]`);
        const success = await updatePedidoStatus(pedidoId, finalStatus, SB_KEY, SB_URL);
        
        if (!success) console.error(`[wompi-webhook] ❌ Falló actualización en BD para el pedido ${pedidoId}`);
      } else {
          console.log(`[wompi-webhook] Referencia ignorada o faltan llaves: ${reference}`);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[wompi-webhook] Error interno:', err.message);
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500 });
  }
};
