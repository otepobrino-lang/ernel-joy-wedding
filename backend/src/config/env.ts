import "dotenv/config";
import { z } from "zod";
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  LOG_LEVEL: z.string().default("info"),
});
const result = schema.safeParse(process.env);
if (!result.success) throw new Error(`Invalid backend environment: ${result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
export const env = result.data;
