import React, { useState, useEffect } from 'react';
import { Server, Wifi, Users, Clock, Filter, AlertCircle, PlayCircle, StopCircle, RefreshCw, ListChecks } from 'lucide-react';
import { ApiClient } from '../lib/apiClient';
import { DeviceState } from '../types/schema';

interface LaborShift {
    id: string;
    userId: string;
    nodeId: string;
    role: string;
    status: 'ACTIVE' | 'CLOSED';
    clockInTime: number;
    clockOutTime?: number;
    totalMinutes?: number;
    user?: {
        name: string;
        role: string;
    };
}

export const FleetView = ({ devices }: { devices: DeviceState[] }) => {
    const [shifts, setShifts] = useState<LaborShift[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ApiClient.getLaborShifts().then(data => {
            setShifts(data || []);
            setLoading(false);
        });
    }, []);

    const activeShifts = shifts.filter(s => s.status === 'ACTIVE');
    const closedShifts = shifts.filter(s => s.status === 'CLOSED');
    const totalLaborMinutes = closedShifts.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Server className="text-brand relative z-10" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Fleet & Labor</h2>
                        <div className="h-0.5 w-12 bg-brand mt-1 shadow-[0_0_10px_#84cc16]"></div>
                    </div>
                </div>

                {loading && <div className="text-xs text-brand font-mono flex items-center gap-2 animate-pulse"><RefreshCw size={14} className="animate-spin" /> SYNCING TELEMETRY</div>}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* LEFT: DEVICES */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                        <h3 className="text-sm font-bold font-mono text-gray-400 uppercase mb-6 flex items-center gap-2 shrink-0">
                            <Wifi size={16} /> Device Topology ({devices.filter(d => d.status === 'online').length} Online)
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {devices.length === 0 ? (
                                <div className="col-span-full h-40 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-gray-500 font-mono text-sm">
                                    No devices provisioned.
                                </div>
                            ) : devices.map(d => (
                                <div key={d.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-brand/30 transition-colors flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${d.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                                                    <Server size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-200">{d.name}</h4>
                                                    <span className="text-[10px] uppercase font-mono bg-black/50 px-2 py-0.5 rounded text-gray-500 mt-1 inline-block border border-white/5">
                                                        {d.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 mt-4">
                                        <div className="flex justify-between items-center text-[10px] font-mono">
                                            <span className="text-gray-500">BATTERY</span>
                                            <span className={d.batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}>{d.batteryLevel}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-mono">
                                            <span className="text-gray-500">VERSION</span>
                                            <span className="text-gray-300">{d.appVersion}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-mono">
                                            <span className="text-gray-500">PENDING QUEUE</span>
                                            <span className={d.pendingUploads > 0 ? 'text-amber-400' : 'text-gray-300'}>{d.pendingUploads} events</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: LABOR LOG */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                            <div className="p-3 bg-brand/10 text-brand rounded-xl border border-brand/20">
                                <Users size={24} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-mono text-gray-500 uppercase">Active Shifts</h4>
                                <p className="text-2xl font-bold font-mono text-white">{activeShifts.length}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-mono text-gray-500 uppercase">Total Hours</h4>
                                <p className="text-2xl font-bold font-mono text-white">{(totalLaborMinutes / 60).toFixed(1)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="text-sm font-bold font-mono text-gray-400 uppercase flex items-center gap-2">
                                <ListChecks size={16} /> Time & Attendance Log
                            </h3>
                            <button className="text-brand text-xs font-mono flex items-center gap-2 hover:underline">
                                <Filter size={12} /> FILTER
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {shifts.length === 0 && !loading ? (
                                <div className="h-40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-500 font-mono text-sm">
                                    <Users size={32} className="opacity-30 mb-2" />
                                    No shift data recorded.
                                </div>
                            ) : shifts.map(shift => (
                                <div key={shift.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${shift.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-black/50 text-gray-500'}`}>
                                            {shift.status === 'ACTIVE' ? <PlayCircle size={18} /> : <StopCircle size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200 text-sm flex items-center gap-2">
                                                {shift.user?.name || 'Unknown User'}
                                                {shift.status === 'ACTIVE' && <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse blur-[1px]"></span>}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] uppercase font-mono bg-black/50 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">
                                                    {shift.role} @ {shift.nodeId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono font-bold text-white mb-1">
                                            {new Date(shift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {shift.clockOutTime ? ` - ${new Date(shift.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' - ACTIVE'}
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-500 uppercase">
                                            {shift.totalMinutes ? `${Math.floor(shift.totalMinutes / 60)}h ${shift.totalMinutes % 60}m` : 'Running...'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
