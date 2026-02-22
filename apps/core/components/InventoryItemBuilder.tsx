import React, { useState } from 'react';
import { ChefHat, Save, X, Package, DollarSign, Truck, AlertCircle } from 'lucide-react';
import type { InventoryItem } from '../types/schema';

interface InventoryItemBuilderProps {
    initialItem?: Partial<InventoryItem>;
    suppliers?: any[];
    onSave: (item: any) => Promise<void>;
    onClose: () => void;
}

export const InventoryItemBuilder: React.FC<InventoryItemBuilderProps> = ({
    initialItem,
    suppliers = [],
    onSave,
    onClose
}) => {
    const [item, setItem] = useState<any>({
        id: initialItem?.id || '',
        name: initialItem?.name || '',
        type: initialItem?.type || 'RAW',
        stockUnit: initialItem?.stockUnit || 'count',
        costPerUnit: initialItem?.costPerUnit || 0,
        preferredSupplierId: initialItem?.preferredSupplierId || '',
        // Initial stock (only for creation, optional)
        stockKitchen: initialItem?.stockKitchen || 0
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!item.name) return alert('Item Name is required');
        setIsSaving(true);
        try {
            await onSave(item);
            onClose();
        } catch (error) {
            console.error('Failed to save item', error);
            alert('Failed to save item');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-jet-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/20">
                            <Package className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                {item.id ? 'Edit Inventory Item' : 'New Stock Definition'}
                            </h2>
                            <div className="text-[10px] text-gray-500 font-mono">SUPPLY CHAIN CONTROL</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-black font-black text-xs rounded-xl hover:bg-blue-400 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <AlertCircle className="animate-spin" size={16} /> : <Save size={16} />}
                            SAVE ITEM
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* FORM */}
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Item Name</label>
                        <input
                            type="text"
                            value={item.name}
                            onChange={e => setItem({ ...item, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all font-bold"
                            placeholder="e.g. Raw Beef Patty"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Type</label>
                            <select
                                value={item.type}
                                onChange={e => setItem({ ...item, type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-xs"
                            >
                                <option value="RAW">RAW (Ingredient)</option>
                                <option value="PREP">PREP (Internal Batch)</option>
                                <option value="ASSET">ASSET (Non-Food)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Stock Unit</label>
                            <input
                                type="text"
                                list="stock-units"
                                value={item.stockUnit}
                                onChange={e => setItem({ ...item, stockUnit: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-xs font-mono"
                                placeholder="count, kg, lb..."
                            />
                            <datalist id="stock-units">
                                <option value="kg" />
                                <option value="g" />
                                <option value="lb" />
                                <option value="oz" />
                                <option value="L" />
                                <option value="ml" />
                                <option value="count" />
                                <option value="box" />
                                <option value="arpilla" />
                                <option value="sack" />
                                <option value="crate" />
                            </datalist>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Cost Per Unit</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.costPerUnit}
                                    onChange={e => setItem({ ...item, costPerUnit: parseFloat(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-blue-500 outline-none transition-all font-mono"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Preferred Supplier</label>
                            <div className="relative">
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <select
                                    value={item.preferredSupplierId}
                                    onChange={e => setItem({ ...item, preferredSupplierId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-xs appearance-none"
                                >
                                    <option value="">None (Ad-Hoc)</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle size={14} className="text-yellow-500" /> {item.id ? 'Live Stock Adjustment' : 'Initial Stock Seed (Optional)'}
                        </h3>
                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase mb-1">Kitchen Stock</label>
                            <input
                                type="number"
                                value={item.stockKitchen}
                                onChange={e => setItem({ ...item, stockKitchen: parseFloat(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none text-xs font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
