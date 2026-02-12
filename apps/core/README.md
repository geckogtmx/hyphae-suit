# Hyphae Core

**Strategic Control Center & Knowledge Repository for the Hyphae POS Ecosystem**

---

## 🎯 Overview

**Hyphae Core** is the brain of the Hyphae Suit — a multi-module restaurant management system. It serves as:

- **Menu Configuration Hub**: Manages products, modifiers, recipes, and pricing
- **Fleet Monitoring Dashboard**: Tracks POS device health, sync status, and performance
- **Analytics Engine**: Processes transaction data and generates strategic insights
- **Knowledge Repository**: Stores SOPs, recipes, and operational intelligence

Core publishes immutable `MenuRelease` snapshots that the [Hyphae POS](https://github.com/geckogtmx/hyphae-pos) consumes for offline-first operation.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      HYPHAE ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ HYPHAE-CORE │    │  CORE API   │    │  HYPHAE-POS │         │
│  │ (This Repo) │◄──►│  (Future)   │◄──►│  (Tablet)   │         │
│  │             │    │             │    │             │         │
│  │ • Menu Mgmt │    │ • REST API  │    │ • Order UI  │         │
│  │ • Analytics │    │ • WebSocket │    │ • Payments  │         │
│  │ • Fleet Mon │    │ • Auth      │    │ • Kitchen   │         │
│  │ • Recipes   │    │ • Sync      │    │ • Loyalty   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow**:
- **Core → POS**: Menu releases, loyalty tiers, configuration
- **POS → Core**: Transaction records, device heartbeats, inventory updates
- **Core → BOH** (Future): Production schedules, prep lists, waste tracking

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19 + Vite |
| **Styling** | TailwindCSS (SHASO design system) |
| **Icons** | Lucide React |
| **State** | Zustand 5 (planned) |
| **Database** | Drizzle ORM + SQLite/LibSQL (planned) |
| **AI** | Google Gemini 2.5 Flash |
| **Validation** | Zod (planned) |

---

## 📁 Project Structure

```
hyphae-core/
├── .agent/
│   └── skills/           # AI development assistance
├── types/
│   └── schema.ts          # Canonical data structures (POS contract)
├── lib/
│   ├── gemini.ts          # AI strategic analysis
│   └── inventory.ts       # Stock management utilities
├── docs/
│   └── POS_INTEGRATION.md # Integration architecture
├── @AI_CODEX.md           # Governance & mandates
├── @DEV_HANDOFF.md        # Session handoff protocol
└── App.tsx                # Proto-dashboard (monolithic, needs refactor)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/geckogtmx/hyphae-core.git
   cd hyphae-core
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment** (optional for AI features):
   ```bash
   # Create .env.local
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

5. **Open in browser**: `http://localhost:5173`

### Available Scripts

```bash
pnpm dev      # Start development server (Vite)
pnpm build    # Build for production
pnpm preview  # Preview production build
```

---

## 📊 Current Status

**Phase**: Initialization (Proto-Dashboard Complete)

| Feature | Status |
|---------|--------|
| **Core Schema** | ✅ Complete |
| **Proto-Dashboard** | ✅ Complete |
| **Governance Docs** | ✅ Complete |
| **POS Integration Docs** | ✅ Complete |
| **Drizzle/SQLite** | 🟡 Planned |
| **Zustand Stores** | 🟡 Planned |
| **Menu Export** | ❌ Not Started |
| **API Layer** | ❌ Not Started |

See [`@DEV_HANDOFF.md`](@DEV_HANDOFF.md) for detailed task backlog.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [`@AI_CODEX.md`](@AI_CODEX.md) | Governance, mandates, and architectural rules |
| [`@DEV_HANDOFF.md`](@DEV_HANDOFF.md) | Session handoff protocol and task backlog |
| [`docs/POS_INTEGRATION.md`](docs/POS_INTEGRATION.md) | POS data contracts and integration architecture |
| [`types/schema.ts`](types/schema.ts) | Canonical data structures ("Code B-Smash") |

---

## 🔗 Related Repositories

- **[Hyphae POS](https://github.com/geckogtmx/hyphae-pos)**: Tablet point-of-sale application
- **Hyphae BOH** (Future): Back-of-house prep kitchen manager

---

## 🎨 Design Philosophy

### SHASO (Single Hand Solo Operator)
- Optimized for **index finger** interaction on tablets
- **Abyssal Palette**: Ink (#0A0A0A), Jet (#1A1B1E), Teal (#84CC16)
- Large touch targets, minimal scrolling, glass morphism

### Offline-First
- All core logic works without internet
- Sync is asynchronous and non-blocking
- Local SQLite database as source of truth

### Data Contract Stability
- `types/schema.ts` is the **canonical schema** for the POS
- Breaking changes require 1-month deprecation notice
- Backwards compatibility is mandatory

---

## 🤝 Contributing

This is a private project under active development. Contributions are currently limited to the core team.

---

## 📄 License

Proprietary - All Rights Reserved

---

*Maintained by the Hyphae Architect*  
*Last Updated: 2026-01-16*
