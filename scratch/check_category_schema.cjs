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

async function checkSchema() {
  const res = await fetch(`${SB_URL}/rest/v1/categorias?limit=1`, {
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`
    }
  });
  const data = await res.json();
  console.log("Category columns:", Object.keys(data[0] || {}));
  console.log("Full category row:", data[0]);
}

checkSchema();
