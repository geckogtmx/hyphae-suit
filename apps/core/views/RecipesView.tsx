import React, { useEffect, useState } from 'react';
import { ChefHat, BookOpen, Clock, Flame, ListChecks, Timer, Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import type { RecipeDefinition, InventoryItem } from '../types/schema';
import { RecipeBuilder } from '../components/RecipeBuilder';

export const RecipesView = () => {
    const [recipes, setRecipes] = useState<RecipeDefinition[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<RecipeDefinition | null>(null);

    const fetchData = async () => {
        setLoading(true);
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
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveRecipe = async (recipe: any) => {
        const method = recipe.id ? 'PUT' : 'POST';
        const url = recipe.id
            ? `http://127.0.0.1:3001/api/recipes/${recipe.id}`
            : 'http://127.0.0.1:3001/api/recipes';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                },
                body: JSON.stringify(recipe)
            });

            if (res.ok) {
                fetchData();
            } else {
                alert('Failed to save recipe');
            }
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    const handleDeleteRecipe = async (id: string) => {
        if (!confirm('Permanently delete this protocol?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:3001/api/recipes/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    if (loading && recipes.length === 0) return (
        <div className="p-8 pt-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            <div className="text-gray-500 font-mono text-sm mt-4 tracking-widest">QUERYING CULINARY ENGINE...</div>
        </div>
    );

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <ChefHat className="text-brand" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Master Recipes</h2>
                        <div className="text-[10px] text-gray-500 font-mono">INTERNAL PROTOCOLS & ASSEMBLY GUIDE</div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingRecipe(null);
                        setIsBuilderOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-brand text-black font-black text-xs rounded-2xl hover:bg-brand/90 transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)]"
                >
                    <Plus size={18} strokeWidth={3} />
                    NEW PROTOCOL
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {recipes.map(recipe => (
                    <div key={recipe.id} className="glass-panel group overflow-hidden border border-white/5 bg-white/5 hover:border-brand/20 transition-all duration-500">
                        <div className="p-6 bg-gradient-to-r from-transparent to-white/[0.02]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-brand transition-colors">
                                        {recipe.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${recipe.type === 'BATCH'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {recipe.type === 'BATCH' ? 'PROTOCOL: BATCH' : 'PROTOCOL: PRODUCT'}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">CATEGORY: {recipe.category?.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-brand font-mono font-bold">{recipe.yieldQuantity} {recipe.yieldUnit}</div>
                                        <div className="text-[10px] text-gray-500 font-mono uppercase">Standard Yield</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingRecipe(recipe);
                                                setIsBuilderOpen(true);
                                            }}
                                            className="p-2 bg-white/5 hover:bg-brand hover:text-black rounded-lg text-gray-400 transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRecipe(recipe.id)}
                                            className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg text-gray-400 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-gray-500" />
                                    <div className="text-[10px] font-mono text-gray-400">ACTIVE: <span className="text-white">{recipe.activeTimeMinutes}m</span></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer size={12} className="text-gray-500" />
                                    <div className="text-[10px] font-mono text-gray-400">TOTAL: <span className="text-white">{recipe.totalTimeMinutes}m</span></div>
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <Shield size={12} className="text-emerald-500" />
                                    <div className="text-[10px] font-mono text-emerald-400">HACCP SECURE</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left: Ingredients */}
                            <div className="p-6 border-t md:border-t-0 md:border-r border-white/5 bg-black/20">
                                <h4 className="text-[10px] font-mono text-brand uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Flame size={12} /> Bill of Materials
                                </h4>
                                <div className="space-y-1.5">
                                    {recipe.components?.map((ing) => (
                                        <div key={ing.inventoryItemId} className="flex justify-between items-center text-xs p-2 rounded bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                            <span className="text-gray-300">{ing.inventoryItemId.replace('_', ' ').toUpperCase()}</span>
                                            <span className="font-mono text-white font-bold">{ing.quantity} {ing.unit}</span>
                                        </div>
                                    ))}
                                </div>

                                {recipe.equipment && recipe.equipment.length > 0 && (
                                    <div className="mt-8">
                                        <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Required Gear</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {recipe.equipment.map(e => (
                                                <span key={e} className="text-[9px] px-2 py-1 bg-white/5 text-gray-400 rounded-md border border-white/5 uppercase font-bold tracking-wider">{e}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Steps */}
                            <div className="p-6 border-t border-white/5 bg-black/40">
                                <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ListChecks size={12} /> Execution Sequence
                                </h4>
                                <div className="space-y-4">
                                    {recipe.steps?.map((step) => (
                                        <div key={step.stepNumber} className="relative pl-6">
                                            <div className="absolute left-0 top-0 text-[10px] font-mono text-brand py-0.5">0{step.stepNumber}</div>
                                            <div className="text-xs text-gray-300 leading-relaxed">{step.instruction}</div>
                                            {step.durationMinutes && (
                                                <div className="text-[9px] font-mono text-gray-500 mt-1 uppercase tracking-tighter italic">⏱️ {step.durationMinutes} minutes</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {recipe.storageInstructions && (
                                    <div className="mt-8 p-4 bg-brand/5 border border-brand/10 rounded-xl">
                                        <h5 className="text-[9px] font-black text-brand uppercase mb-1">Storage Logistics</h5>
                                        <p className="text-[11px] text-brand/80 leading-normal">{recipe.storageInstructions}</p>
                                        <div className="mt-2 text-[9px] font-mono text-gray-500 uppercase">SHELF LIFE: {recipe.shelfLifeDays} DAYS</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isBuilderOpen && (
                <RecipeBuilder
                    initialRecipe={editingRecipe || undefined}
                    inventory={inventory}
                    onSave={handleSaveRecipe}
                    onClose={() => setIsBuilderOpen(false)}
                />
            )}
        </div>
    );
};
