import type { LoginRequest, RegisterRequest, AuthResponse } from '../lib/types';
import { mockUsers } from './mockData';

// Simple mock implementation
export const mockAuthService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if it's a valid demo account
        if (credentials.email === 'seller@autokosova.com' && credentials.password === 'password') {
            return {
                token: 'mock_jwt_token_seller_' + Date.now(),
                user: mockUsers.seller,
            };
        }

        if (credentials.email === 'user@autokosova.com' && credentials.password === 'password') {
            return {
                token: 'mock_jwt_token_user_' + Date.now(),
                user: mockUsers.user,
            };
        }

        if (credentials.email === 'admin@autokosova.com' && credentials.password === 'password') {
            return {
                token: 'mock_jwt_token_admin_' + Date.now(),
                user: mockUsers.admin,
            };
        }

        throw new Error('Invalid credentials');
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newUser = {
            id: String(Date.now()),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'User' as const,
            avatar: undefined,
        };

        return {
            token: 'mock_jwt_token_' + Date.now(),
            user: newUser,
        };
    },

    logout: async (): Promise<void> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
    },

    me: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockUsers.user;
    },
};
