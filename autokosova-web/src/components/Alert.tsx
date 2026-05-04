import React from 'react';

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '!',
        info: 'ⓘ',
    };

    return (
        <div className={`border rounded-lg p-4 ${styles[type]}`}>
            <div className="flex gap-3">
                <div className="flex-shrink-0 text-xl font-bold">
                    {icons[type]}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 opacity-50 hover:opacity-100"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};
