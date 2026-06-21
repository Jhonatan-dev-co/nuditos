const SB_URL = "https://fpyhkxikxdwjhukltmqf.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweWhreGlreGR3amh1a2x0bXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzE1OTIsImV4cCI6MjA4ODI0NzU5Mn0.U1fHtV23e3uTlaH9qoeibzbm1d6MEcUaFE7rDhnokgM";

async function checkSpecifics() {
  try {
    // 1. Fetch categories
    const catRes = await fetch(`${SB_URL}/rest/v1/categorias`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
    });
    const categories = await catRes.json();
    console.log("--- CATEGORIES IN DATABASE ---");
    categories.forEach(c => {
      console.log(`ID: ${c.id} | Name: "${c.nombre}" | Orden: ${c.orden}`);
    });

    // 2. Fetch products containing "combo" or "mundial"
    const prodRes = await fetch(`${SB_URL}/rest/v1/productos`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
    });
    const products = await prodRes.json();
    
    console.log("\n--- SEARCHING FOR 'combo' or 'mundial' in PRODUCTS ---");
    const matches = products.filter(p => {
      const name = (p.nombre || "").toLowerCase();
      const desc = (p.descripcion || "").toLowerCase();
      const cat = (p.categoria || "").toLowerCase();
      return name.includes("combo") || name.includes("mundial") || name.includes("copa") || name.includes("futbol") ||
             desc.includes("combo") || desc.includes("mundial") ||
             cat.includes("combo") || cat.includes("mundial");
    });

    if (matches.length === 0) {
      console.log("No matching products found in Supabase.");
    } else {
      matches.forEach(p => {
        console.log(`ID: ${p.id} | Name: "${p.nombre}" | Price: ${p.precio} | Active: ${p.activo} | Category: ${p.categoria}`);
        console.log(`  Desc: ${p.descripcion}`);
        console.log(`  Img: ${p.img}`);
        console.log(`  Imgs: ${p.imgs}`);
      });
    }

    // 3. Print the 5 most recently updated products
    console.log("\n--- 5 MOST RECENT PRODUCTS ---");
    products.slice(0, 5).forEach(p => {
      console.log(`ID: ${p.id} | Name: "${p.nombre}" | Price: ${p.precio} | Active: ${p.activo} | Category: ${p.categoria}`);
    });

  } catch (error) {
    console.error("Error fetching details:", error);
  }
}

checkSpecifics();
