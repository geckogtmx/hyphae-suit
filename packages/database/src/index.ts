
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
// Shared DB Path
// Hardcoding for local monorepo simplicity so both apps hit the same file
// relative to this package's location in node_modules or symlink
export const DB_FILE_NAME = 'file:../../packages/database/sqlite.db';

// Environment-agnostic URL retrieval
const getDatabaseUrl = () => {
    // Check for Browser environment (safety fallback)
    if (typeof window !== 'undefined') {
        return ':memory:';
    }
    // Check for Vite environment
    const metaEnv = (import.meta as any).env;
    if (typeof import.meta !== 'undefined' && metaEnv && metaEnv.VITE_DATABASE_URL) {
        return metaEnv.VITE_DATABASE_URL;
    }
    // Check for Node environment
    if (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    return DB_FILE_NAME;
};

const getAuthToken = () => {
    const metaEnv = (import.meta as any).env;
    if (typeof import.meta !== 'undefined' && metaEnv && metaEnv.VITE_DATABASE_AUTH_TOKEN) {
        return metaEnv.VITE_DATABASE_AUTH_TOKEN;
    }
    if (typeof process !== 'undefined' && process.env && process.env.DATABASE_AUTH_TOKEN) {
        return process.env.DATABASE_AUTH_TOKEN;
    }
    return undefined;
}

// Instantiate Client (or Mock for Browser)
let client;

if (typeof window !== 'undefined') {
    // BROWSER: Mock Client to prevent LibSQL crash
    console.warn('⚠️ Using Mock Database Client (Browser Mode)');
    client = {
        execute: async (stmt: any) => {
            console.log('[MockDB] Execute:', stmt);
            return { rows: [], columns: [], rowsAffected: 0 };
        },
        batch: async (stmts: any) => {
            console.log('[MockDB] Batch:', stmts);
            return stmts.map(() => ({ rows: [], columns: [], rowsAffected: 0 }));
        },
        transaction: async (mode: any) => {
            console.log('[MockDB] Transaction:', mode);
            return {
                execute: async () => ({ rows: [], columns: [], rowsAffected: 0 }),
                rollback: async () => { },
                commit: async () => { },
                close: async () => { }
            };
        },
        close: async () => { },
        protocol: 'http',
    } as any;
} else {
    // NODE/SERVER: Real Client
    client = createClient({
        url: getDatabaseUrl(),
        authToken: getAuthToken(),
    });
}

export const db = drizzle(client, { schema });
export { schema };
export * from './schema.js';
export * from './mock_data.js';
export { eq, desc, asc, and, or } from 'drizzle-orm';
