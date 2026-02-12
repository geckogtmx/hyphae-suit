import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { calculateBakersMath, BRIOCHE_RATIO } from '../../engines/baking';
import { RefreshCcw, Calculator } from 'lucide-react';

export function BakingView() {
    // Default recipe requests 1000g flour
    const [availableFlour, setAvailableFlour] = useState<number>(1000);
    const [scaled, setScaled] = useState(calculateBakersMath(1000, BRIOCHE_RATIO));

    useEffect(() => {
        setScaled(calculateBakersMath(availableFlour, BRIOCHE_RATIO));
    }, [availableFlour]);

    // Numpad input handler (simulated for "No-Keyboard" rule)
    const adjustFlour = (delta: number) => {
        setAvailableFlour(prev => Math.max(0, prev + delta));
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-teal-bright">
                    <Calculator className="w-6 h-6" /> Baking Engine: Auto-Scale
                </h3>
                <Badge variant="info">Hydration: {BRIOCHE_RATIO.water + (BRIOCHE_RATIO.others?.eggs || 0)}%</Badge>
            </div>

            <div className="grid grid-cols-2 gap-8 flex-1">
                {/* INPUT: Available Resource */}
                <Card className="flex flex-col justify-center items-center gap-6 bg-jet-700">
                    <span className="text-gray-400 uppercase tracking-widest text-sm">Available Flour</span>
                    <div className="text-6xl font-black text-white">{availableFlour}<span className="text-2xl text-gray-400">g</span></div>

                    <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                        <Button variant="outline" onClick={() => adjustFlour(-500)}>-500</Button>
                        <Button variant="outline" onClick={() => adjustFlour(-50)}>-50</Button>
                        <Button variant="outline" onClick={() => adjustFlour(50)}>+50</Button>
                        <Button variant="outline" onClick={() => adjustFlour(500)}>+500</Button>
                        {/* Presets */}
                        <Button variant="ghost" className="col-span-2 text-teal-mid" onClick={() => setAvailableFlour(1000)}>Reset (1kg)</Button>
                    </div>
                </Card>

                {/* OUTPUT: Scaled Recipe */}
                <div className="space-y-4">
                    {/* Flour (Main) */}
                    <div className="flex justify-between items-center p-3 bg-jet-700/50 rounded-lg border-l-4 border-teal-500">
                        <span className="text-lg font-medium">Flour (100%)</span>
                        <span className="text-2xl font-bold">{scaled.flour}g</span>
                    </div>

                    {/* Scaled Ingredients */}
                    <div className="space-y-2">
                        <IngredientRow name="Water/Liquid" pct={BRIOCHE_RATIO.water} weight={scaled.water} />
                        <IngredientRow name="Yeast" pct={BRIOCHE_RATIO.yeast} weight={scaled.yeast} />
                        <IngredientRow name="Salt" pct={BRIOCHE_RATIO.salt} weight={scaled.salt} />
                        <IngredientRow name="Butter" pct={BRIOCHE_RATIO.others?.butter || 0} weight={scaled.others?.butter || 0} />
                        <IngredientRow name="Sugar" pct={BRIOCHE_RATIO.others?.sugar || 0} weight={scaled.others?.sugar || 0} />
                        <IngredientRow name="Eggs" pct={BRIOCHE_RATIO.others?.eggs || 0} weight={scaled.others?.eggs || 0} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-jet-700 flex justify-between text-gray-400">
                        <span>Total Batch Weight</span>
                        <span>{(scaled.totalWeight / 1000).toFixed(2)} kg</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IngredientRow({ name, pct, weight }: { name: string, pct: number, weight: number }) {
    return (
        <div className="flex justify-between items-center p-2 border-b border-jet-700/50 last:border-0">
            <span className="text-gray-300">{name} <span className="text-xs text-gray-500">({pct}%)</span></span>
            <span className="text-xl font-mono text-white">{weight}g</span>
        </div>
    );
}
