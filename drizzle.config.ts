import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  driver: 'turso',
  dbCredentials: {
    url: String(process.env.TURSO_DB_URL),
    authToken: String(process.env.TURSO_DB_AUTH_TOKEN)
  },
  breakpoints: true,
  out: './drizzle/migrations',
  verbose: true,
  strict: true
});
