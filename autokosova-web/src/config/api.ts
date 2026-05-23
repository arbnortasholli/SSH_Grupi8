/**
 * Configuration for API usage
 * Set USE_MOCK_DATA to true to use mock data instead of real API
 * This is useful for frontend development before backend is ready
 */

export const API_CONFIG = {
    // Set to true to use mock data, false to use real API
    USE_MOCK_DATA: false,

    // API Base URL (only used when USE_MOCK_DATA is false)
    API_BASE_URL:
        import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? '/api' : 'http://localhost:5265/api'),

    // Mock data settings
    MOCK_API_DELAY: 300, // Simulated delay in ms
};

// Demo accounts for testing
export const DEMO_ACCOUNTS = {
    seller: {
        email: 'seller@autokosova.com',
        password: 'password',
        role: 'Rental',
    },
    customer: {
        email: 'customer@autokosova.com',
        password: 'password',
        role: 'Customer',
    },
    superAdmin: {
        email: 'superadmin@autokosova.com',
        password: 'password',
        role: 'SuperAdmin',
    },
};
