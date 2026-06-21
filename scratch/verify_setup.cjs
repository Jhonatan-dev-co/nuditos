const fs = require('fs');

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
  'Authorization': `Bearer ${SB_KEY}`
};

async function verify() {
  try {
    console.log("Checking Category 'mundial'...");
    const catRes = await fetch(`${SB_URL}/rest/v1/categorias?id=eq.mundial`, { headers });
    const cats = await catRes.json();
    console.log("Category Result:", cats);

    console.log("\nChecking Combo Products...");
    const prodRes = await fetch(`${SB_URL}/rest/v1/productos?categoria=like.*mundial*`, { headers });
    const prods = await prodRes.json();
    console.log(`Found ${prods.length} products with category containing 'mundial':`);
    prods.forEach(p => {
      console.log(`- ID: ${p.id} | Name: "${p.nombre}" | Price: ${p.precio} | Category: "${p.categoria}" | Active: ${p.activo}`);
    });

    console.log("\nChecking Landing Page 'mundial'...");
    const landRes = await fetch(`${SB_URL}/rest/v1/landings?slug=eq.mundial`, { headers });
    const landings = await landRes.json();
    console.log("Landing page title:", landings[0]?.title);
    console.log("Landing page active:", landings[0]?.is_active);
    console.log("Landing page content keys:", Object.keys(landings[0]?.content || {}));

    console.log("\nVerification Finished!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

verify();
