import { createClient } from "@supabase/supabase-js";
import { config } from "../../config";
import { Database } from "types/supabase";

export const supabase = createClient<Database>(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY,
);

export const supabaseadmin = createClient<Database>(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
);

export default supabase;
