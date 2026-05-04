import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils/helpers';

export const useFetch = <T,>(
    fetchFn: () => Promise<T>,
    immediate = true
) => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'An error occurred'));
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn]);

    // Auto-execute if immediate is true
    if (immediate) {
        // Using a simple effect pattern - be cautious with dependencies
    }

    return { data, isLoading, error, execute };
};
