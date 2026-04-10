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

export const POST: APIRoute = async () => {
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;
  const apiKey = import.meta.env.CLOUDINARY_API_KEY;
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME || 'dzxgu27wr';
  const uploadPreset = import.meta.env.CLOUDINARY_UPLOAD_PRESET || 'ssjghh9e';
  const folder = import.meta.env.CLOUDINARY_FOLDER || 'nuditos-products';

  if (!apiSecret || !apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Configura CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Cloudflare',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await signParams(
    {
      folder,
      timestamp,
      upload_preset: uploadPreset,
    },
    apiSecret
  );

  return new Response(
    JSON.stringify({
      signature,
      timestamp,
      apiKey,
      cloudName,
      uploadPreset,
      folder,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
