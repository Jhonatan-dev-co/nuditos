import type { APIRoute } from 'astro';

/**
 * NUDITOS — API de Envío de Correos
 * Endpoint: /api/send-email
 * 
 * Este endpoint centraliza el envío de correos usando Resend.
 * Soporta diferentes tipos: compra_confirmada, pedido_enviado, carrito_abandonado.
 */

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env || {};
    const RESEND_API_KEY = env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
    const ADMIN_EMAIL = env.ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL || 'jhona@nuditos.com.co'; // Fallback a correo del dueño

    if (!RESEND_API_KEY) {
      console.error('[send-email] ❌ Error: Faltas RESEND_API_KEY');
      return new Response(JSON.stringify({ error: 'Configuración de correo pendiente' }), { status: 500 });
    }

    const { type, data } = await request.json();

    let subject = '';
    let html = '';
    let to = data.clienteEmail;

    // ── 1. CONFIGURACIÓN SEGÚN TIPO DE CORREO ──────────────────────────
    
    if (type === 'compra_confirmada') {
      subject = `🌸 ¡Pago Confirmado! Pedido #${data.pedidoId} — Nuditos`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #8b5cf6; font-size: 24px; margin: 0;">¡Gracias por tu compra, ${data.clienteNombre}!</h1>
            <p style="color: #666;">Estamos preparando tu ramo con mucho amor.</p>
          </div>
          
          <div style="background: #fdfafc; border-radius: 16px; padding: 25px; border: 1px solid #f3e8ff;">
            <h2 style="font-size: 18px; color: #1a1a1a; margin-top: 0;">Resumen del Pedido</h2>
            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>ID del pedido:</strong> #${data.pedidoId}</p>
              <p style="margin: 5px 0;"><strong>Artículos:</strong> ${data.items}</p>
              <p style="margin: 5px 0; font-size: 1.2em; color: #8b5cf6;"><strong>Total:</strong> $${data.total?.toLocaleString('es-CO')}</p>
            </div>
            
            <p style="font-size: 0.9em; color: #666;">
              Te notificaremos en cuanto el pedido sea entregado a la transportadora con tu número de guía.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #999;">
            <p>Nuditos Tejidos — Detalles hechos con amor 🌸</p>
            <p>Colombia</p>
          </div>
        </div>
      `;
    } 
    else if (type === 'pedido_enviado') {
      subject = `🚚 ¡Tu pedido va en camino! — Nuditos`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #8b5cf6;">¡Hola ${data.clienteNombre}!</h1>
          <p>Tu pedido ya ha sido entregado a la transportadora. Aquí tienes los detalles del envío:</p>
          
          <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>Transportadora:</strong> ${data.transportadora}</p>
            <p><strong>Número de Guía:</strong> <span style="background: #fff; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${data.guia}</span></p>
          </div>
          
          <p>Pronto recibirás tus nuditos. ¡Esperamos que te encanten!</p>
        </div>
      `;
    }
    else if (type === 'carrito_abandonado') {
      subject = `🌸 ¡Dejaste algo hermoso en tu carrito! — Nuditos`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #8b5cf6;">¡Hola ${data.clienteNombre}!</h1>
          <p>Notamos que dejaste algunos nuditos en tu carrito. Las flores eternas se agotan rápido, ¡no te quedes sin las tuyas!</p>
          
          <div style="background: #fdfafc; border-radius: 12px; padding: 20px; border: 1px solid #f3e8ff; margin: 20px 0;">
            <p><strong>En tu carrito:</strong></p>
            <p>${data.items?.map((i: any) => `- ${i.qty}x ${i.name}`).join('<br>')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${request.url.split('/api')[0]}/checkout" style="background: #8b5cf6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Terminar mi compra</a>
          </div>
        </div>
      `;
    }
    else if (type === 'notificacion_admin') {
      to = ADMIN_EMAIL;
      subject = `🚨 ¡NUEVA VENTA! Pedido #${data.pedidoId}`;
      html = `
        <div style="font-family: sans-serif;">
          <h2>💰 Nueva venta confirmada</h2>
          <p><strong>Cliente:</strong> ${data.clienteNombre} (${data.clienteEmail})</p>
          <p><strong>WhatsApp:</strong> ${data.tel}</p>
          <p><strong>Pedido:</strong> ${data.items}</p>
          <p><strong>Total:</strong> $${data.total?.toLocaleString('es-CO')}</p>
          <p><strong>Dirección:</strong> ${data.notas}</p>
          <hr/>
          <a href="${request.url.split('/api')[0]}/admin" style="background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir al Panel Admin</a>
        </div>
      `;
    }

    // ── 2. ENVÍO REAL A RESEND ───────────────────────────────────────
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Nuditos Tejidos <hola@nuditos.com.co>',
        to: to,
        subject: subject,
        html: html
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[send-email] Resend Error:', err);
      return new Response(JSON.stringify({ error: 'Falla al enviar' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err: any) {
    console.error('[send-email] Fatal Error:', err.message);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), { status: 500 });
  }
};
