import apiClient from './apiClient';
import type { LoginRequest, RegisterRequest, RegisterResponse, AuthResponse, User } from '../lib/types';

const toUser = (authData: AuthResponse): User => ({
    accountID: authData.accountID,
    accountRoleID: authData.accountRoleID,
    role: authData.role || 'User',
    accountUsername: authData.accountUsername,
    accountEmail: authData.accountEmail,
    accountName: authData.accountName,
    accountLastname: authData.accountLastname,
    email: authData.accountEmail,
    firstName: authData.accountName,
    lastName: authData.accountLastname,
});

const notifyAuthChanged = () => {
    window.dispatchEvent(new Event('authChanged'));
};

export const authService = {
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await apiClient.post<RegisterResponse>('/account/register', data);
        return response.data;
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/account/login', data);
        const authData = response.data;
        const user = toUser(authData);

        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(user));
        notifyAuthChanged();

        return authData;
    },

    async logout(): Promise<void> {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        notifyAuthChanged();
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    getCurrentUser(): User | null {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser) as User;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    },

    isAuthenticated(): boolean {
        return Boolean(localStorage.getItem('token'));
    },

    async me(): Promise<User> {
        const user = this.getCurrentUser();
        if (!user) {
            throw new Error('User is not authenticated.');
        }

        return user;
    },
};
