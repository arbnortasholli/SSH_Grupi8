export interface LoginRequest {
    emailOrUsername: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    expiresAt: string;

    accountID: number;
    accountRoleID: number;
    role: string;

    accountUsername: string;
    accountEmail: string;
    accountName: string;
    accountLastname: string;
}

export interface AuthUser {
    accountID: number;
    accountRoleID: number;
    role: string;

    accountUsername: string;
    accountEmail: string;
    accountName: string;
    accountLastname: string;
}