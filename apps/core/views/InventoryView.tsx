import React, { useState, useEffect } from 'react';
import { Package, Truck, AlertTriangle, CheckCircle2, Search, Filter, Plus, Edit2, Trash2 } from 'lucide-react';
import type { InventoryItem } from '../types/schema';
import { InventoryItemBuilder } from '../components/InventoryItemBuilder';

type InventoryItemWithSupplier = InventoryItem & {
    supplier?: any;
};

export const InventoryView = () => {
    const [inventory, setInventory] = useState<InventoryItemWithSupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:3001/api/inventory', {
                headers: {
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                }
            });
            if (res.ok) {
                const data = await res.json();
                setInventory(data);
            }
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSaveItem = async (item: any) => {
        const method = item.id && inventory.find(i => i.id === item.id) ? 'PUT' : 'POST';
        const url = method === 'PUT'
            ? `http://127.0.0.1:3001/api/inventory/item/${item.id}`
            : 'http://127.0.0.1:3001/api/inventory/item';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                },
                body: JSON.stringify(item)
            });

            if (res.ok) {
                fetchInventory();
            } else {
                alert('Failed to save item');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Permanently delete this inventory item?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:3001/api/inventory/item/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                }
            });
            if (res.ok) fetchInventory();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTotalValue = () => {
        return inventory.reduce((acc, item) => acc + ((item.stockKitchen || 0) + (item.stockStand || 0)) * item.costPerUnit, 0);
    };

    if (loading && inventory.length === 0) return <div className="p-8 text-white">Loading Inventory...</div>;

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            {/* Header and Summary Cards */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="text-blue-400" /> Inventory & Stock
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono animate-pulse">LIVE DICTIONARY</span>
                    </h2>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setIsBuilderOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-black font-black text-xs rounded-2xl hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                        <Plus size={18} strokeWidth={3} />
                        NEW ITEM
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-gray-400 text-xs font-mono uppercase mb-2">Total Items</div>
                        <div className="text-3xl font-bold text-white">{inventory.length}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-gray-400 text-xs font-mono uppercase mb-2">Total Value</div>
                        <div className="text-3xl font-bold text-white">${getTotalValue().toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-gray-400 text-xs font-mono uppercase mb-2">Low Stock Alerts</div>
                        <div className="text-3xl font-bold text-white">{inventory.length > 0 ? inventory.filter(i => (i.stockKitchen || 0) < 10).length : 0}</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 font-mono text-xs uppercase">
                            <tr>
                                <th className="p-4">Item Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-center">Kitchen</th>
                                <th className="p-4 text-center">Stand</th>
                                <th className="p-4">Unit Cost</th>
                                <th className="p-4">Total Val</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredInventory.map(item => {
                                const kitchenStock = item.stockKitchen || 0;
                                const standStock = item.stockStand || 0;
                                const totalValue = (kitchenStock + standStock) * item.costPerUnit;
                                return (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-white font-medium">{item.name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${item.type === 'RAW' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                item.type === 'PREP' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    'bg-white/10 text-gray-300 border-white/5'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-white text-center">
                                            {kitchenStock} <span className="text-gray-500 text-xs">{item.stockUnit}</span>
                                        </td>
                                        <td className="p-4 font-mono text-white text-center">
                                            {standStock} <span className="text-gray-500 text-xs">{item.stockUnit}</span>
                                        </td>
                                        <td className="p-4 font-mono text-gray-300">
                                            ${item.costPerUnit.toFixed(2)}
                                        </td>
                                        <td className="p-4 font-mono text-white">
                                            ${totalValue.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-xs text-gray-400">
                                            {item.supplier ? (
                                                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                                                    <Truck size={12} /> {item.supplier.name}
                                                </span>
                                            ) : (
                                                <span className="opacity-50">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setIsBuilderOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-gray-500 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isBuilderOpen && (
                <InventoryItemBuilder
                    initialItem={editingItem || undefined}
                    onSave={handleSaveItem}
                    onClose={() => setIsBuilderOpen(false)}
                />
            )}
        </div>
    );
};
