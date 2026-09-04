import type { APIRoute } from 'astro';
import { sendNuditosEmail } from '../../lib/emails';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const type = body.type;
    const data = body.data || body;

    if (!type) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'invalid_request', 
        message: 'Falta el parámetro type' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const result = await sendNuditosEmail({ type, data, locals });

    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        error: result.error || 'Falla al enviar',
        detail: result.detail
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: result.messageId
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err: any) {
    console.error('[send-email API] Error fatal:', err.message);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'internal_server_error', 
      message: err.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
