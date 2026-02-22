import { StaffProfile } from '@hyphae/schemas';
import { db } from '../db';
import { schema } from '@hyphae/database';
import { eq } from 'drizzle-orm';

export interface AuthResult {
    success: boolean;
    token?: string;
    staff?: StaffProfile;
    error?: string;
    isOffline?: boolean;
}

const SESSION_KEY = 'hyphae_pos_session';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export const AuthService = {
    async loginWithPin(pin: string): Promise<AuthResult> {
        // 1. Try Online Login First
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
                signal: AbortSignal.timeout(3000) // Don't wait forever
            });

            if (response.ok) {
                const data = await response.json();
                const session = {
                    token: data.token,
                    staff: data.user,
                    isOffline: false
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, ...session };
            }
        } catch (e) {
            console.warn("Online login failed, attempting offline fallback...", e);
        }

        // 2. Offline Fallback
        try {
            const localUsers = await db.select().from(schema.users).where(eq(schema.users.pin, pin)).limit(1);
            const user = localUsers[0];

            if (user && user.isActive) {
                const session = {
                    token: 'offline-token', // Dummy token
                    staff: {
                        id: user.id,
                        name: user.name,
                        role: user.role as any
                    },
                    isOffline: true
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                console.info("⚡ Offline Login Successful for:", user.name);
                return { success: true, ...session };
            }

            return { success: false, error: 'Invalid PIN (Offline)' };
        } catch (dbError) {
            console.error("Critical Auth Failure:", dbError);
            return { success: false, error: 'Authentication System Error' };
        }
    },

    async validateSession(token: string): Promise<boolean> {
        if (token === 'offline-token') return true;
        return typeof token === 'string' && token.length > 10;
    },

    getStoredSession(): { token: string, staff: StaffProfile, isOffline?: boolean } | null {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse session", e);
            return null;
        }
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        console.log('User logged out');
    }
};
