import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los de tu proyecto Supabase
const supabaseUrl = 'https://oummravhkvtrozprmggs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bW1yYXZoa3Z0cm96cHJtZ2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTI0NzUsImV4cCI6MjA2ODEyODQ3NX0.omPuPU8NS-g6o7Rs24vk7dey0kd-7XK-DMeuNK5O6to';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);