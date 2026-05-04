// Format currency
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Calculate days between two dates
export const daysBetween = (startDate: string | Date, endDate: string | Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Validate email
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Check if user can perform action based on role
export const canPerformAction = (
    userRole: string,
    requiredRoles: string[]
): boolean => {
    return requiredRoles.includes(userRole);
};

// Get initials from name
export const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        return error.message || fallback;
    }

    if (typeof error === 'object' && error !== null) {
        const maybeError = error as {
            message?: unknown;
            response?: { data?: { message?: unknown } };
        };

        if (typeof maybeError.response?.data?.message === 'string') {
            return maybeError.response.data.message;
        }

        if (typeof maybeError.message === 'string') {
            return maybeError.message;
        }
    }

    return fallback;
};
