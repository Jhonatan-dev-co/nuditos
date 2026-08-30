import type { APIRoute } from 'astro';

/**
 * NUDITOS — API de Envío de Correos Profesional
 * Endpoint: /api/send-email
 * 
 * Correos e-commerce profesionales utilizando íconos SVG vectoriales limpios
 * sin depender de emojis ni fuentes externas.
 */

export const prerender = false;

// ── SVG ICONS OFICIALES (Compatibles con todos los clientes de correo) ──
const SVG_ICONS = {
  flower: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5m0 0V12m0 0H12"/></svg>`,
  shoppingBag: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  package: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-8.95-5.16"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  truck: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  gift: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#db2777" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  checkCircle: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertTriangle: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  shoppingCart: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  dollarSign: `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  mail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  camera: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c5fad" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`
};

function escapeHtml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── HELPER: Buscar imagen del producto en Supabase por nombre ──
async function getProductImage(productName: string, sbUrl: string, sbKey: string): Promise<string> {
  try {
    const cleanName = productName.replace(/^\d+x\s*/, '').trim();
    const res = await fetch(
      `${sbUrl}/rest/v1/productos?select=nombre,img&nombre=ilike.*${encodeURIComponent(cleanName)}*&limit=1`,
      { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
    );
    const data = await res.json();
    if (data?.[0]?.img) return data[0].img;
  } catch (e) { /* fallback */ }
  return 'https://res.cloudinary.com/dzxgu27wr/image/upload/w_140,h_140,c_fill,q_auto,f_auto/v1776121095/nuditos-products/flor-y-miel-ramo-tejido-crochet-r4qg.jpg';
}

// ── HELPER: Parsear items string a array ──
function parseItems(itemsStr: string): Array<{qty: number, name: string}> {
  if (!itemsStr) return [];
  return itemsStr.split(',').map(s => {
    const match = s.trim().match(/^(\d+)x\s*(.+)$/);
    if (match) return { qty: parseInt(match[1]), name: match[2].trim() };
    return { qty: 1, name: s.trim() };
  });
}

// ── ESTILOS COMPARTIDOS ──
const brandColor = '#8c5fad';
const brandDark = '#6b3fa0';
const warmBg = '#faf7f5';
const cardBg = '#ffffff';
const textPrimary = '#1a1220';
const textSecondary = '#6b5e74';
const textMuted = '#9a8da3';
const accentGreen = '#059669';
const accentPink = '#db2777';
const accentOrange = '#d97706';
const borderLight = '#f0e8f5';

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  @media only screen and (max-width:620px) {
    .email-container { width:100%!important; padding:0!important; }
    .email-pad { padding-left:20px!important; padding-right:20px!important; }
    .email-pad-sm { padding-left:16px!important; padding-right:16px!important; }
    .email-btn { display:block!important; width:100%!important; padding:18px 16px!important; font-size:16px!important; text-align:center!important; box-sizing:border-box!important; }
    .email-btn-outline { display:block!important; width:100%!important; padding:16px 16px!important; font-size:15px!important; text-align:center!important; box-sizing:border-box!important; }
    .email-h1 { font-size:24px!important; line-height:1.3!important; }
    .email-h2 { font-size:20px!important; }
    .email-body { font-size:15px!important; line-height:1.6!important; }
    .email-card { border-radius:14px!important; }
    .email-card-inner { padding:16px!important; }
    .email-guia { font-size:18px!important; padding:10px 16px!important; letter-spacing:1.5px!important; }
    .email-total { font-size:20px!important; }
    .email-progress-label { font-size:9px!important; }
    .email-progress-dot { width:28px!important; height:28px!important; }
    .email-product-img { width:60px!important; height:60px!important; }
    .email-footer-pad { padding:24px 20px 20px!important; }
    .email-hero-pad { padding:28px 20px 16px!important; }
    .email-divider-pad { padding:0 20px!important; }
    .email-info-text { font-size:13px!important; }
    .hide-mobile { display:none!important; }
    .logo-text { letter-spacing:1px!important; }
    .social-links { display:block!important; margin-bottom:8px!important; }
    .social-sep { display:none!important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${warmBg};font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${warmBg};">
    <tr><td align="center" style="padding:16px 8px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" class="email-container" style="max-width:600px;width:100%;">
        <!-- Logo Header -->
        <tr><td class="email-hero-pad" style="text-align:center;padding:24px 0 8px;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;padding-right:6px;">${SVG_ICONS.flower}</td>
              <td class="logo-text" style="font-size:26px;font-weight:300;color:${brandColor};letter-spacing:3px;font-family:Georgia,'Times New Roman',serif;">NUDITOS</td>
            </tr>
            <tr>
              <td colspan="2" style="font-size:10px;color:${textMuted};letter-spacing:4px;text-transform:uppercase;text-align:center;padding-top:2px;">TEJIDOS A CROCHET</td>
            </tr>
          </table>
        </td></tr>
        <!-- Divider -->
        <tr><td class="email-divider-pad" style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,${borderLight},transparent);"></div></td></tr>
        <!-- Content -->
        <tr><td style="padding:0;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td class="email-footer-pad" style="padding:32px 40px 24px;text-align:center;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,${borderLight},transparent);margin-bottom:24px;"></div>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr>
              <td class="social-links" style="padding:0 8px;"><a href="https://www.instagram.com/nuditos_tejidos" style="color:${textMuted};text-decoration:none;font-size:13px;">Instagram</a></td>
              <td class="social-sep" style="color:${borderLight};padding:0 4px;">•</td>
              <td class="social-links" style="padding:0 8px;"><a href="https://wa.me/573144931525" style="color:${textMuted};text-decoration:none;font-size:13px;">WhatsApp</a></td>
              <td class="social-sep" style="color:${borderLight};padding:0 4px;">•</td>
              <td class="social-links" style="padding:0 8px;"><a href="https://nuditos.com.co" style="color:${textMuted};text-decoration:none;font-size:13px;">Tienda</a></td>
            </tr>
          </table>
          <p style="font-size:11px;color:${textMuted};margin:16px 0 0;line-height:1.5;">
            Nuditos Tejidos — Flores eternas hechas con amor<br>
            Colombia · hola@nuditos.com.co
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── BARRA DE PROGRESO DE ENVÍO CON ÍCONOS SVG VECTORIALES ──
function shippingProgress(step: number): string {
  const steps = ['Confirmado', 'Preparando', 'Enviado', 'En camino', 'Entregado'];
  const svgIcons = [
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5m0 0V12m0 0H12"/></svg>`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
  ];

  let html = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;"><tr>`;
  steps.forEach((s, i) => {
    const isActive = i <= step;
    const isCurrent = i === step;
    const color = isActive ? brandColor : '#ddd5e3';
    const textColor = isActive ? brandColor : textMuted;
    const weight = isCurrent ? 'bold' : 'normal';
    html += `<td style="text-align:center;width:20%;">
      <div class="email-progress-dot" style="width:36px;height:36px;border-radius:50%;background:${isActive ? brandColor : '#f5f0f8'};color:${isActive ? '#fff' : textMuted};display:flex;align-items:center;justify-content:center;margin:0 auto;line-height:36px;text-align:center;">${svgIcons[i]}</div>
      <div class="email-progress-label" style="font-size:10px;color:${textColor};margin-top:6px;font-weight:${weight};">${s}</div>
    </td>`;
  });
  html += `</tr></table>`;
  return html;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env || {};
    const RESEND_API_KEY = env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
    const ADMIN_EMAIL = env.ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL || 'jhona@nuditos.com.co';
    const SB_URL = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!RESEND_API_KEY) {
      console.error('[send-email] ❌ Error: Falta RESEND_API_KEY');
      return new Response(JSON.stringify({ error: 'Configuración de correo pendiente' }), { status: 500 });
    }

    const body = await request.json();
    const type = body.type;
    const data = body.data || body;

    let subject = '';
    let html = '';
    let to = data.clienteEmail || data.to;

    // ══════════════════════════════════════════════════════════════════
    // 1. COMPRA CONFIRMADA (Cliente)
    // ══════════════════════════════════════════════════════════════════
    if (type === 'compra_confirmada') {
      subject = `Pedido #${data.pedidoId} confirmado — Nuditos Tejidos`;

      const parsedItems = parseItems(data.items);
      let itemsHtml = '';
      for (const item of parsedItems) {
        const imgUrl = await getProductImage(item.name, SB_URL, SB_KEY);
        const thumbUrl = imgUrl.replace('/upload/', '/upload/w_120,h_120,c_fill,q_auto,f_auto/');
        itemsHtml += `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid ${borderLight};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="80" style="vertical-align:top;">
                    <img src="${thumbUrl}" alt="${item.name}" width="72" height="72" class="email-product-img" style="border-radius:12px;object-fit:cover;display:block;border:1px solid ${borderLight};" />
                  </td>
                  <td style="vertical-align:middle;padding-left:16px;">
                    <div style="font-size:15px;font-weight:600;color:${textPrimary};line-height:1.4;">${item.name}</div>
                    <div style="font-size:13px;color:${textSecondary};margin-top:2px;">Cantidad: ${item.qty}</div>
                    <div class="email-info-text" style="font-size:11px;color:${textMuted};margin-top:4px;">Hecho a mano · Flores eternas</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
      }

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.shoppingBag}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${textPrimary};margin:0;line-height:1.3;">¡Gracias por tu compra, ${data.clienteNombre}!</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">Tu pedido ha sido recibido y estamos preparando tu ramo con mucho amor.</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px;">${shippingProgress(0)}</td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 24px;">
            <div class="email-card" style="background:${cardBg};border-radius:16px;border:1px solid ${borderLight};overflow:hidden;box-shadow:0 2px 16px rgba(140,95,173,0.08);">
              <div class="email-card-inner" style="background:linear-gradient(135deg,${brandColor},${brandDark});padding:24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color:rgba(255,255,255,0.85);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Pedido</td>
                    <td style="text-align:right;color:#fff;font-size:16px;font-weight:700;">#${data.pedidoId}</td>
                  </tr>
                </table>
              </div>
              <div class="email-card-inner" style="padding:8px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${itemsHtml}
                </table>
              </div>
              <div class="email-card-inner" style="padding:24px;background:#faf7f5;border-top:1px solid ${borderLight};">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:14px;color:${textSecondary};">Total pagado</td>
                    <td class="email-total" style="text-align:right;font-size:22px;font-weight:700;color:${brandColor};">$${data.total?.toLocaleString('es-CO')}</td>
                  </tr>
                </table>
              </div>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 24px;">
            <div class="email-card" style="background:#f0ebf8;border-radius:16px;padding:24px;text-align:center;">
              <p class="email-body" style="font-size:15px;color:${brandDark};margin:0;line-height:1.6;">
                Como cada pieza es tejida a mano, tu ramo puede tomar unos días en estar listo.<br>
                Te notificaremos con tu número de guía cuando esté en camino.
              </p>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 32px;text-align:center;">
            <a href="https://nuditos.com.co/catalogo" class="email-btn" style="display:inline-block;background:linear-gradient(135deg, ${brandColor}, ${brandDark});color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(140,95,173,0.25);">Explorar catálogo</a>
          </td></tr>
        </table>
      `);
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. ENVÍO CREADO (Guía generada)
    // ══════════════════════════════════════════════════════════════════
    else if (type === 'pedido_enviado' || type === 'envio_creado') {
      subject = `Tu guía de envío está lista — Pedido #${data.pedidoId || ''}`;

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.package}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${textPrimary};margin:0;line-height:1.3;">¡Tu ramo ya tiene guía!</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">Hemos entregado tu pedido a la transportadora.</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px;">${shippingProgress(2)}</td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 24px;">
            <div class="email-card" style="background:${cardBg};border-radius:16px;border:1px solid ${borderLight};overflow:hidden;box-shadow:0 2px 16px rgba(140,95,173,0.08);">
              <div class="email-card-inner" style="padding:24px;text-align:center;">
                <div style="font-size:12px;color:${textMuted};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Transportadora</div>
                <div style="font-size:18px;font-weight:700;color:${textPrimary};margin-bottom:20px;">${data.transportadora || 'Transportadora'}</div>
                <div style="font-size:12px;color:${textMuted};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Número de guía</div>
                <div class="email-guia" style="display:inline-block;background:linear-gradient(135deg,${brandColor},${brandDark});color:#fff;padding:12px 28px;border-radius:12px;font-size:22px;font-weight:700;letter-spacing:2px;user-select:all;-webkit-user-select:all;cursor:pointer;">${data.guia}</div>
                <div style="margin-top:12px;"><span style="display:inline-block;background:#f0ebf8;border:1.5px dashed ${brandColor};color:${brandDark};padding:8px 18px;border-radius:30px;font-size:12px;font-weight:700;letter-spacing:0.5px;user-select:all;-webkit-user-select:all;cursor:pointer;">📋 Toca aquí para seleccionar y copiar guía</span></div>
              </div>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 8px;text-align:center;">
            <a href="https://www.interrapidisimo.com/" class="email-btn" style="display:inline-block;background:linear-gradient(135deg, ${brandColor}, ${brandDark});color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(140,95,173,0.25);">Rastrear en ${data.transportadora || 'la transportadora'}</a>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 32px;text-align:center;">
            <div class="email-card" style="background:#f0ebf8;border-radius:16px;padding:24px;">
              <p class="email-body" style="font-size:15px;color:${brandDark};margin:0;line-height:1.6;">Ingresa tu número de guía <strong>${data.guia}</strong> en el campo "Sigue tu envío" de la web de la transportadora para ver el estado en tiempo real.</p>
            </div>
          </td></tr>
        </table>
      `);
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. EN CAMINO
    // ══════════════════════════════════════════════════════════════════
    else if (type === 'envio_encamino') {
      subject = `¡Tu paquete va en camino! — Nuditos Tejidos`;

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.truck}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${textPrimary};margin:0;line-height:1.3;">¡Tu paquete está viajando!</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">${data.transportadora} tiene tu ramo y lo lleva a tu ciudad.</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px;">${shippingProgress(3)}</td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 24px;">
            <div class="email-card" style="background:#ecfdf5;border-radius:16px;border:1px solid #d1fae5;padding:24px;text-align:center;box-shadow:0 2px 16px rgba(5,150,105,0.08);">
              <div class="email-card-inner">
                <div style="font-size:12px;color:${accentGreen};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Guía de rastreo</div>
                <div class="email-guia" style="display:inline-block;background:#d1fae5;color:${accentGreen};padding:12px 28px;border-radius:12px;font-size:22px;font-weight:700;letter-spacing:2px;user-select:all;-webkit-user-select:all;cursor:pointer;">${data.guia}</div>
                <div style="margin-top:12px;"><span style="display:inline-block;background:#ffffff;border:1.5px dashed ${accentGreen};color:${accentGreen};padding:8px 18px;border-radius:30px;font-size:12px;font-weight:700;letter-spacing:0.5px;user-select:all;-webkit-user-select:all;cursor:pointer;">📋 Toca aquí para seleccionar y copiar guía</span></div>
                <p class="email-body" style="font-size:15px;color:#047857;margin:14px 0 0;line-height:1.6;">El paquete se desplaza hacia tu ciudad.<br>¡Te avisaremos cuando esté en reparto!</p>
              </div>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 32px;text-align:center;">
            <a href="https://www.interrapidisimo.com/" class="email-btn" style="display:inline-block;background:linear-gradient(135deg, ${accentGreen}, #047857);color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(5,150,105,0.25);">Rastrear en ${data.transportadora || 'la transportadora'}</a>
          </td></tr>
        </table>
      `);
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. EN REPARTO
    // ══════════════════════════════════════════════════════════════════
    else if (type === 'envio_reparto') {
      subject = `¡HOY LLEGA TU PAQUETE! — Nuditos Tejidos`;

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.gift}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:${accentPink};margin:0;line-height:1.3;">¡Atento a tu puerta!</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">Tu paquete está en el vehículo de reparto y <strong>llega hoy</strong>.</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px;">${shippingProgress(3)}</td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 16px;">
            <div class="email-card" style="background:#fdf2f8;border-radius:16px;border:1px solid #fbcfe8;padding:24px;text-align:center;box-shadow:0 2px 16px rgba(219,39,119,0.08);">
              <div class="email-card-inner">
                <p style="font-size:13px;color:${accentPink};margin:0 0 8px;font-weight:600;">Número de Guía:</p>
                <div class="email-guia" style="display:inline-block;background:#fbcfe8;color:#9d174d;padding:12px 28px;border-radius:12px;font-size:22px;font-weight:700;letter-spacing:2px;user-select:all;-webkit-user-select:all;cursor:pointer;">${data.guia}</div>
                <div style="margin-top:12px;"><span style="display:inline-block;background:#ffffff;border:1.5px dashed ${accentPink};color:${accentPink};padding:8px 18px;border-radius:30px;font-size:12px;font-weight:700;letter-spacing:0.5px;user-select:all;-webkit-user-select:all;cursor:pointer;">📋 Toca aquí para seleccionar y copiar guía</span></div>
                <p class="email-body" style="font-size:15px;color:#9d174d;margin:12px 0 0;line-height:1.6;">
                  Transportadora: <strong>${data.transportadora}</strong><br>
                  Asegúrate de que haya alguien en la dirección para recibir tu paquete.
                </p>
              </div>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 32px;text-align:center;">
            <a href="https://www.interrapidisimo.com/" class="email-btn" style="display:inline-block;background:linear-gradient(135deg, ${accentPink}, #be185d);color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(219,39,119,0.25);">Rastrear en ${data.transportadora || 'la transportadora'}</a>
          </td></tr>
        </table>
      `);
    }

    // ══════════════════════════════════════════════════════════════════
    // 5. ENTREGADO
    // ══════════════════════════════════════════════════════════════════
    else if (type === 'envio_entregado') {
      subject = `¡Pedido entregado con éxito! — Nuditos Tejidos`;

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.checkCircle}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:${accentGreen};margin:0;line-height:1.3;">¡Entregado!</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">Tu pedido con guía <strong>${data.guia}</strong> ha sido entregado exitosamente.</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px;">${shippingProgress(4)}</td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 24px;">
            <div class="email-card" style="background:#ecfdf5;border-radius:16px;border:1px solid #a7f3d0;padding:28px;text-align:center;box-shadow:0 2px 16px rgba(5,150,105,0.08);">
              <div class="email-card-inner">
                <p style="font-size:16px;color:#047857;margin:0 0 12px;font-weight:600;">Esperamos que disfrutes mucho tus flores eternas</p>
                <p class="email-body" style="font-size:15px;color:#065f46;margin:0;line-height:1.6;">
                  ¡Nos encantaría que compartas una foto etiquetándonos!<br>
                  <strong>@nuditos_tejidos</strong> en Instagram
                </p>
              </div>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 12px;text-align:center;">
            <a href="https://www.instagram.com/nuditos_tejidos" class="email-btn" style="display:inline-block;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(253,29,29,0.25);">Etiquétanos en Instagram</a>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 32px;text-align:center;">
            <a href="https://nuditos.com.co/catalogo" class="email-btn-outline" style="display:inline-block;color:${accentGreen};text-decoration:none;padding:16px 32px;border-radius:12px;font-size:15px;font-weight:600;border:2px solid ${accentGreen};">Explorar más productos</a>
          </td></tr>
        </table>
      `);
    }

    // ══════════════════════════════════════════════════════════════════
    // 6. NOVEDAD
    // ══════════════════════════════════════════════════════════════════
    else if (type === 'envio_novedad') {
      subject = `Novedad con tu envío (Guía #${data.guia}) — Nuditos`;

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.alertTriangle}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${accentOrange};margin:0;line-height:1.3;">Novedad con tu entrega</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">La transportadora ${data.transportadora} reportó una novedad.</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:16px 40px 24px;">
            <div class="email-card" style="background:#fffbeb;border-radius:16px;border:1px solid #fde68a;padding:24px;box-shadow:0 2px 16px rgba(217,119,6,0.08);">
              <div class="email-card-inner">
                <div style="font-size:12px;color:${accentOrange};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-weight:600;">Guía: ${data.guia}</div>
                <p class="email-body" style="font-size:15px;color:#92400e;margin:0 0 16px;line-height:1.6;">
                  <strong>Detalle:</strong> ${data.novedad || 'Dirección no encontrada o cliente ausente. Disponible para reclamo en oficina.'}
                </p>
                <div style="height:1px;background:#fde68a;margin:16px 0;"></div>
                <p class="email-body" style="font-size:15px;color:#b45309;margin:0;line-height:1.6;">Si necesitas ayuda, contáctanos por WhatsApp y te asistiremos de inmediato.</p>
              </div>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 32px;text-align:center;">
            <a href="https://wa.me/573144931525?text=Hola%2C%20tengo%20una%20novedad%20con%20mi%20gu%C3%ADa%20${data.guia}" class="email-btn" style="display:inline-block;background:linear-gradient(135deg, #25D366, #128C7E);color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(37,211,102,0.25);">Escribir por WhatsApp</a>
          </td></tr>
        </table>
      `);
    }

    // ══════════════════════════════════════════════════════════════════
    // 7. CARRITO ABANDONADO
    // ══════════════════════════════════════════════════════════════════
    else if (type === 'carrito_abandonado') {
      subject = `Dejaste algo hermoso en tu carrito — Nuditos Tejidos`;

      let cartItemsHtml = '';
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const imgUrl = await getProductImage(item.name, SB_URL, SB_KEY);
          const thumbUrl = imgUrl.replace('/upload/', '/upload/w_120,h_120,c_fill,q_auto,f_auto/');
          cartItemsHtml += `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid ${borderLight};">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="64" style="vertical-align:top;">
                      <img src="${thumbUrl}" alt="${item.name}" width="56" height="56" class="email-product-img" style="border-radius:12px;object-fit:cover;display:block;border:1px solid ${borderLight};" />
                    </td>
                    <td style="vertical-align:middle;padding-left:12px;">
                      <div style="font-size:15px;font-weight:600;color:${textPrimary};">${item.name}</div>
                      <div class="email-info-text" style="font-size:13px;color:${textMuted};margin-top:2px;">Cantidad: ${item.qty}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
        }
      }

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.shoppingCart}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${textPrimary};margin:0;line-height:1.3;">¡Hola ${data.clienteNombre}!</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">Notamos que dejaste algunos nuditos en tu carrito.<br>Las flores eternas se agotan rápido, ¡no te quedes sin las tuyas!</p>
          </td></tr>
        </table>
        ${cartItemsHtml ? `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 24px;">
            <div class="email-card" style="background:${cardBg};border-radius:16px;border:1px solid ${borderLight};padding:24px;box-shadow:0 2px 16px rgba(140,95,173,0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-card-inner">
                ${cartItemsHtml}
              </table>
            </div>
          </td></tr>
        </table>` : ''}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 12px;text-align:center;">
            <a href="https://nuditos.com.co/checkout" class="email-btn" style="display:inline-block;background:linear-gradient(135deg, ${brandColor}, ${brandDark});color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(140,95,173,0.25);">Terminar mi compra</a>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 32px;text-align:center;">
            <a href="https://nuditos.com.co/catalogo" class="email-btn-outline" style="display:inline-block;color:${brandColor};text-decoration:none;padding:16px 32px;border-radius:12px;font-size:15px;font-weight:600;border:2px solid ${brandColor};">Agregar más productos</a>
          </td></tr>
        </table>
      `);
    }

    // ══════════════════════════════════════════════════════════════════
    // 8. NOTIFICACIÓN ADMIN (Foto HD real desde Supabase + Íconos SVG)
    // ══════════════════════════════════════════════════════════════════
    else if (type === 'notificacion_admin') {
      to = ADMIN_EMAIL;
      subject = `NUEVA VENTA! Pedido #${data.pedidoId} — $${data.total?.toLocaleString('es-CO')}`;

      const parsedItems = parseItems(data.items);
      let adminItemsHtml = '';

      for (const item of parsedItems) {
        const imgUrl = await getProductImage(item.name, SB_URL, SB_KEY);
        const thumbUrl = imgUrl.replace('/upload/', '/upload/w_140,h_140,c_fill,q_auto,f_auto/');

        adminItemsHtml += `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid ${borderLight};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="90" style="vertical-align:top;">
                    <a href="${imgUrl}" target="_blank">
                      <img src="${thumbUrl}" alt="${item.name}" width="80" height="80" class="email-product-img" style="border-radius:14px;object-fit:cover;display:block;border:2px solid ${brandColor};box-shadow:0 4px 10px rgba(140,95,173,0.15);" />
                    </a>
                  </td>
                  <td style="vertical-align:middle;padding-left:16px;">
                    <div style="font-size:16px;font-weight:700;color:${textPrimary};line-height:1.3;">${item.name}</div>
                    <div class="email-info-text" style="font-size:14px;color:${brandColor};font-weight:600;margin-top:4px;">Cantidad a tejer: ${item.qty} ud(s)</div>
                    <div class="email-info-text" style="font-size:13px;color:${textMuted};margin-top:4px;">Producto oficial Nuditos Tejidos</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
      }

      html = emailWrapper(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad email-hero-pad" style="padding:32px 40px 16px;text-align:center;">
            <div style="margin-bottom:12px;">${SVG_ICONS.dollarSign}</div>
            <h1 class="email-h1" style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${accentGreen};margin:0;line-height:1.3;">¡Nueva venta confirmada!</h1>
            <p class="email-body" style="font-size:15px;color:${textSecondary};margin:12px 0 0;line-height:1.6;">Pedido listo para confeccionar y despachar</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:8px 40px 24px;">
            <div class="email-card" style="background:${cardBg};border-radius:16px;border:1px solid ${borderLight};overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
              <div class="email-card-inner" style="background:linear-gradient(135deg,${accentGreen},#047857);padding:24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color:rgba(255,255,255,0.85);font-size:12px;text-transform:uppercase;letter-spacing:1px;">ID de Pedido</td>
                    <td style="text-align:right;color:#fff;font-size:20px;font-weight:700;">#${data.pedidoId}</td>
                  </tr>
                </table>
              </div>

              <!-- Lista de Ramos con Foto HD de Supabase -->
              <div class="email-card-inner" style="padding:24px;background:#fcfafc;border-bottom:1px solid ${borderLight};">
                <div style="font-size:12px;color:${brandColor};text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px;">${SVG_ICONS.camera} Ramos Comprados (Foto en Supabase)</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${adminItemsHtml}
                </table>
              </div>

              <!-- Detalles del Cliente -->
              <div class="email-card-inner" style="padding:24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr><td style="padding:8px 0;border-bottom:1px solid ${borderLight};">
                    <span style="font-size:11px;color:${textMuted};text-transform:uppercase;letter-spacing:1px;">${SVG_ICONS.user} Cliente</span><br>
                    <span style="font-size:15px;color:${textPrimary};font-weight:600;">${data.clienteNombre}</span>
                  </td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid ${borderLight};">
                    <span style="font-size:11px;color:${textMuted};text-transform:uppercase;letter-spacing:1px;">${SVG_ICONS.mail} Email</span><br>
                    <span class="email-body" style="font-size:15px;color:${textPrimary};">${data.clienteEmail}</span>
                  </td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid ${borderLight};">
                    <span style="font-size:11px;color:${textMuted};text-transform:uppercase;letter-spacing:1px;">${SVG_ICONS.phone} WhatsApp / Celular</span><br>
                    <a href="https://wa.me/${(data.tel || '').replace(/\D/g, '')}" target="_blank" style="font-size:15px;color:${accentGreen};font-weight:700;text-decoration:none;">${data.tel} (Abrir Chat)</a>
                  </td></tr>
                  <tr><td style="padding:8px 0;">
                    <span style="font-size:11px;color:${textMuted};text-transform:uppercase;letter-spacing:1px;">${SVG_ICONS.mapPin} Dirección de Envío</span><br>
                    <span class="email-body" style="font-size:15px;color:${textPrimary};">${data.notas}</span>
                  </td></tr>
                </table>
              </div>
              <div class="email-card-inner" style="padding:24px;background:#ecfdf5;border-top:1px solid #d1fae5;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:14px;color:#047857;font-weight:600;">Total Cobrado en Wompi</td>
                    <td class="email-total" style="text-align:right;font-size:24px;font-weight:700;color:${accentGreen};">$${data.total?.toLocaleString('es-CO')}</td>
                  </tr>
                </table>
              </div>
            </div>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td class="email-pad" style="padding:0 40px 32px;text-align:center;">
            <a href="https://nuditos.com.co/admin" class="email-btn" style="display:inline-block;background:linear-gradient(135deg, ${brandColor}, ${brandDark});color:#fff;text-decoration:none;padding:18px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(140,95,173,0.25);">Abrir Panel Admin Nuditos</a>
          </td></tr>
        </table>
      `);
    }

    if (!html || !subject || !to) {
      return new Response(JSON.stringify({ error: 'invalid_request', message: 'Tipo de correo no reconocido o falta destinatario' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(to).trim())) {
      return new Response(JSON.stringify({ error: 'invalid_email', message: 'Dirección de correo no válida' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // ── ENVÍO REAL A RESEND ──
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Nuditos Tejidos <hola@nuditos.com.co>',
        to: String(to).trim(),
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
