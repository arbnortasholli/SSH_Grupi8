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
    tenantID?: number | null;
    brand: string;
    model: string;
    year: number;
    type: 'Sedan' | 'SUV' | 'Truck' | 'Coupe' | 'Hatchback' | 'Van';
    price: number;
    priceType: 'daily' | 'monthly' | 'sale';
    mileage: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    transmission: 'Manual' | 'Automatic';
    seats: number;
    bodyType?: string;
    color?: string;
    city?: string;
    sellerType?: string;
    features?: CarFeature[];
    description: string;
    images: string[];
    imageRecords?: CarImage[];
    isFavorite?: boolean;
    isAvailable: boolean;
    carStatus?: string;
    sellerId: string;
    sellerName: string;
    createdAt: string;
}

export interface CarImage {
    id: string;
    carId: string;
    url: string;
    originalFileName?: string | null;
    contentType?: string | null;
    sizeBytes?: number | null;
    isMain: boolean;
    orderNumber: number;
    createdAt: string;
}

export interface CarFeature {
    id: string;
    name: string;
    description?: string | null;
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
    status: 'PendingPayment' | 'Confirmed' | 'Cancelled' | 'Completed';
    createdAt: string;
}

export interface BookingRequest {
    carId: string;
    startDate: string;
    endDate: string;
}

export interface BookingCheckoutResponse {
    message: string;
    rentalBookingID: number;
    paymentOrderID: number;
    totalDays: number;
    totalPrice: number;
    rentalBookingStatus: string;
    paymentStatus: string;
    checkoutUrl: string;
}

export interface PaymentStatusResponse {
    paymentOrderID: number;
    rentalBookingID: number;
    amount: number;
    currency: string;
    paymentStatus: string;
    paymentProvider: string;
    stripeCheckoutSessionID?: string | null;
    stripePaymentIntentID?: string | null;
    rentalBookingStatus: string;
    createdDate: string;
    paidDate?: string | null;
    failedDate?: string | null;
    cancelledDate?: string | null;
}

export type PurchasePaymentMethod = 'CashOnDelivery' | 'Card';

export interface PurchaseOrderRequest {
    carId: string;
    carTitle: string;
    carPrice: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    paymentMethod: PurchasePaymentMethod;
    cardholderName?: string;
    cardLastFour?: string;
}

export interface PurchaseOrderResponse {
    orderNumber: string;
    message: string;
    receiptText: string;
    createdAt: string;
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
