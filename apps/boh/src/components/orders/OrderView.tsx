import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { Check, Clock, RefreshCw } from 'lucide-react';

interface KitchenTicket {
    id: string;
    productName: string;
    note: string;
    timestamp: number;
    status: 'pending' | 'completed';
    orderDetails?: any;
}

export function OrderView() {
    const [tickets, setTickets] = useState<KitchenTicket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            // Use same proxy key as POS for simplicity in dev
            const res = await fetch('http://localhost:3001/api/kitchen-queue', {
                headers: {
                    'x-api-key': 'dev-secret-123'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Failed to fetch tickets', err);
        } finally {
            setIsLoading(false);
        }
    };

    const completeTicket = async (id: string) => {
        try {
            await fetch(`http://localhost:3001/api/kitchen-queue/${id}/complete`, {
                method: 'POST',
                headers: {
                    'x-api-key': 'dev-secret-123'
                }
            });
            // Optimistic update
            setTickets(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to complete ticket', err);
        }
    };

    useEffect(() => {
        fetchTickets();
        const timer = setInterval(fetchTickets, 5000); // Poll every 5s
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-full flex flex-col p-4 mt-16 pb-20 max-w-4xl mx-auto w-full">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Incoming Orders</h2>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock size={14} /> Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
                    <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </header>

            {tickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-jet-700 rounded-2xl">
                    <Clock size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Pending Orders</p>
                    <p className="text-sm">Waiting for POS to fire tickets...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id} className="bg-jet-600 border-jet-500 p-5 flex flex-col hover:border-teal-mid transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Badge variant="warning" className="mb-2">NEW</Badge>
                                    <h3 className="text-3xl font-black text-white tracking-tight font-mono">
                                        #{ticket.orderDetails?.id || ticket.note.substring(0, 4)}
                                    </h3>
                                    <div className="text-gray-400 text-sm mt-1 mb-3">
                                        {ticket.orderDetails?.table || ticket.productName}
                                    </div>

                                    {ticket.orderDetails ? (
                                        <div className="space-y-4 border-t border-jet-700 pt-3">
                                            {ticket.orderDetails.items.map((item: any, i: number) => {
                                                // --- GROUPING LOGIC ---
                                                // Split modifiers into "Main" and "Sub-Items" (like Fries/Drinks in a Combo)
                                                // This visual hack separates "Large Fries" into its own heading if it appears in modifiers.

                                                const groups: { name: string; qty: number; mods: any[] }[] = [];
                                                let currentGroup = { name: `${item.qty || 1}x ${item.name}`, qty: item.qty || 1, mods: [] as any[] };

                                                (item.selectedModifiers || []).forEach((mod: any) => {
                                                    const upperName = mod.name.toUpperCase();
                                                    // Heuristic: Promote these keywords to Heading status
                                                    if (upperName.includes('FRIES') || upperName.includes('TOTS') || upperName.includes('RINGS') || upperName.includes('SHAKE') || upperName.includes('DRINK') || upperName.includes('SODA')) {
                                                        // Push previous group
                                                        groups.push(currentGroup);
                                                        // Start new group (inherit qty 1 for now, or match item qty?)
                                                        // Usually sides match item qty in a combo
                                                        currentGroup = { name: `1x ${mod.name}`, qty: 1, mods: [] };
                                                    } else {
                                                        currentGroup.mods.push(mod);
                                                    }
                                                });
                                                // Push final group
                                                groups.push(currentGroup);

                                                return (
                                                    <div key={i} className="pb-4 border-b border-jet-700 last:border-0 last:pb-0">
                                                        {groups.map((group, gIdx) => (
                                                            <div key={gIdx} className={gIdx > 0 ? "mt-4 pt-2 border-t border-jet-800 border-dashed" : ""}>
                                                                <div className="flex justify-between font-bold text-lg text-white mb-1">
                                                                    <span>{group.name}</span>
                                                                </div>
                                                                {group.mods.length > 0 && (
                                                                    <div className="pl-3 space-y-1">
                                                                        {group.mods.map((mod: any, j: number) => {
                                                                            const variation = mod.variation && mod.variation !== 'Normal' ? mod.variation : '';
                                                                            let prefixColor = 'text-teal-bright';
                                                                            if (variation === 'No') prefixColor = 'text-red-400';
                                                                            if (variation === 'Extra') prefixColor = 'text-lime-400';
                                                                            if (variation === 'Side') prefixColor = 'text-blue-400'; // Added Side color

                                                                            return (
                                                                                <div key={j} className="text-sm uppercase font-mono font-bold flex items-start">
                                                                                    <span className="text-teal-dim mr-1">+</span>
                                                                                    {variation && (
                                                                                        <span className={`${prefixColor} mr-1`}>{variation}</span>
                                                                                    )}
                                                                                    <span className="text-gray-300">{mod.name}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-black text-white tracking-tight font-mono mb-4">
                                            {ticket.note}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs font-mono text-gray-500 bg-jet-800 px-2 py-1 rounded">
                                    {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                className="mt-auto w-full bg-teal-deep hover:bg-teal-mid font-bold"
                                onClick={() => completeTicket(ticket.id)}
                            >
                                <Check size={20} className="mr-2" /> COMPLETE
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
