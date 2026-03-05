// netlify/functions/cloudinary-sign.js
// Nuditos Tejidos — Firma segura para subida a Cloudinary

const CLOUD_NAME   = 'dzxgu27wr';
const API_KEY      = '433838269526844';
const API_SECRET   = '4TAMjTYu5ba-PyQRaHZy7vuLIqc';
const UPLOAD_PRESET = 'nuditos_upload';

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);

    // Parámetros que se firman (deben coincidir con lo que manda el frontend)
    const paramsToSign = {
      timestamp,
      upload_preset: UPLOAD_PRESET,
      folder: 'nuditos',
    };

    // Generar firma SHA-1
    const signature = await generateSignature(paramsToSign, API_SECRET);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signature,
        timestamp,
        apiKey: API_KEY,
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: 'nuditos',
      })
    };
  } catch (err) {
    console.error('Error generando firma:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

/* ══════════════════════════════
   GENERAR FIRMA SHA-1
══════════════════════════════ */
async function generateSignature(params, secret) {
  // Ordenar parámetros alfabéticamente y construir string
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + secret;

  // SHA-1 con Web Crypto API (disponible en Netlify Functions)
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
