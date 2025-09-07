import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging for production
console.log('Environment check:', {
  supabaseUrl: supabaseUrl ? 'loaded' : 'missing',
  supabaseAnonKey: supabaseAnonKey ? 'loaded' : 'missing',
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'present' : 'missing'
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
