/**
 * Authentication Service
 * Manages user authentication state (mock implementation)
 */

import type { AuthUser } from '../models';

export class AuthService {
    private storageKey = 'advanced_app_auth';

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.getUser() !== null;
    }

    /**
     * Get current authenticated user
     */
    getUser(): AuthUser | null {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return null;
        
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }

    /**
     * Login user (mock implementation)
     */
    async login(username: string, password: string): Promise<AuthUser> {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock authentication
        if (username && password) {
            const user: AuthUser = {
                id: 1,
                username,
                email: `${username}@example.com`,
                token: `mock_token_${Date.now()}`,
            };

            localStorage.setItem(this.storageKey, JSON.stringify(user));
            return user;
        }

        throw new Error('Invalid credentials');
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Register new user (mock implementation)
     */
    async register(username: string, email: string, password: string): Promise<AuthUser> {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user: AuthUser = {
            id: Math.floor(Math.random() * 1000),
            username,
            email,
            token: `mock_token_${Date.now()}`,
        };

        localStorage.setItem(this.storageKey, JSON.stringify(user));
        return user;
    }
}
