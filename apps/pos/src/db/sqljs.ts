/**
 * @author Hyphae POS Team
 * @description Exposes the raw sql.js Database instance for DDL operations (migrations).
 *   The Drizzle proxy in index.ts wraps DML; direct DDL (CREATE TABLE) needs the raw db.
 *   This is a separate module to avoid circular imports.
 * @version 1.0.0
 * @last-updated 2026-02-23
 */

import type { Database as SqlJsDatabase } from 'sql.js';

let _instance: SqlJsDatabase | null = null;

export function setSqlJsDb(db: SqlJsDatabase): void {
    _instance = db;
}

export function getSqlJsDb(): SqlJsDatabase | null {
    return _instance;
}
