
import { StaffProfile } from '@hyphae/schemas';

export interface AuthResult {
    success: boolean;
    token?: string;
    staff?: StaffProfile;
    error?: string;
}

const SESSION_KEY = 'hyphae_pos_session';

export const AuthService = {
    async loginWithPin(pin: string): Promise<AuthResult> {
        try {
            const response = await fetch('http://127.0.0.1:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            const session = {
                token: data.token,
                staff: data.user
            };

            // Persist session
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));

            return {
                success: true,
                ...session
            };
        } catch (e) {
            console.error("Login Error:", e);
            return { success: false, error: 'Network Connection Failed' };
        }
    },

    async validateSession(token: string): Promise<boolean> {
        // Optimistic validation. In prod, verify with API /auth/me
        return typeof token === 'string' && token.length > 10;
    },

    /**
     * Retrieve stored session from local storage
     */
    getStoredSession(): { token: string, staff: StaffProfile } | null {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse session", e);
            return null;
        }
    },

    /**
     * Clear session.
     */
    logout() {
        localStorage.removeItem(SESSION_KEY);
        console.log('User logged out');
    }
};
