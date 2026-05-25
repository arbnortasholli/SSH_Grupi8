import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7110/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const expiresAt = localStorage.getItem('expiresAt');
        const expiresAtMs = expiresAt ? Date.parse(expiresAt) : null;

        if (expiresAtMs !== null && (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now())) {
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('user');
        }

        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = String(error.config?.url ?? '');
        const isAuthRequest = requestUrl.includes('/account/login') || requestUrl.includes('/account/register');

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
