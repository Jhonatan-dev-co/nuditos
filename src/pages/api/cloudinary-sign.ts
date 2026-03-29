import crypto from 'node:crypto';
import type { APIRoute } from 'astro';

function signParams(params: Record<string, string | number>, apiSecret: string) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(stringToSign + apiSecret).digest('hex');
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
        error: 'Configura CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Netlify',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams(
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
