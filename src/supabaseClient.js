import { createClient } from '@supabase/supabase-js'

// Fallback to hardcoded values if environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ogjunbybimpaqvybqmqc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nanVuYnliaW1wYXF2eWJxbXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTg5MTgsImV4cCI6MjA3Mjc3NDkxOH0.ysuqzvs1ILEwdyovDBeoBqUzgVgWdSDTMKcwNRthwIk'

// Debug logging for production
console.log('Environment check:', {
  supabaseUrl: supabaseUrl ? 'loaded' : 'missing',
  supabaseAnonKey: supabaseAnonKey ? 'loaded' : 'missing',
  usingFallback: !import.meta.env.VITE_SUPABASE_URL,
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
