import React, { useEffect, useState } from 'react';
import { Truck, Phone, Mail, Package, Plus, Edit2, Trash2, ListChecks, FileText, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '../lib/apiClient';
import { PurchaseOrderBuilder } from '../components/PurchaseOrderBuilder';

export const SuppliersView = () => {
    const [activeTab, setActiveTab] = useState<'network' | 'orders'>('network');
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [editingOrder, setEditingOrder] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [supData, ordData, invData] = await Promise.all([
                    ApiClient.getSuppliers(),
                    ApiClient.getSupplyOrders(),
                    ApiClient.getInventory()
                ]);
                setSuppliers(supData);
                setOrders(ordData);
                setInventory(invData);
            } catch (error) {
                console.error("Failed to fetch supply chain data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier.id) {
                await ApiClient.updateSupplier(editingSupplier.id, editingSupplier);
                setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? editingSupplier : s));
            } else {
                const res = await ApiClient.createSupplier(editingSupplier);
                setSuppliers(prev => [...prev, { ...editingSupplier, id: res.id }]);
            }
            setEditingSupplier(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSupplier = async (id: string) => {
        if (!confirm('Delete this supplier?')) return;
        try {
            await ApiClient.deleteSupplier(id);
            setSuppliers(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveOrder = async (orderData: any) => {
        try {
            if (editingOrder?.id) {
                await ApiClient.updateSupplyOrder(editingOrder.id, orderData);
            } else {
                await ApiClient.createSupplyOrder(orderData);
            }
            const ordData = await ApiClient.getSupplyOrders();
            setOrders(ordData);
            setEditingOrder(null);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 text-white font-mono animate-pulse">Loading Supply Chain Network...</div>;

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <Truck className="text-brand" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Supply Hub</h2>
                        <div className="h-0.5 w-12 bg-brand mt-1 shadow-[0_0_10px_#84cc16]"></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('network')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold font-mono transition-colors ${activeTab === 'network' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        VENDORS
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold font-mono transition-colors ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        PURCHASE ORDERS
                    </button>
                </div>

                {activeTab === 'network' ? (
                    <button
                        onClick={() => setEditingSupplier({ name: '', category: 'General', leadTimeDays: 0 })}
                        className="bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-colors shadow-[0_0_15px_rgba(132,204,22,0.1)]"
                    >
                        <Plus size={16} /> ADD VENDOR
                    </button>
                ) : (
                    <button
                        onClick={() => setEditingOrder({ items: [] })}
                        className="bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-colors shadow-[0_0_15px_rgba(132,204,22,0.1)]"
                    >
                        <Plus size={16} /> NEW PO
                    </button>
                )}
            </div>

            {/* TAB CONTENT: VENDORS */}
            {activeTab === 'network' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(supplier => (
                        <div key={supplier.id} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 bg-white/5 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{supplier.name}</h3>
                                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{supplier.category}</span>
                                    </div>
                                    <div className="bg-brand/10 text-brand px-2 py-1 rounded text-xs font-bold font-mono border border-brand/20">
                                        {supplier.leadTimeDays} DAY LEAD
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Package size={16} className="text-gray-500" />
                                        <span>{supplier.contactName || 'No Contact'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Mail size={16} className="text-gray-500" />
                                        <span>{supplier.email || 'No Email'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Phone size={16} className="text-gray-500" />
                                        <span>{supplier.phone || 'No Phone'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditingSupplier(supplier)} className="p-2 text-gray-400 hover:text-white transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteSupplier(supplier.id)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => { setActiveTab('orders'); setEditingOrder({ supplierId: supplier.id, items: [] }); }}
                                    className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <FileText size={14} /> DRAFT PO
                                </button>
                            </div>
                        </div>
                    ))}
                    {suppliers.length === 0 && (
                        <div className="col-span-1 border border-white/5 border-dashed rounded-2xl p-8 text-center bg-black/20 text-gray-500 font-mono text-sm">
                            No Vendors connected. Add your first supplier to begin drafting POs.
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: ORDERS */}
            {activeTab === 'orders' && (
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="border border-white/5 border-dashed rounded-2xl p-8 text-center bg-black/20 text-gray-500 font-mono text-sm">
                            No Purchase Orders generated.
                        </div>
                    ) : orders.map(order => (
                        <div key={order.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand/30 transition-colors cursor-pointer" onClick={() => setEditingOrder(order)}>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-white">{order.supplier?.name || 'Unknown Vendor'}</h4>
                                    <div className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${order.status === 'RECEIVED' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                            order.status === 'PLACED' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                                                'text-brand border-brand/30 bg-brand/10'
                                        }`}>
                                        {order.status}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-mono">
                                    PO REF: {order.id} | ITEMS: {order.items.length}
                                </p>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-mono mb-1">Total Expected</p>
                                    <p className="text-lg font-bold font-mono text-white">${order.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                    <Edit2 size={16} className="text-brand" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Editing Supplier */}
            {editingSupplier && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingSupplier.id ? 'Edit Supplier' : 'New Supplier'}
                        </h3>
                        <form onSubmit={handleSaveSupplier} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-1">NAME</label>
                                <input required type="text" value={editingSupplier.name} onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-1">CATEGORY</label>
                                    <input required type="text" value={editingSupplier.category} onChange={e => setEditingSupplier({ ...editingSupplier, category: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-1">LEAD TIME (DAYS)</label>
                                    <input required type="number" value={editingSupplier.leadTimeDays} onChange={e => setEditingSupplier({ ...editingSupplier, leadTimeDays: parseInt(e.target.value) })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand/50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-1">CONTACT NAME</label>
                                <input type="text" value={editingSupplier.contactName || ''} onChange={e => setEditingSupplier({ ...editingSupplier, contactName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-1">EMAIL</label>
                                    <input type="email" value={editingSupplier.email || ''} onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-1">PHONE</label>
                                    <input type="text" value={editingSupplier.phone || ''} onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand/50" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setEditingSupplier(null)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">CANCEL</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors shadow-[0_0_15px_rgba(132,204,22,0.3)]">SAVE</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PO Builder Overlay */}
            {editingOrder && (
                <PurchaseOrderBuilder
                    order={editingOrder}
                    suppliers={suppliers}
                    inventory={inventory}
                    onSave={handleSaveOrder}
                    onCancel={() => setEditingOrder(null)}
                />
            )}
        </div>
    );
};
