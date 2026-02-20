import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Minus, Calculator, RefreshCw, ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react';
import { ApiClient } from '../lib/apiClient';
import { runForecast, ForecastTarget, ForecastResultItem } from '../lib/forecastEngine';
import { Product, RecipeDefinition, InventoryItem } from '../types/schema';

export const ForecastView = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [recipes, setRecipes] = useState<RecipeDefinition[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [targets, setTargets] = useState<ForecastTarget[]>([]);
    const [results, setResults] = useState<ForecastResultItem[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        Promise.all([
            ApiClient.getProducts(),
            ApiClient.getRecipes(),
            ApiClient.getInventory()
        ]).then(([p, r, i]) => {
            setProducts(p && p.length > 0 ? p : []);
            setRecipes(r || []);
            setInventory(i || []);
            setLoading(false);
        });
    }, []);

    const addTarget = (product: Product) => {
        setTargets(prev => {
            const existing = prev.find(t => t.productId === product.id);
            if (existing) {
                return prev.map(t => t.productId === product.id ? { ...t, targetCount: t.targetCount + 10 } : t);
            }
            return [...prev, { productId: product.id, productName: product.name, targetCount: 10 }];
        });
    };

    const updateTarget = (productId: string, delta: number) => {
        setTargets(prev => prev.map(t => t.productId === productId ? { ...t, targetCount: Math.max(0, t.targetCount + delta) } : t).filter(t => t.targetCount > 0));
    };

    const handleCalculate = () => {
        setIsCalculating(true);
        setTimeout(() => {
            const res = runForecast(targets, products, recipes, inventory);
            setResults(res);
            setIsCalculating(false);
        }, 600);
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-brand font-mono animate-pulse">Initializing Forecast Engine...</div>;

    const totalEstimatedCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <TrendingUp className="text-amber-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Forecast Engine (PLN)</h2>
                    <div className="h-0.5 w-12 bg-amber-400 mt-1 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Target Input */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold font-mono text-gray-400 uppercase mb-4 flex items-center gap-2">
                            <Calculator size={16} /> Projected Sales Targets
                        </h3>

                        <div className="space-y-3 mb-6">
                            {targets.length === 0 ? (
                                <div className="text-xs font-mono text-gray-600 bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                                    No targets set. Add products below to simulate required inventory.
                                </div>
                            ) : targets.map(target => (
                                <div key={target.productId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                                    <span className="font-bold text-gray-200">{target.productName}</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateTarget(target.productId, -10)} className="p-1 rounded bg-black/50 text-gray-400 hover:text-white"><Minus size={14} /></button>
                                        <span className="w-12 text-center font-mono font-bold text-brand">{target.targetCount}</span>
                                        <button onClick={() => updateTarget(target.productId, 10)} className="p-1 rounded bg-black/50 text-gray-400 hover:text-white"><Plus size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={targets.length === 0 || isCalculating}
                            className="w-full py-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl font-bold tracking-widest text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isCalculating ? <RefreshCw size={18} className="animate-spin" /> : <Calculator size={18} />}
                            RUN EXPLOSION ENGINE
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xs font-bold font-mono text-gray-500 uppercase mb-4">Available Menu Items</h3>
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                            {products.filter(p => p.inventoryMetadata?.recipeId || p.inventoryMetadata?.directDepletion).map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addTarget(product)}
                                    className="p-3 bg-black/40 border border-white/5 rounded-xl text-left hover:border-brand/30 transition-colors group flex flex-col justify-between h-20"
                                >
                                    <span className="font-bold text-sm text-gray-300 group-hover:text-white line-clamp-1">{product.name}</span>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-mono text-gray-500 uppercase">{product.inventoryMetadata?.recipeId ? 'Assembly' : 'Direct'}</span>
                                        <Plus size={14} className="text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Shopping List Results */}
                <div className="lg:col-span-7">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold font-mono text-amber-400 uppercase flex items-center gap-2">
                                <ShoppingCart size={16} /> Required Shopping List
                            </h3>
                            {results.length > 0 && (
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Total Estimated Cost</div>
                                    <div className="text-2xl font-mono font-bold text-white flex items-center gap-1">
                                        <DollarSign size={20} className="text-gray-500" />
                                        {totalEstimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {results.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                                    <Package size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm">Run the explosion engine to generate a shopping list.</p>
                                </div>
                            ) : results.map((res, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-black/40 rounded-lg text-gray-500 group-hover:text-amber-400">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-200">{res.inventoryItem.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded text-gray-400 uppercase">
                                                    {res.inventoryItem.type || 'RAW'}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-500">
                                                    @{res.inventoryItem.costPerUnit.toFixed(2)}/{res.unit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-mono font-bold text-brand">
                                            {res.requiredQuantity.toFixed(res.requiredQuantity % 1 === 0 ? 0 : 2)} <span className="text-sm text-brand/50">{res.unit}</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-500 mt-1">
                                            EST. COST: ${(res.estimatedCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
