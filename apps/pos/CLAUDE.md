# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Operational Protocol

**CRITICAL**: You must read `AI_CODEX.md` at the start of every session. It contains:
- Prime Directives (Read-First, Tasks.md is Law, Strict Handoff)
- Project Context (Phase, Architecture)
- Tool Use Standards
- Documentation Map

**Key Memory Files**:
- `DEV_HANDOFF.md` - Session-to-session handoff log (read first!)
- `docs/TASKS.md` - Current task roadmap (work ONLY on these tasks)
- `docs/DESIGN_SHASO.md` - UI/UX design system truth
- `docs/QA_TESTING.md` - Testing standards and requirements

## Project Overview

Hyphae POS is a React-based mobile Point-of-Sale system for multi-concept restaurants. It's currently in **Phase 0 (Stabilization)** moving toward production readiness.

**Tech Stack**:
- React 19.2 + TypeScript 5.8
- Vite 6.2 (build tool)
- TailwindCSS with custom SHASO design system
- Local-first architecture (planned: SQLite/IndexedDB)

## Common Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (must pass before commits)
npm run preview      # Preview production build
```

### Testing (Future - Not Yet Configured)
```bash
npm run test         # Run unit tests (Vitest - to be installed)
npm run lint         # Check code quality (ESLint - to be installed)
```

### Environment Setup
```bash
cp .env.example .env  # Create environment file
# Edit .env with GEMINI_API_KEY if needed
```

## Architecture Overview

### State Management
- **Primary Pattern**: React Context + useReducer
- **Main Context**: `OrderContext` (src/context/OrderContext.tsx)
  - Manages: cart items, loyalty profiles, active/completed orders, payment state
  - Includes automatic loyalty perk calculations (Gold tier = free fries logic)
  - Persists to localStorage (`hyphae_pos_state_v3` key)

### Data Flow
1. Mock data layer (`src/data/mock_data.ts`) - mutable arrays simulating DB
2. OrderContext reducer handles all business logic
3. Components consume via `useOrder()` hook

### Key Type Definitions (src/types.ts)
- `OrderItem` - Cart item with modifiers and calculated prices
- `SavedOrder` - Persisted order with lifecycle timestamps
- `LoyaltyProfile` - Customer loyalty data with transaction history
- `ModifierGroup` - Nested modifier system with dependencies
- `RecipeDefinition` - Inventory depletion tracking (future)

### Component Organization
```
src/
├── components/          # 16+ UI components
│   ├── OrderBuilder.tsx    # Main order entry screen
│   ├── CheckoutModal.tsx   # Payment processing
│   ├── OrderRail.tsx       # Active order queue
│   └── ...
├── context/            # React Context providers
├── hooks/              # Custom hooks (idle timer, long press, menu data)
├── utils/              # Business logic helpers
│   ├── orderHelpers.ts      # Order calculations
│   └── packagingCalculator.ts
├── data/               # Mock data (mutable arrays)
└── types.ts            # TypeScript definitions
```

## Design System (SHASO)

SHASO = "Single Hand Solo Operator" - optimized for one-finger touch operation.

**Core Principles**:
- **Minimum touch target**: 60px × 60px
- **Bottom-heavy layout**: Primary actions in bottom 40% of screen
- **No hover states**: Touch-first design
- **High contrast**: Dark backgrounds for low-light environments

**Color Palette** (Abyssal theme):
- `ink-*` - Deep black backgrounds (ink-100 = app background)
- `jet-*` - Card/panel backgrounds (jet-500)
- `teal_deep` / `teal_mid` / `teal_bright` - Action hierarchy
- Inverted scale: 100 is darkest, 900 is lightest

**Typography**:
- `font-sans` (Inter) - UI and labels
- `font-mono` (Space Mono) - Prices, SKUs, quantities
- Minimum text size: `text-lg` (16px)

See `docs/DESIGN_SHASO.md` for complete specifications.

## Testing Standards

From `docs/QA_TESTING.md`:

### Zero Broken Windows Policy
- `npm run build` must pass (0 errors)
- `npm run lint` must pass (0 warnings) - when configured
- `npm run test` must pass (0 failures) - when configured

### Coverage Requirements (When Testing is Set Up)
- **POS Calculations**: 100% (tax, totals, balancing)
- **Inventory Logic**: 90%
- **UI Components**: 70%
- **Utilities**: 100%

### Testing Stack (To Be Installed)
- **Runner**: Vitest (Vite-native)
- **Environment**: jsdom
- **Assertions**: `expect` (Jest-compatible)
- **Location**: `__tests__` directories alongside source

## Development Workflow

### Before Starting Work
1. Read `DEV_HANDOFF.md` for session context
2. Read `AI_CODEX.md` for operational rules
3. Check `docs/TASKS.md` for current phase tasks
4. Run `npm run dev` to verify current state

### When Making Changes
1. Follow SHASO design principles for UI work
2. Never break the build (`npm run build` must pass)
3. Test visual changes in dev server
4. Update relevant documentation if architecture changes

### Before Ending Session
1. Update `DEV_HANDOFF.md` with:
   - Completed tasks
   - Known issues
   - In-progress work
   - Instructions for next session
2. Ensure build passes
3. Commit changes with descriptive messages

## Critical Implementation Notes

### Vite Configuration
- **Port**: 3000 (not default 5173)
- **Host**: 0.0.0.0 (network access)
- **Alias**: `@` -> `./src`
- **Environment**: Gemini API key loaded from `.env`

### Known Technical Debt (Phase 0)
1. **CDN Dependencies**: TailwindCSS loaded from CDN in index.html (needs build-time migration)
2. **React CDN**: React loaded from aistudiocdn.com (conflicts with local deps)
3. **Mock Data Mutation**: `data/mock_data.ts` exports mutable arrays (not production-safe)
4. **No Tests**: Zero test coverage (Phase 1 priority)
5. **Security**: Staff PINs in plain text (needs hashing)

### LocalStorage Schema
- **Key**: `hyphae_pos_state_v3`
- **Persisted**: Full OrderState including active/completed orders
- **Migration**: Version bumped from v2 to v3 for new schema

### Loyalty System Architecture
- **Multi-card support**: Users can have multiple cards (ACTIVE/INACTIVE/LOST)
- **Transaction log**: Event-sourced design (EARN/REDEEM/ADJUSTMENT/TIER_BONUS)
- **Automatic perks**: Gold tier gets free fries with burgers (applied in `recalculateCartWithPerks`)
- **Tier upgrades**: Trigger modal when punch threshold crossed

### Business Logic Locations
- **Tax calculation**: 8.25% in OrderContext.tsx:422
- **Loyalty earning**: `CREATE_ORDER` action (OrderContext.tsx:238-303)
- **Perk application**: `recalculateCartWithPerks` (OrderContext.tsx:23-56)
- **Order lifecycle**: `UPDATE_ORDER` action with timestamp tracking

## File Naming Conventions

- Components: PascalCase (e.g., `OrderBuilder.tsx`)
- Utilities: camelCase (e.g., `orderHelpers.ts`)
- Types: `types.ts` (centralized)
- Context: `<Name>Context.tsx`
- Hooks: `use<Name>.ts`

## Agent Skills

Custom agent skills are located in `.agent/skills/`:
- `frontend-design` - SHASO implementation guidance
- `pos-domain-logic` - Business rules (tax, inventory, loyalty)
- `offline-sync` - Local-first architecture patterns
- `pos-session-manager` - Shift/cash management logic
- `security` - POS-specific security requirements

**Do not reference**: Deleted Loom-legacy skills (electron-ipc, memory-layer, etc.)

## Version Control

- **Main branch**: `main`
- **Commit style**: Concise, descriptive messages
- **Pre-commit**: No hooks currently configured
- **Co-author tag**: Include `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` when committing

## Additional Resources

- `docs/STATUS_REPORT_2026-01-16.md` - Full codebase analysis
- `docs/DEVELOPMENT_PLAN.md` - 12-week production roadmap
- `docs/reference_ui/UI_SPECIFICATION.md` - Visual standards guide
- `README.md` - Project overview and quick start
