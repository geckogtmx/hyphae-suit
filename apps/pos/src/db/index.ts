

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { schema } from '@hyphae/database';

const client = createClient({ url: 'file:sqlite.db' });
export const db = drizzle(client, { schema });

