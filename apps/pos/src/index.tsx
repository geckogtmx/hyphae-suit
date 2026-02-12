/**
 * @link e:\git\hyphae-pos\src\index.tsx
 * @author Hyphae POS Team
 * @description Application entry point and React mounting.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
