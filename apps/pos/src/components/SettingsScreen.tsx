/**
 * @link e:\git\hyphae-pos\src\components\SettingsScreen.tsx
 * @author Hyphae POS Team
 * @description Administrative interface for menu management and product sequencing.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

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
} from 'lucide-react';
import { useMenuData } from '../hooks/useMenuData';
import { Product, ModifierGroup, ModifierOption } from '../types';

interface SettingsScreenProps {
  onClose: () => void;
  activeConceptId: string;
}

const generateId = (prefix: string) => `${prefix}_${Date.now()}`;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose, activeConceptId }) => {
  const { getProductsByConcept, concepts, categories, saveBatchProducts } = useMenuData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [sequences, setSequences] = useState<Product[]>(() =>
    getProductsByConcept(activeConceptId)
  );
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(
    sequences.length > 0 ? sequences[0].id : null
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>('ROOT');

  // Ref for horizontal scrolling timeline
  const timelineRef = useRef<HTMLDivElement>(null);

  const activeSequence = sequences.find((s) => s.id === selectedSequenceId);
  const currentConcept = concepts.find((c) => c.id === activeConceptId);

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

  const activeVisualStep = visualSteps.find((s) => s.id === selectedStepId) || visualSteps[0];
  const isActiveStepRoot = selectedStepId === 'ROOT';

  // Handle Mouse Wheel for Horizontal Scrolling on Timeline
  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      // If no vertical scroll, let native behavior happen (e.g. touchpad horizontal swipe)
      if (e.deltaY === 0) return;

      // Prevent page/sidebar vertical scrolling
      e.preventDefault();

      // Map vertical scroll to horizontal scroll
      element.scrollLeft += e.deltaY;
    };

    // Passive: false is required to use preventDefault()
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
      await saveBatchProducts(sequences);
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
    const defaultCategory =
      categories.find((c) => c.conceptId === activeConceptId)?.id || 'burgers';
    const newSeq: Product = {
      id: generateId('seq'),
      name: 'New Sequence',
      price: 0,
      categoryId: defaultCategory,
      requiresMods: true,
      modifierGroups: [],
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
    <div className="fixed inset-x-0 bottom-0 top-14 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 z-[45] flex flex-col animate-in slide-in-from-bottom duration-300 transition-colors">
      {/* HEADER */}
      <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-lime-600 dark:text-lime-400">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              MENU BUILDER
            </h1>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase">
              <span className="text-zinc-500">Backend Management</span>
              <span className="text-zinc-400">/</span>
              <span
                className={`font-bold text-${currentConcept?.color.split('-')[0]}-600 dark:text-${currentConcept?.color.split('-')[0]}-400`}
              >
                {currentConcept?.name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={saveStatus !== 'IDLE'}
            className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm transition-all min-w-[140px] justify-center ${saveStatus === 'SAVED' ? 'bg-zinc-100 dark:bg-zinc-100 text-zinc-900 dark:text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : saveStatus === 'SAVING' ? 'bg-lime-500/50 text-zinc-900 cursor-wait' : 'bg-lime-500 hover:bg-lime-400 text-zinc-950 shadow-[0_0_15px_rgba(132,204,22,0.3)]'}`}
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none overflow-hidden'}`}
        >
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Sequences
            </span>
            <button
              onClick={handleCreateSequence}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-lime-600 dark:text-lime-400"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sequences.map((seq) => (
              <button
                key={seq.id}
                onClick={() => handleSelectSequence(seq.id)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group whitespace-nowrap ${selectedSequenceId === seq.id ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              >
                <span className="truncate pr-2">{seq.name}</span>
                {selectedSequenceId === seq.id && (
                  <ChevronRight size={14} className="text-lime-600 dark:text-lime-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 relative"
          onClickCapture={() => {
            if (isSidebarOpen) setIsSidebarOpen(false);
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute top-1/2 -translate-y-1/2 z-30 w-5 h-12 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-y border-r border-zinc-200 dark:border-zinc-700 rounded-r-xl flex items-center justify-center text-zinc-500 hover:text-lime-600 dark:hover:text-lime-400 hover:border-lime-500 transition-all shadow-lg left-0`}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {activeSequence ? (
            <>
              <div className="flex-1 p-8 overflow-y-auto pb-48">
                <div className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-4 pl-4">
                  <div className="flex items-center">
                    {isActiveStepRoot ? (
                      <span className="bg-lime-100 dark:bg-lime-400/10 text-lime-700 dark:text-lime-400 px-3 py-1 rounded text-sm font-bold uppercase mr-3">
                        MAIN ITEM (ROOT)
                      </span>
                    ) : (activeVisualStep as { type?: string }).type === 'SUB_ITEM' ? (
                      <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded text-sm font-bold uppercase mr-3">
                        ADDITIONAL ITEM
                      </span>
                    ) : (
                      <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded text-sm font-bold uppercase mr-3">
                        MODIFIER STEP
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {activeVisualStep.name}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-1 space-y-6">
                    <div>
                      <label className="block text-xs font-mono text-zinc-500 mb-1">
                        {isActiveStepRoot ? 'Sequence / Item Name' : 'Step Name'}
                      </label>
                      {isActiveStepRoot ? (
                        <input
                          type="text"
                          value={activeSequence.name}
                          onChange={(e) => updateRootItem({ name: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-black dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none font-bold"
                        />
                      ) : (
                        <input
                          type="text"
                          value={(activeVisualStep as ModifierGroup).name}
                          onChange={(e) => updateCurrentGroup({ name: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-black dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none"
                        />
                      )}
                    </div>

                    {isActiveStepRoot && (
                      <>
                        <div>
                          <label className="block text-xs font-mono text-zinc-500 mb-1">
                            Base Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                              $
                            </span>
                            <input
                              type="number"
                              value={activeSequence.price}
                              onChange={(e) =>
                                updateRootItem({ price: parseFloat(e.target.value) })
                              }
                              className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-6 pr-3 py-2 text-black dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none font-mono"
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-lime-50 dark:bg-lime-900/10 rounded-xl border border-lime-200 dark:border-lime-900/30">
                          <h4 className="text-xs font-bold text-lime-700 dark:text-lime-400 uppercase tracking-widest mb-3 flex items-center">
                            <ChefHat size={12} className="mr-1" /> Kitchen Prep Settings
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-500 mb-1 uppercase">
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
                                className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-black dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-500 mb-1 uppercase">
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
                                className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-black dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {!isActiveStepRoot && (
                      <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-2">
                          Step Logic
                        </label>
                        <div className="space-y-2">
                          <button
                            onClick={() => updateCurrentGroup({ variant: undefined })}
                            className={`w-full text-left px-3 py-3 rounded-lg border transition-all flex items-center justify-between ${!(activeVisualStep as ModifierGroup).variant ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white' : 'bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                          >
                            <span className="text-sm font-bold">Modifier</span>
                            {!(activeVisualStep as ModifierGroup).variant && (
                              <CheckCircle size={16} className="text-lime-600 dark:text-lime-400" />
                            )}
                          </button>
                          <button
                            onClick={() => updateCurrentGroup({ variant: 'sub_item' })}
                            className={`w-full text-left px-3 py-3 rounded-lg border transition-all flex items-center justify-between ${(activeVisualStep as ModifierGroup).variant === 'sub_item' ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-200' : 'bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                          >
                            <span className="text-sm font-bold">Additional Item (e.g. Sides)</span>
                            {(activeVisualStep as ModifierGroup).variant === 'sub_item' && (
                              <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {!isActiveStepRoot && (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            Mandatory?
                          </span>
                          <button
                            onClick={() =>
                              updateCurrentGroup({
                                required: !(activeVisualStep as ModifierGroup).required,
                              })
                            }
                            className={`w-12 h-6 rounded-full transition-colors relative ${(activeVisualStep as ModifierGroup).required ? 'bg-lime-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                          >
                            <div
                              className={`absolute top-1 left-1 bg-zinc-50 dark:bg-zinc-900 w-4 h-4 rounded-full transition-transform ${(activeVisualStep as ModifierGroup).required ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            Multi-Select?
                          </span>
                          <button
                            onClick={() =>
                              updateCurrentGroup({
                                multiSelect: !(activeVisualStep as ModifierGroup).multiSelect,
                              })
                            }
                            className={`w-12 h-6 rounded-full transition-colors relative ${(activeVisualStep as ModifierGroup).multiSelect ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                          >
                            <div
                              className={`absolute top-1 left-1 bg-zinc-50 dark:bg-zinc-900 w-4 h-4 rounded-full transition-transform ${(activeVisualStep as ModifierGroup).multiSelect ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                    {!isActiveStepRoot && !(activeVisualStep as ModifierGroup).variant && (
                      <div className="flex items-start p-3 bg-zinc-100 dark:bg-zinc-800/30 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
                        <Link
                          size={14}
                          className="mt-0.5 mr-2 shrink-0 text-lime-600 dark:text-lime-500"
                        />
                        <div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                            Auto-Linked Dependency
                          </span>
                          Depending on:{' '}
                          <span className="text-black dark:text-white font-mono">
                            {getParentItemName(
                              visualSteps.findIndex((s) => s.id === selectedStepId)
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    {isActiveStepRoot ? (
                      <div className="h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                        <Utensils size={48} className="mb-4 opacity-50" />
                        <p className="max-w-xs text-center text-sm">
                          This is the Main Item of the sequence. It serves as the root. Add steps to
                          attach modifiers or additional items to it.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            {(activeVisualStep as ModifierGroup).variant === 'sub_item'
                              ? 'Available Items'
                              : 'Modifier Options'}
                          </h3>
                          <button
                            onClick={handleAddOption}
                            className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-lime-600 dark:text-lime-400 px-3 py-1.5 rounded-lg font-bold flex items-center transition-colors"
                          >
                            <Plus size={12} className="mr-1" /> ADD OPTION
                          </button>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {((activeVisualStep as ModifierGroup).options || []).map((opt) => (
                            <div
                              key={opt.id}
                              className="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="cursor-move text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400">
                                  <GripVertical size={16} />
                                </div>
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) => updateOption(opt.id, { name: e.target.value })}
                                  className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-200 focus:text-black dark:focus:text-white outline-none font-medium"
                                  placeholder="Option Name"
                                />
                                <button
                                  onClick={() =>
                                    setExpandedOptionId(expandedOptionId === opt.id ? null : opt.id)
                                  }
                                  className={`p-1.5 rounded transition-colors ${opt.metadata?.kitchenLabel || expandedOptionId === opt.id ? 'text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/20' : 'text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                  title="Kitchen Settings"
                                >
                                  <ChefHat size={16} />
                                </button>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 rounded px-2 border border-zinc-200 dark:border-zinc-800">
                                  <span className="text-zinc-400 dark:text-zinc-500 text-xs mr-1">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    value={opt.price}
                                    onChange={(e) =>
                                      updateOption(opt.id, { price: parseFloat(e.target.value) })
                                    }
                                    className="w-16 bg-transparent text-right text-sm font-mono text-lime-600 dark:text-lime-400 outline-none"
                                  />
                                </div>
                                <button
                                  onClick={() => deleteOption(opt.id)}
                                  className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              {(expandedOptionId === opt.id || opt.metadata?.kitchenLabel) && (
                                <div
                                  className={`mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/50 grid grid-cols-2 gap-4 animate-in slide-in-from-top-1 ${!expandedOptionId ? 'hidden' : 'block'}`}
                                >
                                  <div>
                                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1 block">
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
                                      className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs text-lime-600 dark:text-lime-400 font-mono outline-none focus:border-lime-500/50"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1 block">
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
                                      className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs text-lime-600 dark:text-lime-400 font-mono outline-none focus:border-lime-500/50"
                                    />
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

              <div className="absolute bottom-0 left-0 right-0 h-auto bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-col z-10 shadow-lg pb-[env(safe-area-inset-bottom)]">
                <div className="px-6 py-2 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Sequence Timeline
                  </span>
                  <button
                    onClick={handleAddStep}
                    className="flex items-center text-xs font-bold text-lime-600 dark:text-lime-400 hover:text-black dark:hover:text-white transition-colors"
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
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-300 dark:bg-zinc-800 -translate-y-1/2" />
                            <button
                              onClick={() => handleInsertStep(idx)}
                              className="relative z-10 w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-lime-600 dark:hover:text-lime-400 hover:border-lime-500 dark:hover:border-lime-400 flex items-center justify-center shadow-sm transition-all active:scale-95"
                              title="Insert Step Here"
                            >
                              <Plus size={10} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedStepId(step.id)}
                          className={`w-44 h-28 rounded-xl border-2 flex flex-col p-3 transition-all relative overflow-visible text-left ${isActive ? 'bg-zinc-50 dark:bg-zinc-800 border-lime-500 shadow-md scale-105 z-10' : isRoot ? 'bg-lime-50 dark:bg-lime-900/10 border-lime-500/30' : isSubItem ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500/50' : 'bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'}`}
                        >
                          <div className="flex items-center gap-1 mb-2">
                            {isRoot && (
                              <span className="text-[9px] font-bold bg-lime-500 text-zinc-950 px-1.5 rounded">
                                ROOT
                              </span>
                            )}
                            {isSubItem && (
                              <span className="text-[9px] font-bold bg-blue-500 text-zinc-950 px-1.5 rounded">
                                ITEM
                              </span>
                            )}
                            {isModifier && (
                              <span className="text-[9px] font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-1.5 rounded">
                                MOD
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-zinc-500 ml-auto">
                              STEP {idx + 1}
                            </span>
                          </div>
                          <span
                            className={`font-bold text-sm leading-tight truncate w-full mb-1 ${isActive ? 'text-black dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}
                          >
                            {step.name}
                          </span>
                          {isModifier && (
                            <div className="mt-auto flex items-center text-[9px] text-zinc-500 truncate w-full">
                              <Link size={10} className="mr-1 text-zinc-400" />
                              <span className="truncate">for {parentName}</span>
                            </div>
                          )}
                          {!isRoot && (
                            <div className={`mt-auto text-[9px] ${isModifier ? 'text-right' : ''}`}>
                              <span className="text-zinc-400">
                                {(step as ModifierGroup).options?.length || 0} Opts
                              </span>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                  <div className="flex items-center ml-4">
                    <div className="w-8 h-0.5 bg-zinc-300 dark:bg-zinc-800 mx-2" />
                    <button
                      onClick={handleAddStep}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-lime-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-lime-600 dark:hover:text-lime-400 transition-all"
                    >
                      <Plus size={24} className="mb-2" />
                      <span className="text-[10px] uppercase font-bold">End</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
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

export default SettingsScreen;
