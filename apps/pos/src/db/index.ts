import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web'; // Use web client for browser
import { schema } from '@hyphae/database';

// In a browser environment, we want to target a local SQLite file (persistable via OPFS)
// If in development/non-compatible environment, it might fallback to in-memory
const client = createClient({
    url: 'file:hyphae_pos.db'
});

export const db = drizzle(client, { schema });
