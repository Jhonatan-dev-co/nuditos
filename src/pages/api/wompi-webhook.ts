import type { APIRoute } from 'astro';
import { getLiveConfig } from '../../lib/supabase';

// Helper para actualizar Supabase sin auth completa (usando service role de ser posible, o anon si hay RLS abierto)
async function updatePedidoStatus(pedidoId: string, status: string, transactionId: string) {
  const SB_URL = 'https://fpyhkxikxdwjhukltmqf.supabase.co';
  // Usamos el API KEY del .env para tener permisos de escritura (Server side)
  const SB_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY; 

  const finalStatus = status === 'APPROVED' ? 'pagado' : (status === 'DECLINED' ? 'cancelado' : 'error');

  try {
    const res = await fetch(`${SB_URL}/rest/v1/pedidos?id=eq.${pedidoId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        estado: finalStatus,
        notas: `Wompi ID: ${transactionId} | Estado: ${status}`
      })
    });
    return res.ok;
  } catch (e) {
    console.error('[webhook] Error updating supabase:', e);
    return false;
  }
}

async function verifySignature(body: any, secret: string) {
  const { data, timestamp, signature } = body;
  const transaction = data.transaction;
  
  // Wompi concatena las propiedades indicadas en signature.properties
  // Por defecto: id, status, amount_in_cents
  const rawString = 
    transaction.id + 
    transaction.status + 
    transaction.amount_in_cents + 
    timestamp + 
    secret;

  const encoder = new TextEncoder();
  const dataUint8 = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === signature.checksum;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('[Wompi Webhook] Received:', JSON.stringify(body, null, 2));

    const config = await getLiveConfig();
    const eventSecret = config?.wompiEvents;

    // 1. Validar firma si hay secreto configurado
    if (eventSecret && eventSecret !== '') {
      const isValid = await verifySignature(body, eventSecret);
      if (!isValid) {
        console.warn('[Wompi Webhook] Invalid signature');
        return new Response(JSON.stringify({ error: 'invalid_signature' }), { status: 401 });
      }
    }

    const { event, data } = body;
    if (event === 'transaction.updated') {
      const { id, status, reference } = data.transaction;
      
      // Extraer el ID del pedido de la referencia (ej: NUD-123-TIME -> 123)
      // Nuestra referencia actual en checkout.astro es `NUDITOS-${pedido.id}`
      const match = reference.match(/NUDITOS-(\d+)/);
      const pedidoId = match ? match[1] : null;

      if (pedidoId) {
        console.log(`[Wompi Webhook] Updating order ${pedidoId} to ${status}`);
        await updatePedidoStatus(pedidoId, status, id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[Wompi Webhook] Error:', err);
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500 });
  }
};
