import React, { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, Save, ChefHat,
    ListChecks, Flame, Scale, Clock,
    Timer, Shield, Info, Package,
    ArrowRight, Search, CheckCircle2
} from 'lucide-react';
import type { RecipeDefinition, InventoryItem, RecipeComponent, RecipeStep } from '../types/schema';

interface RecipeBuilderProps {
    initialRecipe?: Partial<RecipeDefinition>;
    inventory: InventoryItem[];
    onSave: (recipe: any) => Promise<void>;
    onClose: () => void;
}

export const RecipeBuilder: React.FC<RecipeBuilderProps> = ({
    initialRecipe,
    inventory,
    onSave,
    onClose
}) => {
    const [recipe, setRecipe] = useState<any>({
        id: initialRecipe?.id || '',
        name: initialRecipe?.name || '',
        type: initialRecipe?.type || 'BATCH',
        category: initialRecipe?.category || 'assembly',
        yieldQuantity: initialRecipe?.yieldQuantity || 1,
        yieldUnit: initialRecipe?.yieldUnit || 'count',
        activeTimeMinutes: initialRecipe?.activeTimeMinutes || 0,
        totalTimeMinutes: initialRecipe?.totalTimeMinutes || 0,
        outputInventoryItemId: initialRecipe?.outputInventoryItemId || '',
        storageInstructions: initialRecipe?.storageInstructions || '',
        shelfLifeDays: initialRecipe?.shelfLifeDays || 1,
        equipment: initialRecipe?.equipment || [],
        components: initialRecipe?.components || [],
        steps: initialRecipe?.steps || []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'BOM' | 'STEPS'>('DETAILS');

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddComponent = (item: InventoryItem) => {
        if (recipe.components.find((c: any) => c.inventoryItemId === item.id)) return;

        setRecipe({
            ...recipe,
            components: [
                ...recipe.components,
                {
                    inventoryItemId: item.id,
                    quantity: 1,
                    unit: item.stockUnit
                }
            ]
        });
        setSearchTerm('');
    };

    const handleUpdateComponent = (itemId: string, updates: Partial<RecipeComponent>) => {
        setRecipe({
            ...recipe,
            components: recipe.components.map((c: any) =>
                c.inventoryItemId === itemId ? { ...c, ...updates } : c
            )
        });
    };

    const handleRemoveComponent = (itemId: string) => {
        setRecipe({
            ...recipe,
            components: recipe.components.filter((c: any) => c.inventoryItemId !== itemId)
        });
    };

    const handleAddStep = () => {
        setRecipe({
            ...recipe,
            steps: [
                ...recipe.steps,
                {
                    stepNumber: recipe.steps.length + 1,
                    instruction: '',
                    type: 'active',
                    durationMinutes: 0
                }
            ]
        });
    };

    const handleUpdateStep = (index: number, updates: Partial<RecipeStep>) => {
        setRecipe({
            ...recipe,
            steps: recipe.steps.map((s: any, i: number) =>
                i === index ? { ...s, ...updates } : s
            )
        });
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = recipe.steps.filter((_: any, i: number) => i !== index)
            .map((s: any, i: number) => ({ ...s, stepNumber: i + 1 }));
        setRecipe({ ...recipe, steps: newSteps });
    };

    const handleSave = async () => {
        if (!recipe.name) return alert('Recipe Name is required');
        setIsSaving(true);
        try {
            await onSave(recipe);
            onClose();
        } catch (error) {
            console.error('Failed to save recipe', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-5xl h-[90vh] bg-jet-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand/20 rounded-2xl border border-brand/20">
                            <ChefHat className="text-brand" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                {recipe.id ? 'Edit Recipe' : 'New Culinary Protocol'}
                            </h2>
                            <div className="text-[10px] text-gray-500 font-mono">HYPHAE CULINARY ENGINE v2.0</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand text-black font-black text-xs rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Timer className="animate-spin" size={16} /> : <Save size={16} />}
                            SAVE PROTOCOL
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* NAV */}
                <div className="flex px-6 border-b border-white/5">
                    {[
                        { id: 'DETAILS', label: '1. Metadata', icon: Info },
                        { id: 'BOM', label: '2. Bill of Materials', icon: Scale },
                        { id: 'STEPS', label: '3. Execution Sequence', icon: ListChecks }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-brand' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'DETAILS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Protocol Name</label>
                                    <input
                                        type="text"
                                        value={recipe.name}
                                        onChange={e => setRecipe({ ...recipe, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-all font-bold"
                                        placeholder="e.g. Code BS Master Patty"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Type</label>
                                        <select
                                            value={recipe.type}
                                            onChange={e => setRecipe({ ...recipe, type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-all text-xs"
                                        >
                                            <option value="BATCH">BATCH (PREP)</option>
                                            <option value="ASSEMBLY">PRODUCT (SALES)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Category</label>
                                        <select
                                            value={recipe.category}
                                            onChange={e => setRecipe({ ...recipe, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-all text-xs uppercase"
                                        >
                                            <option value="protein">Protein</option>
                                            <option value="bread">Bread</option>
                                            <option value="sauce">Sauce</option>
                                            <option value="produce">Produce</option>
                                            <option value="assembly">Assembly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Yield Quantity</label>
                                        <input
                                            type="number"
                                            value={recipe.yieldQuantity}
                                            onChange={e => setRecipe({ ...recipe, yieldQuantity: parseFloat(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Yield Unit</label>
                                        <input
                                            type="text"
                                            value={recipe.yieldUnit}
                                            onChange={e => setRecipe({ ...recipe, yieldUnit: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-all text-xs"
                                            placeholder="count, lbs, oz..."
                                        />
                                    </div>
                                </div>

                                {recipe.type === 'BATCH' && (
                                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ArrowRight className="text-purple-400" size={14} />
                                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Output Mapping</span>
                                        </div>
                                        <label className="block text-[9px] text-gray-500 uppercase mb-1">Link to PREP Stock Item</label>
                                        <select
                                            value={recipe.outputInventoryItemId}
                                            onChange={e => setRecipe({ ...recipe, outputInventoryItemId: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none text-xs"
                                        >
                                            <option value="">No Auto-Depletion</option>
                                            {inventory.filter(i => i.type === 'PREP').map(i => (
                                                <option key={i.id} value={i.id}>{i.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Active Time (m)</label>
                                        <input
                                            type="number"
                                            value={recipe.activeTimeMinutes}
                                            onChange={e => setRecipe({ ...recipe, activeTimeMinutes: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Time (m)</label>
                                        <input
                                            type="number"
                                            value={recipe.totalTimeMinutes}
                                            onChange={e => setRecipe({ ...recipe, totalTimeMinutes: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Storage Instructions</label>
                                    <textarea
                                        value={recipe.storageInstructions}
                                        onChange={e => setRecipe({ ...recipe, storageInstructions: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none h-24 text-sm"
                                        placeholder="e.g. Wrap in parchment, store @ 4C"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Equipment (Comma Separated)</label>
                                    <input
                                        type="text"
                                        value={recipe.equipment?.join(', ')}
                                        onChange={e => setRecipe({ ...recipe, equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none text-xs"
                                        placeholder="Griddle, Spatula, Scale..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'BOM' && (
                        <div className="flex gap-12 h-full">
                            <div className="w-1/3 flex flex-col gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search inventory..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-brand"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto border border-white/5 rounded-2xl p-2 space-y-1 bg-black/40">
                                    {filteredInventory.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleAddComponent(item)}
                                            className="w-full text-left p-3 rounded-xl hover:bg-white/5 group flex items-center justify-between transition-all"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-brand transition-colors">{item.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{item.stockKitchen || item.stockStand || 0} {item.stockUnit}</div>
                                            </div>
                                            <Plus size={14} className="text-gray-600 group-hover:text-brand" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Active Bill of Materials ({recipe.components.length})</h3>
                                {recipe.components.map((comp: any) => {
                                    const item = inventory.find(i => i.id.toLowerCase() === comp.inventoryItemId.toLowerCase());
                                    return (
                                        <div key={comp.inventoryItemId} className="flex items-center gap-6 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-brand/20 transition-all">
                                            <div className="flex-1">
                                                <div className="text-sm font-black text-white">{item?.name || 'Unknown'}</div>
                                                <div className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{comp.inventoryItemId}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-500 font-black uppercase mb-1">Qty</span>
                                                    <input
                                                        type="number"
                                                        value={comp.quantity}
                                                        onChange={e => handleUpdateComponent(comp.inventoryItemId, { quantity: parseFloat(e.target.value) })}
                                                        className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-none focus:border-brand"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-500 font-black uppercase mb-1">Unit</span>
                                                    <input
                                                        type="text"
                                                        value={comp.unit}
                                                        onChange={e => handleUpdateComponent(comp.inventoryItemId, { unit: e.target.value as any })}
                                                        className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray-400 text-center uppercase outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveComponent(comp.inventoryItemId)}
                                                    className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {recipe.components.length === 0 && (
                                    <div className="h-64 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-600">
                                        <Package size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm">No items added to the BOM yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'STEPS' && (
                        <div className="max-w-3xl mx-auto space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Instructional Flow</h3>
                                <button
                                    onClick={handleAddStep}
                                    className="px-4 py-2 bg-white/5 border border-white/10 text-brand font-black text-[10px] rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <Plus size={14} /> ADD STEP
                                </button>
                            </div>

                            <div className="space-y-4">
                                {recipe.steps.map((step: any, index: number) => (
                                    <div key={index} className="flex gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl group">
                                        <div className="shrink-0 flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-jet-700 flex items-center justify-center text-brand font-black border border-jet-600">
                                                {index + 1}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveStep(index)}
                                                className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <textarea
                                                value={step.instruction}
                                                onChange={e => handleUpdateStep(index, { instruction: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-brand h-24 text-sm resize-none"
                                                placeholder="Describe the action..."
                                            />
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Timing (min)</span>
                                                    <input
                                                        type="number"
                                                        value={step.durationMinutes}
                                                        onChange={e => handleUpdateStep(index, { durationMinutes: parseInt(e.target.value) })}
                                                        className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center font-mono outline-none focus:border-brand"
                                                    />
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer group/check">
                                                    <input
                                                        type="checkbox"
                                                        checked={step.isCheckpoint}
                                                        onChange={e => handleUpdateStep(index, { isCheckpoint: e.target.checked })}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${step.isCheckpoint ? 'bg-brand border-brand' : 'border-white/20'}`}>
                                                        {step.isCheckpoint && <CheckCircle2 size={12} className="text-black" />}
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/check:text-gray-300 transition-colors">Safety Checkpoint</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {recipe.steps.length === 0 && (
                                    <button
                                        onClick={handleAddStep}
                                        className="w-full h-48 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-600 hover:border-brand/30 hover:text-brand transition-all group"
                                    >
                                        <ListChecks size={48} className="mb-4 opacity-20 group-hover:opacity-40 transition-all" />
                                        <p className="text-sm">Click to begin the sequence architect.</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
