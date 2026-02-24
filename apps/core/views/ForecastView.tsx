import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Minus, Calculator, RefreshCw, ShoppingCart, DollarSign, Package, AlertCircle, Calendar, Save, Trash2, List } from 'lucide-react';
import { ApiClient } from '../lib/apiClient';
import { runForecast, ForecastTarget, ForecastResultItem } from '../lib/forecastEngine';
import { Product, RecipeDefinition, InventoryItem, PrepForecast } from '../types/schema';

export const ForecastView = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [recipes, setRecipes] = useState<RecipeDefinition[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [forecasts, setForecasts] = useState<PrepForecast[]>([]);

    const [loading, setLoading] = useState(true);

    const [activeForecastId, setActiveForecastId] = useState<string | null>(null);
    const [activeName, setActiveName] = useState('New Forecast');
    const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Equivalent to PrepForecastItem but simplified for UI
    const [targets, setTargets] = useState<ForecastTarget[]>([]);
    const [results, setResults] = useState<ForecastResultItem[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [p, r, i, f] = await Promise.all([
            ApiClient.getProducts(),
            ApiClient.getRecipes(),
            ApiClient.getInventory(),
            ApiClient.getForecasts()
        ]);
        setProducts(p && p.length > 0 ? p : []);
        setRecipes(r || []);
        setInventory(i || []);
        setForecasts(f || []);
        setLoading(false);
    };

    const handleSelectForecast = (f: PrepForecast) => {
        setActiveForecastId(f.id);
        setActiveName(f.name);
        const dateStr = new Date(f.targetDate).toISOString().split('T')[0];
        setActiveDate(dateStr);

        if (f.items) {
            const loadedTargets = f.items.map(item => {
                const p = products.find(prod => prod.id === item.productId);
                return {
                    productId: item.productId,
                    productName: p?.name || 'Unknown Product',
                    targetCount: item.targetQuantity
                };
            });
            setTargets(loadedTargets);
        } else {
            setTargets([]);
        }
        setResults([]);
    };

    const handleNewForecast = () => {
        setActiveForecastId(null);
        setActiveName('New Forecast Plan');
        setActiveDate(new Date().toISOString().split('T')[0]);
        setTargets([]);
        setResults([]);
    };

    const handleSave = async () => {
        if (!activeName.trim()) return alert("Name is required");
        setIsSaving(true);

        // Time noon UTC to avoid timezone day shifting
        const tDate = new Date(`${activeDate}T12:00:00Z`).getTime();

        const payload = {
            name: activeName,
            targetDate: tDate,
            status: 'ACTIVE',
            items: targets.map(t => ({
                productId: t.productId,
                targetQuantity: t.targetCount
            }))
        };

        try {
            if (activeForecastId) {
                await ApiClient.updateForecast(activeForecastId, payload);
            } else {
                const res = await ApiClient.createForecast(payload);
                setActiveForecastId(res.id);
            }
            await loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to save forecast");
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (!activeForecastId) return;
        if (!confirm("Delete this prep forecast?")) return;
        setIsSaving(true);
        try {
            await ApiClient.deleteForecast(activeForecastId);
            handleNewForecast();
            await loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to delete");
        }
        setIsSaving(false);
    };

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
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen flex gap-6">

            {/* Nav Sidebar for Forecasts */}
            <div className="w-80 shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Calendar className="text-amber-400" size={20} /> Scheduler
                    </h2>
                    <button onClick={handleNewForecast} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-amber-400 border border-amber-400/20 transition-colors">
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {forecasts.length === 0 ? (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-gray-500 font-mono">
                            No active prep plans.
                        </div>
                    ) : forecasts.map(f => (
                        <button
                            key={f.id}
                            onClick={() => handleSelectForecast(f)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${activeForecastId === f.id ? 'bg-amber-400/10 border-amber-400/30' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                        >
                            <div className={`font-bold text-sm ${activeForecastId === f.id ? 'text-amber-400' : 'text-gray-300'}`}>
                                {f.name}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-gray-500">
                                <Calendar size={12} /> {new Date(f.targetDate).toLocaleDateString()}
                                <span className="ml-auto bg-black/50 px-2 py-0.5 rounded text-gray-400">
                                    {(f.items?.length || 0)} TARGETS
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Left: Editor & Targets */}
                <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">

                    {/* Header Controls */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shrink-0 z-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1 space-y-3">
                                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">Plan Designation</label>
                                <input
                                    value={activeName}
                                    onChange={e => setActiveName(e.target.value)}
                                    className="w-full bg-transparent text-xl font-bold text-white outline-none border-b border-white/10 focus:border-amber-400 pb-1"
                                    placeholder="e.g. Weekend Rush Prep"
                                />
                            </div>
                            <div className="w-48 space-y-3">
                                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">Target Date</label>
                                <input
                                    type="date"
                                    value={activeDate}
                                    onChange={e => setActiveDate(e.target.value)}
                                    className="w-full bg-black/50 text-brand border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-amber-400 font-mono text-sm [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2 bg-brand/20 text-brand outline-none border border-brand/20 rounded-lg font-bold text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-brand/30 transition-all">
                                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} SAVE PLAN
                            </button>
                            {activeForecastId && (
                                <button onClick={handleDelete} disabled={isSaving} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col min-h-0">
                        <h3 className="text-sm font-bold font-mono text-gray-400 uppercase mb-4 flex items-center gap-2 shrink-0">
                            <List size={16} /> Sales Targets ({targets.length})
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                            {targets.length === 0 ? (
                                <div className="text-xs font-mono text-gray-600 bg-black/20 p-4 rounded-xl border border-white/5 text-center h-full flex items-center justify-center">
                                    No targets set. Pick products below.
                                </div>
                            ) : targets.map(target => (
                                <div key={target.productId} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                    <span className="font-bold text-gray-200">{target.productName}</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateTarget(target.productId, -10)} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white"><Minus size={14} /></button>
                                        <span className="w-12 text-center font-mono font-bold text-brand">{target.targetCount}</span>
                                        <button onClick={() => updateTarget(target.productId, 10)} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white"><Plus size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="shrink-0 space-y-3">
                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-t border-white/10 pt-4 mb-2">Append Target Products</div>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                                {products.filter(p => p.inventoryMetadata?.recipeId || p.inventoryMetadata?.directDepletion).map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addTarget(product)}
                                        className="p-2 bg-black/40 border border-white/5 rounded-lg text-left hover:border-brand/30 transition-colors group flex items-center justify-between"
                                    >
                                        <span className="font-bold text-xs text-gray-300 group-hover:text-white line-clamp-1 truncate mr-2">{product.name}</span>
                                        <Plus size={12} className="text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Results / Shopping List */}
                <div className="h-[calc(100vh-140px)] flex flex-col">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
                        {/* Background Deco */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
                            <h3 className="text-sm font-bold font-mono text-amber-400 uppercase flex items-center gap-2">
                                <Calculator size={16} /> Explosion Results
                            </h3>
                            {results.length > 0 && (
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Estimated Value</div>
                                    <div className="text-xl font-mono font-bold text-white flex items-center gap-1">
                                        <DollarSign size={16} className="text-gray-500" />
                                        {totalEstimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={targets.length === 0 || isCalculating}
                            className="shrink-0 mb-6 w-full py-4 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl font-bold tracking-widest text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 relative z-10"
                        >
                            {isCalculating ? <RefreshCw size={18} className="animate-spin" /> : <TrendingUp size={18} />}
                            CALCULATE INVENTORY NEEDS
                        </button>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 relative z-10">
                            {results.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                                    <Package size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm text-center px-8">Run the calculator to generate the aggregated shopping and prep lists for this plan.</p>
                                </div>
                            ) : results.map((res, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-black/40 rounded-lg text-gray-500 group-hover:text-amber-400">
                                            <Package size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-200 text-sm">{res.inventoryItem.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${res.inventoryItem.type === 'PREP' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {res.inventoryItem.type || 'RAW'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-mono font-bold text-brand">
                                            {res.requiredQuantity.toFixed(res.requiredQuantity % 1 === 0 ? 0 : 2)} <span className="text-xs text-brand/50">{res.unit}</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-500 mt-1">
                                            ${(res.estimatedCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
