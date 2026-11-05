export const prerender = false;
import type { APIRoute } from 'astro';

async function signParams(params: Record<string, string | number>, apiSecret: string) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  const runtimeEnv = (locals as any)?.runtime?.env || {};
  const SB_URL = runtimeEnv.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || 'https://fpyhkxikxdwjhukltmqf.supabase.co';
  const SB_ANON = runtimeEnv.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

  const isAuth = await verifyAdminAuth(request, SB_URL, SB_ANON);
  if (!isAuth) {
    return new Response(JSON.stringify({ 
      error: 'unauthorized', 
      message: 'Acceso no autorizado. Se requiere sesión activa de administrador.' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiSecret = runtimeEnv.CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET;
  const apiKey = runtimeEnv.CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY;
  const cloudName = runtimeEnv.CLOUDINARY_CLOUD_NAME || import.meta.env.CLOUDINARY_CLOUD_NAME || 'dzxgu27wr';
  const uploadPreset = runtimeEnv.CLOUDINARY_UPLOAD_PRESET || import.meta.env.CLOUDINARY_UPLOAD_PRESET || 'ssjghh9e';
  const folder = runtimeEnv.CLOUDINARY_FOLDER || import.meta.env.CLOUDINARY_FOLDER || 'nuditos-products';

  let customPublicId = null;
  try {
    const body = await request.clone().json();
    if (body && body.public_id) {
      customPublicId = body.public_id;
    }
  } catch (e) {
    // Sin body
  }

  if (!apiSecret || !apiKey) {
    // Si no hay API secret configurada, usar el preset unsigned existente (ssjghh9e)
    return new Response(
      JSON.stringify({
        unsigned: true,
        cloudName,
        uploadPreset,
        folder,
        publicId: customPublicId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
    upload_preset: uploadPreset,
  };

  if (customPublicId) {
    paramsToSign.public_id = customPublicId;
  }

  const signature = await signParams(paramsToSign, apiSecret);

  return new Response(
    JSON.stringify({
      signature,
      timestamp,
      apiKey,
      cloudName,
      uploadPreset,
      folder,
      publicId: customPublicId,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
