/* ══════════════════════════════════════════
   NUDITOS — Disparadores de correos
   js/emails.js
   ══════════════════════════════════════════ */

const EMAILS_ENDPOINT = '/.netlify/functions/send-email';

/* ════════════════════════════
   ENVIAR CORREO (función base)
════════════════════════════ */
async function enviarCorreo(type, data) {
  try {
    const res = await fetch(EMAILS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    if (!res.ok) throw new Error('Error en la función');
    return true;
  } catch (err) {
    console.warn('Correo no enviado:', err.message);
    return false;
  }
}

/* ════════════════════════════
   CORREO 1 — Compra confirmada
   Llamar después de confirmar pago de Wompi
════════════════════════════ */
async function correoCompraConfirmada({ clienteEmail, clienteNombre, items, total, pedidoId }) {
  return enviarCorreo('compra_confirmada', { clienteEmail, clienteNombre, items, total, pedidoId });
}

/* ════════════════════════════
   CORREO 2 — Pedido enviado
   Llamar desde el panel admin cuando cambias estado a "enviado"
════════════════════════════ */
async function correoPedidoEnviado({ clienteEmail, clienteNombre, guia, transportadora }) {
  return enviarCorreo('pedido_enviado', { clienteEmail, clienteNombre, guia, transportadora });
}

/* ════════════════════════════
   CORREO 3 — Carrito abandonado
   Se activa automáticamente a los 30 minutos de inactividad
════════════════════════════ */
let carritoAbandonadoTimer = null;

function iniciarTimerCarritoAbandonado(clienteEmail, clienteNombre, items) {
  // Cancelar timer anterior si existe
  if (carritoAbandonadoTimer) clearTimeout(carritoAbandonadoTimer);

  // Solo activar si hay email y productos
  if (!clienteEmail || !items || items.length === 0) return;

  // Esperar 30 minutos (1800000 ms) — cambiar a 120000 para probar (2 min)
  carritoAbandonadoTimer = setTimeout(async () => {
    // Verificar que aún no haya comprado (carrito sigue igual)
    const carritoActual = JSON.parse(localStorage.getItem('nuditos_cart') || '[]');
    if (carritoActual.length > 0) {
      await enviarCorreo('carrito_abandonado', { clienteEmail, clienteNombre, items });
      console.log('📧 Correo carrito abandonado enviado a', clienteEmail);
    }
  }, 1800000);
}

function cancelarTimerCarritoAbandonado() {
  if (carritoAbandonadoTimer) {
    clearTimeout(carritoAbandonadoTimer);
    carritoAbandonadoTimer = null;
  }
}

/* ════════════════════════════
   RECOPILAR EMAIL DEL CLIENTE
   Muestra un popup suave pidiendo el email antes del checkout
════════════════════════════ */
function pedirEmailCliente() {
  return new Promise((resolve) => {
    // Si ya tenemos el email guardado, usarlo directamente
    const emailGuardado = localStorage.getItem('nuditos_cliente_email');
    const nombreGuardado = localStorage.getItem('nuditos_cliente_nombre');
    if (emailGuardado) {
      resolve({ email: emailGuardado, nombre: nombreGuardado || '' });
      return;
    }

    // Crear popup
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;
      display:flex;align-items:center;justify-content:center;padding:1rem;
    `;

    overlay.innerHTML = `
      <div style="background:white;border-radius:24px;padding:2rem;width:min(400px,90vw);text-align:center;box-shadow:0 20px 60px rgba(140,95,173,0.2);">
        <div style="font-size:2.5rem;margin-bottom:0.8rem;">🌸</div>
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:400;color:#1a1220;margin:0 0 0.4rem;">Casi listo</h3>
        <p style="font-size:0.85rem;color:#8a7592;margin:0 0 1.5rem;line-height:1.6;">
          Déjanos tu correo para enviarte la confirmación de tu pedido y el número de seguimiento.
        </p>
        <input id="emailPopupNombre" type="text" placeholder="Tu nombre" style="
          width:100%;padding:0.75rem 1rem;border:1.5px solid #f3edf9;border-radius:12px;
          font-family:'Jost',sans-serif;font-size:0.9rem;outline:none;margin-bottom:0.8rem;
          color:#1a1220;background:#faf8f5;box-sizing:border-box;
        ">
        <input id="emailPopupInput" type="email" placeholder="tu@correo.com" style="
          width:100%;padding:0.75rem 1rem;border:1.5px solid #f3edf9;border-radius:12px;
          font-family:'Jost',sans-serif;font-size:0.9rem;outline:none;margin-bottom:1rem;
          color:#1a1220;background:#faf8f5;box-sizing:border-box;
        ">
        <div style="display:flex;gap:0.8rem;">
          <button id="emailPopupSkip" style="
            flex:1;background:#faf8f5;color:#8a7592;border:1.5px solid #f0ece6;
            padding:0.75rem;border-radius:50px;font-family:'Jost',sans-serif;
            font-size:0.85rem;cursor:pointer;
          ">Omitir</button>
          <button id="emailPopupOk" style="
            flex:2;background:#8c5fad;color:white;border:none;
            padding:0.75rem;border-radius:50px;font-family:'Jost',sans-serif;
            font-size:0.9rem;font-weight:600;cursor:pointer;
          ">Continuar</button>
        </div>
        <p style="font-size:0.72rem;color:#c4b5cc;margin:0.8rem 0 0;">
          No enviamos spam. Solo confirmaciones de tu pedido. 🌸
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById('emailPopupInput');
    const nombreInput = document.getElementById('emailPopupNombre');

    document.getElementById('emailPopupOk').onclick = () => {
      const email = input.value.trim();
      const nombre = nombreInput.value.trim();
      if (email && email.includes('@')) {
        localStorage.setItem('nuditos_cliente_email', email);
        if (nombre) localStorage.setItem('nuditos_cliente_nombre', nombre);
        document.body.removeChild(overlay);
        resolve({ email, nombre });
      } else {
        input.style.borderColor = '#e74c3c';
        input.focus();
      }
    };

    document.getElementById('emailPopupSkip').onclick = () => {
      document.body.removeChild(overlay);
      resolve({ email: null, nombre: null });
    };

    // Enter para confirmar
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('emailPopupOk').click();
    });

    setTimeout(() => input.focus(), 100);
  });
}
