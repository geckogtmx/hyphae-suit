import { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { useInventoryStore } from '../../stores/inventoryStore';

type UnitType = 'standard' | 'bulk'; // kg vs sack

export function ReceivingForm() {
    const { inventory, updateQuantity } = useInventoryStore();
    const [selectedItem, setSelectedItem] = useState<string>('');

    // Form Input
    const [unitType, setUnitType] = useState<UnitType>('standard');
    const [unitCount, setUnitCount] = useState<number>(1);
    const [netWeight, setNetWeight] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);

    const calculatedCostPerUnit = useMemo(() => {
        if (!totalCost || !netWeight) return 0;
        return totalCost / netWeight;
    }, [totalCost, netWeight]);

    const handleSubmit = () => {
        if (!selectedItem) return;
        // Mock API Call to update HCA
        console.log({
            itemId: selectedItem,
            received: unitCount,
            netWeight,
            costPerUnit: calculatedCostPerUnit
        });
        updateQuantity(selectedItem, Number((inventory.find(i => i.id === selectedItem)?.currentStock || 0) + netWeight));

        // Reset form
        setUnitCount(1);
        setNetWeight(0);
        setTotalCost(0);
    };

    return (
        <Card className="bg-ink-500 p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-jet-700 pb-2">Receiving Mode (Ingestion Firewall)</h2>

            <div className="space-y-6">
                {/* 1. Item Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Item to Receive</label>
                    <div className="grid grid-cols-2 gap-2">
                        {inventory.map((i: any) => (
                            <Button
                                key={i.id}
                                variant={selectedItem === i.id ? 'primary' : 'outline'}
                                onClick={() => setSelectedItem(i.id)}
                            >
                                {i.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {selectedItem && (
                    <>
                        {/* 2. Unit Type Toggle */}
                        <div className="flex gap-4 p-4 bg-jet-700 rounded-lg">
                            <span className="text-sm font-bold text-gray-300">Unit Type:</span>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={unitType === 'standard'}
                                    onChange={() => setUnitType('standard')}
                                    className="accent-teal-mid"
                                /> Standard (kg)
                            </label>
                            <label className="flex items-center gap-2">
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
                                    <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">Weight (kg)</label>
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
                                <div className="text-2xl font-black text-white">${calculatedCostPerUnit.toFixed(2)} <span className="text-sm font-medium text-gray-400">/ kg</span></div>
                            </div>
                            <Button size="lg" onClick={handleSubmit} disabled={!netWeight || !totalCost}>
                                Confirm Receipt
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
