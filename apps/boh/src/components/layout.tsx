import { useState, useCallback } from 'react';
import { ChefHat, Warehouse, BookOpen, Truck, Settings, Clock } from 'lucide-react';
import { Button, Badge } from './ui/base';

interface NavigationProps {
    currentRoute: 'prep' | 'inventory' | 'recipes' | 'receiving' | 'ops';
    onNavigate: (route: string) => void;
}

export function Navigation({ currentRoute, onNavigate }: NavigationProps) {
    const routes = [
        { id: 'prep', icon: ChefHat, label: 'Prep' },
        { id: 'inventory', icon: Warehouse, label: 'Stock' },
        { id: 'recipes', icon: BookOpen, label: 'Recipes' },
        { id: 'receiving', icon: Truck, label: 'Receive' },
        { id: 'ops', icon: Clock, label: 'Shift' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ink-500 border-t border-jet-700 h-[80px] flex items-center justify-around pb-safe">
            {routes.map((route) => (
                <Button
                    key={route.id}
                    variant={currentRoute === route.id ? 'primary' : 'ghost'}
                    size="lg" // 56px large target
                    onClick={() => onNavigate(route.id)}
                    className="flex-col gap-1 w-full h-full rounded-none active:bg-jet-700"
                >
                    <route.icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{route.label}</span>
                </Button>
            ))}
        </nav>
    );
}

export function Header({ status = 'active' }: { status?: 'active' | 'passive' }) {
    const [time, setTime] = useState(new Date());

    // Clock update logic would go here

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-ink-500 border-b border-jet-700 h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white">
                    <span className="text-teal-bright">Batch</span>Prep
                </h1>
                <Badge variant={status === 'active' ? 'success' : 'warning'}>
                    {status === 'active' ? '● Live' : '○ Idle'}
                </Badge>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="text-sm font-medium text-white">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-400">
                        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
                <Button variant="ghost" size="sm">
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
