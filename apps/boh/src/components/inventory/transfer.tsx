import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { useInventoryStore } from '../../stores/inventoryStore';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { InventoryItem } from '../../types';

export function InventoryTransfer() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [direction, setDirection] = useState<'EXIT' | 'INGRESS'>('EXIT');
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [note, setNote] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/inventory`, {
                headers: { 'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || '' }
            });
            if (res.ok) setInventory(await res.json());
        } catch (err) {
            console.error('Failed to load inventory', err);
        }
    };

    const handleTransfer = async () => {
        if (!selectedItem || quantity <= 0) return;
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/inventory/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                },
                body: JSON.stringify({
                    itemId: selectedItem,
                    quantity,
                    direction,
                    note
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Transfer Failed: ${err.error}`);
                return;
            }

            alert('Transfer Successful');
            setQuantity(0);
            setNote('');
            fetchInventory(); // Refresh stock levels
        } catch (e) {
            console.error('Transfer Error', e);
            alert('Network Error');
        } finally {
            setLoading(false);
        }
    };

    const item = inventory.find(i => i.id === selectedItem);
    const maxStock = item ? (direction === 'EXIT' ? (item.stockKitchen || 0) : (item.stockStand || 0)) : 0;

    return (
        <Card className="bg-ink-500 p-6 max-w-2xl mx-auto h-full flex flex-col">
            <header className="flex justify-between items-center mb-6 border-b border-jet-700 pb-4">
                <h2 className="text-2xl font-bold text-white">Logistics / Transfer</h2>
                <div className="flex bg-jet-700 p-1 rounded-lg">
                    <button
                        onClick={() => setDirection('EXIT')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${direction === 'EXIT' ? 'bg-teal-mid text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Kitchen <ArrowRight size={16} /> Stand
                    </button>
                    <button
                        onClick={() => setDirection('INGRESS')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${direction === 'INGRESS' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Stand <ArrowLeft size={16} /> Kitchen
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6">
                {/* 1. Select Item */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Item</label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {inventory.map(i => (
                            <button
                                key={i.id}
                                onClick={() => setSelectedItem(i.id)}
                                className={`flex justify-between items-center p-3 rounded-lg border text-left transition-all
                                    ${selectedItem === i.id
                                        ? (direction === 'EXIT' ? 'bg-teal-500/10 border-teal-500 text-white' : 'bg-orange-500/10 border-orange-500 text-white')
                                        : 'bg-jet-700 border-jet-600 text-gray-300 hover:bg-jet-600'
                                    }`}
                            >
                                <span className="font-medium truncate mr-2">{i.name}</span>
                                <div className="flex flex-col items-end text-[10px] font-mono">
                                    <span className={direction === 'EXIT' ? 'text-white font-bold' : 'text-gray-500'}>
                                        K: {i.stockKitchen || 0}
                                    </span>
                                    <span className={direction === 'INGRESS' ? 'text-white font-bold' : 'text-gray-500'}>
                                        S: {i.stockStand || 0}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Quantity & Context */}
                {item && (
                    <div className="bg-jet-700/50 p-4 rounded-xl border border-jet-600 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                                <div className="text-xs text-gray-400 uppercase tracking-widest">
                                    Available to Transfer: <span className="text-white font-bold">{maxStock} {item.stockUnit}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <label className="block text-xs text-gray-400 mb-1">Transfer Amount</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={e => setQuantity(Math.min(Number(e.target.value), maxStock))}
                                        className="w-24 bg-jet-800 border border-jet-600 rounded p-2 text-right font-mono font-bold text-xl text-white focus:border-teal-500 outline-none"
                                    />
                                    <span className="text-gray-500 font-bold">{item.stockUnit}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-1">Note (Optional)</label>
                            <input
                                type="text"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder={direction === 'EXIT' ? "Morning Stock / Event Load" : "Post-shift Return / Damaged"}
                                className="w-full bg-jet-800 border border-jet-600 rounded p-2 text-white text-sm focus:border-teal-500 outline-none"
                            />
                        </div>

                        <Button
                            className="w-full py-4 text-lg font-bold"
                            variant={direction === 'EXIT' ? 'primary' : 'secondary'}
                            onClick={handleTransfer}
                            disabled={loading || quantity <= 0 || quantity > maxStock}
                        >
                            {loading ? 'Processing...' : (direction === 'EXIT' ? 'CONFIRM EXIT NOTE' : 'CONFIRM INGRESS NOTE')}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
