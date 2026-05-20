import type { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse } from '../lib/types';
import { mockUsers } from './mockData';

const expiresAt = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();

// Kept only for legacy imports; register/login now use authService against the real API.
export const mockAuthService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (credentials.emailOrUsername === 'seller@autokosova.com' && credentials.password === 'password') {
            return {
                token: 'mock_jwt_token_seller_' + Date.now(),
                expiresAt: expiresAt(),
                ...mockUsers.seller,
            };
        }

        if (credentials.emailOrUsername === 'user@autokosova.com' && credentials.password === 'password') {
            return {
                token: 'mock_jwt_token_user_' + Date.now(),
                expiresAt: expiresAt(),
                ...mockUsers.user,
            };
        }

        if (credentials.emailOrUsername === 'admin@autokosova.com' && credentials.password === 'password') {
            return {
                token: 'mock_jwt_token_admin_' + Date.now(),
                expiresAt: expiresAt(),
                ...mockUsers.admin,
            };
        }

        throw new Error('Invalid credentials');
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            message: `Account ${data.accountUsername} registered successfully.`,
            accountID: Date.now(),
        };
    },

    logout: async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));
    },

    me: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockUsers.user;
    },
};
