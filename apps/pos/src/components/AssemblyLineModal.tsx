/**
 * @link e:\git\hyphae-pos\src\components\AssemblyLineModal.tsx
 * @author Hyphae POS Team
 * @description Bagging and assembly view for orders.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { SavedOrder } from '../types';
import { groupItemsForAssembly } from '../utils/orderHelpers';
import { calculatePackagingFallback } from '../utils/packagingCalculator';
import { UtensilsCrossed, X, CheckCircle } from 'lucide-react';
import LiveTimer from './LiveTimer';

interface AssemblyLineModalProps {
  orders: SavedOrder[];
  onClose: () => void;
  onPackAndClose: (order: SavedOrder) => void;
}

interface AssemblySide {
  name: string;
  modifiers: string[];
}

interface AssemblyBundle {
  uniqueId: string;
  name: string;
  qty: number;
  mods: string[];
  sides: AssemblySide[];
}

const AssemblyLineModal: React.FC<AssemblyLineModalProps> = ({
  orders,
  onClose,
  onPackAndClose,
}) => {
  const assemblyRef = useRef<HTMLDivElement>(null);
  const [collapsedAssemblyIds, setCollapsedAssemblyIds] = useState<Set<string>>(new Set());

  const assemblyDataMemo = useMemo(() => {
    const data = new Map<
      string,
      { bundles: AssemblyBundle[]; packaging: Record<string, number> }
    >();
    orders.forEach((order) => {
      const bundles = groupItemsForAssembly(order) as AssemblyBundle[];
      let packaging = {};
      try {
        const payload = {
          orderId: order.id,
          serviceType: order.orderType,
          items: (order.items || []).map((item) => ({
            sku: item.id,
            qty: 1,
            volumePoints: item.packaging?.volumePoints || 0,
            isMessy: item.packaging?.isMessy || false,
            modifiers: (item.selectedModifiers || []).map((m) => m.name),
          })),
        };
        packaging = calculatePackagingFallback(payload).packagingUsed;
      } catch (e) {
        console.error('Assembly Pkg Calc Error', e);
      }
      data.set(order.id, { bundles, packaging });
    });
    return data;
  }, [orders]);

  useEffect(() => {
    const element = assemblyRef.current;
    if (!element) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      element.scrollLeft += e.deltaY;
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  const toggleAssemblyCollapse = (orderId: string) => {
    setCollapsedAssemblyIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
        <div className="flex items-center text-lime-600 dark:text-lime-400">
          <UtensilsCrossed size={20} className="mr-2" />
          <span className="font-bold uppercase tracking-widest text-sm">
            Assembly Line (Bagging)
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div ref={assemblyRef} className="flex-1 p-4 overflow-x-auto whitespace-nowrap space-x-4">
        {orders.map((order) => {
          const data = assemblyDataMemo.get(order.id);
          const bundles = data?.bundles || [];
          const orderPkg = data?.packaging || {};

          const isCollapsed = collapsedAssemblyIds.has(order.id);
          const isReady = order.status === 'Ready';

          const widthClass = isCollapsed ? 'w-14' : bundles.length > 3 ? 'w-[680px]' : 'w-[340px]';
          const gridClass =
            !isCollapsed && bundles.length > 3 ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3';

          return (
            <div
              key={order.id}
              className={`inline-block h-full align-top bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 ${widthClass}`}
            >
              <div
                onClick={() => toggleAssemblyCollapse(order.id)}
                className={`
                                    cursor-pointer flex items-center justify-between p-3 border-b border-zinc-800 hover:bg-zinc-800 transition-colors
                                    ${isReady ? 'bg-lime-900/20' : 'bg-orange-900/20'}
                                `}
              >
                {!isCollapsed ? (
                  <>
                    <div>
                      <div className="text-lg font-mono font-bold text-white">#{order.id}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">
                        {order.table}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <LiveTimer
                          startTime={
                            order.status === 'Kitchen' ? order.cookingStartedAt : order.createdAt
                          }
                          className={`font-mono font-bold text-sm ${isReady ? 'text-lime-500' : 'text-orange-500'}`}
                        />
                        <div className="text-[9px] text-zinc-600 uppercase">COOK TIME</div>
                      </div>
                      {isReady && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPackAndClose(order);
                          }}
                          className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-lime-500 text-zinc-400 hover:text-black flex items-center justify-center transition-all border border-zinc-700 hover:border-lime-400"
                          title="Pack & Close"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-start pt-4 space-y-2">
                    <span className="text-white font-mono font-bold text-lg [writing-mode:vertical-lr] rotate-180">
                      #{order.id}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${isReady ? 'bg-lime-500' : 'bg-orange-500'}`}
                    />
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex flex-col h-[calc(100%-60px)]">
                  <div className={`flex-1 p-3 whitespace-normal overflow-y-auto ${gridClass}`}>
                    {bundles.map((bundle, idx) => (
                      <div
                        key={`${bundle.uniqueId}-${idx}`}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-2 border-b border-zinc-800 pb-2">
                          <span className="font-bold text-white text-sm uppercase">
                            {bundle.name}
                          </span>
                          <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-xs font-mono font-bold">
                            x{bundle.qty}
                          </span>
                        </div>
                        <div className="space-y-2 mb-2 flex-1">
                          {bundle.mods.map((mod: string, i: number) => (
                            <div
                              key={i}
                              className="text-xs px-2 py-1 rounded bg-blue-900/20 text-blue-300 border border-blue-900/50 inline-block mr-1 mb-1 font-bold uppercase"
                            >
                              {mod}
                            </div>
                          ))}
                        </div>
                        {bundle.sides.length > 0 && (
                          <div className="mt-auto pt-2 border-t border-zinc-800">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">
                              INCLUDED SIDES
                            </span>
                            {bundle.sides.map((side, i) => (
                              <div
                                key={i}
                                className="text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 mb-1 flex items-center flex-wrap gap-2"
                              >
                                <span className="font-bold text-white">{side.name}</span>
                                {side.modifiers.map((mod: string, j: number) => (
                                  <span
                                    key={j}
                                    className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded border border-zinc-700"
                                  >
                                    {mod}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 p-3 bg-zinc-900/50 border-t border-zinc-800">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(orderPkg).map(([sku, count]) => (
                        <span
                          key={sku}
                          className="text-[9px] font-mono font-bold uppercase px-2 py-1 bg-zinc-800 text-zinc-400 rounded border border-zinc-700 flex items-center"
                        >
                          <span className="text-lime-500 mr-1">{count}x</span>{' '}
                          {sku.replace('SKU_', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssemblyLineModal;
