import { z } from 'zod';

// Define the schema for the environment variables
const EnvSchema = z.object({
  TURSO_DB_URL: z.string(),
  TURSO_DB_AUTH_TOKEN: z.string(),
  SESSION_SECRET: z.string()
});

export const env = EnvSchema.parse(process.env);
