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

    // Recipes
    recipes: RecipeDefinition[];
    fetchRecipes: () => Promise<void>;

    // Actions
    loadSchedule: () => void;
    selectTask: (task: PrepTask) => void;
    startTask: (taskId: string) => void;
    pauseTask: (taskId: string) => void;
    completeTask: (taskId: string, actualYield?: number) => void;
    addTaskFromRecipe: (recipeId: string, quantity: number) => void;
}

export const usePrepStore = create<PrepStore>((set) => ({
    activeSchedule: null,
    activeTasks: [],
    passiveTasks: [],
    selectedTask: null,
    recipes: [],

    fetchRecipes: async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api'}/recipes`, {
                headers: { 'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || '' }
            });
            if (res.ok) {
                const data = await res.json();
                set({ recipes: data });
            }
        } catch (err) {
            console.error('Failed to fetch recipes', err);
        }
    },

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

    completeTask: async (taskId, actualYield) => {
        const state = usePrepStore.getState();
        const task = state.activeTasks.find(t => t.id === taskId);

        if (task && task.recipeId) {
            try {
                // Call API to execute production (deduct ingredients, add output)
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/inventory/produce`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                    },
                    body: JSON.stringify({
                        recipeId: task.recipeId,
                        quantity: actualYield ?? task.targetQuantity
                    })
                });

                if (!res.ok) {
                    const err = await res.json();
                    console.error('Failed to complete production:', err);
                    alert(`Production Failed: ${err.error}`);
                    return; // Don't remove task if failed
                }

                console.log('Production recorded successfully');
            } catch (e) {
                console.error('API Error:', e);
                return;
            }
        }

        set((state) => ({
            activeTasks: state.activeTasks.filter((t) => t.id !== taskId),
            selectedTask: state.activeTasks.find((t) => t.id !== taskId) || null
        }));
    },

    addTaskFromRecipe: (recipeId, quantity) => {
        const newTask: PrepTask = {
            id: `task_${Date.now()}`,
            scheduleId: 'manual',
            recipeId,
            targetQuantity: quantity,
            unit: 'batches',
            assignedDay: new Date().toISOString().split('T')[0],
            estimatedMinutes: 30, // Default estimate
            status: 'pending'
        };

        set((state) => ({
            activeTasks: [...state.activeTasks, newTask],
            selectedTask: newTask // Auto-select the newly added manual task
        }));
    },
}));
