# Hyphae Suit

**Hyphae Suit** is a next-generation Restaurant Operating System, built as a modern monorepo to power both Front of House (POS) and Back of House (Core) operations.

## 🚀 Overview

The ecosystem is split into specialized applications sharing a common domain layer:

- **[POS (Point of Sale)](./apps/pos)**: Offline-first, high-performance React application for order entry, payments, and table management.
- **[Core (BOH/HQ)](./apps/core)**: Centralized command center for menu management, inventory, analytics, and fleet control.
- **[Kitchen (BOH Prep)](./apps/boh)**: Kitchen Display System (KDS) and prep station management.
- **[Schemas](./packages/schemas)**: Shared source of truth for all data types, validation logic, and domain rules.

## 🛠️ Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Data**: LibSQL (local-first sync) + Drizzle ORM
- **Languages**: TypeScript (Strict Mode)

## 📦 Project Structure

```bash
hyphae-suit/
├── apps/
│   ├── pos/          # Point of Sale Application
│   ├── core/         # Back of House / Admin Dashboard
│   └── boh/          # Kitchen Prep 
├── packages/
│   └── schemas/      # Shared Types & Zod Schemas
├── GEMINI.md         # AI Project Map & Status
├── AI_CODEX.md       # Operational Protocol
└── pnpm-lock.yaml
```

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v20+
- **pnpm**: v9+ (`npm install -g pnpm`)

### Installation

```bash
# Install dependencies from root
pnpm install
```

### Development

To start the development environment for all apps:

```bash
# Start all apps in parallel
pnpm dev
```

To work on a specific app:

```bash
# POS only
pnpm --filter @hyphae/pos dev

# Core only
pnpm --filter @hyphae/core dev

# Kitchen only
pnpm --filter @hyphae/boh dev
```

### Building

```bash
# Build all apps and packages
pnpm build
```

## 📚 Developer Guide

For detailed documentation on architecture, code standards, and AI workflows, refer to:

- [**GEMINI.md**](./GEMINI.md): The "Project Brain" - Roadmap, Status, and Maintenance Log.
- [**AI_CODEX.md**](./AI_CODEX.md): The Rules of Engagement for AI Agent collaboration.

## 🤝 Contribution

1. **Hygiene**: All code must adhere to the "30-Line Rule" and Strict Typing.
2. **Schemas**: All shared types MUST live in `@hyphae/schemas`. Do not duplicate types across apps.
3. **Secrets**: Never commit `.env` files. Use `.env.example`.

---
*Built with ❤️ by the Hyphae Team*
