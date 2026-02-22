import { useState, useMemo, useEffect } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { useInventoryStore } from '../../stores/inventoryStore';

type UnitType = 'standard' | 'bulk'; // kg vs sack
type ModeType = 'order' | 'manual';

export function ReceivingForm() {
    const { inventory, supplyOrders, suppliers, fetchInventory, fetchSupplyOrders } = useInventoryStore();
    const [mode, setMode] = useState<ModeType>('order');
    const [loading, setLoading] = useState(false);

    // Manual Form State
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [unitType, setUnitType] = useState<UnitType>('standard');
    const [unitCount, setUnitCount] = useState<number>(1);
    const [netWeight, setNetWeight] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [search, setSearch] = useState('');

    // Order Receive State
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [orderReceipts, setOrderReceipts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchInventory();
        fetchSupplyOrders();
    }, [fetchInventory, fetchSupplyOrders]);

    const calculatedCostPerUnit = useMemo(() => {
        if (!totalCost || !netWeight) return 0;
        return totalCost / netWeight;
    }, [totalCost, netWeight]);

    const handleManualSubmit = async () => {
        if (!selectedItem) return;
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/inventory/receive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                },
                body: JSON.stringify({
                    itemId: selectedItem,
                    quantity: netWeight,
                    cost: calculatedCostPerUnit,
                    supplierId: 'manual-entry'
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Manual Receiving Failed: ${err.error}`);
                return;
            }

            alert('Manual Stock Received Successfully');
            setUnitCount(1);
            setNetWeight(0);
            setTotalCost(0);
            setSelectedItem('');
            fetchInventory();
        } catch (e) {
            console.error('API Error', e);
            alert('Network Error');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderSubmit = async () => {
        if (!selectedOrderId) return;
        const currentOrder = supplyOrders.find(o => o.id === selectedOrderId);
        if (!currentOrder) return;

        setLoading(true);

        // Build Payload
        const payloadItems = currentOrder.items.map((i: any) => ({
            inventoryItemId: i.inventoryItemId,
            quantityOrdered: i.quantityOrdered,
            quantityReceived: orderReceipts[i.inventoryItemId] !== undefined ? orderReceipts[i.inventoryItemId] : i.quantityOrdered,
            cost: i.cost
        }));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/supply-orders/${selectedOrderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
                },
                body: JSON.stringify({
                    status: 'RECEIVED',
                    totalCost: currentOrder.totalCost,
                    items: payloadItems
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Order Receiving Failed: ${err.error}`);
                return;
            }

            alert('Order Received & Fully Ingested');
            setSelectedOrderId('');
            setOrderReceipts({});
            fetchInventory();
            fetchSupplyOrders();
        } catch (e) {
            console.error('API Error', e);
            alert('Network Error');
        } finally {
            setLoading(false);
        }
    };

    const activeOrder = supplyOrders.find(o => o.id === selectedOrderId);

    return (
        <Card className="bg-ink-500 p-6 w-full max-w-4xl mx-auto h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-jet-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-white">Goods Reception</h2>
                <div className="flex bg-jet-700 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('order')}
                        className={`px-4 py-2 text-sm font-bold rounded ${mode === 'order' ? 'bg-teal-mid text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        From Purchase Order
                    </button>
                    <button
                        onClick={() => setMode('manual')}
                        className={`px-4 py-2 text-sm font-bold rounded ${mode === 'manual' ? 'bg-teal-mid text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Manual Ingestion
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {mode === 'order' && (
                    <div className="space-y-6">
                        {!selectedOrderId ? (
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Pending Deliveries</h3>
                                {supplyOrders.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 border border-dashed border-jet-600 rounded-xl">
                                        No pending purchase orders to receive.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {supplyOrders.map((order: any) => (
                                            <Button
                                                key={order.id}
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedOrderId(order.id);
                                                    // Initialize receipts to expected quantities
                                                    const initialReceipts: Record<string, number> = {};
                                                    order.items.forEach((i: any) => {
                                                        initialReceipts[i.inventoryItemId] = i.quantityOrdered;
                                                    });
                                                    setOrderReceipts(initialReceipts);
                                                }}
                                                className="justify-start text-left flex-col items-start p-4 h-auto"
                                            >
                                                <div className="flex items-center justify-between w-full mb-2">
                                                    <span className="font-bold text-white text-lg">{order.supplier?.name || 'Unknown Supplier'}</span>
                                                    <Badge variant="warning">{new Date(order.placedAt).toLocaleDateString()}</Badge>
                                                </div>
                                                <div className="text-sm text-gray-400">{order.items.length} items expected</div>
                                                <div className="mt-2 text-xs font-mono text-teal-400">Total: ${order.totalCost}</div>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-jet-800 p-4 rounded-xl border border-jet-600">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Receiving From</div>
                                        <div className="text-xl font-bold text-white">{activeOrder?.supplier?.name}</div>
                                    </div>
                                    <Button variant="ghost" onClick={() => setSelectedOrderId('')}>Cancel / Back</Button>
                                </div>

                                <div className="bg-jet-700/50 rounded-xl border border-jet-600 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-jet-800 text-xs font-mono uppercase text-gray-400">
                                            <tr>
                                                <th className="p-4">Item</th>
                                                <th className="p-4 text-center">Expected</th>
                                                <th className="p-4 text-center">Received</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-jet-700">
                                            {activeOrder?.items.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-jet-700/50">
                                                    <td className="p-4">
                                                        <div className="font-bold text-white">{item.inventoryItem?.name || item.inventoryItemId}</div>
                                                        <div className="text-xs text-gray-500 font-mono">${item.cost}/unit</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-gray-300 font-mono text-lg">{item.quantityOrdered}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={orderReceipts[item.inventoryItemId] ?? item.quantityOrdered}
                                                                onChange={(e) => setOrderReceipts(prev => ({ ...prev, [item.inventoryItemId]: parseFloat(e.target.value) || 0 }))}
                                                                className={`w-24 bg-jet-800 border ${orderReceipts[item.inventoryItemId] !== item.quantityOrdered ? 'border-amber-500 text-amber-500' : 'border-jet-500 text-white'} rounded-lg p-2 text-center text-lg font-bold outline-none`}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-jet-700">
                                    <Button size="lg" onClick={handleOrderSubmit} disabled={loading}>
                                        {loading ? 'Processing...' : 'Confirm Delivery & Ingest'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'manual' && (
                    <div className="space-y-6">
                        {/* 1. Item Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Item to Receive</label>
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-jet-800 border border-jet-600 rounded p-2 text-white mb-2 focus:border-teal-500 outline-none"
                            />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                {inventory
                                    .filter((i) => (i.type === 'RAW' || i.type === 'READY') && i.name.toLowerCase().includes(search.toLowerCase()))
                                    .map((i: any) => (
                                        <Button
                                            key={i.id}
                                            variant={selectedItem === i.id ? 'primary' : 'outline'}
                                            onClick={() => setSelectedItem(i.id)}
                                            className="justify-start text-left flex-col items-start gap-1"
                                        >
                                            <span className="truncate w-full">{i.name}</span>
                                            <Badge variant="info" className="text-[10px]">{Number(i.stockKitchen || 0).toFixed(1)} {i.stockUnit} AVAIL</Badge>
                                        </Button>
                                    ))}
                            </div>
                        </div>

                        {selectedItem && (
                            <>
                                {/* 2. Unit Type Toggle */}
                                <div className="flex gap-4 p-4 bg-jet-700 rounded-lg">
                                    <span className="text-sm font-bold text-gray-300">Unit Type:</span>
                                    <label className="flex items-center gap-2 text-gray-300">
                                        <input
                                            type="radio"
                                            checked={unitType === 'standard'}
                                            onChange={() => setUnitType('standard')}
                                            className="accent-teal-mid"
                                        /> Standard (kg/L)
                                    </label>
                                    <label className="flex items-center gap-2 text-gray-300">
                                        <input
                                            type="radio"
                                            checked={unitType === 'bulk'}
                                            onChange={() => setUnitType('bulk')}
                                            className="accent-teal-mid"
                                        /> Bulk (Sack/Crate)
                                    </label>
                                </div>

                                {/* 3. Dynamic Inputs */}
                                <div className="grid grid-cols-2 gap-4">
                                    {unitType === 'bulk' && (
                                        <div className="col-span-2 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">Unit Count</label>
                                                <input
                                                    type="number"
                                                    value={unitCount}
                                                    onChange={e => setUnitCount(Number(e.target.value))}
                                                    className="w-full bg-jet-700 text-white rounded p-2 border border-jet-500"
                                                    placeholder="e.g. 1 (Arpilla)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">Net Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    value={netWeight}
                                                    onChange={e => setNetWeight(Number(e.target.value))}
                                                    className="w-full bg-jet-700 text-white rounded p-2 border border-jet-500"
                                                    placeholder="e.g. 25"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {unitType === 'standard' && (
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">Weight/Volume</label>
                                            <input
                                                type="number"
                                                value={netWeight}
                                                onChange={e => setNetWeight(Number(e.target.value))}
                                                className="w-full bg-jet-700 text-white rounded p-2 border border-jet-500"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">Total Cost Paid ($)</label>
                                        <input
                                            type="number"
                                            value={totalCost}
                                            onChange={e => setTotalCost(Number(e.target.value))}
                                            className="w-full bg-jet-700 text-teal-bright font-bold rounded p-2 border border-jet-500"
                                            placeholder="e.g. 300"
                                        />
                                    </div>
                                </div>

                                {/* 4. Validation & Cost Averaging */}
                                <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-teal-bright uppercase tracking-widest">Cost Analysis</div>
                                        <div className="text-2xl font-black text-white">${calculatedCostPerUnit.toFixed(2)} <span className="text-sm font-medium text-gray-400">/ unit</span></div>
                                    </div>
                                    <Button size="lg" onClick={handleManualSubmit} disabled={!netWeight || !totalCost || loading}>
                                        {loading ? 'Processing...' : 'Confirm Receipt'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
