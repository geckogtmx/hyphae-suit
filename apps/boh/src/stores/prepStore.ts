import { create } from 'zustand';
import type { PrepSchedule, PrepTask, RecipeDefinition } from '../types';
import { mockSchedule, mockRecipes } from '../lib/mockData';

interface PrepStore {
    // Current state
    activeSchedule: PrepSchedule | null;
    activeTasks: PrepTask[]; // "Flight Control" - Tasks needing immediate attention
    passiveTasks: PrepTask[]; // "Monitor Zone" - Tasks running in background

    // Selection
    selectedTask: PrepTask | null; // Center zone

    // Actions
    loadSchedule: () => void;
    selectTask: (task: PrepTask) => void;
    startTask: (taskId: string) => void;
    pauseTask: (taskId: string) => void;
    completeTask: (taskId: string) => void;
}

export const usePrepStore = create<PrepStore>((set) => ({
    activeSchedule: null,
    activeTasks: [],
    passiveTasks: [],
    selectedTask: null,

    loadSchedule: () => {
        // Determine active vs passive based on recipe steps (simplified for now)
        // Real logic needs to inspect current step type
        const active = mockSchedule.tasks.slice(0, 1);
        const passive = mockSchedule.tasks.slice(1, 3);

        set({
            activeSchedule: mockSchedule,
            activeTasks: active,
            passiveTasks: passive,
            selectedTask: active[0] || null,
        });
    },

    selectTask: (task) => set({ selectedTask: task }),

    startTask: (taskId) => {
        set((state) => {
            // Move to active, update status
            // MOCK LOGIC - In real app, check recipe step type first
            return state;
        });
    },

    pauseTask: (taskId) => {
        console.log('Pause task', taskId);
    },

    completeTask: (taskId) => {
        set((state) => ({
            activeTasks: state.activeTasks.filter((t) => t.id !== taskId),
            selectedTask: state.activeTasks.find((t) => t.id !== taskId) || null
        }));
    },
}));
