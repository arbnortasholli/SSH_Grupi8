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
    if (typeof error === 'object' && error !== null) {
        const maybeError = error as {
            code?: unknown;
            message?: unknown;
            response?: {
                data?: unknown;
                statusText?: unknown;
            };
        };

        if (maybeError.code === 'ERR_NETWORK') {
            return 'Nuk mund të lidhem me API-në. Sigurohuni që backend-i po punon (dotnet run në autokosova-api/AutoKosova.Api, porti 5265).';
        }

        const data = maybeError.response?.data;

        if (typeof data === 'string') {
            return data;
        }

        if (typeof data === 'object' && data !== null) {
            const responseData = data as {
                message?: unknown;
                title?: unknown;
                error?: unknown;
                detail?: unknown;
                errors?: unknown;
            };

            if (typeof responseData.message === 'string') {
                return responseData.message;
            }

            if (typeof responseData.error === 'string') {
                return responseData.error;
            }

            if (typeof responseData.detail === 'string') {
                return responseData.detail;
            }

            if (responseData.errors && typeof responseData.errors === 'object') {
                const validationMessages = Object.values(responseData.errors)
                    .flatMap((value) => Array.isArray(value) ? value : [value])
                    .filter((value): value is string => typeof value === 'string');

                if (validationMessages.length > 0) {
                    return validationMessages.join(' ');
                }
            }

            if (typeof responseData.title === 'string') {
                return responseData.title;
            }
        }

        if (typeof maybeError.message === 'string') {
            return maybeError.message;
        }

        if (typeof maybeError.response?.statusText === 'string') {
            return maybeError.response.statusText;
        }
    }

    if (error instanceof Error) {
        return error.message || fallback;
    }

    return fallback;
};
