const fs = require('fs');

// Read environment variables
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

async function update() {
  try {
    // 1. Fetch current landing data
    const res = await fetch(`${SB_URL}/rest/v1/landings?slug=eq.mundial`, { headers });
    const data = await res.json();
    if (data.length === 0) {
      console.log("Landing 'mundial' not found.");
      return;
    }
    
    const landing = data[0];
    const newContent = {
      ...landing.content,
      heroImg: "https://res.cloudinary.com/dzxgu27wr/video/upload/q_auto,vc_auto/v1782067798/nuditos-products/fondo-portada-movil-ramo-tejido-crochet-lu3e.mp4"
    };
    
    console.log("Updating landing 'mundial' with mobile video URL...");
    const patchRes = await fetch(`${SB_URL}/rest/v1/landings?slug=eq.mundial`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ content: newContent })
    });
    
    if (patchRes.ok) {
      console.log("Success! Mobile video set as heroImg on 'mundial' landing.");
    } else {
      const text = await patchRes.text();
      console.error("Failed to update:", text);
    }
  } catch (e) {
    console.error(e);
  }
}

update();
