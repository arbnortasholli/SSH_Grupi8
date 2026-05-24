// @ts-nocheck
import apiClient from '../config/apiClient';
import type { LoginRequest, AuthResponse, AuthUser } from '../types/auth'

const TOKEN_KEY = 'token';
const EXPIRES_AT_KEY = 'expiresAt';
const USER_KEY = 'user';

const clearSession = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(USER_KEY);
};

const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) {
        return false;
    }

    const expiresAtMs = Date.parse(expiresAt);
    return Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now();
};

const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/account/login', data);

        const authData = response.data;

        localStorage.setItem(TOKEN_KEY, authData.token);
        localStorage.setItem(EXPIRES_AT_KEY, authData.expiresAt);

        const user: AuthUser = {
            accountID: authData.accountID,
            accountRoleID: authData.accountRoleID,
            tenantID: authData.tenantID ?? null,
            tenantName: authData.tenantName ?? null,
            ownerAccountID: authData.ownerAccountID ?? null,
            role: authData.role,
            accountUsername: authData.accountUsername,
            accountEmail: authData.accountEmail,
            accountName: authData.accountName,
            accountLastname: authData.accountLastname
        };

        localStorage.setItem(USER_KEY, JSON.stringify(user));

        return authData;
    },

    logout(): void {
        clearSession();
    },

    getToken(): string | null {
        if (isExpired(localStorage.getItem(EXPIRES_AT_KEY))) {
            clearSession();
            return null;
        }

        return localStorage.getItem(TOKEN_KEY);
    },

    getUser(): AuthUser | null {
        if (!this.getToken()) {
            return null;
        }

        const user = localStorage.getItem(USER_KEY);

        if (!user) {
            clearSession();
            return null;
        }

        try {
            return JSON.parse(user) as AuthUser;
        } catch {
            clearSession();
            return null;
        }
    },

    isAuthenticated(): boolean {
        return Boolean(this.getToken() && this.getUser());
    }
};

export default authService;
