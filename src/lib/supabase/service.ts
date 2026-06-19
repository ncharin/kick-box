import { createClient } from '@supabase/supabase-js'

// Client avec service_role — utilisé pour les écritures admin (sync, etc.)
// Ne jamais exposer côté client
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
