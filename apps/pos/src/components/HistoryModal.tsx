/**
 * @link e:\git\hyphae-pos\src\components\HistoryModal.tsx
 * @author Hyphae POS Team
 * @description Archive view for completed orders with detailed drill-down.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import {
  X,
  Clock,
  CheckCircle,
  Crown,
  Calendar,
  CreditCard,
  Banknote,
  DollarSign,
  User,
  MapPin,
  Monitor,
} from 'lucide-react';
import { SavedOrder } from '../types';

interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const { state } = useOrder();

  // Now using the optimized completedOrders array
  // If the migration just happened, checking activeOrders as fallback (optional, but good safety)
  const legacyCompleted = state.activeOrders.filter((o) => o.status === 'Completed');

  const historyOrders = [...state.completedOrders, ...legacyCompleted].sort(
    (a, b) => (b.completedAt || 0) - (a.completedAt || 0)
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderOrderDetails = (order: SavedOrder) => (
    <div className="bg-black/20 rounded-lg p-3 space-y-3 mb-3 font-mono">
      {order.items.map((item, idx) => (
        <div
          key={`${item.uniqueId}-${idx}`}
          className="border-b border-zinc-800/50 last:border-0 pb-3 last:pb-0"
        >
          <div className="flex justify-between items-start">
            <span className="text-white font-bold text-sm uppercase leading-tight">
              {item.name}
            </span>
            <span className="text-zinc-400 text-xs">${item.finalPrice.toFixed(2)}</span>
          </div>

          <div className="mt-1 space-y-1 pl-2">
            {item.selectedModifiers
              ?.filter((m) => {
                const group = item.modifierGroups?.find((g) => g.id === m.groupId);
                if (group?.variant === 'sub_item') return false;
                if (group?.dependency) {
                  const parentGroup = item.modifierGroups?.find(
                    (pg) => pg.id === group.dependency?.groupId
                  );
                  if (parentGroup?.variant === 'sub_item') return false;
                }
                return true;
              })
              .map((mod, i) => (
                <div key={i} className="text-xs text-zinc-400 flex items-start">
                  {mod.variation !== 'Normal' ? (
                    <span
                      className={`font-bold mr-1.5 px-1 rounded text-[10px] uppercase
                                     ${
                                       mod.variation === 'No'
                                         ? 'bg-red-900/50 text-red-400'
                                         : mod.variation === 'Side'
                                           ? 'bg-blue-900/50 text-blue-400'
                                           : 'bg-lime-900/50 text-lime-400'
                                     }
                                 `}
                    >
                      {mod.variation}
                    </span>
                  ) : (
                    <span className="text-zinc-600 mr-1.5">•</span>
                  )}
                  <span>{mod.name}</span>
                </div>
              ))}

            {item.selectedModifiers
              ?.filter(
                (m) => item.modifierGroups?.find((g) => g.id === m.groupId)?.variant === 'sub_item'
              )
              .map((subItem, i) => (
                <div key={i} className="mt-2 ml-1 pl-2 border-l-2 border-zinc-700">
                  <div className="text-xs font-bold text-lime-400/80 mb-0.5">{subItem.name}</div>
                  {item.selectedModifiers
                    ?.filter((m) => {
                      const group = item.modifierGroups?.find((g) => g.id === m.groupId);
                      return group?.dependency?.groupId === subItem.groupId;
                    })
                    .map((nestedMod, j) => (
                      <div key={j} className="text-[10px] text-zinc-500 pl-1">
                        + {nestedMod.name}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-widest uppercase">
                Order History
              </h2>
              <span className="text-zinc-500 text-xs">{historyOrders.length} Archived Orders</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/50">
          {historyOrders.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p className="font-mono text-sm">No archived orders found.</p>
            </div>
          )}

          {historyOrders.map((order) => (
            <div
              key={order.id}
              className={`
                        bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all
                        ${expandedId === order.id ? 'ring-1 ring-zinc-700 bg-zinc-800' : 'hover:bg-zinc-800/50'}
                    `}
            >
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-lime-900/20 text-lime-500 flex items-center justify-center shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-lg">#{order.id}</span>
                      {order.isLoyalty && (
                        <Crown size={14} className="text-yellow-500 fill-yellow-500/20" />
                      )}
                      <span className="text-xs text-zinc-500 uppercase font-bold px-2 py-0.5 bg-zinc-950 rounded border border-zinc-800">
                        {order.table}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-zinc-500 mt-1 font-mono">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {order.completedAt
                          ? new Date(order.completedAt).toLocaleTimeString()
                          : 'Unknown'}
                      </span>
                      <span className="flex items-center">
                        {order.paymentStatus === 'Paid' ? (
                          <DollarSign size={12} className="mr-1" />
                        ) : null}
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white text-lg">
                    ${order.total.toFixed(2)}
                  </div>
                  {order.tipAmount ? (
                    <span className="text-xs text-lime-400 font-mono">
                      +${order.tipAmount.toFixed(2)} Tip
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600 font-mono">No Tip</span>
                  )}
                </div>
              </button>

              {expandedId === order.id && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                  <div className="h-px bg-zinc-800 mb-4"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">
                        Order Items
                      </h4>
                      {renderOrderDetails(order)}
                    </div>

                    <div className="space-y-4">
                      {/* SYSTEM INFO WIDGET */}
                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                          <div className="flex items-center gap-1" title="Staff ID">
                            <User size={12} />{' '}
                            <span className="font-mono">{order.systemInfo?.staffId || 'UNK'}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Terminal ID">
                            <Monitor size={12} />{' '}
                            <span className="font-mono">
                              {order.systemInfo?.terminalId || 'UNK'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1" title="Store ID">
                            <MapPin size={12} />{' '}
                            <span className="font-mono">{order.systemInfo?.storeId || 'UNK'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 tracking-widest">
                          Summary
                        </h4>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between text-zinc-400">
                            <span>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Tax</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lime-400 font-bold border-t border-zinc-800 pt-2 mt-2">
                            <span>Grand Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                          {order.tipAmount !== undefined && (
                            <div className="flex justify-between text-zinc-300 font-bold">
                              <span>Tip</span>
                              <span>${order.tipAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-white font-bold border-t border-zinc-800 pt-2 mt-2 text-lg">
                            <span>Paid</span>
                            <span>${(order.amountPaid + (order.tipAmount || 0)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-center flex-col">
                          <span className="text-[10px] text-zinc-500 uppercase mb-1">Method</span>
                          <div className="flex items-center text-zinc-300 font-bold">
                            {order.confirmationNumber ? (
                              <CreditCard size={16} className="mr-2" />
                            ) : (
                              <Banknote size={16} className="mr-2" />
                            )}
                            <span>Payment</span>
                          </div>
                        </div>
                        {order.confirmationNumber && (
                          <div className="flex-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-center flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase mb-1">Ref #</span>
                            <span className="font-mono text-zinc-300 font-bold">
                              {order.confirmationNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
