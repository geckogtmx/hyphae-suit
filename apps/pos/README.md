<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HYPHAE.POS

> **Modern Mobile Point-of-Sale System for Multi-Concept Restaurants**

[![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)](package.json)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

---

## 🎯 Overview

Hyphae MPOS is a **React-based Point-of-Sale application** designed for modern restaurant operations. It supports multi-brand menus, complex modifier workflows, loyalty programs, and kitchen integration — all with a polished dark-mode UI optimized for touch devices.

### Key Features

- 🍔 **Multi-Concept Menus** — Serve multiple restaurant brands from one terminal
- 🛒 **Complex Modifiers** — Dependencies, variations, sub-items with smart pricing
- 💳 **Flexible Payments** — Cash, card, transfer, and split payment support
- 🏆 **Loyalty Program** — Multi-tier rewards with automatic perks
- 🍳 **Kitchen Integration** — Order queue, prep summaries, assembly bundling
- 🌙 **Modern UI** — Dark/light themes, responsive design, touch-optimized
- 📴 **Offline-Ready** — Queue orders when disconnected, sync when online

---

## 📊 Project Status

| Aspect                  | Status          |
| ----------------------- | --------------- |
| **Development Stage**   | Prototype / MVP |
| **Core POS Flow**       | ✅ Complete     |
| **Backend Integration** | 🟡 Planned      |
| **BOH App Integration** | 🟡 Planned      |
| **Production Ready**    | ❌ Not Yet      |

See [`docs/STATUS_REPORT_2026-01-16.md`](docs/STATUS_REPORT_2026-01-16.md) for detailed analysis.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      HYPHAE ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   POS APP   │◄──►│  CORE API   │◄──►│   BOH APP   │         │
│  │  (This Repo)│    │  (Backend)  │    │(Prep Kitchen)│        │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **npm** 10+ (or pnpm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/hyphae-pos.git
cd hyphae-pos

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

| Script            | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start development server with HMR |
| `npm run build`   | Build for production              |
| `npm run preview` | Preview production build          |
| `npm run test`    | Run unit tests with Vitest        |
| `npm run lint`    | Check code quality with ESLint    |
| `npm run format`  | Format code with Prettier         |

---

## 📁 Project Structure

```
hyphae-pos/
├── src/
│   ├── components/      # React components (16 files)
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── data/            # Mock data layer
│   ├── types.ts         # TypeScript definitions
│   └── App.tsx          # Main application
├── docs/                # Documentation
│   ├── STATUS_REPORT_2026-01-16.md
│   └── DEVELOPMENT_PLAN.md
├── public/              # Static assets
└── [config files]
```

---

## 🛠️ Tech Stack

| Category       | Technology                 |
| -------------- | -------------------------- |
| **Framework**  | React 19.2                 |
| **Language**   | TypeScript 5.8             |
| **Build Tool** | Vite 6.2                   |
| **Styling**    | TailwindCSS                |
| **Icons**      | Lucide React               |
| **State**      | React Context + useReducer |

See [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) for recommended upgrades.

---

## 📖 Documentation

| Document                                          | Description                       |
| ------------------------------------------------- | --------------------------------- |
| [Status Report](docs/STATUS_REPORT_2026-01-16.md) | Current codebase analysis         |
| [Development Plan](docs/DEVELOPMENT_PLAN.md)      | 12-week roadmap to production     |
| [Core Integration](docs/CORE_INTEGRATION.md)      | Schema alignment with Hyphae Core |

---

## 🎨 Screenshots

<details>
<summary>Click to view UI screenshots</summary>

### Dark Mode - Desktop

_Coming soon_

### Light Mode - Mobile

_Coming soon_

</details>

---

## 🗺️ Roadmap

| Phase       | Timeline    | Focus                              |
| ----------- | ----------- | ---------------------------------- |
| **Phase 0** | Weeks 1-2   | Build stabilization, testing setup |
| **Phase 1** | Weeks 3-4   | Service layer, offline queue       |
| **Phase 2** | Weeks 5-8   | Core API integration, payments     |
| **Phase 3** | Weeks 9-10  | BOH app integration, real-time     |
| **Phase 4** | Weeks 11-12 | Security, performance, deployment  |

---

## 🤝 Contributing

This is a proprietary project. Contribution guidelines will be added when the repository is opened.

---

## 📄 License

Copyright © 2026 Hyphae Systems. All rights reserved.

---

<div align="center">
  <sub>Built with ☕ and 🎵 by the Hyphae Team</sub>
</div>
