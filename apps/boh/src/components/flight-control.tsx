import { useState } from 'react';
import { Card, Button, Badge } from './ui/base';
import { usePrepStore } from '../stores/prepStore';
import { Play, Pause, Square, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { Timer } from './status';
import { BakingView } from './engines/BakingView';
import { SauceView } from './engines/SauceView';
import { PrepDashboard } from './PrepDashboard';

export function FlightControl() {
    const { activeTasks, passiveTasks, selectedTask, recipes, fetchRecipes } = usePrepStore();
    const [activeZone, setActiveZone] = useState('focus'); // focus vs monitor
    const [showYieldModal, setShowYieldModal] = useState(false);
    const [actYield, setActYield] = useState(1);

    // Optional: fetch recipes if not loaded yet
    if (recipes.length === 0) {
        fetchRecipes();
    }

    const recipe = selectedTask ? recipes.find(r => r.id === selectedTask.recipeId) : null;

    if (!selectedTask) {
        return (
            <div className="p-4 h-screen pt-4 overflow-hidden">
                <PrepDashboard />
            </div>
        );
    }

    // --- FOCUS ZONE (60%) ---
    return (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] h-[calc(100vh-144px)] gap-4 p-4 mt-16 pb-20">
            {/* LEFT: Focus Zone */}
            <section className="bg-jet-500 rounded-2xl p-6 border border-jet-700 shadow-xl flex flex-col justify-between">
                <header className="flex justify-between items-start mb-6">
                    <div>
                        <Badge variant="info" className="mb-2">ACTIVE TASK</Badge>
                        <h2 className="text-3xl font-bold text-white">{recipe?.name || selectedTask.recipeId}</h2>
                        <div className="text-gray-400 mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Est: {selectedTask.estimatedMinutes}m
                        </div>
                    </div>
                    <Timer duration={15} />
                </header>

                <div className="flex-1 overflow-y-auto">
                    {recipe?.category === 'bread' ? (
                        <BakingView />
                    ) : recipe?.category === 'sauce' ? (
                        <SauceView />
                    ) : (
                        <div className="flex flex-col justify-center items-center text-center h-full">
                            <div className="text-teal-bright text-lg font-mono mb-4">STEP 3 OF 7</div>
                            <h1 className="text-6xl font-black text-white leading-tight mb-8">
                                Generic Task
                            </h1>
                            <p className="text-xl text-gray-300 max-w-lg">
                                Follow standard operating procedures.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="grid grid-cols-2 gap-4 mt-8">
                    <Button variant="secondary" size="xl" className="h-20 text-xl">
                        <Pause className="mr-3 w-8 h-8" /> PAUSE
                    </Button>
                    <Button
                        variant="primary"
                        size="xl"
                        className="h-20 text-2xl font-bold bg-teal-deep hover:bg-teal-mid"
                        onClick={() => {
                            setActYield(recipe?.yieldQuantity || selectedTask.targetQuantity);
                            setShowYieldModal(true);
                        }}
                    >
                        DONE <ArrowRight className="ml-3 w-8 h-8" />
                    </Button>
                </footer>
            </section>

            {/* YIELD MODAL */}
            {showYieldModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-jet-600 p-8 rounded-2xl w-[400px] shadow-2xl border border-jet-500 flex flex-col items-center">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase">Log Batch Yield</h3>
                        <p className="text-gray-400 text-center mb-6 text-sm">Target yield was <span className="font-bold text-white">{recipe?.yieldQuantity || selectedTask.targetQuantity} {recipe?.yieldUnit || 'units'}</span>. Enter actual yield from this batch.</p>

                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActYield(v => Math.max(0, v - 1))} className="w-12 h-12 rounded-lg bg-jet-700 hover:bg-jet-500 text-white font-black text-2xl flex items-center justify-center">-</button>
                            <input
                                type="number"
                                value={actYield}
                                onChange={(e) => setActYield(Number(e.target.value) || 0)}
                                className="w-24 bg-jet-800 border-2 border-teal-mid rounded-xl p-4 text-center font-mono font-black text-3xl text-teal-bright outline-none"
                            />
                            <button onClick={() => setActYield(v => v + 1)} className="w-12 h-12 rounded-lg bg-jet-700 hover:bg-jet-500 text-white font-black text-2xl flex items-center justify-center">+</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button variant="secondary" onClick={() => setShowYieldModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => {
                                setShowYieldModal(false);
                                if (selectedTask) usePrepStore.getState().completeTask(selectedTask.id, actYield);
                            }}>Confirm Yield</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* RIGHT: Monitor Zone (30%) */}
            <aside className="flex flex-col gap-4">
                <div className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1 px-1">
                    Running (Passive)
                </div>

                {/* Passive Task Cards */}
                {passiveTasks.map((task) => (
                    <Card key={task.id} className="bg-jet-700 border-jet-500 p-4 hover:bg-jet-600 transition-colors cursor-pointer active:scale-95">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-lg text-white truncate max-w-[70%]">{task.recipeId}</span>
                            <Badge variant="warning">Oven</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 relative">
                                <Timer duration={task.estimatedMinutes} />
                            </div>
                            <div className="flex-col">
                                <div className="text-2xl font-mono font-bold text-white">45:00</div>
                                <div className="text-xs text-gray-400">Step: Proofing</div>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Alerts Section */}
                <div className="mt-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                        <AlertTriangle className="w-5 h-5" /> Low Stock Warning
                    </div>
                    <div className="text-sm text-red-400">
                        Butter Inventory below par (500g). Restock needed for Brioche.
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                        View Inventory
                    </Button>
                </div>
            </aside>
        </div>
    );
}
