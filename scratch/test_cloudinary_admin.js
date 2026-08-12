import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dzxgu27wr',
  api_key: '433838269526844',
  api_secret: '4TAMjTYu5ba-PyQRaHZy7vuLIqc'
});

async function testAdminCloudinary() {
  console.log("=== VERIFICANDO CONEXIÓN DE ADMINISTRACIÓN CON CLOUDINARY ===");

  try {
    const res = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'nuditos-products',
      max_results: 10
    });

    console.log(`\n✅ CONEXIÓN ADMIN CLOUDINARY 100% EXITOSA`);
    console.log(`Total imágenes encontradas en 'nuditos-products': ${res.resources.length}`);
    console.log("Muestra de imágenes:");
    res.resources.forEach(r => {
      console.log(` - ${r.public_id} (${r.width}x${r.height} px, ${(r.bytes/1024).toFixed(1)} KB) -> ${r.secure_url}`);
    });
  } catch (err) {
    console.error("❌ Error Admin Cloudinary:", err.message);
  }
}

testAdminCloudinary();
