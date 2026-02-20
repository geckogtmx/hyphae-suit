import React from 'react';
import { Card, Button, Badge } from './ui/base';
import { usePrepStore } from '../stores/prepStore';
import {
    ClipboardList,
    Clock,
    TrendingUp,
    AlertCircle,
    ChefHat,
    Zap,
    CheckCircle2,
    Play
} from 'lucide-react';
import type { RecipeDefinition, InventoryItem } from '../types';

export function PrepDashboard() {
    const { activeSchedule, activeTasks, passiveTasks, loadSchedule, selectTask } = usePrepStore();
    const [recipes, setRecipes] = React.useState<RecipeDefinition[]>([]);
    const [inventory, setInventory] = React.useState<InventoryItem[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = {
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                };
                const [recRes, invRes] = await Promise.all([
                    fetch('http://127.0.0.1:3001/api/recipes', { headers }),
                    fetch('http://127.0.0.1:3001/api/inventory', { headers })
                ]);
                if (recRes.ok) setRecipes(await recRes.json());
                if (invRes.ok) setInventory(await invRes.json());
            } catch (err) {
                console.error('Failed to fetch prep dashboard data', err);
            }
        };
        fetchData();
    }, []);

    const handleStartShift = () => {
        loadSchedule();
    };

    if (!activeSchedule) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="absolute -inset-4 bg-teal-mid/20 blur-2xl rounded-full animate-pulse" />
                    <ChefHat size={80} className="text-teal-bright relative z-10" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">KITCHEN PREP ENGINE</h2>
                    <p className="text-gray-400 mt-2 max-w-sm">No active schedule found for this station. Initializing morning prep protocols...</p>
                </div>
                <Button size="xl" onClick={handleStartShift} className="px-12 rounded-2xl shadow-lg shadow-teal-900/40 group">
                    <Zap className="mr-2 group-hover:animate-bounce" /> START PREP SHIFT
                </Button>
            </div>
        );
    }

    const completedTasks = activeSchedule.tasks.filter(t => t.status === 'completed');
    const progress = activeSchedule.tasks.length > 0
        ? Math.round((completedTasks.length / activeSchedule.tasks.length) * 100)
        : 0;

    const criticalInventory = inventory
        .filter(item => (item.stockKitchen || 0) < 5) // Simple threshold for demo
        .slice(0, 3);

    return (
        <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Summary */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{activeSchedule.name}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge variant="info" className="font-mono">{new Date(activeSchedule.targetDate).toLocaleDateString()}</Badge>
                        <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                            <Clock size={14} className="mr-1" /> Estimated: {Math.ceil(activeSchedule.tasks.reduce((acc, t) => acc + t.estimatedMinutes, 0) / 60)} Hours
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-64 bg-jet-700 h-14 rounded-2xl border border-jet-600 p-1 flex items-center relative overflow-hidden group">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-deep to-teal-mid transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="absolute inset-x-0 text-center text-xs font-black text-white z-10 drop-shadow-md">
                        PREP PROGRESS: {progress}%
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Main Task List */}
                <section className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">
                        <ClipboardList size={14} /> Critical Tasks Queue
                    </div>

                    {activeSchedule.tasks.map((task) => {
                        const recipe = recipes.find(r => r.id === task.recipeId);
                        const isCompleted = task.status === 'completed';

                        return (
                            <Card
                                key={task.id}
                                onClick={() => !isCompleted && selectTask(task)}
                                className={`group relative flex items-center justify-between p-4 border-l-4 transition-all active:scale-[0.98] cursor-pointer
                  ${isCompleted ? 'border-l-lime-500 opacity-60 bg-jet-700/50' : 'border-l-teal-mid hover:bg-jet-400 hover:border-l-teal-bright'}
                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                    ${isCompleted ? 'bg-lime-500/10 text-lime-500' : 'bg-ink-100/50 text-teal-bright'}
                  `}>
                                        {isCompleted ? <CheckCircle2 size={24} /> : <TrendingUp size={24} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                                            {recipe?.name || task.recipeId}
                                        </h3>
                                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-gray-500">
                                            <span>{task.targetQuantity} {task.unit}</span>
                                            <span className="w-1 h-1 bg-jet-700 rounded-full" />
                                            <span>{task.estimatedMinutes} Mins</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {task.status === 'pending' && (
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-teal-mid/10 text-teal-bright group-hover:bg-teal-mid group-hover:text-ink-100 transition-all">
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                    )}
                                    {isCompleted && (
                                        <Badge variant="success">READY</Badge>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </section>

                {/* Sidebar Insights */}
                <aside className="flex flex-col gap-6">
                    <Card className="bg-jet-700/30 border-dashed border-jet-600">
                        <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest mb-4">
                            <AlertCircle size={14} /> Critical Inventory
                        </div>
                        <div className="space-y-4">
                            {criticalInventory.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-ink-200/50 p-3 rounded-xl border border-jet-700">
                                    <div className="text-sm font-bold text-gray-200">{item.name}</div>
                                    <Badge variant={(item.stockKitchen || 0) <= 0 ? "danger" : "warning"}>
                                        {item.stockKitchen || 0} {item.stockUnit}
                                    </Badge>
                                </div>
                            ))}
                            {criticalInventory.length === 0 && (
                                <div className="text-center text-gray-500 text-xs py-4 italic">No critical alerts</div>
                            )}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-xs font-bold text-teal-bright uppercase tracking-widest">
                            Open Full Inventory <TrendingUp size={14} className="ml-2" />
                        </Button>
                    </Card>

                    <Card className="bg-gradient-to-br from-jet-700 to-ink-500 border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ChefHat size={80} />
                        </div>
                        <h4 className="text-xs font-black text-teal-bright uppercase tracking-widest mb-2">Station Assignment</h4>
                        <p className="text-2xl font-black text-white leading-tight">PREP STATION 04</p>
                        <p className="text-gray-400 text-sm mt-1 mb-6 italic">Current Op: Morning Bake & Sauce</p>

                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assigned Staff</div>
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-teal-mid border-2 border-jet-700 flex items-center justify-center text-[10px] font-bold">JD</div>
                                <div className="w-8 h-8 rounded-full bg-jet-400 border-2 border-jet-700 flex items-center justify-center text-[10px] font-bold">ML</div>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
