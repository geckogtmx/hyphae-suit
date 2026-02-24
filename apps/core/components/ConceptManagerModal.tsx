import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, Layers } from 'lucide-react';
import { Concept, Category } from '../types/schema';
import { ApiClient } from '../lib/apiClient';

interface ConceptManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConceptUpdated: () => void;
}

const COLORS = [
    'emerald-500', 'blue-500', 'red-500', 'purple-500',
    'orange-500', 'yellow-500', 'pink-500', 'cyan-500'
];

export const ConceptManagerModal = ({ isOpen, onClose, onConceptUpdated }: ConceptManagerModalProps) => {
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingConceptId, setEditingConceptId] = useState<string | null>(null);
    const [editData, setEditData] = useState<{ name: string, color: string }>({ name: '', color: 'emerald-500' });

    // Category specific
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        const [c, cats] = await Promise.all([
            ApiClient.getConcepts(),
            ApiClient.getCategories()
        ]);
        setConcepts(c);
        setCategories(cats);
        setLoading(false);
    };

    if (!isOpen) return null;

    const handleCreateConcept = async () => {
        await ApiClient.createConcept({
            id: `mode_${Date.now()}`,
            name: 'New Concept',
            color: 'emerald-500'
        });
        loadData();
        onConceptUpdated();
    };

    const handleSaveConcept = async (id: string) => {
        if (!editData.name.trim()) return;
        await ApiClient.updateConcept(id, { name: editData.name, color: editData.color });
        setEditingConceptId(null);
        loadData();
        onConceptUpdated();
    };

    const handleDeleteConcept = async (id: string, conceptName: string) => {
        if (!confirm(`Are you sure you want to delete ${conceptName}?`)) return;
        try {
            await ApiClient.deleteConcept(id);
            loadData();
            onConceptUpdated();
        } catch (e: any) {
            alert('Failed to delete Concept. Make sure all underlying categories are deleted first.');
        }
    };

    const handleCreateCategory = async (conceptId: string) => {
        if (!newCategoryName.trim()) return;
        await ApiClient.createCategory({
            name: newCategoryName,
            conceptId: conceptId
        });
        setNewCategoryName('');
        loadData();
        onConceptUpdated();
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category? Products using it might break if not reassigned.')) return;
        try {
            await ApiClient.deleteCategory(id);
            loadData();
            onConceptUpdated();
        } catch (e: any) {
            alert('Failed to delete category. Make sure no products are assigned to it.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Layers className="text-brand" size={24} />
                            MODES & CATEGORIES MANAGER
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">
                            Catalog Level 1 - Concept Hierarchy
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-20 animate-pulse text-brand font-mono">LOADING HIERARCHY...</div>
                    ) : (
                        <div className="space-y-8">
                            {concepts.map(concept => {
                                const conceptCats = categories.filter(c => c.conceptId === concept.id);
                                const isEditing = editingConceptId === concept.id;

                                return (
                                    <div key={concept.id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                                        <div className={`p-4 border-b border-white/5 flex items-center justify-between bg-${concept.color?.split('-')[0]}-500/10`}>
                                            {isEditing ? (
                                                <div className="flex items-center gap-4 flex-1">
                                                    <input
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                                                        className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm font-bold w-64"
                                                    />
                                                    <div className="flex gap-2">
                                                        {COLORS.map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => setEditData({ ...editData, color: c })}
                                                                className={`w-6 h-6 rounded-full bg-${c.split('-')[0]}-500 border-2 ${editData.color === c ? 'border-white' : 'border-transparent'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <button onClick={() => handleSaveConcept(concept.id)} className="ml-auto bg-brand text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1">
                                                        <Save size={14} /> SAVE
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg bg-${concept.color?.split('-')[0]}-500/20 text-${concept.color?.split('-')[0]}-400 flex items-center justify-center font-black`}>
                                                            {concept.name[0]}
                                                        </div>
                                                        <h3 className="text-lg font-bold">{concept.name}</h3>
                                                        <span className="text-[10px] font-mono text-gray-500 uppercase">[{conceptCats.length} Categories]</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingConceptId(concept.id);
                                                                setEditData({ name: concept.name, color: concept.color || 'emerald-500' });
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteConcept(concept.id, concept.name)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="p-4 bg-black/20">
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                                                {conceptCats.map(cat => (
                                                    <div key={cat.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center group">
                                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors truncate">
                                                            {cat.name}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2 max-w-sm">
                                                <input
                                                    type="text"
                                                    placeholder="New Category Name..."
                                                    value={editingConceptId === concept.id ? '' : newCategoryName} // Reset if switching
                                                    onChange={e => {
                                                        if (editingConceptId === null) setNewCategoryName(e.target.value)
                                                    }}
                                                    onFocus={() => { if (isEditing) setEditingConceptId(null) }}
                                                    onKeyDown={e => e.key === 'Enter' && handleCreateCategory(concept.id)}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm flex-1"
                                                />
                                                <button
                                                    onClick={() => handleCreateCategory(concept.id)}
                                                    className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={handleCreateConcept}
                                className="w-full flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-brand hover:border-brand/50 transition-all hover:bg-brand/5"
                            >
                                <Plus size={24} />
                                <span className="font-bold tracking-widest uppercase">Create New Concept Mode</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
