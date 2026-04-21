
const SB_URL = "https://fpyhkxikxdwjhukltmqf.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweWhreGlreGR3amh1a2x0bXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY3MTU5MiwiZXhwIjoyMDg4MjQ3NTkyfQ.7nqTgfiEKJeK3KUI3ixvMfBaLd8Si_2kzyZjg2KhTt4";

async function checkConfig() {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/config?select=clave,valor`, {
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`
      }
    });

    if (!res.ok) {
      console.error('Error fetching config:', await res.text());
      return;
    }

    const data = await res.json();
    console.log('Current Config:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

checkConfig();
