/**
 * @author Hyphae POS Team
 * @description Browser-compatible SQLite database using sql.js (WASM).
 *   - sql.js is the correct browser SQLite — `@libsql/client/web` is remote-only and
 *     does NOT support `file:` or `memory:` URLs in the browser environment.
 *   - drizzle-orm/sqlite-proxy bridges the sql.js Database instance to the Drizzle API,
 *     preserving all existing repository code unchanged (query, insert, update, delete, transaction).
 *   - The DB is initialised async; `initDb()` must be awaited before first use.
 *     `db` is a Proxy that will throw if accessed before init.
 * @version 3.1.0
 * @last-updated 2026-02-23
 */

import initSqlJs from 'sql.js';
// Vite ?url import — Vite handles the asset hash, MIME type, and correct serving path.
// This is the correct way to reference WASM in a Vite project; do not use locateFile with bare paths.
// @ts-ignore: Vite ?url suffix is not typed in TypeScript
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { schema } from '@hyphae/database';
import { setSqlJsDb } from './sqljs';

// ─── Types ────────────────────────────────────────────────────────────────────

type DB = SqliteRemoteDatabase<typeof schema>;

// ─── State ────────────────────────────────────────────────────────────────────

let _db: DB | null = null;
let _initPromise: Promise<void> | null = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Initialises the sql.js WASM engine and creates the Drizzle proxy.
 * Safe to call multiple times — subsequent calls return the same promise.
 */
export async function initDb(): Promise<void> {
    if (_db) return;
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
        console.log('🗄️  Initialising sql.js WASM database...');

        const SQL = await initSqlJs({
            // Use the Vite ?url import — correct MIME type, correct hash, no SPA fallback.
            locateFile: (file: string) => file.endsWith('.wasm') ? (sqlWasmUrl as string) : file,
        });

        const rawDb = new SQL.Database();

        // Register the instance for DDL access (migrations).
        setSqlJsDb(rawDb);

        // Drizzle sqlite-proxy: synchronous callback that runs SQL against sql.js.
        // The sqlite-proxy driver is async by type, but sql.js is synchronous.
        // We wrap the sync result in a resolved promise to satisfy the interface.
        _db = drizzle(
            async (sql, params, method) => {
                try {
                    if (method === 'run') {
                        rawDb.run(sql, params as any[]);
                        return { rows: [] };
                    }

                    const stmt = rawDb.prepare(sql);
                    stmt.bind(params as any[]);
                    const rows: any[][] = [];
                    while (stmt.step()) {
                        rows.push(stmt.get());
                    }
                    stmt.free();
                    return { rows };
                } catch (e: any) {
                    console.error('[sql.js] Query error:', e.message, '\nSQL:', sql);
                    throw e;
                }
            },
            { schema }
        );

        console.log('✅ sql.js database ready.');
    })();

    return _initPromise;
}

/**
 * Returns the Drizzle db instance.
 * @throws if called before `initDb()` has resolved.
 */
export function getDb(): DB {
    if (!_db) {
        throw new Error(
            '[POS DB] Database not initialised. Await initDb() before accessing the database.'
        );
    }
    return _db;
}

/**
 * Proxy export that mirrors the old `db` export name.
 * All repositories import `{ db }` from '../db' — this keeps them unchanged.
 * Will throw with a clear message if accessed before boot completes.
 */
export const db = new Proxy({} as DB, {
    get(_target, prop) {
        return (getDb() as any)[prop];
    },
});
