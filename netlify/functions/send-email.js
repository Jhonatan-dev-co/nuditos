// netlify/functions/send-email.js
// Nuditos Tejidos — Correos automáticos con Resend

const RESEND_API_KEY = 're_DupcdpC9_7VJLDF5R24RUurygDKkJ9jhR';
const ADMIN_EMAIL = 'Jhonatanjr1212@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev'; // Cambiar por hola@nuditos.com.co cuando tengas dominio

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { type, data } = body;

  try {
    switch (type) {
      case 'compra_confirmada':
        await sendCompraConfirmada(data);
        break;
      case 'pedido_enviado':
        await sendPedidoEnviado(data);
        break;
      case 'carrito_abandonado':
        await sendCarritoAbandonado(data);
        break;
      case 'cupon_segunda_compra':
        await sendCuponSegundaCompra(data);
        break;
      default:
        return { statusCode: 400, body: 'Tipo de correo no válido' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Error enviando correo:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

/* ══════════════════════════════════════
   CORREO 1 — Compra confirmada
══════════════════════════════════════ */
async function sendCompraConfirmada(data) {
  const { clienteEmail, clienteNombre, items, total, pedidoId } = data;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3edf9;font-size:14px;color:#4a3d52;">
        ${item.emoji || '🌸'} ${item.name}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3edf9;font-size:14px;color:#8c5fad;text-align:right;font-weight:600;">
        ${item.qty > 1 ? `x${item.qty} · ` : ''}$${Number(item.price * (item.qty||1)).toLocaleString('es-CO')}
      </td>
    </tr>
  `).join('');

  const html = emailBase({
    titulo: '¡Tu pedido está confirmado! 🌸',
    subtitulo: `Hola ${clienteNombre || 'amor'}, recibimos tu pedido y ya estamos tejiendo con mucho cariño.`,
    contenido: `
      <h3 style="font-family:'Georgia',serif;font-size:18px;color:#1a1220;margin:24px 0 12px;">Tu pedido</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsHtml}
        <tr>
          <td style="padding:14px 0 0;font-weight:700;font-size:15px;color:#1a1220;">Total pagado</td>
          <td style="padding:14px 0 0;font-weight:700;font-size:15px;color:#8c5fad;text-align:right;">$${Number(total).toLocaleString('es-CO')}</td>
        </tr>
      </table>
      <div style="background:#faf6fd;border-radius:12px;padding:16px;margin:24px 0;">
        <p style="margin:0;font-size:13px;color:#8a7592;line-height:1.6;">
          ⏱️ <strong style="color:#4a3d52;">Tiempo de elaboración:</strong> 1 a 3 días hábiles<br>
          📦 <strong style="color:#4a3d52;">Luego te avisamos</strong> cuando esté en camino con el número de guía<br>
          💬 <strong style="color:#4a3d52;">¿Dudas?</strong> Escríbenos por WhatsApp
        </p>
      </div>
    `,
    botonTexto: 'Escribir por WhatsApp',
    botonUrl: 'https://wa.me/573144931525',
    extra: `<p style="font-size:12px;color:#8a7592;text-align:center;margin-top:8px;">Pedido #${pedidoId || 'NU-' + Date.now()}</p>`
  });

  // Correo al cliente
  await resendSend({
    from: FROM_EMAIL,
    to: clienteEmail,
    subject: '🌸 ¡Tu pedido de Nuditos está confirmado!',
    html
  });

  // Notificación al admin
  await resendSend({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🛍️ Nuevo pedido — $${Number(total).toLocaleString('es-CO')} — ${clienteNombre || clienteEmail}`,
    html: `<p>Nuevo pedido recibido.<br><br>
      <strong>Cliente:</strong> ${clienteNombre || 'Sin nombre'}<br>
      <strong>Email:</strong> ${clienteEmail}<br>
      <strong>Total:</strong> $${Number(total).toLocaleString('es-CO')}<br><br>
      <strong>Productos:</strong><br>
      ${items.map(i => `• ${i.name} x${i.qty||1} — $${Number(i.price*(i.qty||1)).toLocaleString('es-CO')}`).join('<br>')}
    </p>`
  });

  // Enviar cupón de segunda compra automáticamente
  await sendCuponSegundaCompra({ clienteEmail, clienteNombre });
}

/* ══════════════════════════════════════
   CORREO 2 — Pedido enviado
══════════════════════════════════════ */
async function sendPedidoEnviado(data) {
  const { clienteEmail, clienteNombre, guia, transportadora } = data;

  const html = emailBase({
    titulo: '¡Tu ramo está en camino! 🚚',
    subtitulo: `${clienteNombre ? `Hola ${clienteNombre}, t` : 'T'}u pedido ya fue despachado y pronto estará en tus manos.`,
    contenido: `
      <div style="background:#eaf7f0;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#4fa876;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Número de guía</p>
        <p style="margin:0;font-size:24px;font-weight:700;color:#1a1220;letter-spacing:2px;">${guia || 'Pendiente'}</p>
        ${transportadora ? `<p style="margin:8px 0 0;font-size:12px;color:#8a7592;">${transportadora}</p>` : ''}
      </div>
      <div style="background:#faf6fd;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#8a7592;line-height:1.7;">
          📍 Puedes rastrear tu pedido con el número de guía en la página de la transportadora.<br>
          ⏱️ Tiempo estimado de entrega: <strong style="color:#4a3d52;">2 a 5 días hábiles</strong> según tu ciudad.<br>
          💬 ¿Algún problema? Escríbenos por WhatsApp.
        </p>
      </div>
    `,
    botonTexto: 'Escribir por WhatsApp',
    botonUrl: 'https://wa.me/573144931525'
  });

  await resendSend({
    from: FROM_EMAIL,
    to: clienteEmail,
    subject: '🚚 Tu pedido de Nuditos ya está en camino',
    html
  });
}

/* ══════════════════════════════════════
   CORREO 3 — Carrito abandonado
══════════════════════════════════════ */
async function sendCarritoAbandonado(data) {
  const { clienteEmail, clienteNombre, items } = data;

  const itemsHtml = (items || []).map(item => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3edf9;">
      <span style="font-size:28px;">${item.emoji || '🌸'}</span>
      <div>
        <p style="margin:0;font-size:14px;font-weight:600;color:#1a1220;">${item.name}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#8c5fad;">$${Number(item.price).toLocaleString('es-CO')}</p>
      </div>
    </div>
  `).join('');

  const html = emailBase({
    titulo: '¡Olvidaste algo! 🌸',
    subtitulo: `${clienteNombre ? `Hola ${clienteNombre}, ` : ''}dejaste flores hermosas en tu carrito. ¡Todavía están esperando por ti!`,
    contenido: `
      <h3 style="font-family:'Georgia',serif;font-size:16px;color:#1a1220;margin:20px 0 12px;">Tu carrito</h3>
      ${itemsHtml}
      <div style="background:#faf6fd;border-radius:12px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#8a7592;line-height:1.6;">
          🌸 Cada ramo es hecho a mano con mucho amor.<br>
          ⏱️ El stock es limitado — los personalizados pueden demorar más si se acumulan pedidos.
        </p>
      </div>
    `,
    botonTexto: 'Completar mi compra',
    botonUrl: 'https://nuditos-tejidos.netlify.app'
  });

  await resendSend({
    from: FROM_EMAIL,
    to: clienteEmail,
    subject: '🌸 Tus flores te están esperando — Nuditos',
    html
  });
}

/* ══════════════════════════════════════
   CORREO 4 — Cupón segunda compra
══════════════════════════════════════ */
async function sendCuponSegundaCompra(data) {
  const { clienteEmail, clienteNombre } = data;

  const html = emailBase({
    titulo: '¡Gracias por tu compra! 🎁',
    subtitulo: `${clienteNombre ? `${clienteNombre}, ` : ''}queremos que vuelvas. Aquí tienes un regalo especial para tu próximo pedido.`,
    contenido: `
      <div style="background:linear-gradient(135deg,#f3edf9,#eaf7f0);border-radius:16px;padding:28px;margin:20px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#8a7592;text-transform:uppercase;letter-spacing:2px;">Tu cupón exclusivo</p>
        <p style="margin:0;font-size:32px;font-weight:700;color:#8c5fad;letter-spacing:4px;">NUDITOS10</p>
        <p style="margin:10px 0 0;font-size:14px;color:#4a3d52;">10% de descuento en tu próximo pedido</p>
      </div>
      <div style="background:#faf6fd;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#8a7592;line-height:1.7;">
          ✅ Válido para cualquier producto del catálogo<br>
          ✅ Aplícalo en el carrito antes de pagar<br>
          ⚠️ Un solo uso por cliente
        </p>
      </div>
    `,
    botonTexto: 'Ir a la tienda',
    botonUrl: 'https://nuditos-tejidos.netlify.app'
  });

  await resendSend({
    from: FROM_EMAIL,
    to: clienteEmail,
    subject: '🎁 Tu cupón de 10% para tu próxima compra — Nuditos',
    html
  });
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
async function resendSend({ from, to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
}

function emailBase({ titulo, subtitulo, contenido, botonTexto, botonUrl, extra = '' }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="100%" style="max-width:560px;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 30px rgba(140,95,173,0.12);" cellpadding="0" cellspacing="0">

        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#f3edf9,#eaf7f0);padding:36px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:28px;font-family:'Georgia',serif;font-weight:400;color:#1a1220;letter-spacing:4px;">NUDITOS<span style="color:#8c5fad;">.</span></p>
          <p style="margin:0;font-size:11px;color:#8a7592;letter-spacing:2px;text-transform:uppercase;">Flores tejidas con amor</p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:36px 40px;">
          <h1 style="margin:0 0 12px;font-family:'Georgia',serif;font-size:22px;font-weight:400;color:#1a1220;line-height:1.3;">${titulo}</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#8a7592;line-height:1.7;">${subtitulo}</p>
          ${contenido}
          <div style="text-align:center;margin:28px 0 0;">
            <a href="${botonUrl}" style="display:inline-block;background:#8c5fad;color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">${botonTexto}</a>
          </div>
          ${extra}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#faf6fd;padding:24px 40px;text-align:center;border-top:1px solid #f3edf9;">
          <p style="margin:0 0 8px;font-size:12px;color:#8a7592;">Síguenos en Instagram</p>
          <a href="https://www.instagram.com/nuditos_tejidos/" style="font-size:12px;color:#8c5fad;text-decoration:none;">@nuditos_tejidos</a>
          <p style="margin:16px 0 0;font-size:11px;color:#c4b5cc;">© 2025 Nuditos Tejidos · El Dorado, Meta, Colombia 🇨🇴</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
