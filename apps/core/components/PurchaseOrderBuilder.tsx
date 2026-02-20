import React, { useState, useEffect } from 'react';
import { Truck, Package, Plus, Trash2, Calendar, FileText, Download, Send, RefreshCw, X } from 'lucide-react';

interface PurchaseOrderBuilderProps {
    order?: any;
    suppliers: any[];
    inventory: any[];
    onSave: (order: any) => void;
    onCancel: () => void;
}

export const PurchaseOrderBuilder = ({ order, suppliers, inventory, onSave, onCancel }: PurchaseOrderBuilderProps) => {
    const [localOrder, setLocalOrder] = useState<any>({
        id: order?.id || '',
        supplierId: order?.supplierId || (suppliers[0]?.id || ''),
        status: order?.status || 'DRAFT',
        items: order?.items ? [...order.items] : [],
        totalCost: order?.totalCost || 0
    });

    // Re-calculate total anytime items change
    useEffect(() => {
        const total = localOrder.items.reduce((sum: number, item: any) => sum + (item.quantityOrdered * item.cost), 0);
        setLocalOrder((prev: any) => ({ ...prev, totalCost: total }));
    }, [localOrder.items]);

    const activeSupplier = suppliers.find(s => s.id === localOrder.supplierId);

    const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const invId = e.target.value;
        if (!invId) return;
        const invItem = inventory.find(i => i.id === invId);
        if (!invItem) return;

        // Check if already added
        if (localOrder.items.find((i: any) => i.inventoryItemId === invId)) return;

        setLocalOrder((prev: any) => ({
            ...prev,
            items: [...prev.items, {
                inventoryItemId: invItem.id,
                inventoryItem: invItem,
                quantityOrdered: 1,
                quantityReceived: localOrder.status === 'RECEIVED' ? 1 : 0,
                cost: invItem.costPerUnit || 0
            }]
        }));

        e.target.value = ''; // Reset select
    };

    const updateItem = (index: number, field: string, value: number) => {
        setLocalOrder((prev: any) => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const removeItem = (index: number) => {
        setLocalOrder((prev: any) => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    const isReadOnly = localOrder.status === 'RECEIVED';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-12 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-5xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <FileText className="text-brand" size={24} />
                            <h2 className="text-2xl font-bold text-white tracking-tight">Purchase Order</h2>
                        </div>
                        <p className="text-xs font-mono text-gray-500 uppercase">
                            {localOrder.id ? `PO REF: ${localOrder.id}` : 'NEW DRAFT ORDER'}
                        </p>
                    </div>
                    <button onClick={onCancel} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-black/20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Col: Config & Details */}
                        <div className="space-y-6">
                            {/* Status Pill */}
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Order Lifecycle</label>
                                <div className="flex items-center gap-2 mb-4">
                                    {['DRAFT', 'PLACED', 'RECEIVED'].map(status => (
                                        <button
                                            key={status}
                                            disabled={isReadOnly && status !== 'RECEIVED'}
                                            onClick={() => setLocalOrder((prev: any) => ({ ...prev, status }))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono transition-all ${localOrder.status === status
                                                ? status === 'RECEIVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                    : status === 'PLACED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'bg-brand/20 text-brand border border-brand/30 shadow-[0_0_10px_rgba(132,204,22,0.1)]'
                                                : 'bg-black/50 text-gray-600 border border-white/5 hover:text-gray-400'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                {localOrder.status === 'RECEIVED' && (
                                    <div className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center justify-center gap-2">
                                        <RefreshCw size={12} className="animate-spin-slow" /> INVENTORY AUTO-SYNC ACTIVE
                                    </div>
                                )}
                            </div>

                            {/* Supplier Selection */}
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Vendor</label>
                                    <select
                                        disabled={isReadOnly}
                                        value={localOrder.supplierId}
                                        onChange={e => setLocalOrder((prev: any) => ({ ...prev, supplierId: e.target.value }))}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-brand/50"
                                    >
                                        <option value="" disabled>Select Vendor...</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                                        ))}
                                    </select>
                                </div>
                                {activeSupplier && (
                                    <div className="text-xs text-gray-500 font-mono space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex justify-between"><span>Lead Time:</span><span className="text-white">{activeSupplier.leadTimeDays} Days</span></div>
                                        <div className="flex justify-between"><span>Contact:</span><span className="text-white">{activeSupplier.contactName || 'N/A'}</span></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Col: Items Ledger */}
                        <div className="lg:col-span-2 flex flex-col">
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-xs font-mono text-gray-400 uppercase">Order Ledger (Manifest)</label>

                                    {!isReadOnly && (
                                        <div className="relative w-64">
                                            <select
                                                onChange={handleAddItem}
                                                className="w-full bg-brand/10 text-brand border border-brand/20 rounded-xl p-2 pl-8 text-xs font-bold font-mono outline-none cursor-pointer appearance-none"
                                            >
                                                <option value="">+ ADD INVENTORY ITEM...</option>
                                                {inventory.map(i => (
                                                    <option key={i.id} value={i.id}>{i.name} ({i.stockUnit})</option>
                                                ))}
                                            </select>
                                            <Plus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto mb-4 border border-white/5 rounded-xl bg-black/20">
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="bg-black/40 text-gray-500 font-mono text-[10px] uppercase sticky top-0 z-10 backdrop-blur-md">
                                            <tr>
                                                <th className="p-3 font-medium">Item Name</th>
                                                <th className="p-3 font-medium">Qty Ord</th>
                                                {localOrder.status === 'RECEIVED' && <th className="p-3 font-medium text-emerald-400">Qty Rcvd</th>}
                                                <th className="p-3 font-medium">Cost ({localOrder.items.length > 0 && localOrder.items[0].inventoryItem?.stockUnit ? localOrder.items[0].inventoryItem.stockUnit : 'unit'})</th>
                                                <th className="p-3 font-medium text-right">Line Total</th>
                                                <th className="p-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {localOrder.items.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-gray-600 font-mono text-xs">
                                                        Ledger is empty. Add items to manifest.
                                                    </td>
                                                </tr>
                                            ) : localOrder.items.map((item: any, idx: number) => (
                                                <tr key={item.inventoryItemId} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 font-bold text-white flex items-center gap-2">
                                                        <Package size={14} className="text-gray-500" />
                                                        {item.inventoryItem?.name || 'Unknown Item'}
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="number"
                                                            disabled={isReadOnly}
                                                            value={item.quantityOrdered}
                                                            onChange={e => updateItem(idx, 'quantityOrdered', parseFloat(e.target.value) || 0)}
                                                            className="w-16 bg-black/50 border border-white/10 rounded px-2 py-1 text-white font-mono text-center outline-none focus:border-brand/50 disabled:opacity-50"
                                                        />
                                                    </td>
                                                    {localOrder.status === 'RECEIVED' && (
                                                        <td className="p-3">
                                                            <input
                                                                type="number"
                                                                value={item.quantityReceived}
                                                                onChange={e => updateItem(idx, 'quantityReceived', parseFloat(e.target.value) || 0)}
                                                                className="w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded px-2 py-1 font-mono text-center outline-none focus:border-emerald-500"
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="p-3">
                                                        <input
                                                            type="number"
                                                            disabled={isReadOnly}
                                                            value={item.cost}
                                                            onChange={e => updateItem(idx, 'cost', parseFloat(e.target.value) || 0)}
                                                            className="w-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-white font-mono text-right outline-none focus:border-brand/50 disabled:opacity-50"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-right font-mono font-bold text-gray-200">
                                                        ${((localOrder.status === 'RECEIVED' ? item.quantityReceived : item.quantityOrdered) * item.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {!isReadOnly && (
                                                            <button onClick={() => removeItem(idx)} className="text-red-500/50 hover:text-red-400 transition-colors">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <div className="text-gray-500 text-xs font-mono uppercase">
                                        Total Manifest Items: {localOrder.items.length}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Estimated Total</div>
                                        <div className="text-3xl font-mono font-bold text-white text-glow shadow-brand">
                                            ${localOrder.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer acts */}
                <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={() => onSave(localOrder)}
                        disabled={localOrder.items.length === 0}
                        className="px-8 py-2.5 bg-brand text-black rounded-xl font-black text-sm tracking-wide hover:bg-brand/90 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(132,204,22,0.2)] disabled:opacity-50 disabled:shadow-none"
                    >
                        <Send size={16} />
                        SAVE & UPDATE
                    </button>
                </div>
            </div>
        </div>
    );
};
