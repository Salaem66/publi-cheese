// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dnjxzmebfavedeyjjbcg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanh6bWViZmF2ZWRleWpqYmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDIzMjMsImV4cCI6MjA2NTMxODMyM30.Lb-Y1KTlnEgjVi7nHjpIYQv1L-GJpPigfUg6lNIqBvo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);