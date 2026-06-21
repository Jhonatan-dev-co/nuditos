const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dotenv = fs.readFileSync('c:\\Users\\jhona\\Downloads\\nuditos-astro-paso1\\.env', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const cloudName = env.CLOUDINARY_CLOUD_NAME || 'dzxgu27wr';
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;
const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET || 'ssjghh9e';
const folder = env.CLOUDINARY_FOLDER || 'nuditos-products';

function signParams(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + secret;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}

async function uploadFile(filePath, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder,
    timestamp,
    upload_preset: uploadPreset,
    public_id: publicId
  };

  const signature = signParams(params, apiSecret);
  
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);
  
  formData.append('file', blob, path.basename(filePath));
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('public_id', publicId);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.secure_url;
}

async function run() {
  const images = [
    {
      path: "C:\\Users\\jhona\\.gemini\\antigravity-ide\\brain\\add23d53-dfe1-497a-978d-c44beb15d3f4\\media__1782068813764.jpg",
      name: "combo-flores-amarillas-tulipanes"
    },
    {
      path: "C:\\Users\\jhona\\.gemini\\antigravity-ide\\brain\\add23d53-dfe1-497a-978d-c44beb15d3f4\\media__1782068813851.jpg",
      name: "combo-girasol-virgencita"
    },
    {
      path: "C:\\Users\\jhona\\.gemini\\antigravity-ide\\brain\\add23d53-dfe1-497a-978d-c44beb15d3f4\\media__1782068813867.jpg",
      name: "combo-orquidea-gatito"
    }
  ];

  console.log("Starting uploads...");
  for (const img of images) {
    try {
      console.log(`Uploading ${path.basename(img.path)} as ${img.name}...`);
      const url = await uploadFile(img.path, img.name);
      console.log(`SUCCESS! URL: ${url}`);
    } catch (e) {
      console.error(`Error uploading ${img.name}:`, e.message);
    }
  }
}

run();
