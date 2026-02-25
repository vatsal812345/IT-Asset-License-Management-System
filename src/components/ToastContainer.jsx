import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast }) => {
    // Portal to body to avoid z-index/transform issues
    return createPortal(
        <div 
            className="fixed top-6 right-6 z-9999 flex flex-col items-end pointer-events-none"
            aria-live="polite"
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={removeToast}
                />
            ))}
        </div>,
        document.body
    );
};

export default ToastContainer;
