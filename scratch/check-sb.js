const SB_URL = "https://fpyhkxikxdwjhukltmqf.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweWhreGlreGR3amh1a2x0bXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzE1OTIsImV4cCI6MjA4ODI0NzU5Mn0.U1fHtV23e3uTlaH9qoeibzbm1d6MEcUaFE7rDhnokgM";

async function checkConfig() {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/config?select=clave,valor`, {
      headers: { 
        apikey: SB_KEY, 
        Authorization: `Bearer ${SB_KEY}` 
      }
    });
    const data = await res.json();
    console.log("Config Rows:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error checking config:", e);
  }
}

checkConfig();
