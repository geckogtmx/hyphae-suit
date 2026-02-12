import { useState } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { useInventoryStore } from '../../stores/inventoryStore';
import type { DecayStatus } from './visual-decay';
import { VisualDecayIcon } from './visual-decay';
import { Plus, Printer, XCircle, Recycle } from 'lucide-react';

export function InventoryDashboard() {
    const { inventory } = useInventoryStore();
    const [filter, setFilter] = useState<'ALL' | 'RAW' | 'PREP'>('ALL');

    const filteredItems = inventory.filter((i: any) => filter === 'ALL' || i.type === filter);

    // Mock function to determine decay status (since mockData lacks dates)
    const getMockStatus = (id: string): { status: DecayStatus, days: number } => {
        if (id === 'tomatillos') return { status: 'use_soon', days: 2 };
        if (id === 'yeast') return { status: 'expired', days: -1 };
        return { status: 'fresh', days: 7 };
    };

    return (
        <div className="p-4 h-full flex flex-col gap-6">
            <header className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Inventory & Par Levels</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFilter('ALL')} className={filter === 'ALL' ? 'bg-jet-700' : ''}>All</Button>
                    <Button variant="outline" onClick={() => setFilter('RAW')} className={filter === 'RAW' ? 'bg-jet-700' : ''}>Raw Goods</Button>
                    <Button variant="outline" onClick={() => setFilter('PREP')} className={filter === 'PREP' ? 'bg-jet-700' : ''}>Prep Batches</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                {filteredItems.map((item: any) => {
                    const decay = getMockStatus(item.id);
                    const isLowStock = item.currentStock < (item.parLevel || 500); // Mock par check

                    return (
                        <Card key={item.id} className="bg-jet-700 border-jet-500 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                    <div className="text-gray-400 text-sm">{item.stockUnit} • ${item.costPerUnit}/{item.stockUnit}</div>
                                </div>
                                <VisualDecayIcon status={decay.status} daysRemaining={decay.days} />
                            </div>

                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">In Stock</div>
                                    <div className={`text-4xl font-black ${isLowStock ? 'text-red-500' : 'text-teal-bright'}`}>
                                        {item.currentStock}
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="secondary"><Printer className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="danger"><XCircle className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="primary"><Recycle className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            {/* Batch ID Overlay (Simulated) */}
                            <div className="absolute top-0 right-0 p-1">
                                <span className="text-[10px] font-mono text-gray-600">ID: {item.id.toUpperCase().slice(0, 8)}</span>
                            </div>
                        </Card>
                    );
                })}

                {/* Add Item Card */}
                <button className="border-2 border-dashed border-jet-500 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-teal-mid hover:border-teal-mid transition-colors min-h-[160px]">
                    <Plus className="w-12 h-12 mb-2" />
                    <span className="font-bold">Add Item / Receive</span>
                </button>
            </div>
        </div>
    );
}
