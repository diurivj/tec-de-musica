import { env } from './env.server';
import { drizzle } from 'drizzle-orm/libsql';
import { singleton } from './singleton.server';
import { createClient } from '@libsql/client/http';
import * as schema from 'drizzle/schema';

export const db = singleton('drizzle', () => {
  const client = createClient({
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_AUTH_TOKEN
  });
  return drizzle(client, { schema });
});
