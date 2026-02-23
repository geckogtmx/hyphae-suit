/**
 * @link e:\git\hyphae-pos\src\index.tsx
 * @author Hyphae POS Team
 * @description Application entry point. Runs async DB + sync boot before mounting React.
 * @version 2.0.0
 * @last-updated 2026-02-23
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initDb } from './db';
import { SyncEngine } from './services/SyncEngine';
import { runMigrations } from './db/migrations';

const rootElement = document.getElementById('root')!;

async function boot() {
  // 1. Render a loading screen immediately so the user sees activity, not a blank page.
  const loadingRoot = ReactDOM.createRoot(rootElement);
  loadingRoot.render(
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0a0a0f', color: '#2dd4bf', fontFamily: 'sans-serif', gap: '16px'
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.05em' }}>
        <span style={{ color: '#2dd4bf' }}>Hyphae</span> POS
      </div>
      <div style={{ fontSize: '0.85rem', color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Initialising local database…
      </div>
    </div>
  );

  try {
    // 2. Boot the sql.js WASM database.
    await initDb();

    // 3. Apply schema migrations (creates tables if they don't exist).
    await runMigrations();

    // 4. Kick off an initial sync pull to populate local DB from Core API.
    SyncEngine.getInstance().runSyncLoop().catch(e =>
      console.warn('[Boot] Initial sync failed (offline?). Continuing in offline mode.', e)
    );

    // 5. Mount the real app. unmount loading screen first to avoid double-root warnings.
    loadingRoot.unmount();
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('[Boot] Fatal init error:', err);
    loadingRoot.render(
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0a0f', color: '#ef4444', fontFamily: 'sans-serif', gap: '12px', padding: '2rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>⚠️ Startup Failed</div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: '400px' }}>
          The local database could not be initialised. This may be caused by a Content Security Policy
          blocking WASM execution. Check the browser console for details.
        </div>
        <pre style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '8px' }}>
          {String(err)}
        </pre>
      </div>
    );
  }
}

boot();
