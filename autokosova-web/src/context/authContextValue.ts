import { createContext } from 'react';
import type { AuthResponse, RegisterRequest, User } from '../lib/types';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (emailOrUsername: string, password: string) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
