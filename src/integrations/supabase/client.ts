// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mrcuqfyfzjedfklrzwgi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3VxZnlmemplZGZrbHJ6d2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDE5NzMsImV4cCI6MjA1OTM3Nzk3M30.hbPO_wL3uAkgnJEh6UXhjyL9uTrKpp40MsVyxWIWyWQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);