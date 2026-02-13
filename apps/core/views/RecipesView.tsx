
import React, { useEffect, useState } from 'react';
import { db, schema } from '@hyphae/database';
import { ChefHat, BookOpen, Clock, Flame, ChevronRight } from 'lucide-react';

type RecipeWithDetails = typeof schema.recipes.$inferSelect & {
    ingredients: (typeof schema.recipeIngredients.$inferSelect & {
        inventoryItem: typeof schema.inventoryItems.$inferSelect | null
    })[]
};

export const RecipesView = () => {
    const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await db.query.recipes.findMany({
                    with: {
                        ingredients: {
                            with: {
                                inventoryItem: true
                            }
                        }
                    }
                });
                setRecipes(data);
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    if (loading) return <div className="p-8 text-white">Loading Recipes...</div>;

    return (
        <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <ChefHat className="text-brand" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Culinary Database</h2>
                    <div className="h-0.5 w-12 bg-brand mt-1 shadow-[0_0_10px_#84cc16]"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recipes.map(recipe => (
                    <div key={recipe.id} className="glass-panel glass-panel-hover rounded-2xl p-0 overflow-hidden border border-white/5 bg-white/5">
                        <div className="p-6 border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        {recipe.name}
                                        {recipe.type === 'BATCH' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">BATCH PREP</span>}
                                        {recipe.type === 'ASSEMBLY' && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">ASSEMBLY</span>}
                                    </h3>
                                    <div className="text-sm text-gray-500 font-mono mt-1">
                                        YIELD: {recipe.yieldQuantity} {recipe.yieldUnit}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-gray-400 border border-white/5">
                                        <BookOpen size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-black/20">
                            <h4 className="text-xs font-mono text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Flame size={12} /> Ingredients
                            </h4>
                            <div className="space-y-2">
                                {recipe.ingredients.map(ing => (
                                    <div key={ing.id} className="flex justify-between items-center text-sm p-2 rounded bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand/50"></div>
                                            {ing.inventoryItem?.name || 'Unknown Item'}
                                        </div>
                                        <div className="font-mono text-white font-bold">
                                            {ing.quantity} <span className="text-gray-500 text-xs font-normal">{ing.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {recipe.instructions && (
                                <div className="mt-6">
                                    <h4 className="text-xs font-mono text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Clock size={12} /> Instructions
                                    </h4>
                                    <div className="text-sm text-gray-400 italic bg-white/5 p-3 rounded border border-white/5">
                                        No detailed instructions provided in this view.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
