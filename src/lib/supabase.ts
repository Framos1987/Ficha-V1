import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rstgfwjzckgjdxiuqmtr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdGdmd2p6Y2tnamR4aXVxbXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NzQ5NDgsImV4cCI6MjA5MTM1MDk0OH0.YcO4Xe0_VFeyUAs0aS41dgA8n1Jp7qoM4cMi_0TWwSo'

export const supabase = createClient(supabaseUrl, supabaseKey)
