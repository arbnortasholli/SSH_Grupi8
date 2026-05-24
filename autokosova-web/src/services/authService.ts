import apiClient from './apiClient';
import type { LoginRequest, RegisterRequest, RegisterResponse, AuthResponse, User } from '../lib/types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const EXPIRES_AT_KEY = 'expiresAt';

const toUser = (authData: AuthResponse): User => ({
    accountID: authData.accountID,
    accountRoleID: authData.accountRoleID,
    tenantID: authData.tenantID ?? null,
    tenantName: authData.tenantName ?? null,
    ownerAccountID: authData.ownerAccountID ?? null,
    role: authData.role || 'Customer',
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

const clearStoredSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
};

const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) {
        return false;
    }

    const expiresAtMs = Date.parse(expiresAt);
    return Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now();
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

        localStorage.setItem(TOKEN_KEY, authData.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (authData.expiresAt) {
            localStorage.setItem(EXPIRES_AT_KEY, authData.expiresAt);
        } else {
            localStorage.removeItem(EXPIRES_AT_KEY);
        }
        notifyAuthChanged();

        return authData;
    },

    async logout(): Promise<void> {
        clearStoredSession();
        notifyAuthChanged();
    },

    getToken(): string | null {
        if (isExpired(localStorage.getItem(EXPIRES_AT_KEY))) {
            clearStoredSession();
            return null;
        }

        return localStorage.getItem(TOKEN_KEY);
    },

    getCurrentUser(): User | null {
        if (!this.getToken()) {
            return null;
        }

        const storedUser = localStorage.getItem(USER_KEY);
        if (!storedUser) {
            clearStoredSession();
            return null;
        }

        try {
            return JSON.parse(storedUser) as User;
        } catch {
            clearStoredSession();
            return null;
        }
    },

    isAuthenticated(): boolean {
        return Boolean(this.getToken() && this.getCurrentUser());
    },

    async me(): Promise<User> {
        const user = this.getCurrentUser();
        if (!user) {
            throw new Error('User is not authenticated.');
        }

        return user;
    },
};
