import { ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Button Component (SHASO Variants)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-jet-700';

    const variants = {
        primary: 'bg-teal-deep text-white hover:bg-teal-mid focus:ring-teal-mid',
        secondary: 'bg-jet-700 text-white hover:bg-jet-500 focus:ring-jet-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-600',
        ghost: 'hover:bg-jet-700 text-gray-300 hover:text-white',
        outline: 'border border-jet-700 text-gray-300 hover:bg-jet-700/50',
    };

    const sizes = {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-6 text-base',     // 44px min touch target
        lg: 'h-14 px-8 text-lg',       // 56px large target
        xl: 'h-[60px] px-10 text-xl', // SHASO 60px target
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}

// Card Component (Ink/Jet theme)
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('bg-jet-500 border border-jet-700 rounded-xl p-6 shadow-sm', className)}
            {...props}
        />
    );
}

// Badge Component (Status indicators)
export function Badge({ variant = 'default', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
    const variants = {
        default: 'bg-jet-700 text-gray-300',
        success: 'bg-lime-500/20 text-lime-500 border-lime-500/20',
        warning: 'bg-amber-500/20 text-amber-500 border-amber-500/20',
        danger: 'bg-red-500/20 text-red-500 border-red-500/20',
        info: 'bg-teal-mid/20 text-teal-bright border-teal-mid/20',
    };

    return (
        <span
            className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', variants[variant], className)}
            {...props}
        />
    );
}
