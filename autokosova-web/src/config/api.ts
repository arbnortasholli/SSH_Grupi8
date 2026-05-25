export const API_CONFIG = {
    API_BASE_URL:
        import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? '/api' : 'http://localhost:5265/api'),
};
