import React, { useEffect, useState, type ReactNode } from 'react';
import type { AuthResponse, RegisterRequest, User } from '../lib/types';
import { authService } from '../services/authService';
import { AuthContext } from './authContextValue';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser) as User;
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const isAuthenticated = Boolean(user || authService.getToken());

    useEffect(() => {
        const syncUser = () => {
            setUser(authService.getCurrentUser());
        };

        window.addEventListener('authChanged', syncUser);
        window.addEventListener('storage', syncUser);

        return () => {
            window.removeEventListener('authChanged', syncUser);
            window.removeEventListener('storage', syncUser);
        };
    }, []);

    const login = async (emailOrUsername: string, password: string) => {
        setIsLoading(true);
        try {
            const response: AuthResponse = await authService.login({ emailOrUsername, password });
            setUser({
                accountID: response.accountID,
                accountRoleID: response.accountRoleID,
                tenantID: response.tenantID ?? null,
                tenantName: response.tenantName ?? null,
                ownerAccountID: response.ownerAccountID ?? null,
                role: response.role || 'Customer',
                accountUsername: response.accountUsername,
                accountEmail: response.accountEmail,
                accountName: response.accountName,
                accountLastname: response.accountLastname,
                email: response.accountEmail,
                firstName: response.accountName,
                lastName: response.accountLastname,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setIsLoading(true);
        try {
            await authService.register(data);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const checkAuth = async () => {
        await Promise.resolve();
        setUser(authService.getCurrentUser());
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
