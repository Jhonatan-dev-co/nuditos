import { getLiveConfig } from '../src/lib/supabase';

async function check() {
  const config = await getLiveConfig();
  console.log('--- NUDITOS CONFIG ---');
  console.log('Google Analytics Active:', config?.gaActive);
  console.log('Google Analytics ID:', config?.gaId);
  console.log('Meta Pixel Active:', config?.metaPixelActivo);
  console.log('Meta Pixel ID:', config?.metaPixelId);
  console.log('----------------------');
}

check();
