// @ts-nocheck
import apiClient from '../config/apiClient';
import type { LoginRequest, AuthResponse, AuthUser } from '../types/auth'

const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/account/login', data);

        const authData = response.data;

        localStorage.setItem('token', authData.token);
        localStorage.setItem('expiresAt', authData.expiresAt);

        const user: AuthUser = {
            accountID: authData.accountID,
            accountRoleID: authData.accountRoleID,
            role: authData.role,
            accountUsername: authData.accountUsername,
            accountEmail: authData.accountEmail,
            accountName: authData.accountName,
            accountLastname: authData.accountLastname
        };

        localStorage.setItem('user', JSON.stringify(user));

        return authData;
    },

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('user');
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    getUser(): AuthUser | null {
        const user = localStorage.getItem('user');

        if (!user) {
            return null;
        }

        try {
            return JSON.parse(user) as AuthUser;
        } catch {
            return null;
        }
    },

    isAuthenticated(): boolean {
        return Boolean(localStorage.getItem('token'));
    }
};

export default authService;
