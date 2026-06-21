const fs = require('fs');
const path = require('path');

// 1. Read environment variables
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

const SB_URL = env.PUBLIC_SUPABASE_URL || 'https://fpyhkxikxdwjhukltmqf.supabase.co';
const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json'
};

async function dbGet(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.statusText}`);
  return await res.json();
}

async function dbPost(path, body, prefer = '') {
  const localHeaders = { ...headers };
  if (prefer) localHeaders['Prefer'] = prefer;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: localHeaders,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} - ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function dbPatch(path, body) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${path} failed: ${res.status} - ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function setup() {
  try {
    console.log("--- 1. SETTING UP CATEGORY 'mundial' ---");
    const categories = await dbGet("categorias");
    const hasMundialCat = categories.some(c => c.id === 'mundial');
    
    if (!hasMundialCat) {
      console.log("Category 'mundial' not found. Creating it...");
      await dbPost("categorias", {
        id: "mundial",
        nombre: "Mes del Mundial ⚽",
        orden: 0,
        icon: "⚽",
        activo: true,
        descripcion_seo: "<p>Celebra el Mes del Mundial con nuestros combos exclusivos tejidos a mano. Detalles eternos a precios imperdibles.</p>"
      });
      console.log("Category 'mundial' created successfully.");
    } else {
      console.log("Category 'mundial' already exists.");
    }

    console.log("\n--- 2. UPDATING PARENT PRODUCTS ---");
    // Parent product IDs:
    // 114 (Maceta orquídea), 94 (Ramo gatito)
    // 78 (Maceta de Girasol), 120 (Virgencita del Carmen)
    // 110 (Ramo flores amarillas), 79 (Maceta tulipanes)
    const parentIds = [114, 94, 78, 120, 110, 79];
    
    for (const id of parentIds) {
      const prods = await dbGet(`productos?id=eq.${id}`);
      if (prods.length > 0) {
        const prod = prods[0];
        let currentCats = prod.categoria || '';
        let catsArr = currentCats.split(',').map(c => c.trim()).filter(Boolean);
        
        if (!catsArr.includes('mundial')) {
          catsArr.push('mundial');
          const updatedCats = catsArr.join(', ');
          console.log(`Updating product ${id} ("${prod.nombre}") categories to: "${updatedCats}"`);
          await dbPatch(`productos?id=eq.${id}`, { categoria: updatedCats });
        } else {
          console.log(`Product ${id} ("${prod.nombre}") already linked to 'mundial' category.`);
        }
      } else {
        console.warn(`Warning: Parent product with ID ${id} not found in database.`);
      }
    }

    console.log("\n--- 3. CREATING COMBO PRODUCTS ---");
    const combos = [
      {
        nombre: "Combo Mundial: Maceta Orquídea + Ramo Gatito",
        precio: 154000,
        precio_original: 174000,
        descripcion: "¡Edición especial del Mes del Mundial! Llévate la hermosa Maceta Orquídea y el tierno Ramo Gatito a un precio de oferta único. Tejidos a mano con hilo premium de alta resistencia. Envíos gratis en toda Colombia.",
        categoria: "mundial",
        emoji: "⚽",
        img: "https://res.cloudinary.com/dzxgu27wr/image/upload/v1782069070/nuditos-products/combo-orquidea-gatito.jpg",
        activo: true,
        oferta: true,
        envio_gratis: true,
        stock: 99,
        badge: "Mundial",
        badge_class: "especial"
      },
      {
        nombre: "Combo Mundial: Maceta Girasol + Virgencita",
        precio: 170000,
        precio_original: 190000,
        descripcion: "¡Celebra con fe y alegría mundialista! Este combo especial incluye la Maceta de Girasol y la Virgencita del Carmen tejida a crochet. Un detalle eterno lleno de amor y esperanza.",
        categoria: "mundial",
        emoji: "⚽",
        img: "https://res.cloudinary.com/dzxgu27wr/image/upload/v1782069069/nuditos-products/combo-girasol-virgencita.jpg",
        activo: true,
        oferta: true,
        envio_gratis: true,
        stock: 99,
        badge: "Mundial",
        badge_class: "especial"
      },
      {
        nombre: "Combo Mundial: Flores Amarillas + Maceta Tulipanes",
        precio: 133000,
        precio_original: 153000,
        descripcion: "Combina el vibrante Ramo de Flores Amarillas con la tierna Maceta de Tulipanes. Una hermosa explosión de color tejida a crochet para decorar y alegrar cualquier rincón.",
        categoria: "mundial",
        emoji: "⚽",
        img: "https://res.cloudinary.com/dzxgu27wr/image/upload/v1782069068/nuditos-products/combo-flores-amarillas-tulipanes.jpg",
        activo: true,
        oferta: true,
        envio_gratis: true,
        stock: 99,
        badge: "Mundial",
        badge_class: "especial"
      }
    ];

    const existingProds = await dbGet("productos");
    for (const combo of combos) {
      const match = existingProds.find(p => p.nombre === combo.nombre);
      if (!match) {
        console.log(`Creating new combo product: "${combo.nombre}"`);
        await dbPost("productos", combo);
        console.log(`Product "${combo.nombre}" created.`);
      } else {
        console.log(`Combo product "${combo.nombre}" already exists. Updating details...`);
        await dbPatch(`productos?id=eq.${match.id}`, combo);
        console.log(`Product "${combo.nombre}" updated.`);
      }
    }

    console.log("\n--- 4. SETTING UP LANDING PAGE ---");
    const landings = await dbGet("landings?slug=eq.mundial");
    const landingConfig = {
      title: "Mes del Mundial ⚽",
      slug: "mundial",
      is_active: true,
      content: {
        categorySlug: "mundial",
        heroBadge: "Mes del Mundial ⚽",
        heroTitle: "La pasión del mundial tejida con <em class=\"italic text-rose-500 font-normal\">amor eterno</em>",
        heroSubtitle: "¡Edición Especial! Llévate nuestros combos mundialistas con hasta 25% de descuento. Ramos hechos a mano que duran para siempre. Envíos gratis a todo Colombia.",
        heroImg: "https://res.cloudinary.com/dzxgu27wr/image/upload/v1782069068/nuditos-products/combo-flores-amarillas-tulipanes.jpg",
        unboxingImg: "https://res.cloudinary.com/dzxgu27wr/image/upload/v1782069070/nuditos-products/combo-orquidea-gatito.jpg",
        targetDate: "2026-07-15"
      }
    };

    if (landings.length === 0) {
      console.log("Landing page 'mundial' not found. Creating it...");
      await dbPost("landings", landingConfig);
      console.log("Landing page 'mundial' created successfully.");
    } else {
      console.log("Landing page 'mundial' already exists. Updating config...");
      await dbPatch("landings?slug=eq.mundial", landingConfig);
      console.log("Landing page 'mundial' updated successfully.");
    }

    console.log("\n*** SETUP COMPLETED SUCCESSFULLY! ***");

  } catch (error) {
    console.error("Setup failed:", error);
  }
}

setup();
