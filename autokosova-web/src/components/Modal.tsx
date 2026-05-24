import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    size?: 'default' | 'large';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    title,
    children,
    onClose,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    size = 'default',
}) => {
    if (!isOpen) return null;

    return (
        <div className="ak-modal" role="dialog" aria-modal="true" aria-labelledby="ak-modal-title">
            <button type="button" className="ak-modal__backdrop" aria-label="Close modal" onClick={onClose} />
            <div className={`ak-modal__panel ak-modal__panel--${size}`}>
                <div className="ak-modal__header">
                    <h2 id="ak-modal-title">{title}</h2>
                    <button type="button" onClick={onClose} className="ak-modal__close" aria-label="Close modal">
                        x
                    </button>
                </div>

                <div className="ak-modal__body">{children}</div>

                {(onConfirm || cancelText) && (
                    <div className="ak-modal__footer">
                        <button type="button" onClick={onClose} className="ak-button ak-button--secondary">
                            {cancelText}
                        </button>
                        {onConfirm && (
                            <button type="button" onClick={onConfirm} className="ak-button ak-button--primary">
                                {confirmText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
