import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { useInventoryStore } from '../../stores/inventoryStore';
import type { DecayStatus } from './visual-decay';
import { VisualDecayIcon } from './visual-decay';
import { Plus, Printer, XCircle, Recycle } from 'lucide-react';

export function InventoryDashboard() {
    const { inventory, fetchInventory } = useInventoryStore();
    const [filter, setFilter] = useState<'ALL' | 'RAW' | 'PREP'>('ALL');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const filteredItems = inventory.filter((i: any) => filter === 'ALL' || i.type === filter);
    const selectedItem = inventory.find((i: any) => i.id === selectedItemId);

    // Mock function to determine decay status (since mockData lacks dates)
    const getMockStatus = (id: string): { status: DecayStatus, days: number } => {
        if (id === 'tomatillos') return { status: 'use_soon', days: 2 };
        if (id === 'yeast') return { status: 'expired', days: -1 };
        return { status: 'fresh', days: 7 };
    };

    return (
        <div className="p-4 h-full flex flex-col gap-6">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-white">Inventory & Par Levels</h2>
                    <Badge variant={inventory.length > 0 && inventory[0].id !== 'flour_ap' ? 'success' : 'default'} className="animate-pulse">
                        {inventory.length > 0 && inventory[0].id !== 'flour_ap' ? 'LIVE CONNECTION' : 'MOCK MODE'}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFilter('ALL')} className={filter === 'ALL' ? 'bg-jet-700' : ''}>All</Button>
                    <Button variant="outline" onClick={() => setFilter('RAW')} className={filter === 'RAW' ? 'bg-jet-700' : ''}>Raw Goods</Button>
                    <Button variant="outline" onClick={() => setFilter('PREP')} className={filter === 'PREP' ? 'bg-jet-700' : ''}>Prep Batches</Button>
                </div>
            </header>

            <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
                {/* Left: Master List */}
                <div className="w-1/2 flex flex-col bg-jet-900/30 rounded-2xl border border-jet-700 min-h-0">
                    <div className="p-4 border-b border-jet-700 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Items Catalog ({filteredItems.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {filteredItems.map((item: any) => {
                            const isLowStock = (item.stockKitchen || 0) < (item.parLevel || 500);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItemId(item.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group
                                        ${selectedItemId === item.id ? 'bg-teal-mid/20 border-teal-mid' : 'hover:bg-jet-700 border-transparent'} border
                                    `}
                                >
                                    <div>
                                        <div className="text-sm font-bold text-white">{item.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase">
                                            $ {item.costPerUnit}/{item.stockUnit}
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${isLowStock ? 'text-red-500' : 'text-teal-bright'}`}>
                                        {item.stockKitchen || 0}
                                        <span className="text-[10px] text-gray-500 font-bold ml-1">{item.stockUnit}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Detail View */}
                <div className="w-1/2 bg-jet-800/50 rounded-2xl border border-jet-700 flex flex-col">
                    {selectedItem ? (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                            <div className="p-8 bg-gradient-to-br from-jet-800 to-ink-500 border-b border-jet-700 rounded-t-2xl relative overflow-hidden">
                                <VisualDecayIcon status={getMockStatus(selectedItem.id).status} daysRemaining={getMockStatus(selectedItem.id).days} />
                                <Badge variant="info" className="mb-4">{selectedItem.type}</Badge>
                                <h2 className="text-4xl font-black text-white">{selectedItem.name}</h2>
                                <div className="text-[10px] font-mono text-gray-500 mt-2">ID: {selectedItem.id}</div>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-jet-900 p-4 rounded-xl border border-jet-700">
                                        <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Current Kitchen Stock</div>
                                        <div className={`text-3xl font-black ${(selectedItem.stockKitchen || 0) < (selectedItem.parLevel || 500) ? 'text-red-500' : 'text-teal-bright'}`}>
                                            {selectedItem.stockKitchen || 0} <span className="text-lg">{selectedItem.stockUnit}</span>
                                        </div>
                                    </div>
                                    <div className="bg-jet-900 p-4 rounded-xl border border-jet-700">
                                        <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Valuation (Cost)</div>
                                        <div className="text-3xl font-black text-white">
                                            ${((selectedItem.stockKitchen || 0) * selectedItem.costPerUnit).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-jet-700 pt-8 mt-auto">
                                    <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Inventory Operations</h3>
                                    <div className="flex gap-4">
                                        <Button className="flex-1 flex gap-2"><Recycle className="w-4 h-4" /> Move to Waste</Button>
                                        <Button variant="secondary" className="flex-1 flex gap-2"><Printer className="w-4 h-4" /> Print Labels</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col text-gray-500 opacity-50 p-6 text-center">
                            <Recycle size={64} className="mb-4" />
                            <h3 className="text-xl font-bold uppercase">Select an Item</h3>
                            <p className="text-sm">View details and perform operations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
