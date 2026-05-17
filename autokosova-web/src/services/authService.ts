import apiClient from './apiClient';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../lib/types';
import { API_CONFIG } from '../config/api';
import { mockAuthService } from './mockAuthService';

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockAuthService.login(credentials);
        }
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockAuthService.register(data);
        }
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockAuthService.logout();
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    me: async (): Promise<User> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockAuthService.me();
        }
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
