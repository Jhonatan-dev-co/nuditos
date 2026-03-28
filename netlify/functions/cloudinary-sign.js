/**
 * Firma peticiones de subida a Cloudinary (upload con preset firmado).
 * Variables en Netlify: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
 * CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_FOLDER (opcional).
 */
const crypto = require('crypto');

function signParams(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(stringToSign + apiSecret).digest('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || 'dzxgu27wr';
  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET || 'ssjghh9e';
  const folder = process.env.CLOUDINARY_FOLDER || 'nuditos-products';

  if (!apiSecret || !apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Configura CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Netlify',
      }),
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
    upload_preset: uploadPreset,
  };
  const signature = signParams(paramsToSign, apiSecret);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      signature,
      timestamp,
      apiKey,
      cloudName,
      uploadPreset,
      folder,
    }),
  };
};
