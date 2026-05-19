import React, { useState, type ReactNode } from 'react';
import type { User, AuthResponse } from '../lib/types';
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

    const login = async (emailOrUsername: string, password: string) => {
        setIsLoading(true);
        try {
            const response: AuthResponse = await authService.login({ emailOrUsername, password });
            setUser({
                accountID: response.accountID,
                accountRoleID: response.accountRoleID,
                role: response.role || 'User',
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
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await authService.me();
                setUser(userData);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
