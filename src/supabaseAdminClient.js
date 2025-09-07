import { createClient } from '@supabase/supabase-js'

// Admin client with service role key - bypasses RLS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ogjunbybimpaqvybqmqc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nanVuYnliaW1wYXF2eWJxbXFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE5ODkxOCwiZXhwIjoyMDcyNzc0OTE4fQ.zMMuPtx-aEtJyuutgPOxbp7XRukWdkafrVlpsodcbDY'

console.log('Creating admin client with service role key...')

// Create admin client that bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
