import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    ...props
}) => {
    const variantStyles = {
        primary: 'bg-primary text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'text-gray-700 border border-gray-300 hover:bg-gray-50',
    };

    const sizeStyles = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed
        font-medium inline-flex items-center gap-2
      `}
            {...props}
        >
            {isLoading && <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />}
            {children}
        </button>
    );
};
