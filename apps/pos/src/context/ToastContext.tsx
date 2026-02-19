/**
 * @author Hyphae POS Team
 * @description Context for managing global toast notifications.
 * @version 1.0.0
 * @last-updated 2026-02-19
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastContainer } from '../components/ui/Toast';
import { ToastMessage } from '../types';

interface ToastContextType {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((toastData: Omit<ToastMessage, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast = { ...toastData, id };

        setToasts((prev) => [...prev, newToast]);

        if (toastData.duration !== 0) {
            setTimeout(() => {
                removeToast(id);
            }, toastData.duration || 5000);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
