---
name: zustand-stores
description: Guides Zustand 5 state management patterns for LOOM Engine UI. Use this skill when creating stores, implementing persistence, managing reactive state across Worlds, Sessions, and Patterns, or debugging state issues. Covers store design, selectors, and Electron-specific persistence.
---

# Zustand Stores

This skill provides patterns for Zustand 5 state management in LOOM Engine.

## Store Architecture

```
┌─────────────────────────────────────────────┐
│                   UI Layer                   │
├─────────────────────────────────────────────┤
│  useWorldStore  │  useSessionStore  │  ...  │
├─────────────────────────────────────────────┤
│              Zustand Middleware              │
│         (persist, devtools, immer)          │
├─────────────────────────────────────────────┤
│            Electron IPC Bridge              │
└─────────────────────────────────────────────┘
```

## Basic Store Pattern

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface WorldState {
  // State
  worlds: World[];
  activeWorldId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setWorlds: (worlds: World[]) => void;
  setActiveWorld: (worldId: string) => void;
  addWorld: (world: World) => void;
  updateWorld: (worldId: string, updates: Partial<World>) => void;
  removeWorld: (worldId: string) => void;

  // Async actions
  fetchWorlds: () => Promise<void>;
  createWorld: (data: CreateWorldData) => Promise<World>;
}

export const useWorldStore = create<WorldState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        worlds: [],
        activeWorldId: null,
        isLoading: false,
        error: null,

        // Sync actions
        setWorlds: (worlds) => set((state) => {
          state.worlds = worlds;
        }),

        setActiveWorld: (worldId) => set((state) => {
          state.activeWorldId = worldId;
        }),

        addWorld: (world) => set((state) => {
          state.worlds.push(world);
        }),

        updateWorld: (worldId, updates) => set((state) => {
          const index = state.worlds.findIndex(w => w.id === worldId);
          if (index !== -1) {
            Object.assign(state.worlds[index], updates);
          }
        }),

        removeWorld: (worldId) => set((state) => {
          state.worlds = state.worlds.filter(w => w.id !== worldId);
          if (state.activeWorldId === worldId) {
            state.activeWorldId = null;
          }
        }),

        // Async actions (call IPC)
        fetchWorlds: async () => {
          set((state) => { state.isLoading = true; state.error = null; });
          try {
            const worlds = await window.api.worlds.list();
            set((state) => {
              state.worlds = worlds;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
          }
        },

        createWorld: async (data) => {
          const world = await window.api.worlds.create(data);
          get().addWorld(world);
          return world;
        },
      })),
      {
        name: 'loom-world-store',
        partialize: (state) => ({
          activeWorldId: state.activeWorldId,
          // Don't persist worlds - fetch from DB
        }),
      }
    ),
    { name: 'WorldStore' }
  )
);
```

## Session Store

```typescript
interface SessionState {
  // State
  currentSession: Session | null;
  sessionState: SessionStateType;
  sie: SessionIntentEnvelope | null;
  streamBuffer: string;

  // Actions
  startSession: (worldId: string, patternId?: string) => Promise<void>;
  sealSIE: (sie: SessionIntentEnvelope) => void;
  appendToStream: (chunk: string) => void;
  clearStream: () => void;
  closeSession: () => Promise<void>;

  // Computed
  isActive: () => boolean;
  canExecutePattern: () => boolean;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    immer((set, get) => ({
      currentSession: null,
      sessionState: 'idle',
      sie: null,
      streamBuffer: '',

      startSession: async (worldId, patternId) => {
        set((state) => {
          state.sessionState = 'initializing';
        });

        try {
          const session = await window.api.sessions.start(worldId, patternId);
          set((state) => {
            state.currentSession = session;
            state.sessionState = 'primacy';
          });
        } catch (error) {
          set((state) => {
            state.sessionState = 'failed';
          });
          throw error;
        }
      },

      sealSIE: (sie) => set((state) => {
        state.sie = sie;
        state.sessionState = 'active';
      }),

      appendToStream: (chunk) => set((state) => {
        state.streamBuffer += chunk;
      }),

      clearStream: () => set((state) => {
        state.streamBuffer = '';
      }),

      closeSession: async () => {
        const session = get().currentSession;
        if (session) {
          await window.api.sessions.close(session.id);
        }
        set((state) => {
          state.currentSession = null;
          state.sessionState = 'idle';
          state.sie = null;
          state.streamBuffer = '';
        });
      },

      // Computed
      isActive: () => get().sessionState === 'active',
      canExecutePattern: () => {
        const state = get();
        return state.sessionState === 'active' && state.sie !== null;
      },
    })),
    { name: 'SessionStore' }
  )
);
```

## UI State Store

```typescript
interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Navigation
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Panels
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  contextPanelOpen: boolean;
  toggleContextPanel: () => void;

  // Modals
  activeModal: ModalType | null;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;

  // Tempo (global display)
  currentTempo: Tempo;
  setTempo: (tempo: Tempo) => void;
}

type ViewType =
  | 'worlds-dashboard'
  | 'world-cockpit'
  | 'session-runner'
  | 'memory-inspector'
  | 'agent-profiles'
  | 'settings';

type ModalType =
  | 'create-world'
  | 'session-wizard'
  | 'pattern-selector'
  | 'command-palette';

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      immer((set) => ({
        // Theme
        theme: 'tokyo-night',
        setTheme: (theme) => set((state) => { state.theme = theme; }),

        // Navigation
        activeView: 'worlds-dashboard',
        setActiveView: (view) => set((state) => { state.activeView = view; }),

        // Panels
        sidebarOpen: true,
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
        contextPanelOpen: false,
        toggleContextPanel: () => set((state) => {
          state.contextPanelOpen = !state.contextPanelOpen;
        }),

        // Modals
        activeModal: null,
        openModal: (modal) => set((state) => { state.activeModal = modal; }),
        closeModal: () => set((state) => { state.activeModal = null; }),

        // Tempo
        currentTempo: 'andante',
        setTempo: (tempo) => set((state) => { state.currentTempo = tempo; }),
      })),
      {
        name: 'loom-ui-store',
        // Persist all UI preferences
      }
    ),
    { name: 'UIStore' }
  )
);
```

## Selectors (Performance)

Use selectors to prevent unnecessary re-renders:

```typescript
// Define selectors outside component
const selectActiveWorld = (state: WorldState) =>
  state.worlds.find(w => w.id === state.activeWorldId);

const selectWorldsByStatus = (status: WorldStatus) => (state: WorldState) =>
  state.worlds.filter(w => w.status === status);

// Use in components
function WorldCockpit() {
  // Only re-renders when active world changes
  const activeWorld = useWorldStore(selectActiveWorld);

  // Only re-renders when active worlds change
  const activeWorlds = useWorldStore(selectWorldsByStatus('active'));

  return (/* ... */);
}
```

### Shallow Comparison

```typescript
import { shallow } from 'zustand/shallow';

function SessionStatus() {
  // Only re-renders when these specific values change
  const { sessionState, sie } = useSessionStore(
    (state) => ({
      sessionState: state.sessionState,
      sie: state.sie,
    }),
    shallow
  );

  return (/* ... */);
}
```

## Electron IPC Integration

### Preload API Types

```typescript
// packages/shared/src/api.ts
export interface LoomAPI {
  worlds: {
    list: () => Promise<World[]>;
    get: (id: string) => Promise<World>;
    create: (data: CreateWorldData) => Promise<World>;
    update: (id: string, data: Partial<World>) => Promise<World>;
    delete: (id: string) => Promise<void>;
  };
  sessions: {
    start: (worldId: string, patternId?: string) => Promise<Session>;
    close: (sessionId: string) => Promise<void>;
    getState: (sessionId: string) => Promise<SessionState>;
  };
  // ... other APIs
}

declare global {
  interface Window {
    api: LoomAPI;
  }
}
```

### Store with IPC

```typescript
export const useWorldStore = create<WorldState>()((set, get) => ({
  // ... state

  fetchWorlds: async () => {
    set({ isLoading: true });
    try {
      // Call through IPC bridge
      const worlds = await window.api.worlds.list();
      set({ worlds, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

## WebSocket Streaming Integration

```typescript
// Subscribe to WebSocket events
export function initializeStreamingStore() {
  const ws = new WebSocket('ws://localhost:3001');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'stream-chunk':
        useSessionStore.getState().appendToStream(data.content);
        break;

      case 'session-state-change':
        useSessionStore.setState({ sessionState: data.state });
        break;

      case 'model-selected':
        useObservabilityStore.setState({
          currentModel: data.model,
          isLocal: data.isLocal,
        });
        break;
    }
  };
}
```

## Testing Stores

```typescript
import { act, renderHook } from '@testing-library/react';

describe('useWorldStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useWorldStore.setState({
      worlds: [],
      activeWorldId: null,
      isLoading: false,
      error: null,
    });
  });

  it('should add a world', () => {
    const { result } = renderHook(() => useWorldStore());

    act(() => {
      result.current.addWorld({ id: 'w1', name: 'Test World' });
    });

    expect(result.current.worlds).toHaveLength(1);
    expect(result.current.worlds[0].name).toBe('Test World');
  });

  it('should set active world', () => {
    const { result } = renderHook(() => useWorldStore());

    act(() => {
      result.current.addWorld({ id: 'w1', name: 'World 1' });
      result.current.setActiveWorld('w1');
    });

    expect(result.current.activeWorldId).toBe('w1');
  });
});
```

## Best Practices

1. **Separate concerns**: One store per domain (worlds, sessions, UI)
2. **Use immer**: Makes immutable updates readable
3. **Use selectors**: Prevent unnecessary re-renders
4. **Persist wisely**: Only persist preferences, not data
5. **Type everything**: Full TypeScript coverage
6. **Reset on logout**: Clear sensitive state
