import type { APIRoute } from 'astro';
import { sendNuditosEmail } from '../../lib/emails';

export const prerender = false;

async function verifyAdminAuth(request: Request, sbUrl: string, anonKey: string): Promise<boolean> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || token.length < 20) return false;
  try {
    const res = await fetch(`${sbUrl}/auth/v1/user`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env || {};
    const SB_URL = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || 'https://fpyhkxikxdwjhukltmqf.supabase.co';
    const SB_ANON = env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

    const isAuth = await verifyAdminAuth(request, SB_URL, SB_ANON);
    if (!isAuth) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'unauthorized', 
        message: 'No autorizado. Se requiere sesión activa de administrador.' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

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
