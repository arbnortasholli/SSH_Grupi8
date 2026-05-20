export interface LoginRequest {
    emailOrUsername: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    expiresAt: string;

    accountID: number;
    accountRoleID: number;
    tenantID?: number | null;
    tenantName?: string | null;
    ownerAccountID?: number | null;
    role: string;

    accountUsername: string;
    accountEmail: string;
    accountName: string;
    accountLastname: string;
}

export interface AuthUser {
    accountID: number;
    accountRoleID: number;
    tenantID?: number | null;
    tenantName?: string | null;
    ownerAccountID?: number | null;
    role: string;

    accountUsername: string;
    accountEmail: string;
    accountName: string;
    accountLastname: string;
}
