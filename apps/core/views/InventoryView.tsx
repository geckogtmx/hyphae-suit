import React, { useState, useEffect } from 'react';
import { db, schema } from '@hyphae/database';
import { Package, Truck, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';
import { eq } from 'drizzle-orm';

type InventoryItemWithSupplier = typeof schema.inventoryItems.$inferSelect & {
    supplier?: typeof schema.suppliers.$inferSelect | null;
};

export const InventoryView = () => {
    const [inventory, setInventory] = useState<InventoryItemWithSupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const data = await db.query.inventoryItems.findMany({
                    with: {
                        supplier: true
                    }
                });
                setInventory(data);
            } catch (error) {
                console.error("Failed to fetch inventory:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTotalValue = () => {
        return inventory.reduce((acc, item) => acc + (item.currentStock || 0) * item.costPerUnit, 0);
    };

    if (loading) return <div className="p-8 text-white">Loading Inventory...</div>;

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            {/* Header and Summary Cards */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Package className="text-blue-400" /> Inventory & Stock
                </h2>

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
                        <div className="text-3xl font-bold text-white">{inventory.length > 0 ? 0 : 0}</div> {/* Todo: impl logic */}
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
                                <th className="p-4">Stock Level</th>
                                <th className="p-4">Unit Cost</th>
                                <th className="p-4">Total Val</th>
                                <th className="p-4">Supplier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredInventory.map(item => {
                                const totalValue = (item.currentStock || 0) * item.costPerUnit;
                                return (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">{item.name}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/10 text-gray-300 border border-white/5">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-white">
                                            {item.currentStock} <span className="text-gray-500 text-xs">{item.stockUnit}</span>
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
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
