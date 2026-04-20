import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseKey ? 'PRESENT' : 'MISSING')

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Products found:', data.length)
    if (data.length > 0) {
      console.log('First product:', data[0].nombre)
    }
  }
}

test()
