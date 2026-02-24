import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    X,
    Plus,
    ChevronRight,
    Trash2,
    GripVertical,
    CheckCircle,
    Save,
    Layers,
    Link,
    Utensils,
    ChevronLeft,
    ChefHat,
    Check,
    RotateCcw,
} from 'lucide-react';
import { Product, ModifierGroup, ModifierOption, Category, Concept, RecipeDefinition, InventoryItem } from '../types/schema';

interface ProductBuilderProps {
    products: Product[];
    categories: Category[];
    recipes: RecipeDefinition[];
    inventory: InventoryItem[];
    activeConcept: Concept;
    onSave: (products: Product[]) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onRestore: (id: string) => Promise<void>;
    onPermanentDelete: (id: string) => Promise<void>;
    isTrashMode?: boolean;
    onClose?: () => void;
}

const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const ProductBuilder: React.FC<ProductBuilderProps> = ({
    products: initialProducts,
    categories,
    recipes,
    inventory,
    activeConcept,
    onSave,
    onDelete,
    onRestore,
    onPermanentDelete,
    isTrashMode,
    onClose
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
    const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);

    // Local state for editing
    const [sequences, setSequences] = useState<Product[]>(initialProducts);

    const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(
        sequences.length > 0 ? sequences[0].id : null
    );
    const [selectedStepId, setSelectedStepId] = useState<string | null>('ROOT');

    // SYNC local state when products prop changes (e.g. Concept Switch)
    useEffect(() => {
        setSequences(initialProducts);

        // Only auto-select first item if current selection is invalid or null
        // This prevents jumping back to first item after a Save operation
        if (initialProducts.length > 0) {
            if (!selectedSequenceId || !initialProducts.find(p => p.id === selectedSequenceId)) {
                setSelectedSequenceId(initialProducts[0].id);
                setSelectedStepId('ROOT');
            }
        } else {
            setSelectedSequenceId(null);
        }
    }, [initialProducts]);

    // Ref for horizontal scrolling timeline
    const timelineRef = useRef<HTMLDivElement>(null);

    const activeSequence = sequences.find((s) => s.id === selectedSequenceId);

    const visualSteps = useMemo(() => {
        if (!activeSequence) return [];
        const rootStep = {
            id: 'ROOT',
            name: activeSequence.name,
            type: 'ROOT_ITEM',
            price: activeSequence.price,
            options: [],
            required: true,
        };
        const groupSteps = (activeSequence.modifierGroups || []).map((g) => ({
            ...g,
            type: g.variant === 'sub_item' ? 'SUB_ITEM' : 'MODIFIER',
        }));
        return [rootStep, ...groupSteps];
    }, [activeSequence]);

    const activeVisualStep = visualSteps.find((s) => s.id === selectedStepId) || (visualSteps.length > 0 ? visualSteps[0] : null);
    const isActiveStepRoot = selectedStepId === 'ROOT';

    const calculateItemCost = (metadata: Product['inventoryMetadata'] | ModifierOption['inventoryMetadata']): number => {
        if (!metadata) return 0;
        let totalCost = 0;
        if (metadata.recipeId) {
            const recipe = recipes.find(r => r.id === metadata.recipeId);
            if (recipe && recipe.components) {
                recipe.components.forEach(comp => {
                    const invItem = inventory.find(i => i.id === comp.inventoryItemId);
                    if (invItem) {
                        totalCost += (comp.quantity * invItem.costPerUnit);
                    }
                });
            }
        } else if (metadata.directDepletion) {
            metadata.directDepletion.forEach(comp => {
                const invItem = inventory.find(i => i.id === comp.inventoryItemId);
                if (invItem) {
                    totalCost += (comp.quantity * invItem.costPerUnit);
                }
            });
        }
        return totalCost;
    };

    const rootCost = isActiveStepRoot && activeSequence ? calculateItemCost(activeSequence.inventoryMetadata) : 0;
    const rootMargin = isActiveStepRoot && activeSequence && activeSequence.price > 0 ? ((activeSequence.price - rootCost) / activeSequence.price) * 100 : 0;

    // Handle Mouse Wheel for Horizontal Scrolling on Timeline
    useEffect(() => {
        const element = timelineRef.current;
        if (!element) return;

        const handleWheel = (e: WheelEvent) => {
            // If no vertical scroll, let native behavior happen (e.g. touchpad horizontal swipe)
            if (e.deltaY === 0) return;
            e.preventDefault();
            element.scrollLeft += e.deltaY;
        };

        element.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            element.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const getParentItemName = (currentIndex: number) => {
        for (let i = currentIndex - 1; i >= 0; i--) {
            const step = visualSteps[i];
            if (step.type === 'ROOT_ITEM' || step.type === 'SUB_ITEM') return step.name;
        }
        return 'Unknown Item';
    };

    const handleSave = async () => {
        if (saveStatus !== 'IDLE') return;
        setSaveStatus('SAVING');
        try {
            await onSave(sequences);
            setSaveStatus('SAVED');
            setTimeout(() => setSaveStatus('IDLE'), 2000);
        } catch (error) {
            console.error('Failed to save products', error);
            setSaveStatus('IDLE');
        }
    };

    const handleSelectSequence = (id: string) => {
        setSelectedSequenceId(id);
        setSelectedStepId('ROOT');
    };

    const handleCreateSequence = () => {
        const defaultCategory = categories[0]?.id || 'burgers';
        const newSeq: Product = {
            id: generateId('seq'),
            name: 'New Sequence',
            price: 0,
            categoryId: defaultCategory,
            requiresMods: true,
            modifierGroups: [],
            stock: 100,
            // @ts-ignore - Core uses active but shared type makes it optional/undefined in some contexts
            active: true
        };
        setSequences([...sequences, newSeq]);
        setSelectedSequenceId(newSeq.id);
        setSelectedStepId('ROOT');
    };

    const updateSequence = (updated: Product) =>
        setSequences((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    const handleAddStep = () => {
        if (!activeSequence) return;
        const newStep: ModifierGroup = {
            id: generateId('step'),
            name: 'New Modifier Step',
            required: true,
            multiSelect: false,
            options: [],
        };
        updateSequence({
            ...activeSequence,
            modifierGroups: [...(activeSequence.modifierGroups || []), newStep],
        });
        setSelectedStepId(newStep.id);
    };

    const handleInsertStep = (visualIndex: number) => {
        if (!activeSequence) return;
        const arrayIndex = visualIndex - 1;
        const newStep: ModifierGroup = {
            id: generateId('step'),
            name: 'New Step',
            required: true,
            multiSelect: false,
            options: [],
        };
        const currentGroups = activeSequence.modifierGroups || [];
        updateSequence({
            ...activeSequence,
            modifierGroups: [
                ...currentGroups.slice(0, arrayIndex),
                newStep,
                ...currentGroups.slice(arrayIndex),
            ],
        });
        setSelectedStepId(newStep.id);
    };

    const updateCurrentGroup = (updates: Partial<ModifierGroup>) => {
        if (!activeSequence || isActiveStepRoot) return;
        updateSequence({
            ...activeSequence,
            modifierGroups: (activeSequence.modifierGroups || []).map((group) =>
                group.id === selectedStepId ? { ...group, ...updates } : group
            ),
        });
    };

    const handleAddOption = () => {
        if (!activeSequence || isActiveStepRoot) return;
        const currentGroup = activeSequence.modifierGroups?.find((g) => g.id === selectedStepId);
        if (!currentGroup) return;
        updateCurrentGroup({
            options: [...currentGroup.options, { id: generateId('opt'), name: 'New Item', price: 0 }],
        });
    };

    const updateOption = (optId: string, updates: Partial<ModifierOption>) => {
        if (isActiveStepRoot) return;
        const currentGroup = activeSequence.modifierGroups?.find((g) => g.id === selectedStepId);
        if (!currentGroup) return;
        updateCurrentGroup({
            options: currentGroup.options.map((opt) => (opt.id === optId ? { ...opt, ...updates } : opt)),
        });
    };

    const deleteOption = (optId: string) => {
        if (isActiveStepRoot) return;
        const currentGroup = activeSequence.modifierGroups?.find((g) => g.id === selectedStepId);
        if (!currentGroup) return;
        updateCurrentGroup({ options: currentGroup.options.filter((opt) => opt.id !== optId) });
    };

    const updateRootItem = (updates: Partial<Product>) => {
        if (activeSequence) updateSequence({ ...activeSequence, ...updates });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-black/40 rounded-3xl overflow-hidden border border-white/10">
            {/* HEADER */}
            <div className="h-16 border-b border-white/10 bg-black/20 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-brand">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">
                            MENU BUILDER
                        </h1>
                        <div className="flex items-center space-x-2 text-xs font-mono uppercase">
                            <span className="text-gray-500">Config Mode</span>
                            <span className="text-gray-600">/</span>
                            <span className={`font-bold text-${activeConcept.color.split('-')[0]}-400`}>
                                {activeConcept.name}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleSave}
                        disabled={saveStatus !== 'IDLE'}
                        className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm transition-all min-w-[140px] justify-center ${saveStatus === 'SAVED' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : saveStatus === 'SAVING' ? 'bg-brand/50 text-black cursor-wait' : 'bg-brand hover:bg-brand/80 text-black shadow-[0_0_15px_rgba(132,204,22,0.3)]'}`}
                    >
                        {saveStatus === 'SAVED' ? (
                            <>
                                <Check size={18} strokeWidth={3} className="mr-2 animate-in zoom-in duration-200" />
                                SAVED!
                            </>
                        ) : saveStatus === 'SAVING' ? (
                            <>
                                <Save size={18} className="mr-2 animate-pulse" />
                                SAVING...
                            </>
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                SAVE CHANGES
                            </>
                        )}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <div
                    className={`bg-black/20 border-r border-white/10 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none overflow-hidden'}`}
                >
                    <div className={`p-4 border-b border-white/10 flex justify-between items-center shrink-0 ${isTrashMode ? 'bg-red-500/10' : ''}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isTrashMode ? 'text-red-500' : 'text-gray-500'}`}>
                            {isTrashMode ? 'Recycle Bin' : 'Sequences'}
                        </span>
                        <button
                            onClick={handleCreateSequence}
                            className="p-1 hover:bg-white/10 rounded text-brand"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {sequences.map((s) => {
                            const isSelected = selectedSequenceId === s.id;
                            return (
                                <div
                                    key={s.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleSelectSequence(s.id)}
                                    className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group whitespace-nowrap cursor-pointer ${isSelected ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center justify-between group-hover:px-1 transition-all flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black shadow-inner flex-shrink-0 ${activeConcept.id === 'tacocracy' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {activeConcept.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`text-sm font-bold tracking-tight truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                                                    {s.name}
                                                </div>
                                                <div className={`text-[10px] font-mono font-bold uppercase truncate ${isSelected ? 'text-black/50' : 'text-gray-500'}`}>
                                                    ${s.price.toFixed(2)} • {activeConcept.name.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isTrashMode ? (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRestore(s.id);
                                                        }}
                                                        className="p-1.5 rounded-md hover:bg-black/10 transition-colors text-blue-400 hover:text-blue-300"
                                                        title="Restore"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onPermanentDelete(s.id);
                                                        }}
                                                        className="p-1.5 rounded-md hover:bg-black/10 transition-colors text-red-500 hover:text-red-400"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(s.id);
                                                    }}
                                                    className={`p-1.5 rounded-md hover:bg-black/10 transition-colors ${isSelected ? 'text-black/60 hover:text-red-600' : 'text-gray-500 hover:text-red-400'}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            {isSelected && <ChevronRight size={16} className="shrink-0" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN AREA */}
                <div
                    className="flex-1 flex flex-col bg-transparent relative"
                    onClickCapture={() => {
                        if (window.innerWidth < 768 && isSidebarOpen) setIsSidebarOpen(false);
                    }}
                >
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`absolute top-1/2 -translate-y-1/2 z-30 w-5 h-12 bg-black/40 border-y border-r border-white/10 rounded-r-xl flex items-center justify-center text-gray-500 hover:text-brand hover:border-brand transition-all shadow-lg left-0 backdrop-blur-md`}
                    >
                        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {activeSequence ? (
                        <>
                            <div className="flex-1 p-8 overflow-y-auto pb-48">
                                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 pl-4">
                                    <div className="flex items-center">
                                        {isActiveStepRoot ? (
                                            <span className="bg-brand/20 text-brand px-3 py-1 rounded text-sm font-bold uppercase mr-3 border border-brand/20">
                                                MAIN ITEM (ROOT)
                                            </span>
                                        ) : (activeVisualStep as { type?: string }).type === 'SUB_ITEM' ? (
                                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-bold uppercase mr-3 border border-blue-500/20">
                                                ADDITIONAL ITEM
                                            </span>
                                        ) : (
                                            <span className="bg-white/10 text-gray-300 px-3 py-1 rounded text-sm font-bold uppercase mr-3 border border-white/5">
                                                MODIFIER STEP
                                            </span>
                                        )}
                                        <h2 className="text-2xl font-bold text-white">
                                            {activeVisualStep.name}
                                        </h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20 pr-2">
                                    <div className="col-span-1 space-y-6">
                                        <div>
                                            <label className="block text-xs font-mono text-gray-500 mb-1">
                                                {isActiveStepRoot ? 'Sequence / Item Name' : 'Step Name'}
                                            </label>
                                            {isActiveStepRoot ? (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={activeSequence.name}
                                                        onChange={(e) => updateRootItem({ name: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none font-bold"
                                                    />

                                                    <div>
                                                        <label className="block text-xs font-mono text-gray-500 mb-1">
                                                            Category
                                                        </label>
                                                        <select
                                                            value={activeSequence.categoryId}
                                                            onChange={(e) => updateRootItem({ categoryId: e.target.value })}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                                                        >
                                                            {categories.map(c => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={(activeVisualStep as ModifierGroup).name}
                                                    onChange={(e) => updateCurrentGroup({ name: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                                                />
                                            )}
                                        </div>

                                        {isActiveStepRoot && (
                                            <>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-mono text-gray-500 mb-1">
                                                            Standard Cost
                                                        </label>
                                                        <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-gray-400 font-mono">
                                                            ${rootCost.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-mono text-gray-500 mb-1">
                                                            Base Price
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                                $
                                                            </span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={activeSequence.price}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    updateRootItem({ price: isNaN(val) ? 0 : val });
                                                                }}
                                                                className="w-full bg-black/40 border border-brand/30 rounded-lg pl-6 pr-3 py-2 text-white focus:border-brand outline-none font-mono font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-mono text-gray-500 mb-1">
                                                            Gross Margin
                                                        </label>
                                                        <div className={`bg-black/40 border ${rootMargin > 60 ? 'border-emerald-500/30 text-emerald-400' : rootMargin > 0 ? 'border-brand/30 text-brand' : 'border-red-500/30 text-red-400'} rounded-lg px-3 py-2 font-mono font-bold`}>
                                                            {rootMargin.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-brand/5 rounded-xl border border-brand/20">
                                                    <h4 className="text-xs font-bold text-brand uppercase tracking-widest mb-3 flex items-center">
                                                        <ChefHat size={12} className="mr-1" /> Kitchen Prep Settings
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                                Kitchen Label (e.g. Bun)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={activeSequence.metadata?.kitchenLabel || ''}
                                                                onChange={(e) =>
                                                                    updateRootItem({
                                                                        metadata: {
                                                                            ...activeSequence.metadata,
                                                                            kitchenLabel: e.target.value,
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="Ingredient Name"
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-brand outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                                Quantity Per Item
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={activeSequence.metadata?.quantity || 1}
                                                                onChange={(e) =>
                                                                    updateRootItem({
                                                                        metadata: {
                                                                            ...activeSequence.metadata,
                                                                            quantity: parseFloat(e.target.value),
                                                                        },
                                                                    })
                                                                }
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-brand outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {!isActiveStepRoot && (
                                            <div>
                                                <label className="block text-xs font-mono text-gray-500 mb-2">
                                                    Step Logic
                                                </label>
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => updateCurrentGroup({ variant: undefined })}
                                                        className={`w-full text-left px-3 py-3 rounded-lg border transition-all flex items-center justify-between ${!(activeVisualStep as ModifierGroup).variant ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        <span className="text-sm font-bold">Modifier</span>
                                                        {!(activeVisualStep as ModifierGroup).variant && (
                                                            <CheckCircle size={16} className="text-brand" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => updateCurrentGroup({ variant: 'sub_item' })}
                                                        className={`w-full text-left px-3 py-3 rounded-lg border transition-all flex items-center justify-between ${(activeVisualStep as ModifierGroup).variant === 'sub_item' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        <span className="text-sm font-bold">Additional Item (e.g. Sides)</span>
                                                        {(activeVisualStep as ModifierGroup).variant === 'sub_item' && (
                                                            <CheckCircle size={16} className="text-blue-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!isActiveStepRoot && (
                                            <div className="p-4 bg-black/20 rounded-xl border border-white/10 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-400">
                                                        Mandatory?
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateCurrentGroup({
                                                                required: !(activeVisualStep as ModifierGroup).required,
                                                            })
                                                        }
                                                        className={`w-12 h-6 rounded-full transition-colors relative ${(activeVisualStep as ModifierGroup).required ? 'bg-brand' : 'bg-gray-700'}`}
                                                    >
                                                        <div
                                                            className={`absolute top-1 left-1 bg-black w-4 h-4 rounded-full transition-transform ${(activeVisualStep as ModifierGroup).required ? 'translate-x-6' : 'translate-x-0'}`}
                                                        />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-400">
                                                        Multi-Select?
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateCurrentGroup({
                                                                multiSelect: !(activeVisualStep as ModifierGroup).multiSelect,
                                                            })
                                                        }
                                                        className={`w-12 h-6 rounded-full transition-colors relative ${(activeVisualStep as ModifierGroup).multiSelect ? 'bg-blue-500' : 'bg-gray-700'}`}
                                                    >
                                                        <div
                                                            className={`absolute top-1 left-1 bg-black w-4 h-4 rounded-full transition-transform ${(activeVisualStep as ModifierGroup).multiSelect ? 'translate-x-6' : 'translate-x-0'}`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {isActiveStepRoot && (
                                            <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                                                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center">
                                                    <Link size={12} className="mr-1" /> Inventory & Supply Chain
                                                </h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                            Sourcing Strategy
                                                        </label>
                                                        <select
                                                            value={activeSequence.inventoryMetadata?.recipeId ? 'RECIPE' : activeSequence.inventoryMetadata?.directDepletion ? 'STOCK' : 'NONE'}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'NONE') {
                                                                    updateRootItem({ inventoryMetadata: undefined });
                                                                } else if (val === 'RECIPE') {
                                                                    updateRootItem({ inventoryMetadata: { recipeId: '' } });
                                                                } else if (val === 'STOCK') {
                                                                    updateRootItem({ inventoryMetadata: { directDepletion: [] } });
                                                                }
                                                            }}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none uppercase"
                                                        >
                                                            <option value="NONE">No Link (Service/Ad-hoc)</option>
                                                            <option value="RECIPE">Produced from Recipe (Assembly)</option>
                                                            <option value="STOCK">Direct Stock Item (Resale)</option>
                                                        </select>
                                                    </div>

                                                    {activeSequence.inventoryMetadata?.recipeId !== undefined && (
                                                        <div>
                                                            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                                Select Master Protocol
                                                            </label>
                                                            <select
                                                                value={activeSequence.inventoryMetadata.recipeId || ''}
                                                                onChange={(e) => updateRootItem({
                                                                    inventoryMetadata: { recipeId: e.target.value }
                                                                })}
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                                                            >
                                                                <option value="">-- Select Recipe --</option>
                                                                <optgroup label="Assembly (Sales)">
                                                                    {recipes.filter(r => r.type === 'ASSEMBLY').map(r => (
                                                                        <option key={r.id} value={r.id}>
                                                                            {r.name} ({r.yieldQuantity} {r.yieldUnit})
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                                <optgroup label="Batch (Prep)">
                                                                    {recipes.filter(r => r.type === 'BATCH').map(r => (
                                                                        <option key={r.id} value={r.id}>
                                                                            {r.name} ({r.yieldQuantity} {r.yieldUnit})
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            </select>
                                                        </div>
                                                    )}

                                                    {activeSequence.inventoryMetadata?.directDepletion !== undefined && (
                                                        <div>
                                                            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                                Select Stock Item
                                                            </label>
                                                            <select
                                                                value={activeSequence.inventoryMetadata.directDepletion?.[0]?.inventoryItemId || ''}
                                                                onChange={(e) => {
                                                                    const item = inventory.find(i => i.id === e.target.value);
                                                                    if (item) {
                                                                        updateRootItem({
                                                                            inventoryMetadata: {
                                                                                directDepletion: [{
                                                                                    inventoryItemId: item.id,
                                                                                    quantity: 1,
                                                                                    unit: item.stockUnit
                                                                                }]
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                                                            >
                                                                <option value="">-- Select Inventory --</option>
                                                                {inventory.map(i => (
                                                                    <option key={i.id} value={i.id}>
                                                                        {i.name} ({i.stockUnit})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {!isActiveStepRoot && !(activeVisualStep as ModifierGroup).variant && (
                                            <div className="flex items-start p-3 bg-white/5 rounded-lg border border-dashed border-white/10 text-xs text-gray-400">
                                                <Link
                                                    size={14}
                                                    className="mt-0.5 mr-2 shrink-0 text-brand"
                                                />
                                                <div>
                                                    <span className="font-bold text-gray-300 block mb-1">
                                                        Auto-Linked Dependency
                                                    </span>
                                                    Depending on:{' '}
                                                    <span className="text-white font-mono">
                                                        {getParentItemName(
                                                            visualSteps.findIndex((s) => s.id === selectedStepId)
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1 xl:col-span-2">
                                        {isActiveStepRoot ? (
                                            <div className="h-64 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-600">
                                                <Utensils size={48} className="mb-4 opacity-50" />
                                                <p className="max-w-xs text-center text-sm">
                                                    This is the Main Item of the sequence. It serves as the root. Add steps to
                                                    attach modifiers or additional items to it.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-bold text-gray-300">
                                                        {(activeVisualStep as ModifierGroup).variant === 'sub_item'
                                                            ? 'Available Items'
                                                            : 'Modifier Options'}
                                                    </h3>
                                                    <button
                                                        onClick={handleAddOption}
                                                        className="text-xs bg-white/10 hover:bg-white/20 text-brand px-3 py-1.5 rounded-lg font-bold flex items-center transition-colors"
                                                    >
                                                        <Plus size={12} className="mr-1" /> ADD OPTION
                                                    </button>
                                                </div>
                                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                                    {((activeVisualStep as ModifierGroup).options || []).map((opt) => (
                                                        <div
                                                            key={opt.id}
                                                            className="flex flex-col gap-2 bg-black/20 border border-white/10 p-3 rounded-lg group hover:border-white/20 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="cursor-move text-gray-600 hover:text-gray-400">
                                                                    <GripVertical size={16} />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={opt.name}
                                                                    onChange={(e) => updateOption(opt.id, { name: e.target.value })}
                                                                    className="flex-1 bg-transparent text-sm text-gray-200 focus:text-white outline-none font-medium"
                                                                    placeholder="Option Name"
                                                                />
                                                                <button
                                                                    onClick={() =>
                                                                        setExpandedOptionId(expandedOptionId === opt.id ? null : opt.id)
                                                                    }
                                                                    className={`p-1.5 rounded transition-colors ${opt.metadata?.kitchenLabel || expandedOptionId === opt.id ? 'text-brand bg-brand/10' : 'text-gray-500 hover:text-brand hover:bg-white/5'}`}
                                                                    title="Kitchen Settings"
                                                                >
                                                                    <ChefHat size={16} />
                                                                </button>
                                                                <div className="flex items-center bg-black rounded px-2 border border-white/10">
                                                                    <span className="text-gray-500 text-xs mr-1">
                                                                        $
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        value={opt.price}
                                                                        onChange={(e) =>
                                                                            updateOption(opt.id, { price: parseFloat(e.target.value) })
                                                                        }
                                                                        className="w-16 bg-transparent text-right text-sm font-mono text-brand outline-none"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => deleteOption(opt.id)}
                                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                            {(expandedOptionId === opt.id || opt.metadata?.kitchenLabel) && (
                                                                <div
                                                                    className={`mt-2 pt-2 border-t border-white/5 grid grid-cols-2 gap-4 animate-in slide-in-from-top-1 ${!expandedOptionId ? 'hidden' : 'block'}`}
                                                                >
                                                                    <div>
                                                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1 block">
                                                                            Kitchen Label
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={opt.metadata?.kitchenLabel || ''}
                                                                            onChange={(e) =>
                                                                                updateOption(opt.id, {
                                                                                    metadata: {
                                                                                        ...opt.metadata,
                                                                                        kitchenLabel: e.target.value,
                                                                                    },
                                                                                })
                                                                            }
                                                                            placeholder="e.g. Patty"
                                                                            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-brand font-mono outline-none focus:border-brand/50"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1 block">
                                                                            Quantity
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={opt.metadata?.quantity || 1}
                                                                            onChange={(e) =>
                                                                                updateOption(opt.id, {
                                                                                    metadata: {
                                                                                        ...opt.metadata,
                                                                                        quantity: parseFloat(e.target.value),
                                                                                    },
                                                                                })
                                                                            }
                                                                            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-brand font-mono outline-none focus:border-brand/50"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-2 pt-2 border-t border-white/5">
                                                                        <label className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold mb-1 block">
                                                                            Supply Chain Map
                                                                        </label>
                                                                        <select
                                                                            value={opt.inventoryMetadata?.recipeId ? `RECIPE:${opt.inventoryMetadata.recipeId}` : opt.inventoryMetadata?.directDepletion?.[0]?.inventoryItemId ? `STOCK:${opt.inventoryMetadata.directDepletion[0].inventoryItemId}` : 'NONE'}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                if (val === 'NONE') {
                                                                                    updateOption(opt.id, { inventoryMetadata: undefined });
                                                                                } else if (val.startsWith('RECIPE:')) {
                                                                                    updateOption(opt.id, { inventoryMetadata: { recipeId: val.split(':')[1] } });
                                                                                } else if (val.startsWith('STOCK:')) {
                                                                                    const itemId = val.split(':')[1];
                                                                                    const item = inventory.find(i => i.id === itemId);
                                                                                    updateOption(opt.id, {
                                                                                        inventoryMetadata: {
                                                                                            directDepletion: item ? [{ inventoryItemId: itemId, quantity: 1, unit: item.stockUnit }] : []
                                                                                        }
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="w-full bg-black/40 border border-emerald-500/30 rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-emerald-500"
                                                                        >
                                                                            <option value="NONE">No Supply Link</option>
                                                                            <optgroup label="Direct Stock">
                                                                                {inventory.map(i => (
                                                                                    <option key={i.id} value={`STOCK:${i.id}`}>{i.name}</option>
                                                                                ))}
                                                                            </optgroup>
                                                                            <optgroup label="Assembly Recipes">
                                                                                {recipes.filter(r => r.type === 'ASSEMBLY').map(r => (
                                                                                    <option key={r.id} value={`RECIPE:${r.id}`}>{r.name}</option>
                                                                                ))}
                                                                            </optgroup>
                                                                            <optgroup label="Batch Recipes">
                                                                                {recipes.filter(r => r.type === 'BATCH').map(r => (
                                                                                    <option key={r.id} value={`RECIPE:${r.id}`}>{r.name}</option>
                                                                                ))}
                                                                            </optgroup>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-auto bg-black/80 backdrop-blur-md border-t border-white/10 flex flex-col z-10 shadow-lg pb-[env(safe-area-inset-bottom)]">
                                <div className="px-6 py-2 border-b border-white/10 flex justify-between items-center bg-transparent">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Sequence Timeline
                                    </span>
                                    <button
                                        onClick={handleAddStep}
                                        className="flex items-center text-xs font-bold text-brand hover:text-white transition-colors"
                                    >
                                        <Plus size={14} className="mr-1" /> ADD STEP TO END
                                    </button>
                                </div>
                                <div
                                    ref={timelineRef}
                                    className="flex-1 overflow-x-auto p-4 flex items-center space-x-4 h-44"
                                >
                                    {visualSteps.map((step, idx) => {
                                        const isActive = selectedStepId === step.id;
                                        const isRoot = step.type === 'ROOT_ITEM';
                                        const isSubItem = step.type === 'SUB_ITEM';
                                        const isModifier = step.type === 'MODIFIER';
                                        const parentName = !isRoot ? getParentItemName(idx) : '';
                                        return (
                                            <div key={step.id} className="flex items-center">
                                                {idx > 0 && (
                                                    <div className="relative w-12 flex flex-col items-center justify-center group/connector">
                                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
                                                        <button
                                                            onClick={() => handleInsertStep(idx)}
                                                            className="relative z-10 w-5 h-5 rounded-full bg-black border border-white/20 text-gray-500 hover:text-brand hover:border-brand flex items-center justify-center shadow-sm transition-all active:scale-95"
                                                            title="Insert Step Here"
                                                        >
                                                            <Plus size={10} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setSelectedStepId(step.id)}
                                                    className={`w-44 h-28 rounded-xl border-2 flex flex-col p-3 transition-all relative overflow-visible text-left ${isActive ? 'bg-white/10 border-brand shadow-md scale-105 z-10' : isRoot ? 'bg-brand/10 border-brand/30' : isSubItem ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-white/10 hover:border-white/30'}`}
                                                >
                                                    <div className="flex items-center gap-1 mb-2">
                                                        {isRoot && (
                                                            <span className="text-[9px] font-bold bg-brand text-black px-1.5 rounded">
                                                                ROOT
                                                            </span>
                                                        )}
                                                        {isSubItem && (
                                                            <span className="text-[9px] font-bold bg-blue-500 text-black px-1.5 rounded">
                                                                ITEM
                                                            </span>
                                                        )}
                                                        {isModifier && (
                                                            <span className="text-[9px] font-bold bg-white/10 text-gray-300 px-1.5 rounded">
                                                                MOD
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] font-mono text-gray-500 ml-auto">
                                                            STEP {idx + 1}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`font-bold text-sm leading-tight truncate w-full mb-1 ${isActive ? 'text-white' : 'text-gray-400'}`}
                                                    >
                                                        {step.name}
                                                    </span>
                                                    {isModifier && (
                                                        <div className="mt-auto flex items-center text-[9px] text-gray-500 truncate w-full">
                                                            <Link size={10} className="mr-1 text-gray-600" />
                                                            <span className="truncate">for {parentName}</span>
                                                        </div>
                                                    )}
                                                    {!isRoot && (
                                                        <div className={`mt-auto text-[9px] ${isModifier ? 'text-right' : ''}`}>
                                                            <span className="text-gray-500">
                                                                {(step as ModifierGroup).options?.length || 0} Opts
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center ml-4">
                                        <div className="w-8 h-0.5 bg-white/10 mx-2" />
                                        <button
                                            onClick={handleAddStep}
                                            className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 hover:border-brand/50 hover:bg-white/5 flex flex-col items-center justify-center text-gray-600 hover:text-brand transition-all"
                                        >
                                            <Plus size={24} className="mb-2" />
                                            <span className="text-[10px] uppercase font-bold">End</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-600">
                            {sequences.length > 0
                                ? 'Select a sequence to edit'
                                : 'No sequences available. Create one to get started.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
