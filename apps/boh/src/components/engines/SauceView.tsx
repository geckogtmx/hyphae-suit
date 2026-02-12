import { useState } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { Thermometer, Activity, CheckCircle } from 'lucide-react';

export function SauceView() {
    const [stage, setStage] = useState<'simmer' | 'cool'>('simmer');
    const [temp, setTemp] = useState<string>('');

    const logTemp = () => {
        console.log(`Logged temp: ${temp}`);
        setTemp('');
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-red-400">
                    <Activity className="w-6 h-6" /> Sauce Engine: Viscosity & HACCP
                </h3>
                <Badge variant={stage === 'simmer' ? 'warning' : 'info'}>
                    Stage: {stage.toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Left: Visual Guide */}
                <Card className="bg-jet-700 flex flex-col items-center justify-center gap-4 border-2 border-teal-500/30">
                    <div className="text-gray-400 uppercase tracking-widest text-sm">Visual Target</div>
                    <div className="w-32 h-32 rounded-full bg-red-900 border-4 border-red-500 flex items-center justify-center animate-pulse">
                        <span className="text-xs text-center text-red-200">Simmering<br />(Reduction)</span>
                    </div>
                    <p className="text-xl font-medium text-center max-w-xs">
                        "Reduce until it coats the back of a spoon (Nappe)."
                    </p>
                </Card>

                {/* Right: Controls & Logs */}
                <div className="flex flex-col gap-4">
                    {/* Quick Temp Input */}
                    <Card className="bg-ink-500 p-4">
                        <div className="flex items-center gap-2 mb-4 text-gray-300">
                            <Thermometer className="w-5 h-5" /> HACCP Log
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {['180', '165', '140', '100', '70', '41'].map(t => (
                                <Button key={t} variant="outline" size="sm" onClick={() => setTemp(t)} className={temp === t ? 'bg-teal-900 border-teal-500' : ''}>
                                    {t}°F
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={temp}
                                onChange={(e) => setTemp(e.target.value)}
                                className="bg-jet-700 text-white rounded-lg px-4 w-full border border-jet-500 font-mono text-xl"
                                placeholder="Temp..."
                            />
                            <Button onClick={logTemp} disabled={!temp}>Log</Button>
                        </div>
                    </Card>

                    {/* Stage Controls */}
                    <div className="mt-auto">
                        <Button
                            variant="primary"
                            size="xl"
                            className="w-full flex justify-between items-center"
                            onClick={() => setStage(prev => prev === 'simmer' ? 'cool' : 'simmer')}
                        >
                            <span>{stage === 'simmer' ? 'START COOLING' : 'COMPLETE BATCH'}</span>
                            <CheckCircle className="w-8 h-8" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
