
import React, { useEffect, useState } from 'react';
import { db, schema } from '@hyphae/database';
import { Truck, Phone, Mail, Package, Clock } from 'lucide-react';

// We can define a local type or import from database/schema if it exports inferred types
type Supplier = typeof schema.suppliers.$inferSelect;

export const SuppliersView = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await db.query.suppliers.findMany();
                setSuppliers(data);
            } catch (error) {
                console.error("Failed to fetch suppliers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    if (loading) return <div className="p-8 text-white">Loading Supply Chain Network...</div>;

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <Truck className="text-brand" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Supplier Network</h2>
                    <div className="h-0.5 w-12 bg-brand mt-1 shadow-[0_0_10px_#84cc16]"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(supplier => (
                    <div key={supplier.id} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 bg-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{supplier.name}</h3>
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{supplier.category}</span>
                            </div>
                            <div className="bg-brand/10 text-brand px-2 py-1 rounded text-xs font-bold font-mono">
                                {supplier.leadTimeDays} DAY LEAD
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <Package size={16} className="text-gray-500" />
                                <span>{supplier.contactName}</span>
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

                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                            <div className="text-xs text-brand font-mono flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
                                ACTIVE VENDOR
                            </div>
                            <button className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                                MANAGE ORDERS
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
