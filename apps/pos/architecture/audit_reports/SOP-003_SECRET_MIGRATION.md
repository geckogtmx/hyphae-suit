# SOP-003: Secret and Environment Migration

## Objective

Ensure all configuration and potential secrets are correctly handled via `.env` and `.env.example`.

## Discrepancies Found

- `.env` and `.env.example` are out of sync.
- `GEMINI_API_KEY` exists in `.env` but not in `.env.example`.
- `VITE_API_BASE_URL` in `.env` vs `VITE_API_URL` in `.env.example`.

## Procedure

1. Create a unified `.env.example` that includes all necessary keys (with dummy values).
2. Update `.env` to match the keys in `.env.example`.
3. Inform user to update actual local values if necessary.
