const SB_URL = "https://fpyhkxikxdwjhukltmqf.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweWhreGlreGR3amh1a2x0bXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzE1OTIsImV4cCI6MjA4ODI0NzU5Mn0.U1fHtV23e3uTlaH9qoeibzbm1d6MEcUaFE7rDhnokgM";

async function findExacts() {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/productos`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
    });
    const products = await res.json();
    const keywords = ["virg", "girasol", "gatito", "orqu", "tulip", "amaril"];
    
    console.log("--- SEARCH RESULTS ---");
    products.forEach(p => {
      const name = (p.nombre || "").toLowerCase();
      const match = keywords.some(kw => name.includes(kw));
      if (match) {
        console.log(`ID: ${p.id} | Name: "${p.nombre}" | Price: ${p.precio} | Category: ${p.categoria} | Active: ${p.activo}`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

findExacts();
