/**
 * @author Hyphae POS Team
 * @description Toast notification component using Framer Motion.
 * @version 1.0.0
 * @last-updated 2026-02-19
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { ToastMessage, ToastType } from '../../types';

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const typeStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
    success: {
        bg: 'bg-zinc-900 border-lime-500/50',
        border: 'border-lime-500',
        icon: <CheckCircle className="text-lime-500" size={20} />,
        text: 'text-zinc-100',
    },
    error: {
        bg: 'bg-zinc-900 border-red-500/50',
        border: 'border-red-500',
        icon: <AlertOctagon className="text-red-500" size={20} />,
        text: 'text-zinc-100',
    },
    warning: {
        bg: 'bg-zinc-900 border-yellow-500/50',
        border: 'border-yellow-500',
        icon: <AlertTriangle className="text-yellow-500" size={20} />,
        text: 'text-zinc-100',
    },
    info: {
        bg: 'bg-zinc-900 border-blue-500/50',
        border: 'border-blue-500',
        icon: <Info className="text-blue-500" size={20} />,
        text: 'text-zinc-100',
    },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    const style = typeStyles[toast.type];

    return (
        <motion.div
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
        pointer-events-auto
        flex items-start w-full max-w-sm rounded-xl p-4 shadow-2xl border
        ${style.bg} ${style.border} ${style.text}
        backdrop-blur-md relative overflow-hidden
      `}
        >
            <div className="shrink-0 mr-3 mt-0.5">{style.icon}</div>
            <div className="flex-1 mr-2">
                <h4 className="font-bold text-sm tracking-wide uppercase mb-0.5">{toast.title}</h4>
                {toast.description && <p className="text-sm opacity-90 leading-relaxed">{toast.description}</p>}
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            >
                <X size={16} />
            </button>

            {/* Progress Bar (Optional Visual Flair) */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 bg-current opacity-20`}
                style={{ color: style.border.replace('border-', 'text-') }} // Hacky way to get color, but works with tailwind classes if we used actual colors
            />
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div
            className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none p-4 w-full max-w-sm items-end"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
};
