/**
 * @link e:\git\hyphae-pos\src\components\OrderBuilder.tsx
 * @author Hyphae POS Team
 * @description Step-by-step modifier selection and item construction.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ModifierGroup, SelectedModifier, OrderItem, ModifierVariation } from '../types';
import ActionGridButton from './ActionGridButton';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface OrderBuilderProps {
  product: Product;
  editItem?: OrderItem;
  onComplete: (orderItem: OrderItem) => void;
  onCancel: () => void;
  onStepChange?: (current: number, total: number) => void;
}

const OrderBuilder: React.FC<OrderBuilderProps> = ({
  product,
  editItem,
  onComplete,
  onCancel,
  onStepChange,
}) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>(
    editItem?.selectedModifiers || []
  );
  const [draftId] = useState(() => editItem?.uniqueId || `draft-${Date.now()}`);

  // State to trigger auto-advance after render
  const [autoAdvanceTrigger, setAutoAdvanceTrigger] = useState<number | null>(null);

  // Visibility Logic for Dependency Chain
  const isGroupVisible = useCallback(
    (group: ModifierGroup) => {
      if (!group.dependency) return true;

      const { groupId, requiredOptions } = group.dependency;
      // Check if the parent group has a selection
      const parentSelections = selectedModifiers.filter((s) => s.groupId === groupId);

      if (parentSelections.length === 0) return false;

      // If specific options required
      if (requiredOptions && requiredOptions.length > 0) {
        return parentSelections.some((s) => requiredOptions.includes(s.optionId));
      }

      return true;
    },
    [selectedModifiers]
  );

  // Compute visible groups dynamically
  const groups = useMemo(() => {
    return (product.modifierGroups || []).filter((g) => isGroupVisible(g));
  }, [product.modifierGroups, isGroupVisible]);

  // Prune selections for hidden groups
  useEffect(() => {
    const visibleGroupIds = new Set(groups.map((g) => g.id));
    setSelectedModifiers((prev) => {
      // Filter out selections that belong to groups that are no longer visible
      const newSelections = prev.filter((m) => visibleGroupIds.has(m.groupId));
      if (newSelections.length !== prev.length) {
        return newSelections;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const currentGroup = groups[currentGroupIndex];

  // Validation Logic for Current Step
  const currentSelections = selectedModifiers.filter((m) => m.groupId === currentGroup?.id);
  const isStepValid = !currentGroup?.required || currentSelections.length > 0;
  const isLastStep = currentGroupIndex === groups.length - 1;

  // Skip Logic
  const showSkip = !currentGroup?.required && currentSelections.length === 0;

  // Dynamic Header Logic for Sub-Items (e.g. "Seasoning for Small Fries")
  const getStepHeader = () => {
    if (!currentGroup) return 'Loading...';

    // If this group is a dependency, find what triggered it
    if (currentGroup.dependency) {
      const parentMod = selectedModifiers.find(
        (m) => m.groupId === currentGroup.dependency?.groupId
      );
      if (parentMod) {
        return `${currentGroup.name} for ${parentMod.name}`;
      }
    }
    return currentGroup.name;
  };

  // Calculate running total
  const basePrice = product.price;
  const modsPrice = selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
  const currentTotal = basePrice + modsPrice;

  const finalizeOrder = useCallback(() => {
    const orderItem: OrderItem = {
      ...product,
      uniqueId: draftId,
      selectedModifiers,
      finalPrice: currentTotal,
    };
    onComplete(orderItem);
  }, [product, draftId, selectedModifiers, currentTotal, onComplete]);

  const handleNext = useCallback(() => {
    // We check validity again here, just in case
    // NOTE: We don't block auto-advance here because auto-advance implies a selection was JUST made.

    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
    } else {
      finalizeOrder();
    }
  }, [currentGroupIndex, groups.length, finalizeOrder]);

  // Report progress to parent
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentGroupIndex + 1, groups.length);
    }
  }, [currentGroupIndex, groups.length, onStepChange]);

  // Auto-complete if no mods
  useEffect(() => {
    if (groups.length === 0) {
      finalizeOrder();
    }
  }, [groups.length, finalizeOrder]);

  // Handle Auto Advance Trigger
  useEffect(() => {
    if (autoAdvanceTrigger !== null) {
      // If the trigger matches the current index, we try to advance
      if (autoAdvanceTrigger === currentGroupIndex) {
        handleNext();
      }
      setAutoAdvanceTrigger(null);
    }
  }, [autoAdvanceTrigger, groups.length, currentGroupIndex, handleNext]);

  const handleModifierToggle = (
    group: ModifierGroup,
    optionId: string,
    name: string,
    price: number
  ) => {
    const existingIndex = selectedModifiers.findIndex(
      (m) => m.groupId === group.id && m.optionId === optionId
    );

    if (existingIndex >= 0) {
      // Remove if exists (toggle off) - mostly for multi-select
      if (group.multiSelect) {
        setSelectedModifiers((prev) => prev.filter((_, i) => i !== existingIndex));
      }
    } else {
      const newMod: SelectedModifier = {
        groupId: group.id,
        optionId,
        name,
        price,
        variation: 'Normal',
      };

      if (!group.multiSelect) {
        // Replace existing for this group
        const cleaned = selectedModifiers.filter((m) => m.groupId !== group.id);
        setSelectedModifiers([...cleaned, newMod]);

        // Trigger auto-advance after render updates
        setAutoAdvanceTrigger(currentGroupIndex);
      } else {
        // Add to list
        setSelectedModifiers((prev) => [...prev, newMod]);
      }
    }
  };

  const updateVariation = (groupId: string, optionId: string, variation: ModifierVariation) => {
    setSelectedModifiers((prev) =>
      prev.map((m) => {
        if (m.groupId === groupId && m.optionId === optionId) {
          return { ...m, variation };
        }
        return m;
      })
    );
  };

  const handlePrevious = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prev) => prev - 1);
    }
  };

  // If logic triggers early or no groups
  if (!currentGroup) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        <span className="font-mono animate-pulse">Finalizing...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 transition-colors">
      {/* BUILDER HEADER */}
      <div className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center">
          {/* Close / Cancel Button */}
          <button
            onClick={onCancel}
            className="p-2 -ml-2 hover:bg-zinc-200 dark:hover:bg-red-900/20 rounded-full text-zinc-500 hover:text-red-500 dark:hover:text-red-400 mr-4 transition-colors"
            title="Cancel Item"
          >
            <X size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {editItem ? `Editing: ${product.name}` : product.name}
            </h2>
            <div className="flex items-center space-x-3 text-xs font-mono mt-0.5">
              <span className="text-zinc-500 dark:text-zinc-400">
                STEP {currentGroupIndex + 1}/{groups.length}:
              </span>
              <span className="text-lime-600 dark:text-lime-400 uppercase tracking-widest font-bold">
                {getStepHeader()}
              </span>
              {currentGroup.required ? (
                <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-[9px] uppercase font-bold tracking-wider">
                  Required
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[9px] uppercase font-bold tracking-wider">
                  Optional
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="font-mono text-xl font-bold text-lime-600 dark:text-lime-400">
          ${currentTotal.toFixed(2)}
        </div>
      </div>

      {/* OPTIONS GRID */}
      <div className="flex-1 p-6 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentGroup.options.map((option) => {
            const isSelected = selectedModifiers.some(
              (m) => m.groupId === currentGroup.id && m.optionId === option.id
            );
            const selectedMod = selectedModifiers.find(
              (m) => m.groupId === currentGroup.id && m.optionId === option.id
            );

            return (
              <div key={option.id} className="h-32">
                <ActionGridButton
                  title={option.name}
                  price={option.price}
                  selected={isSelected}
                  variation={selectedMod?.variation}
                  onClick={() =>
                    handleModifierToggle(currentGroup, option.id, option.name, option.price)
                  }
                  onVariationChange={
                    isSelected ? (v) => updateVariation(currentGroup.id, option.id, v) : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="h-20 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 px-6 flex items-center justify-between shrink-0 gap-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] dark:shadow-none">
        {/* PREVIOUS BUTTON */}
        <button
          onClick={handlePrevious}
          disabled={currentGroupIndex === 0}
          className={`
                flex-1 h-12 flex items-center justify-center font-bold uppercase tracking-wider rounded-xl transition-colors
                ${
                  currentGroupIndex === 0
                    ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent'
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                }
            `}
        >
          <ChevronLeft className="mr-2" size={18} /> Previous
        </button>

        {/* NEXT / SKIP / ADD BUTTON */}
        <button
          onClick={() => handleNext()}
          disabled={!isStepValid}
          className={`
                flex-[2] h-12 flex items-center justify-center font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all
                ${
                  !isStepValid
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                    : showSkip
                      ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600' // Skip Style
                      : 'bg-lime-500 hover:bg-lime-400 text-zinc-950 shadow-[0_0_15px_rgba(132,204,22,0.4)] active:scale-[0.98]' // Next/Add Style
                }
             `}
        >
          {isLastStep ? (
            <>
              {editItem ? 'Update Order' : 'Add to Order'} <Check className="ml-2" size={20} />
            </>
          ) : showSkip ? (
            <>
              Skip Step <ChevronRight className="ml-2" size={20} />
            </>
          ) : (
            <>
              Next Step <ChevronRight className="ml-2" size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderBuilder;
