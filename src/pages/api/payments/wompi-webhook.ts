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

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    status: 'online', 
    message: 'Nuditos Webhook está activo. Esperando eventos POST de Wompi.',
    timestamp: new Date().toISOString()
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env || {};
    const SB_URL = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    const body = await request.json();
    const eventId = body?.data?.transaction?.id || 'unknown';
    console.log(`[wompi-webhook] Evento recibido. ID Transacción: ${eventId}`);

    if (!SB_URL || !SB_KEY) {
      console.error('[wompi-webhook] ❌ Error: Faltan variables de entorno de Supabase (URL/KEY).');
    }

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
      const baseURL = request.url.split('/api')[0];
      
      const reference = trans.reference; // Ej: NUDITOS-123456789
      const match = reference.match(/NUDITOS-(\d+)/);
      const pedidoId = match ? match[1] : null;

      if (pedidoId && SB_URL && SB_KEY) {
        const finalStatus = trans.status === 'APPROVED' ? 'pagado' : (trans.status === 'DECLINED' || trans.status === 'ERROR' ? 'cancelado' : 'pendiente');
        
        console.log(`[wompi-webhook] Actualizando pedido ${pedidoId} a estado [${finalStatus}]`);
        // Usar Prefer: return=representation para obtener los datos del cliente
        const updateRes = await fetch(`${SB_URL}/rest/v1/pedidos?id=eq.${pedidoId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SB_KEY,
            'Authorization': `Bearer ${SB_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ estado: finalStatus })
        });
        
        const updatedData = await updateRes.json();
        const pedido = updatedData[0];

        // 3. NOTIFICACIONES (Solo si el pago fue aprobado)
        if (finalStatus === 'pagado' && pedido) {
          console.log(`[wompi-webhook] 📧 Disparando notificaciones para pedido ${pedidoId}`);
          
          try {
            // Notificar al cliente (Email)
            await fetch(`${baseURL}/api/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                type: 'compra_confirmada', 
                data: {
                  pedidoId: pedido.id,
                  clienteNombre: pedido.cliente_nombre,
                  clienteEmail: pedido.cliente_email,
                  total: pedido.total,
                  items: pedido.items
                }
              })
            });

            // Notificar al admin (Email)
            await fetch(`${baseURL}/api/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                type: 'notificacion_admin', 
                data: {
                  pedidoId: pedido.id,
                  clienteNombre: pedido.cliente_nombre,
                  clienteEmail: pedido.cliente_email,
                  tel: pedido.cliente_telefono,
                  total: pedido.total,
                  items: pedido.items,
                  notas: pedido.notas
                }
              })
            });

            // Notificación opcional a TELEGRAM (para aviso inmediato al celular)
            const TG_TOKEN = env.TELEGRAM_BOT_TOKEN;
            const TG_CHAT = env.TELEGRAM_CHAT_ID;
            if (TG_TOKEN && TG_CHAT) {
              const text = `💰 *¡NUEVA VENTA!* 🌸\n\n` +
                           `📦 *Pedido:* #${pedido.id}\n` +
                           `👤 *Cliente:* ${pedido.cliente_nombre}\n` +
                           `🏷️ *Items:* ${pedido.items}\n` +
                           `💵 *Total:* $${pedido.total.toLocaleString('es-CO')}\n\n` +
                           `👉 [Ver panel Admin](${baseURL}/admin)`;
              
              await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'Markdown' })
              });
            }

          } catch (err: any) {
            console.error('[wompi-webhook] Error enviando notificaciones:', err.message);
          }
        }
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
