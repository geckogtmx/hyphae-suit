
import { StaffProfile } from '@hyphae/schemas';

export interface AuthResult {
    success: boolean;
    token?: string;
    staff?: StaffProfile;
    error?: string;
}

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
        return {
            success: true,
            token: 'mock-jwt-token-12345',
            staff: {
                id: 'staff-001',
                name: 'Shift Lead',
                role: 'Manager'
            }
        };
    },

    /**
     * Validate current session token.
     */
    async validateSession(token: string): Promise<boolean> {
        return token === 'mock-jwt-token-12345';
    },

    /**
     * Clear session.
     */
    logout() {
        // Clear local storage or session state here
        console.log('User logged out');
    }
};
