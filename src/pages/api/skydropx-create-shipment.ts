import type { APIRoute } from 'astro';

/**
 * NUDITOS — API para Generar Órdenes y Guías en Skydropx Colombia desde Panel Admin
 * Endpoint: /api/skydropx-create-shipment
 */

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env || {};
    const SKYDROPX_KEY = request.headers.get('x-skydropx-key') || env.SKYDROPX_API_KEY || import.meta.env.SKYDROPX_API_KEY || (typeof process !== 'undefined' ? process.env.SKYDROPX_API_KEY : '');
    const SKYDROPX_SECRET = request.headers.get('x-skydropx-secret') || env.SKYDROPX_API_SECRET || import.meta.env.SKYDROPX_API_SECRET || (typeof process !== 'undefined' ? process.env.SKYDROPX_API_SECRET : '');

    const SB_URL = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    const { pedidoId, carrier } = await request.json();

    if (!pedidoId) {
      return new Response(JSON.stringify({ error: 'Falta pedidoId' }), { status: 400 });
    }

    // 1. Obtener pedido de Supabase
    let pedido: any = null;
    try {
      const pRes = await fetch(`${SB_URL}/rest/v1/pedidos?id=eq.${pedidoId}`, {
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`
        }
      });
      const pData = await pRes.json();
      if (Array.isArray(pData) && pData.length > 0) {
        pedido = pData[0];
      }
    } catch(e) {}

    // Si no hay API Key de Skydropx configurada
    if (!SKYDROPX_KEY) {
      return new Response(JSON.stringify({ error: 'Falta la API Key de Skydropx' }), { status: 400 });
    }

    // 2. Autenticación OAuth 2 con Skydropx Colombia
    let accessToken = SKYDROPX_KEY;
    if (SKYDROPX_SECRET) {
      try {
        const tokenRes = await fetch('https://pro.skydropx.com.co/api/v1/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: SKYDROPX_KEY,
            client_secret: SKYDROPX_SECRET
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
        }
      } catch (err) {
        console.warn('[skydropx-oauth] Error:', err);
      }
    }

    // 3. Crear orden real en Skydropx Colombia (Aparece en pro.skydropx.com.co / Órdenes)
    const orderPayload = {
      order: {
        order_number: `PED-${pedidoId}-${Date.now().toString().slice(-4)}`,
        shipping_address: {
          name: pedido?.cliente || 'Cliente Nuditos',
          phone: pedido?.tel || pedido?.cliente_telefono || '3000000000',
          email: pedido?.clienteEmail || pedido?.cliente_email || 'hola@nuditos.com.co',
          street1: pedido?.notas || pedido?.direccion || 'Calle Principal',
          city: pedido?.ciudad || 'Bogotá',
          province: pedido?.departamento || 'Bogotá D.C.',
          country: 'CO'
        },
        parcels: [{
          weight: 0.5,
          length: 20,
          width: 15,
          height: 10,
          declared_amount: pedido?.total || 45000
        }],
        line_items: [{
          title: pedido?.items || 'Producto Nuditos Tejidos',
          quantity: 1,
          price: pedido?.total || 45000
        }]
      }
    };

    const orderRes = await fetch('https://pro.skydropx.com.co/api/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await orderRes.json();

    if (orderRes.ok && orderData.data?.id) {
      return new Response(JSON.stringify({
        success: true,
        orderId: orderData.data.id,
        tracking_number: orderData.data.id,
        message: 'Orden creada exitosamente en Skydropx Colombia',
        data: orderData.data
      }), { status: 200 });
    } else {
      return new Response(JSON.stringify({
        error: orderData.errors || orderData.message || 'Error al crear la orden en Skydropx'
      }), { status: orderRes.status });
    }

  } catch (err: any) {
    console.error('[skydropx-create] Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
