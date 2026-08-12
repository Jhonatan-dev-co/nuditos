import fs from 'fs';
import path from 'path';

/**
 * NUDITOS — Script de Subida de Imágenes a Cloudinary desde Terminal
 * Uso: node scripts/upload-image.js "C:/ruta/a/la/foto.jpg" "nombre-de-imagen-opcional"
 */

async function uploadImage() {
  const filePath = process.argv[2];
  const customName = process.argv[3];

  if (!filePath) {
    console.log("❌ Error: Debes especificar la ruta de la imagen.");
    console.log("Uso: node scripts/upload-image.js \"C:/ruta/foto.jpg\" \"nombre-opcional\"");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Error: El archivo "${filePath}" no existe.`);
    process.exit(1);
  }

  console.log(`🚀 Subiendo imagen a Cloudinary (dzxgu27wr/nuditos-products)...`);

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).replace('.', '');
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('upload_preset', 'ssjghh9e');
  formData.append('folder', 'nuditos-products');
  if (customName) formData.append('public_id', customName);

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dzxgu27wr/image/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.secure_url) {
      console.log("\n🎉 ¡IMAGEN SUBIDA EXITOSAMENTE A CLOUDINARY!");
      console.log(`--------------------------------------------------`);
      console.log(`URL Optimizada: ${data.secure_url}`);
      console.log(`ID Público:     ${data.public_id}`);
      console.log(`Dimensiones:    ${data.width}x${data.height} px`);
      console.log(`Peso:           ${(data.bytes / 1024).toFixed(2)} KB`);
      console.log(`--------------------------------------------------`);
    } else {
      console.error("❌ Error devuelto por Cloudinary:", data);
    }
  } catch (err) {
    console.error("❌ Error de conexión:", err.message);
  }
}

uploadImage();
