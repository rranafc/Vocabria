import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl =
'https://fybcomaywkvwzphgkqga.supabase.co'

const supabaseKey =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YmNvbWF5d2t2d3pwaGdrcWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTcwNDgsImV4cCI6MjA5NDczMzA0OH0.533iED3UOl7CGwYPY3MxiioXyKemGyEOJC1W0yXDw0U'

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)
