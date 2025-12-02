import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdvhvwhcgdrglzfszvgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdmh2d2hjZ2RyZ2x6ZnN6dmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzcwMzYsImV4cCI6MjA4MDI1MzAzNn0.UCi0w8-q95bCYKpZTikpQxyn6AYZSNEvUadLKvw0WTk';

export const supabase = createClient(supabaseUrl, supabaseKey);