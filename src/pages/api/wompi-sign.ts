import type { APIRoute } from 'astro';
import { getLiveConfig } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { reference, amountInCents, currency } = await request.json();
    
    if (!reference || !amountInCents || !currency) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
    }

    const config = await getLiveConfig();
    const integritySecret = import.meta.env.WOMPI_INTEGRITY_SECRET || config?.wompiIntegrity;

    if (!integritySecret || integritySecret === '') {
      // Si no hay secreto, enviamos nulo (Wompi intentará sin firma)
      return new Response(JSON.stringify({ signature: null }), { status: 200 });
    }

    // sha256(referencia + monto_en_centavos + moneda + secreto_integridad)
    const rawString = `${reference}${amountInCents}${currency}${integritySecret}`;
    
    const encoder = new TextEncoder();
    const dataUint8 = encoder.encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return new Response(JSON.stringify({ signature: hashHex }), { status: 200 });
  } catch (err) {
    console.error('[sign] Error:', err);
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500 });
  }
};
