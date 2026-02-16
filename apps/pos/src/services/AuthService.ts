
import { StaffProfile } from '@hyphae/schemas';

export interface AuthResult {
    success: boolean;
    token?: string;
    staff?: StaffProfile;
    error?: string;
}

const SESSION_KEY = 'hyphae_pos_session';

export const AuthService = {
    /**
     * Authenticate staff using PIN.
     * Currently a stub that mocks successful login for any 4-digit PIN.
     */
    async loginWithPin(pin: string): Promise<AuthResult> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (pin.length !== 4) {
            return { success: false, error: 'PIN must be 4 digits.' };
        }

        // MOCK: Accept any 4-digit PIN, assign 'Manager' role for now
        const session = {
            token: 'mock-jwt-token-12345',
            staff: {
                id: 'staff-001',
                name: 'Shift Lead',
                role: 'Manager' as const
            }
        };

        // Persist session
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return {
            success: true,
            ...session
        };
    },

    /**
     * Validate current session token.
     */
    async validateSession(token: string): Promise<boolean> {
        return token === 'mock-jwt-token-12345';
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
