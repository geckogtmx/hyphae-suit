/**
 * @link e:\git\hyphae-pos\src\components\OrderRail.tsx
 * @author Hyphae POS Team
 * @description Central hub for active orders, status updates, and production views.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useOrder } from '../context/OrderContext';
import { SavedOrder, OrderStatus } from '../types';
import {
  Wand2,
  UtensilsCrossed,
  ChevronUp,
  ChevronDown,
  Bell,
  CheckCircle,
  ChefHat,
  Edit,
} from 'lucide-react';
import LiveTimer from './LiveTimer';
import CompletionModal from './CompletionModal';
import KitchenSummaryModal from './KitchenSummaryModal';
import AssemblyLineModal from './AssemblyLineModal';

interface OrderRailProps {
  onLayoutChange?: (ratio: number) => void;
}

const OrderRail: React.FC<OrderRailProps> = ({ onLayoutChange: _onLayoutChange }) => {
  const { state, dispatch } = useOrder();

  const [showSummary, setShowSummary] = useState(false);
  const [showAssembly, setShowAssembly] = useState(false);
  const [completionOrder, setCompletionOrder] = useState<SavedOrder | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

  /* eslint-disable react-hooks/exhaustive-deps */
  const activeOrders = useMemo(() => state.activeOrders || [], [state.activeOrders]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const queueOrders = useMemo(
    () =>
      activeOrders
        .filter((o) => o.status === 'Pending')
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
    [activeOrders]
  );

  const cookingOrders = useMemo(
    () =>
      activeOrders
        .filter((o) => o.status === 'Kitchen')
        .sort((a, b) => (a.cookingStartedAt || 0) - (b.cookingStartedAt || 0)),
    [activeOrders]
  );

  const readyOrders = useMemo(
    () =>
      activeOrders
        .filter((o) => o.status === 'Ready')
        .sort((a, b) => (a.readyAt || 0) - (b.readyAt || 0)),
    [activeOrders]
  );

  const assemblyOrders = useMemo(
    () => [...cookingOrders, ...readyOrders],
    [cookingOrders, readyOrders]
  );
  const totalActiveOrders = readyOrders.length + cookingOrders.length + queueOrders.length;

  const handleStatusUpdate = useCallback(
    (order: SavedOrder, newStatus: string) => {
      if (newStatus === 'Completed') {
        setCompletionOrder(order);
      } else {
        dispatch({ type: 'UPDATE_ORDER', payload: { ...order, status: newStatus as OrderStatus } });
      }
    },
    [dispatch]
  );

  const finalizeCompletion = useCallback(
    (order: SavedOrder, tipAmount: number) => {
      dispatch({
        type: 'UPDATE_ORDER',
        payload: {
          ...order,
          status: 'Completed',
          tipAmount: tipAmount,
        },
      });
      setCompletionOrder(null);
    },
    [dispatch]
  );

  const handleEditOrder = useCallback(
    (order: SavedOrder) => {
      dispatch({ type: 'LOAD_ORDER_FOR_EDIT', payload: order });
    },
    [dispatch]
  );

  const toggleOrderExpand = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleManualReorder = useCallback(
    (orderId: string, direction: 'UP' | 'DOWN') => {
      const currentIndex = queueOrders.findIndex((o) => o.id === orderId);
      if (currentIndex === -1) return;

      const newQueue = [...queueOrders];
      const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex >= 0 && targetIndex < newQueue.length) {
        [newQueue[currentIndex], newQueue[targetIndex]] = [
          newQueue[targetIndex],
          newQueue[currentIndex],
        ];
        const otherOrders = activeOrders.filter((o) => o.status !== 'Pending');
        const documentExtended = document as Document & {
          startViewTransition?: (cb: () => void) => void;
        };
        if (documentExtended.startViewTransition) {
          documentExtended.startViewTransition(() => {
            dispatch({ type: 'REORDER_ORDERS', payload: [...newQueue, ...otherOrders] });
          });
        } else {
          dispatch({ type: 'REORDER_ORDERS', payload: [...newQueue, ...otherOrders] });
        }
      }
    },
    [queueOrders, activeOrders, dispatch]
  );

  const getVipLabel = (tierName?: string) => {
    if (!tierName) return 'VIP-1';
    const t = tierName.toLowerCase();
    if (t.includes('starter')) return 'VIP-1';
    if (t.includes('bronze')) return 'VIP-2';
    if (t.includes('silver')) return 'VIP-3';
    if (t.includes('gold')) return 'VIP-4';
    return 'VIP';
  };

  const renderOrderItems = (order: SavedOrder) => (
    <div className="space-y-2 mb-3 border-t border-zinc-200 dark:border-zinc-800 pt-2 animate-in slide-in-from-top-1">
      {(order.items || []).map((item, i) => (
        <div key={i} className="text-xs">
          <div className="flex justify-between text-zinc-900 dark:text-zinc-200 font-bold">
            <span>1x {item.name}</span>
          </div>
          <div className="pl-3 space-y-0.5 mt-0.5">
            {(item.selectedModifiers || []).map((mod, j) => (
              <div
                key={j}
                className={`text-[10px] uppercase ${mod.variation === 'No' ? 'text-red-500' : mod.variation === 'Extra' ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-500'}`}
              >
                {mod.variation !== 'Normal' ? `${mod.variation} ` : ''}
                {mod.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 relative">
      {completionOrder && (
        <CompletionModal
          order={completionOrder}
          onClose={() => setCompletionOrder(null)}
          onComplete={finalizeCompletion}
        />
      )}

      {showSummary && (
        <KitchenSummaryModal
          cookingOrders={cookingOrders}
          queueOrders={queueOrders}
          onClose={() => setShowSummary(false)}
        />
      )}

      {showAssembly && (
        <AssemblyLineModal
          orders={assemblyOrders}
          onClose={() => setShowAssembly(false)}
          onPackAndClose={setCompletionOrder}
        />
      )}

      <div className="px-2 py-2 flex items-center justify-start gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 shrink-0">
        <button
          onClick={() => setShowSummary(true)}
          className="h-10 flex-1 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-500/50 transition-all active:scale-95"
          title="Production Summary"
        >
          <Wand2 size={20} />
        </button>

        <button
          onClick={() => setShowAssembly(true)}
          className="h-10 flex-1 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:border-lime-200 dark:hover:border-lime-500/50 transition-all active:scale-95"
          title="Assembly Line"
        >
          <UtensilsCrossed size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
        {totalActiveOrders === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 opacity-50 py-10">
            <ChefHat size={48} className="mb-4" />
            <span className="font-mono text-xs uppercase tracking-widest">No Active Orders</span>
          </div>
        )}

        {readyOrders.length > 0 && (
          <>
            <div className="sticky top-0 z-20 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 bg-lime-50 dark:bg-lime-900/20 border-l-4 border-l-lime-500">
                <span className="text-xs font-bold uppercase tracking-widest text-lime-700 dark:text-lime-400">
                  Ready
                </span>
                <span className="text-[10px] font-mono bg-lime-200 dark:bg-lime-900/50 text-lime-800 dark:text-lime-200 px-1.5 py-0.5 rounded">
                  {readyOrders.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 pb-4">
              {readyOrders.map((order) => {
                const isExpanded = expandedOrderIds.has(order.id);
                return (
                  <div
                    key={order.id}
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col hover:border-lime-500/50 transition-all shadow-sm"
                  >
                    <div
                      className="flex justify-between items-start mb-2 cursor-pointer"
                      onClick={(e) => toggleOrderExpand(order.id, e)}
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-zinc-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-lg text-zinc-900 dark:text-white">
                            #{order.id}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                            {order.table}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <LiveTimer
                          startTime={order.readyAt}
                          className="font-mono font-bold text-sm text-lime-600"
                        />
                        <div className="flex items-center gap-1 mt-1">
                          {order.isLoyalty && (
                            <span className="text-[9px] font-bold bg-yellow-400 text-zinc-900 px-1.5 py-0.5 rounded uppercase">
                              {getVipLabel(order.loyaltySnapshot?.tierName)}
                            </span>
                          )}
                          <span className="text-[9px] uppercase text-zinc-400">READY</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && renderOrderItems(order)}
                    <button
                      onClick={() => setCompletionOrder(order)}
                      className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase flex items-center justify-center"
                    >
                      <CheckCircle size={16} className="mr-2" /> PACK & CLOSE
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {cookingOrders.length > 0 && (
          <>
            <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-l-orange-500">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-400">
                  Kitchen
                </span>
                <span className="text-[10px] font-mono bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-1.5 py-0.5 rounded">
                  {cookingOrders.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 pb-4">
              {cookingOrders.map((order) => {
                const isExpanded = expandedOrderIds.has(order.id);
                return (
                  <div
                    key={order.id}
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col hover:border-orange-500/50 transition-all shadow-sm"
                  >
                    <div
                      className="flex justify-between items-start mb-2 cursor-pointer"
                      onClick={(e) => toggleOrderExpand(order.id, e)}
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-zinc-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-lg text-zinc-900 dark:text-white">
                            #{order.id}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                            {order.table}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <LiveTimer
                          startTime={order.cookingStartedAt}
                          className="font-mono font-bold text-sm text-orange-600"
                        />
                        <div className="flex items-center gap-1 mt-1">
                          {order.isLoyalty && (
                            <span className="text-[9px] font-bold bg-yellow-400 text-zinc-900 px-1.5 py-0.5 rounded uppercase">
                              {getVipLabel(order.loyaltySnapshot?.tierName)}
                            </span>
                          )}
                          <span className="text-[9px] uppercase text-zinc-400">COOKING</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && renderOrderItems(order)}
                    <button
                      onClick={() => handleStatusUpdate(order, 'Ready')}
                      className="w-full py-3 bg-lime-500 hover:bg-lime-400 rounded-lg text-xs font-bold uppercase text-zinc-950 flex items-center justify-center shadow-lg shadow-lime-500/20"
                    >
                      <Bell size={16} className="mr-2" /> ORDER READY
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {queueOrders.length > 0 && (
          <>
            <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800/50 border-l-4 border-l-zinc-400 dark:border-l-zinc-600">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Pending
                </span>
                <span className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded">
                  {queueOrders.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 pb-20">
              {queueOrders.map((order) => {
                const isExpanded = expandedOrderIds.has(order.id);
                return (
                  <div
                    key={order.id}
                    className={`bg-zinc-50 dark:bg-zinc-900 rounded-xl p-2 flex flex-col transition-all relative group shadow-sm ${order.isLoyalty ? 'border border-yellow-400 dark:border-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.1)]' : 'border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                  >
                    <div className="flex h-full">
                      <div className="w-12 flex flex-col items-center justify-center border-r border-zinc-200 dark:border-zinc-800 pr-2 mr-2 gap-1 py-2">
                        <button
                          onClick={() => handleManualReorder(order.id, 'UP')}
                          className="flex-1 w-full flex items-center justify-center text-zinc-400 hover:text-lime-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                        >
                          <ChevronUp size={20} />
                        </button>
                        <button
                          onClick={() => handleManualReorder(order.id, 'DOWN')}
                          className="flex-1 w-full flex items-center justify-center text-zinc-400 hover:text-lime-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                        >
                          <ChevronDown size={20} />
                        </button>
                      </div>

                      <div className="flex-1 py-1">
                        <div
                          className="flex justify-between items-start mb-2 cursor-pointer"
                          onClick={(e) => toggleOrderExpand(order.id, e)}
                        >
                          <div className="flex items-center">
                            <div className="mr-2 text-zinc-400">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            <div>
                              <div className="font-mono font-bold text-lg text-zinc-900 dark:text-white">
                                #{order.id}
                              </div>
                              <div className="text-[10px] font-bold text-zinc-500 uppercase">
                                {order.table}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white">
                              ${order.total.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {order.isLoyalty && (
                                <span className="text-[9px] font-bold bg-yellow-400 text-zinc-900 px-1.5 py-0.5 rounded uppercase">
                                  {getVipLabel(order.loyaltySnapshot?.tierName)}
                                </span>
                              )}
                              <span className="text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase">
                                PENDING
                              </span>
                            </div>
                          </div>
                        </div>

                        {isExpanded && renderOrderItems(order)}

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="flex-1 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 flex items-center justify-center"
                          >
                            <Edit size={14} className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order, 'Kitchen')}
                            className="flex-[2] py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-xs font-bold uppercase text-white flex items-center justify-center"
                          >
                            <ChefHat size={14} className="mr-1" /> Fire
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(OrderRail);
