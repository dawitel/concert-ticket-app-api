import { Config } from "types/config";
import { config as dotenvConfig } from "dotenv";
import * as path from "path";

const envPath = path.resolve(__dirname, "../../.env");
dotenvConfig({ path: envPath });

function loadConfig(): Config {
  const requiredVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PORT",
    "API_DOMAIN",
  ];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      throw new Error(
        `${key} is not set in the environment. Please set it in your .env file at ${envPath}.`,
      );
    }
  }

  const config: Config = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    PORT: parseInt(process.env.PORT || "3000", 10),
    API_DOMAIN: process.env.API_DOMAIN!,
  };

  return config;
}

export const config = loadConfig();
