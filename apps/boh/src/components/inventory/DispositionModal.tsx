/**
 * @author Hyphae POS Team
 * @description Disposition Modal — handles two distinct inventory write-down flows:
 *   1. WRITE OFF: True waste (spoilage, spill, damage). Deducts from kitchen stock only.
 *   2. CONVERT / UPCYCLE: Repurposes one item into another (e.g. beef patties -> chili).
 *      Two-sided atomic transaction — preserves value in the supply chain rather than
 *      treating all off-spec items as dead loss.
 * @version 1.0.0
 * @last-updated 2026-02-23
 */

import { useState, useCallback } from 'react';
import { Button, Badge } from '../ui/base';
import { Trash2, RefreshCw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_KEY = import.meta.env.VITE_HYPHAE_API_KEY || '';

type DispositionMode = 'writeoff' | 'convert';
type WasteReason = 'expired' | 'damaged' | 'spill' | 'quality' | 'overproduced';
type ToastState = { message: string; type: 'success' | 'error' } | null;

interface InventoryItem {
    id: string;
    name: string;
    stockKitchen: number;
    stockUnit: string;
}

interface Props {
    item: InventoryItem;
    allInventory: InventoryItem[];
    onClose: () => void;
    onSuccess: () => void;
}

const WASTE_REASONS: { value: WasteReason; label: string; color: string }[] = [
    { value: 'expired', label: 'Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'damaged', label: 'Damaged', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'spill', label: 'Spill / Drop', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'quality', label: 'Quality Reject', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'overproduced', label: 'Overproduced', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
];

export function DispositionModal({ item, allInventory, onClose, onSuccess }: Props) {
    const [mode, setMode] = useState<DispositionMode>('writeoff');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<ToastState>(null);

    // Write-off state
    const [writeOffQty, setWriteOffQty] = useState<string>('');
    const [writeOffReason, setWriteOffReason] = useState<WasteReason>('expired');
    const [writeOffNote, setWriteOffNote] = useState('');

    // Convert state
    const [sourceQty, setSourceQty] = useState<string>('');
    const [destinationItemId, setDestinationItemId] = useState<string>('');
    const [destinationQty, setDestinationQty] = useState<string>('');
    const [convertNote, setConvertNote] = useState('');

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        if (type === 'success') {
            setTimeout(() => { onSuccess(); onClose(); }, 1800);
        } else {
            setTimeout(() => setToast(null), 4000);
        }
    }, [onClose, onSuccess]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleWriteOff = async () => {
        const qty = parseFloat(writeOffQty);
        if (!qty || qty <= 0) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/inventory/waste`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
                body: JSON.stringify({
                    itemId: item.id,
                    quantity: qty,
                    source: 'KITCHEN',
                    note: `${writeOffReason}${writeOffNote ? ` — ${writeOffNote}` : ''}`
                })
            });

            if (!res.ok) {
                const err = await res.json();
                showToast(`Write-off failed: ${err.error}`, 'error');
            } else {
                showToast(`${qty} ${item.stockUnit} of ${item.name} written off ✓`, 'success');
            }
        } catch {
            showToast('Network error — Check API connection', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async () => {
        const sQty = parseFloat(sourceQty);
        const dQty = parseFloat(destinationQty);
        if (!sQty || sQty <= 0 || !dQty || dQty <= 0 || !destinationItemId) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/inventory/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
                body: JSON.stringify({
                    sourceItemId: item.id,
                    sourceQty: sQty,
                    destinationItemId,
                    destinationQty: dQty,
                    note: convertNote || undefined
                })
            });

            if (!res.ok) {
                const err = await res.json();
                showToast(`Conversion failed: ${err.error}`, 'error');
            } else {
                const destItem = allInventory.find(i => i.id === destinationItemId);
                showToast(
                    `Converted ${sQty} ${item.stockUnit} of ${item.name} → ${dQty} ${destItem?.stockUnit ?? ''} of ${destItem?.name ?? destinationItemId} ✓`,
                    'success'
                );
            }
        } catch {
            showToast('Network error — Check API connection', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Validation helpers ─────────────────────────────────────────────────────

    const writeOffValid = parseFloat(writeOffQty) > 0 && parseFloat(writeOffQty) <= (item.stockKitchen ?? 0);
    const convertValid = parseFloat(sourceQty) > 0
        && parseFloat(sourceQty) <= (item.stockKitchen ?? 0)
        && parseFloat(destinationQty) > 0
        && !!destinationItemId;

    const destinationOptions = allInventory.filter(i => i.id !== item.id);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-lg bg-jet-900 border border-jet-600 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-jet-800 border-b border-jet-700 px-6 py-4 flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Disposition</p>
                        <h2 className="text-xl font-bold text-white">{item.name}</h2>
                        <p className="text-sm text-teal-bright font-mono mt-0.5">
                            {item.stockKitchen ?? 0} {item.stockUnit} available in kitchen
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-jet-700 mt-0.5"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Toast */}
                {toast && (
                    <div className={`flex items-center gap-3 mx-6 mt-4 px-4 py-3 rounded-xl border text-sm font-semibold
            ${toast.type === 'success'
                            ? 'bg-lime-500/10 border-lime-500/30 text-lime-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            : <XCircle className="w-5 h-5 flex-shrink-0" />
                        }
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Mode Toggle */}
                <div className="flex gap-2 mx-6 mt-5">
                    <button
                        onClick={() => setMode('writeoff')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all
              ${mode === 'writeoff'
                                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                : 'bg-jet-800 border-jet-600 text-gray-400 hover:text-white hover:border-jet-500'
                            }`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Write Off (True Waste)
                    </button>
                    <button
                        onClick={() => setMode('convert')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all
              ${mode === 'convert'
                                ? 'bg-teal-mid/20 border-teal-mid/40 text-teal-bright'
                                : 'bg-jet-800 border-jet-600 text-gray-400 hover:text-white hover:border-jet-500'
                            }`}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Convert / Upcycle
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                    {/* ── WRITE OFF MODE ─────────────────────────────────────────── */}
                    {mode === 'writeoff' && (
                        <>
                            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-400">
                                This permanently removes stock from the kitchen. Use only for true loss events.
                            </div>

                            {/* Qty */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Quantity to Write Off ({item.stockUnit})
                                </label>
                                <input
                                    type="number"
                                    min="0.01"
                                    max={item.stockKitchen ?? 0}
                                    step="0.01"
                                    value={writeOffQty}
                                    onChange={e => setWriteOffQty(e.target.value)}
                                    className="w-full bg-jet-800 border border-jet-600 rounded-lg px-4 py-3 text-white text-lg font-bold outline-none focus:border-red-500 transition-colors"
                                    placeholder={`Max ${item.stockKitchen ?? 0}`}
                                />
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Reason</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {WASTE_REASONS.map(r => (
                                        <button
                                            key={r.value}
                                            onClick={() => setWriteOffReason(r.value)}
                                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all
                        ${writeOffReason === r.value ? r.color : 'bg-jet-800 border-jet-600 text-gray-400 hover:border-jet-500'}`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={writeOffNote}
                                    onChange={e => setWriteOffNote(e.target.value)}
                                    className="w-full bg-jet-800 border border-jet-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors text-sm"
                                    placeholder="e.g. Left out overnight"
                                />
                            </div>

                            <Button
                                variant="danger"
                                size="lg"
                                className="w-full mt-2"
                                onClick={handleWriteOff}
                                disabled={!writeOffValid || loading}
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                {loading ? 'Processing…' : `Confirm Write Off — ${writeOffQty || '0'} ${item.stockUnit}`}
                            </Button>
                        </>
                    )}

                    {/* ── CONVERT MODE ───────────────────────────────────────────── */}
                    {mode === 'convert' && (
                        <>
                            <div className="p-3 bg-teal-mid/5 border border-teal-mid/20 rounded-xl text-xs text-teal-bright">
                                Use when repurposing ingredients. Value stays in the system — only the form changes.
                            </div>

                            {/* Source — always the current item */}
                            <div className="bg-jet-800 border border-jet-700 rounded-xl p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Source (this item)</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="text-white font-bold">{item.name}</div>
                                        <div className="text-xs text-gray-400 font-mono">{item.stockKitchen ?? 0} {item.stockUnit} available</div>
                                    </div>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max={item.stockKitchen ?? 0}
                                        step="0.01"
                                        value={sourceQty}
                                        onChange={e => setSourceQty(e.target.value)}
                                        className="w-28 bg-jet-700 border border-jet-500 rounded-lg px-3 py-2 text-white text-lg font-bold text-center outline-none focus:border-teal-mid transition-colors"
                                        placeholder="Qty"
                                    />
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex items-center justify-center">
                                <div className="flex items-center gap-2 text-teal-bright">
                                    <div className="h-px w-12 bg-teal-mid/40" />
                                    <ArrowRight className="w-5 h-5" />
                                    <div className="h-px w-12 bg-teal-mid/40" />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="bg-jet-800 border border-jet-700 rounded-xl p-4 space-y-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Produces</p>
                                <select
                                    value={destinationItemId}
                                    onChange={e => setDestinationItemId(e.target.value)}
                                    className="w-full bg-jet-700 border border-jet-500 rounded-lg px-3 py-2.5 text-white outline-none focus:border-teal-mid transition-colors text-sm"
                                >
                                    <option value="">— Select destination item —</option>
                                    {destinationOptions.map(i => (
                                        <option key={i.id} value={i.id}>
                                            {i.name} ({i.stockKitchen ?? 0} {i.stockUnit} current)
                                        </option>
                                    ))}
                                </select>

                                {destinationItemId && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 text-xs text-gray-400 font-mono">
                                            {allInventory.find(i => i.id === destinationItemId)?.stockUnit ?? ''} produced
                                        </div>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={destinationQty}
                                            onChange={e => setDestinationQty(e.target.value)}
                                            className="w-28 bg-jet-700 border border-jet-500 rounded-lg px-3 py-2 text-white text-lg font-bold text-center outline-none focus:border-teal-mid transition-colors"
                                            placeholder="Qty"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Yield ratio badge */}
                            {parseFloat(sourceQty) > 0 && parseFloat(destinationQty) > 0 && (
                                <div className="flex justify-center">
                                    <Badge variant="info">
                                        Yield ratio: {(parseFloat(destinationQty) / parseFloat(sourceQty)).toFixed(2)}x
                                    </Badge>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={convertNote}
                                    onChange={e => setConvertNote(e.target.value)}
                                    className="w-full bg-jet-800 border border-jet-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-teal-mid transition-colors text-sm"
                                    placeholder="e.g. End-of-shift patty conversion to chili"
                                />
                            </div>

                            <Button
                                size="lg"
                                className="w-full mt-2 bg-teal-deep hover:bg-teal-mid"
                                onClick={handleConvert}
                                disabled={!convertValid || loading}
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                {loading ? 'Processing…' : 'Confirm Conversion'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
