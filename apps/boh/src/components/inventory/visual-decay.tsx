import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../ui/base';

export type DecayStatus = 'fresh' | 'use_soon' | 'expired';

export function VisualDecayIcon({ status, daysRemaining }: { status: DecayStatus, daysRemaining: number }) {
    // Double Coding: Color + Icon
    const config = {
        fresh: {
            color: 'text-teal-bright',
            bg: 'bg-teal-500/10',
            icon: CheckCircle,
            label: 'Fresh'
        },
        use_soon: {
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            icon: AlertTriangle,
            label: 'Use Soon'
        },
        expired: {
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            icon: XCircle,
            label: 'Expired'
        }
    };

    const { color, bg, icon: Icon, label } = config[status];

    return (
        <div className={cn("flex flex-col items-center justify-center p-2 rounded-lg gap-1", bg)}>
            <Icon className={cn("w-8 h-8", color)} />
            <span className={cn("text-xs font-bold uppercase", color)}>{label}</span>
            <span className="text-xs text-gray-400">{daysRemaining} days left</span>
        </div>
    );
}
