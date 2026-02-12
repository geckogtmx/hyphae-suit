# Hyphae BOH (BatchPrep Manager) - "The Kitchen Manager"

> **Status**: Development (Phase 2 UI)
> **Goal**: Manage cognitive load for single-operator prep kitchens.
> **Note**: This is NOT a Kitchen Display System (KDS) for live orders. Use `hyphae-pos` for that.

## 🚀 Quick Start

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    - Runs at `http://localhost:5173` (default Vite port)

3.  **Environment Variables**:
    Create `.env`:
    ```env
    VITE_CORE_API_URL=http://localhost:3001
    ```

## 🏗 Architecture

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS (SHASO Design System "Abyssal")
- **State**: Zustand (Planned)
- **Data**: REST API (Core) + Local Mock Data (`src/lib/mockData.ts`)

## 🔑 Key Concepts

1.  **"Push" Workflow**: The app tells you what to do (Active vs Passive task interleaving).
2.  **Strict Coordination**: Types are synced with `hyphae-pos`.
3.  **Hostile Environment UI**: Touch targets > 60px, High Contrast.

## 📂 Project Structure

- `src/components`: UI components (Prep, Inventory, Navigation).
- `src/lib`: Utilities and `mockData.ts`.
- `src/hooks`: Custom hooks (Timer, Audio).
- `src/services`: API clients.
- `src/types.ts`: Strict type definitions (Product, Recipe, PrepTask).

## ⚠️ Integration Boundaries

- **Live Orders**: Handled by POS.
- **Prep Scheduling**: Handled by BOH.
- **Inventory Par Levels**: Mastered in BOH, synced to Core.
