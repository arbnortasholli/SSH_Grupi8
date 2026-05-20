// Auth types
export interface RegisterRequest {
    accountRoleID?: number;
    accountUsername?: string;
    accountEmail?: string;
    password: string;
    accountName?: string;
    accountLastname?: string;
    accountPhoneNumber?: string;
    accountAddress?: string;
    accountCity?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface RegisterResponse {
    message: string;
    accountID: number;
}

export interface LoginRequest {
    emailOrUsername: string;
    email?: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    expiresAt?: string;
    accountID?: number;
    accountRoleID?: number;
    tenantID?: number | null;
    tenantName?: string | null;
    ownerAccountID?: number | null;
    role?: 'Guest' | 'Customer' | 'Seller' | 'SuperAdmin' | string;
    accountUsername?: string;
    accountEmail?: string;
    accountName?: string;
    accountLastname?: string;
    user?: User;
}

export interface User {
    accountID?: number;
    accountRoleID?: number;
    tenantID?: number | null;
    tenantName?: string | null;
    ownerAccountID?: number | null;
    role: 'Guest' | 'Customer' | 'Seller' | 'SuperAdmin' | string;
    accountUsername?: string;
    accountEmail?: string;
    accountName?: string;
    accountLastname?: string;
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}

// Car types
export interface Car {
    id: string;
    brand: string;
    model: string;
    year: number;
    type: 'Sedan' | 'SUV' | 'Truck' | 'Coupe' | 'Hatchback' | 'Van';
    price: number;
    priceType: 'daily' | 'monthly';
    mileage: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    transmission: 'Manual' | 'Automatic';
    seats: number;
    description: string;
    images: string[];
    isFavorite?: boolean;
    isAvailable: boolean;
    sellerId: string;
    sellerName: string;
    createdAt: string;
}

export interface CarFilters {
    brand?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    availability?: boolean;
    search?: string;
}

// Booking types
export interface Booking {
    id: string;
    carId: string;
    car?: Car;
    userId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
    createdAt: string;
}

export interface BookingRequest {
    carId: string;
    startDate: string;
    endDate: string;
}

// Paginated response
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// API Error
export interface ApiError {
    message: string;
    status: number;
}
