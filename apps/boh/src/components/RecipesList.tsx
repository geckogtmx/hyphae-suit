import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from './ui/base';
import {
    Book,
    Search,
    ChevronRight,
    Flame,
    Clock,
    Scale,
    ListChecks,
    Monitor
} from 'lucide-react';
import type { RecipeDefinition } from '../types';
import { usePrepStore } from '../stores/prepStore';

export function RecipesList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [recipes, setRecipes] = useState<RecipeDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const addTaskFromRecipe = usePrepStore(state => state.addTaskFromRecipe);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await fetch('http://127.0.0.1:3001/api/recipes', {
                    headers: {
                        'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRecipes(data);
                }
            } catch (err) {
                console.error('Failed to fetch recipes', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeRecipe = recipes.find(r => r.id === selectedRecipeId);

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 p-4">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Kitchen Codex</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Official Recipes & Training Materials</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        className="w-full bg-jet-700 border border-jet-600 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-mid"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
                {/* Recipe Catalog */}
                <aside className="bg-jet-900/30 rounded-2xl border border-jet-700 flex flex-col min-h-0">
                    <div className="p-4 border-b border-jet-700 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Available Manuals ({filteredRecipes.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {filteredRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                onClick={() => setSelectedRecipeId(recipe.id)}
                                className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group
                                    ${selectedRecipeId === recipe.id ? 'bg-teal-mid/20 border border-teal-mid/30' : 'hover:bg-jet-700 border border-transparent'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-jet-700 rounded-lg group-hover:bg-jet-500 transition-colors">
                                        <Book size={18} className={selectedRecipeId === recipe.id ? 'text-teal-bright' : 'text-gray-400'} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{recipe.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">{recipe.category}</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className={`transition-transform ${selectedRecipeId === recipe.id ? 'translate-x-1 text-teal-bright' : 'text-gray-700'}`} />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Training View */}
                <main className="lg:col-span-2 bg-jet-800/50 rounded-2xl border border-jet-700 overflow-hidden flex flex-col relative">
                    {activeRecipe ? (
                        <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
                            {/* Recipe Banner */}
                            <div className="p-8 bg-gradient-to-r from-teal-deep/30 to-jet-900 border-b border-jet-700">
                                <Badge variant="info" className="mb-4 uppercase tracking-widest">{activeRecipe.category}</Badge>
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-4 leading-none">{activeRecipe.name}</h1>

                                <div className="flex flex-wrap gap-6 mt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Active Time</span>
                                        <span className="text-xl font-black text-white flex items-center"><Clock size={16} className="mr-2 text-teal-bright" /> {activeRecipe.activeTimeMinutes}m</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Yield</span>
                                        <span className="text-xl font-black text-white flex items-center"><Scale size={16} className="mr-2 text-teal-bright" /> {activeRecipe.yieldQuantity} {activeRecipe.yieldUnit}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Complexity</span>
                                        <span className="text-xl font-black text-white flex items-center"><Flame size={16} className="mr-2 text-orange-500" /> MEDIUM</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Component List */}
                                    <div>
                                        <h3 className="text-xs font-black text-teal-bright uppercase tracking-widest mb-6 flex items-center">
                                            <Scale size={14} className="mr-2" /> Ingredients
                                        </h3>
                                        <div className="space-y-4">
                                            {activeRecipe.components.map((comp, i) => (
                                                <div key={i} className="flex justify-between items-end pb-2 border-b border-ink-100">
                                                    <span className="text-gray-300 font-bold">{comp.inventoryItemId.replace('_', ' ').toUpperCase()}</span>
                                                    <span className="font-mono text-white text-lg font-black">{comp.quantity}{comp.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Step Guide */}
                                    <div>
                                        <h3 className="text-xs font-black text-teal-bright uppercase tracking-widest mb-6 flex items-center">
                                            <ListChecks size={14} className="mr-2" /> Preparation Steps
                                        </h3>
                                        <div className="space-y-6">
                                            {activeRecipe.steps.map((step, i) => (
                                                <div key={i} className="flex gap-4 group">
                                                    <div className="h-8 w-8 rounded-lg bg-jet-700 flex items-center justify-center text-teal-bright font-black shrink-0 border border-jet-600 group-hover:bg-teal-mid group-hover:text-ink-100 transition-colors">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-gray-300 text-sm leading-relaxed pt-1">{step.instruction}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <footer className="p-4 bg-jet-900/50 border-t border-jet-700 flex justify-end">
                                <Button
                                    size="lg"
                                    className="rounded-xl font-black px-8"
                                    onClick={() => activeRecipe && addTaskFromRecipe(activeRecipe.id, 1)}
                                >
                                    <Monitor size={18} className="mr-2" /> START BATCH TRACKING
                                </Button>
                            </footer>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                            <Book size={64} className="mb-4" />
                            <p className="text-xl font-black uppercase tracking-widest">Select a manual to view protocols</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
