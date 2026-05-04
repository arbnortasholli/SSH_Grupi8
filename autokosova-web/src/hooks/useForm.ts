import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils/helpers';

interface UseFormState {
    [key: string]: string | number | boolean | undefined;
}

interface UseFormMethods<T> {
    values: T;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
    setValues: (values: T) => void;
    reset: () => void;
    isSubmitting: boolean;
    error: string | null;
}

export const useForm = <T extends UseFormState>(initialValues: T): UseFormMethods<T> => {
    const [values, setValues] = useState<T>(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

            setValues((prev) => ({
                ...prev,
                [name]: val,
            }));
            setError(null);
        },
        []
    );

    const handleSubmit = useCallback(
        (onSubmit: (values: T) => Promise<void>) =>
            async (e: React.FormEvent) => {
                e.preventDefault();
                setIsSubmitting(true);
                setError(null);

                try {
                    await onSubmit(values);
                } catch (err: unknown) {
                    setError(getErrorMessage(err, 'An error occurred'));
                } finally {
                    setIsSubmitting(false);
                }
            },
        [values]
    );

    const reset = useCallback(() => {
        setValues(initialValues);
        setError(null);
    }, [initialValues]);

    return {
        values,
        handleChange,
        handleSubmit,
        setValues,
        reset,
        isSubmitting,
        error,
    };
};
