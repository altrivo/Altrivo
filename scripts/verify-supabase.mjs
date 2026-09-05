import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — check .env.local');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const { error: authError } = await supabase.auth.getSession();
if (authError) {
  console.error('✗ Could not reach Supabase Auth:', authError.message);
  process.exit(1);
}
console.log('✓ Connected to Supabase at', url);

const { error: dbError } = await supabase.from('vendors').select('id').limit(1);
if (dbError) {
  console.error('✗ vendors table check failed:', dbError.message);
  console.error('  → Has the migration in supabase/migrations/ been run yet?');
  process.exit(1);
}
console.log('✓ vendors table reachable (0 rows expected here — RLS hides other vendors from the anon key)');
