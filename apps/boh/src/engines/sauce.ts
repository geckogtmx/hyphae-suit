/**
 * Sauce Engine Logic
 * 
 * Core Concept: Sauces go through physical state changes (stages) rather than just time.
 * Logic: Alerts based on "Viscosity Checks" and HACCP Cooling logs.
 */

export type SauceStage = 'roast' | 'simmer' | 'reduce' | 'cool';

export interface SauceProcess {
    currentTemp?: number;
    viscosityCheck?: boolean; // "Coats back of spoon"
    coolingLog?: {
        time: number;
        temp: number;
    }[];
}

// HACCP Cooling Rules (FDA)
// 135°F to 70°F in 2 hours
// 70°F to 41°F in 4 hours
export const HACCP_LIMITS = {
    stage1: { targetTemp: 70, maxTimeMinutes: 120 },
    stage2: { targetTemp: 41, maxTimeMinutes: 240 }
};
