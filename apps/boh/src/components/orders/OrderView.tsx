import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge } from '../ui/base';
import { Check, Clock, RefreshCw, BarChart2, List, Layers, Wand2 } from 'lucide-react';
import { socketManager } from '../../services/SocketManager';
import { soundService } from '../../services/SoundService';
import { calculateSpecificSummary, groupItemsForAssembly, type SavedOrder } from '../../lib/orderHelpers';

interface KitchenTicket {
    id: string;
    productName: string;
    note: string;
    timestamp: number;
    status: 'pending' | 'completed';
    orderDetails?: any;
}

const OrderSummary = ({ tickets }: { tickets: KitchenTicket[] }) => {
    const totalCount = tickets.length;
    const now = Date.now();

    // Transform tickets to SavedOrder[] structure expected by helper
    // Filter out tickets without full order details
    const orders = useMemo(() => {
        return tickets
            .map(t => t.orderDetails)
            .filter((o): o is SavedOrder => !!o && !!o.items);
    }, [tickets]);

    const summary = useMemo(() => calculateSpecificSummary(orders), [orders]);

    // Use mains from the summary for top items
    const topItems = Object.entries(summary.mains)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const urgentCount = tickets.filter(t => (now - t.timestamp) > 10 * 60 * 1000).length; // > 10m

    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-jet-700 border-jet-600 p-4">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Total Active</div>
                <div className="text-4xl font-black text-white">{totalCount}</div>
            </Card>
            <Card className="bg-jet-700 border-jet-600 p-4">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Urgent ({'>'}10m)</div>
                <div className={`text-4xl font-black ${urgentCount > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                    {urgentCount}
                </div>
            </Card>
            <Card className="bg-jet-700 border-jet-600 p-4 col-span-2">
                <div className="text-gray-400 text-xs uppercase font-bold mb-2">Production Queue (Top 5)</div>
                <div className="flex flex-wrap gap-2">
                    {topItems.map(([name, count]) => (
                        <Badge key={name} variant="info" className="text-sm py-1 px-3">
                            <span className="font-bold mr-2">{count}x</span> {name}
                        </Badge>
                    ))}
                    {topItems.length === 0 && <span className="text-gray-600 text-sm italic">No items queued</span>}
                </div>
            </Card>
        </div>
    );
};

const SummaryCard = ({ count, label, colorClass, borderClass }: { count: number, label: string, colorClass: string, borderClass: string }) => (
    <div className={`bg-jet-600 rounded-xl p-4 flex flex-col items-center justify-center border-2 ${borderClass} aspect-square shadow-lg transform transition-all hover:scale-105`}>
        <span className={`text-5xl font-black mb-2 ${colorClass}`}>
            {count}
        </span>
        <span className="text-[10px] text-center uppercase font-bold text-gray-400 tracking-wider leading-tight">
            {label}
        </span>
    </div>
);

const ProductionView = ({ tickets }: { tickets: KitchenTicket[] }) => {
    // Transform tickets to SavedOrder[] structure expected by helper
    // Filter out tickets without full order details
    const orders = useMemo(() => {
        return tickets
            .map(t => t.orderDetails)
            .filter((o): o is SavedOrder => !!o && !!o.items);
    }, [tickets]);

    const summary = useMemo(() => calculateSpecificSummary(orders), [orders]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 h-full overflow-hidden">
            {/* LIVE PRODUCTION SECTION */}
            <div className="flex-1 min-h-0 flex flex-col bg-jet-800/50 rounded-2xl border border-jet-700 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-orange-500 font-bold flex items-center uppercase text-sm tracking-widest">
                        <Wand2 size={18} className="mr-2" /> Live Production
                    </span>
                    <span className="text-gray-500 font-mono text-xs bg-jet-900 px-3 py-1 rounded-full border border-jet-700">
                        Current Rail: <span className="text-white font-bold">{tickets.length}</span> Orders
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-y-auto pr-2">
                    {/* PREP COLUMN */}
                    <div className="bg-jet-900/50 rounded-xl p-4 border border-jet-800 flex flex-col">
                        <h4 className="text-gray-500 text-[10px] font-bold uppercase mb-4 text-center tracking-widest border-b border-jet-700 pb-2">
                            Prep Required
                        </h4>
                        <div className="grid grid-cols-2 gap-3 content-start">
                            {Object.entries(summary.prep).map(([name, data]) => (
                                <SummaryCard
                                    key={name}
                                    count={data.count}
                                    label={name}
                                    colorClass="text-gray-200"
                                    borderClass="border-gray-700"
                                />
                            ))}
                            {Object.keys(summary.prep).length === 0 && (
                                <div className="col-span-2 text-center text-gray-600 text-xs py-10 italic">No prep items</div>
                            )}
                        </div>
                    </div>

                    {/* ITEMS COLUMN */}
                    <div className="bg-jet-900/50 rounded-xl p-4 border border-jet-800 flex flex-col">
                        <h4 className="text-orange-900 text-[10px] font-bold uppercase mb-4 text-center tracking-widest border-b border-jet-700 pb-2">
                            Items
                        </h4>
                        <div className="grid grid-cols-2 gap-3 content-start">
                            {Object.entries(summary.mains).map(([name, count]) => (
                                <SummaryCard
                                    key={name}
                                    count={count}
                                    label={name}
                                    colorClass="text-orange-500"
                                    borderClass="border-orange-900/40 bg-orange-950/20"
                                />
                            ))}
                            {Object.keys(summary.mains).length === 0 && (
                                <div className="col-span-2 text-center text-gray-600 text-xs py-10 italic">No active mains</div>
                            )}
                        </div>
                    </div>

                    {/* SIDES COLUMN */}
                    <div className="bg-jet-900/50 rounded-xl p-4 border border-jet-800 flex flex-col">
                        <h4 className="text-blue-900 text-[10px] font-bold uppercase mb-4 text-center tracking-widest border-b border-jet-700 pb-2">
                            Sides (Fryer)
                        </h4>
                        <div className="grid grid-cols-2 gap-3 content-start">
                            {Object.entries(summary.sides).map(([name, count]) => (
                                <SummaryCard
                                    key={name}
                                    count={count}
                                    label={name}
                                    colorClass="text-blue-400"
                                    borderClass="border-blue-900/40 bg-blue-950/20"
                                />
                            ))}
                            {Object.keys(summary.sides).length === 0 && (
                                <div className="col-span-2 text-center text-gray-600 text-xs py-10 italic">No active sides</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* UP NEXT SECTION (Placeholder/Queue) */}
            <div className="h-1/3 flex flex-col bg-jet-800/30 rounded-2xl border border-jet-700/50 p-6 opacity-60 pointer-events-none grayscale">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 font-bold flex items-center uppercase text-sm tracking-widest">
                        <Clock size={18} className="mr-2" /> Up Next (Queue)
                    </span>
                    <span className="text-gray-600 font-mono text-xs">
                        Pending: 0 Orders
                    </span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-6 border-t border-jet-700/50 pt-4">
                    <div className="text-center text-gray-700 text-xs italic pt-4 border-r border-jet-700/30">Incoming Prep</div>
                    <div className="text-center text-gray-700 text-xs italic pt-4 border-r border-jet-700/30">Incoming Items</div>
                    <div className="text-center text-gray-700 text-xs italic pt-4">Incoming Sides</div>
                </div>
            </div>
        </div>
    );
};

const AssemblyView = ({ tickets }: { tickets: KitchenTicket[] }) => {
    // Flatten all orders into a single list of assembly bundles
    const bundles = useMemo(() => {
        const allBundles: any[] = [];
        tickets.forEach(t => {
            if (t.orderDetails) {
                const orderBundles = groupItemsForAssembly(t.orderDetails as SavedOrder);
                // Attach order ID for context
                orderBundles.forEach(b => {
                    // @ts-ignore
                    b.ticketId = t.orderDetails.id;
                    // @ts-ignore
                    b.ticketTime = t.timestamp;
                });
                allBundles.push(...orderBundles);
            }
        });
        // Sort by time (FIFO)
        // @ts-ignore
        return allBundles.sort((a, b) => a.ticketTime - b.ticketTime);
    }, [tickets]);

    return (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            {bundles.length === 0 && (
                <div className="text-center text-gray-500 py-10 border-2 border-dashed border-jet-700 rounded-xl">
                    <Layers size={48} className="mx-auto mb-4 opacity-50" />
                    <div>Assembly Line Clear</div>
                </div>
            )}

            {bundles.map((bundle, idx) => (
                <div key={`${bundle.uniqueId}-${idx}`} className="bg-jet-700 border-l-4 border-teal-500 p-4 rounded-r-lg flex justify-between items-center hover:bg-jet-600 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="bg-jet-800 h-12 w-12 flex items-center justify-center rounded text-2xl font-black text-white">
                            {bundle.qty}
                        </div>
                        <div>
                            <div className="text-sm font-mono text-gray-400 mb-1">Order #{bundle.ticketId}</div>
                            <div className="text-lg font-bold text-white">{bundle.name}</div>
                            {bundle.mods && bundle.mods.length > 0 && (
                                <div className="text-xs text-teal-300 font-mono mt-1">
                                    {bundle.mods.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sides / Sub-items */}
                    <div className="flex gap-2">
                        {bundle.sides && bundle.sides.map((side: any, sIdx: number) => (
                            <div key={sIdx} className="bg-jet-800 px-3 py-2 rounded border border-jet-600 text-center min-w-[80px]">
                                <div className="text-xs font-bold text-blue-300 uppercase">{side.name}</div>
                                {side.modifiers && side.modifiers.map((m: string, mIdx: number) => (
                                    <div key={mIdx} className="text-[10px] text-gray-400">{m}</div>
                                ))}
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" className="h-12 w-12 rounded-full ml-4">
                            <Check size={20} />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export function OrderView() {
    const [tickets, setTickets] = useState<KitchenTicket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'tickets' | 'production' | 'assembly'>('tickets');

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            // Use same proxy key as POS for simplicity in dev
            const res = await fetch('http://127.0.0.1:3001/api/kitchen-queue', {
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
            await fetch(`http://127.0.0.1:3001/api/kitchen-queue/${id}/complete`, {
                method: 'POST',
                headers: {
                    'x-api-key': 'dev-secret-123'
                }
            });
            // Optimistic update
            setTickets(prev => prev.filter(t => t.id !== id));
            soundService.playOrderComplete();
        } catch (err) {
            console.error('Failed to complete ticket', err);
        }
    };

    useEffect(() => {
        // Initial Fetch
        fetchTickets();

        // Connect Socket
        socketManager.connect('store_001');

        // Listen for New Orders
        const handleNewOrder = (ticket: KitchenTicket) => {
            console.log('🔔 New Ticket Received:', ticket);
            setTickets(prev => {
                // Deduplicate by ticket ID
                if (prev.some(t => t.id === ticket.id)) return prev;

                // Deduplicate by Order ID (if present in details)
                if (ticket.orderDetails?.id && prev.some(t => t.orderDetails?.id === ticket.orderDetails.id)) {
                    console.log(`Idempotency: Ignored duplicate ticket for Order ${ticket.orderDetails.id}`);
                    return prev;
                }

                soundService.playNewOrder();
                return [...prev, ticket];
            });
        };
        socketManager.on('order:new', handleNewOrder);

        // Listen for Status Updates (e.g. Completed by another screen)
        const handleStatusUpdate = (data: { ticketId: string, status: string }) => {
            if (data.status === 'completed') {
                setTickets(prev => prev.filter(t => t.id !== data.ticketId));
            }
        };
        socketManager.on('order:status-changed', handleStatusUpdate);

        return () => {
            socketManager.off('order:new');
            socketManager.off('order:status-changed');
        };
    }, []);

    return (
        <div className="h-full flex flex-col p-4 mt-16 pb-20 max-w-7xl mx-auto w-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Kitchen Display</h2>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock size={14} /> Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>

                <div className="flex bg-jet-700 p-1 rounded-lg border border-jet-600">
                    <button
                        onClick={() => setViewMode('tickets')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'tickets' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <List size={16} /> Tickets
                    </button>
                    <button
                        onClick={() => setViewMode('production')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'production' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <BarChart2 size={16} /> Production
                    </button>
                    <button
                        onClick={() => setViewMode('assembly')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'assembly' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Layers size={16} /> Assembly
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="px-3 py-1 bg-teal-900/50 rounded-full border border-teal-800 text-teal-400 text-xs font-mono flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></div>
                        LIVE
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
                        <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>
                </div>
            </header>




            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto">
                {viewMode === 'production' && <ProductionView tickets={tickets} />}

                {viewMode === 'assembly' && <AssemblyView tickets={tickets} />}

                {viewMode === 'tickets' && (
                    <>
                        <OrderSummary tickets={tickets} />

                        {tickets.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-jet-700 rounded-2xl">
                                <Clock size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">No Pending Orders</p>
                                <p className="text-sm">Waiting for POS to fire tickets...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                                {tickets.map((ticket) => (
                                    <Card key={ticket.id} className="bg-jet-600 border-jet-500 p-5 flex flex-col hover:border-teal-mid transition-colors hover:shadow-lg animate-in fade-in zoom-in-95 duration-300 h-full">
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
                                                            const groups: { name: string; qty: number; mods: any[] }[] = [];
                                                            let currentGroup = { name: `${item.qty || 1}x ${item.name}`, qty: item.qty || 1, mods: [] as any[] };

                                                            (item.selectedModifiers || []).forEach((mod: any) => {
                                                                const upperName = mod.name.toUpperCase();
                                                                if (upperName.includes('FRIES') || upperName.includes('TOTS') || upperName.includes('RINGS') || upperName.includes('SHAKE') || upperName.includes('DRINK') || upperName.includes('SODA')) {
                                                                    groups.push(currentGroup);
                                                                    currentGroup = { name: `1x ${mod.name}`, qty: 1, mods: [] };
                                                                } else {
                                                                    currentGroup.mods.push(mod);
                                                                }
                                                            });
                                                            groups.push(currentGroup);

                                                            return (
                                                                <div key={i} className="pb-4 border-b border-jet-700 last:border-0 last:pb-0">
                                                                    {groups.map((group, gIdx) => (
                                                                        <div key={gIdx} className={gIdx > 0 ? "mt-4 pt-2 border-t border-jet-800 border-dashed" : ""}>
                                                                            <div className="flex justify-between font-bold text-lg text-white mb-1">
                                                                                <span>{group.name}</span>
                                                                            </div>
                                                                            {group.mods.length > 0 && (
                                                                                <div className="pl-3 space-y-1 block">
                                                                                    {group.mods.map((mod: any, j: number) => {
                                                                                        const variation = mod.variation && mod.variation !== 'Normal' ? mod.variation : '';
                                                                                        let prefixColor: string = 'text-teal-bright';
                                                                                        if (variation === 'No') prefixColor = 'text-red-400';
                                                                                        if (variation === 'Extra') prefixColor = 'text-lime-400';
                                                                                        if (variation === 'Side') prefixColor = 'text-blue-400';

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
                                            <div className="text-xs font-mono text-gray-500 bg-jet-800 px-2 py-1 rounded h-min">
                                                {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="mt-auto w-full bg-teal-deep hover:bg-teal-mid font-bold shadow-lg shadow-teal-900/20"
                                            onClick={() => completeTicket(ticket.id)}
                                        >
                                            <Check size={20} className="mr-2" /> COMPLETE
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
}

