import { getLiveConfig } from './src/lib/supabase';

async function test() {
  const config = await getLiveConfig();
  console.log('Config keys found:', Object.keys(config || {}));
  console.log('wompiIntegrity length:', config?.wompiIntegrity?.length);
}

test();
