/**
 * @link e:\git\hyphae-pos\src\components\Stage.tsx
 * @author Hyphae POS Team
 * @description Primary interface container for ordering, browsing, and loyalty.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useState, useEffect, useRef } from 'react';
import { useOrder } from '../context/OrderContext';
import { useMenuData } from '../hooks/useMenuData';
import { Product, OrderItem, PaymentMethod } from '../types';
import OrderBuilder from './OrderBuilder';
import CheckoutModal from './CheckoutModal';
import LoyaltyScreen from './LoyaltyScreen';
import {
  Search,
  Utensils,
  Trash2,
  PencilLine,
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Crown,
  RotateCcw,
  Trophy,
  SlidersHorizontal,
} from 'lucide-react';

interface StageProps {
  activeConceptId?: string;
  onLayoutChange?: (ratio: number) => void;
}

type StageMode = 'LOYALTY' | 'BROWSE' | 'BUILD';

const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}`;

const Stage: React.FC<StageProps> = ({
  activeConceptId = 'tacocracy',
  onLayoutChange: _onLayoutChange,
}) => {
  const { state, dispatch, total, tax, grandTotal } = useOrder();
  const { concepts, getProductsByConcept, loyaltyTiers } = useMenuData();

  const [mode, setMode] = useState<StageMode>('LOYALTY');
  const [buildingProduct, setBuildingProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [buildProgress, setBuildProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [isTicketExpanded, setIsTicketExpanded] = useState(false);
  const cartEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.editingOrder) {
      // If we just loaded state and have an active user, go to browse, otherwise loyalty
      if (!state.loyaltyProfile && state.items.length === 0) {
        setMode('LOYALTY');
      } else {
        setMode('BROWSE');
      }
      setBuildingProduct(null);
      setEditingItem(null);
      setBuildProgress({ current: 0, total: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConceptId, state.editingOrder]); // Removed dispatch dependency to avoid loops

  useEffect(() => {
    if (state.editingOrder) {
      setMode('BROWSE');
      setIsTicketExpanded(true);
    }
  }, [state.editingOrder]);

  useEffect(() => {
    if (cartEndRef.current) {
      cartEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [state.items.length]);

  const activeConcept = concepts.find((c) => c.id === activeConceptId);
  const displayItems = activeConceptId ? getProductsByConcept(activeConceptId) : [];

  const handleProductClick = (product: Product) => {
    setEditingItem(null);
    if (product.requiresMods || (product.modifierGroups && product.modifierGroups.length > 0)) {
      setBuildingProduct(product);
      setMode('BUILD');
      setIsTicketExpanded(false);
    } else {
      const orderItem: OrderItem = {
        ...product,
        uniqueId: generateUniqueId(product.id),
        selectedModifiers: [],
        finalPrice: product.price,
      };
      dispatch({ type: 'ADD_ITEM', payload: orderItem });
    }
  };

  const handleEditItem = (item: OrderItem) => {
    setEditingItem(item);
    setBuildingProduct(item);
    setMode('BUILD');
    setIsTicketExpanded(false);
  };

  const handleOrderComplete = (item: OrderItem) => {
    if (editingItem) {
      dispatch({ type: 'UPDATE_ITEM', payload: item });
    } else {
      dispatch({ type: 'ADD_ITEM', payload: item });
    }
    setMode('BROWSE');
    setBuildingProduct(null);
    setEditingItem(null);
    setBuildProgress({ current: 0, total: 0 });
  };

  const handleOrderCancel = () => {
    setMode('BROWSE');
    setBuildingProduct(null);
    setEditingItem(null);
    setBuildProgress({ current: 0, total: 0 });
  };

  const handleCancelEdit = () => {
    dispatch({ type: 'CANCEL_EDIT' });
  };

  const handlePayment = (
    method: PaymentMethod,
    amountPaid: number,
    isFullPayment: boolean,
    confirmationNumber?: string,
    tenderedAmount?: number,
    tipAmount?: number
  ) => {
    dispatch({
      type: 'CREATE_ORDER',
      payload: {
        method,
        amountPaid,
        isFullPayment,
        subtotal: total,
        tax: tax,
        total: grandTotal,
        confirmationNumber,
        tenderedAmount,
        tipAmount,
        isLoyalty: !!state.loyaltyProfile,
      },
    });
    setIsCheckoutOpen(false);
    setIsTicketExpanded(false);

    if (!state.editingOrder) {
      setMode('LOYALTY');
      dispatch({ type: 'LOGOUT_LOYALTY' });
    }
  };

  const handleLoyaltyGuest = () => {
    setMode('BROWSE');
    dispatch({ type: 'LOGOUT_LOYALTY' });
  };

  const handleLoyaltyLogin = (cardNumber: string) => {
    dispatch({ type: 'LOGIN_LOYALTY', payload: cardNumber });
    setMode('BROWSE');
  };

  const renderLoyaltyBanner = () => {
    if (!state.loyaltyProfile) return null;
    const profile = state.loyaltyProfile;
    const tier = loyaltyTiers.find((t) => t.id === state.loyaltyProfile?.currentTierId);
    const nextTier = loyaltyTiers[loyaltyTiers.findIndex((t) => t.id === tier?.id) + 1];

    let progressPercent = 100;
    let toGo = 0;
    if (nextTier) {
      const range = nextTier.minPunches - (tier?.minPunches || 0);
      const currentInTier = profile.totalPunches - (tier?.minPunches || 0);
      progressPercent = Math.min((currentInTier / range) * 100, 100);
      toGo = nextTier.minPunches - profile.totalPunches;
    }

    return (
      <div className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between shrink-0 animate-in slide-in-from-top">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-${tier?.color || 'zinc'}-100 dark:bg-${tier?.color || 'zinc'}-900/50 text-${tier?.color || 'zinc'}-600 dark:text-${tier?.color || 'zinc'}-400 border border-${tier?.color || 'zinc'}-200 dark:border-${tier?.color || 'zinc'}-500/30`}
          >
            <Crown size={20} fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-bold uppercase tracking-wider text-${tier?.color || 'zinc'}-700 dark:text-${tier?.color || 'white'}`}
              >
                {tier?.name} Member
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 text-xs">|</span>
              <span className="text-zinc-800 dark:text-zinc-300 font-bold text-xs">
                {profile.name}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono mt-0.5">
              <span>PTS: {profile.currentPoints.toFixed(2)}</span>
              <span>•</span>
              <span>VISITS: {profile.totalPunches}</span>
            </div>
          </div>
        </div>

        {nextTier ? (
          <div className="flex flex-col items-end w-48">
            <div className="flex justify-between w-full text-[9px] uppercase font-bold text-zinc-500 mb-1">
              <span>Next: {nextTier.name}</span>
              <span className="text-lime-600 dark:text-lime-400">{toGo} Punches left</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${tier?.color || 'lime'}-500 transition-all duration-1000`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-500/30">
            <Trophy size={14} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase">
              Top Tier Status
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden relative transition-colors duration-300">
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          subtotal={total}
          tax={tax}
          total={grandTotal}
          items={state.items}
          onConfirmPayment={handlePayment}
          amountAlreadyPaid={state.editingOrder ? state.editingOrder.amountPaid : 0}
          onEditItem={(item) => {
            setIsCheckoutOpen(false);
            handleEditItem(item);
          }}
          onRemoveItem={(id) => dispatch({ type: 'REMOVE_ITEM', payload: id })}
        />
      )}

      {/* --- TOP SECTION: MENU OR BUILDER --- */}
      <div
        className={`
          flex flex-col min-h-0 relative border-b-2 border-zinc-200 dark:border-zinc-800
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${mode === 'LOYALTY' ? 'h-full border-none' : isTicketExpanded ? 'h-0 opacity-0 overflow-hidden border-none' : 'h-[65%] opacity-100'}
      `}
      >
        {mode === 'LOYALTY' && (
          <LoyaltyScreen
            onGuestAccess={handleLoyaltyGuest}
            onLoginSuccess={handleLoyaltyLogin}
            isAddMode={state.items.length > 0} // Skip splash if items are in cart
          />
        )}

        {mode === 'BROWSE' && (
          <>
            <div
              className={`h-14 flex justify-between items-center px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 ${state.editingOrder ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-500/50' : 'bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900/30'}`}
            >
              <div className="flex items-center space-x-4">
                {state.editingOrder ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-500/50">
                      <PencilLine size={16} className="text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                        Editing Order #{state.editingOrder.id}
                      </span>
                    </div>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
                    >
                      <RotateCcw size={14} />
                      <span className="text-[10px] font-bold uppercase">Cancel & Restore</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-lime-500 dark:group-focus-within:text-lime-400 transition-colors"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="SEARCH SKU"
                      className="pl-9 pr-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-lime-500 dark:focus:border-lime-400 focus:ring-1 focus:ring-lime-500 dark:focus:ring-lime-400 focus:outline-none w-48 text-xs font-mono placeholder-zinc-500 dark:placeholder-zinc-600 text-zinc-900 dark:text-white transition-all"
                    />
                  </div>
                )}

                {/* ADD LOYALTY BUTTON (Only if not already logged in) */}
                {!state.loyaltyProfile && (
                  <button
                    onClick={() => setMode('LOYALTY')}
                    className="h-10 w-20 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-500/50 transition-all active:scale-95"
                    title="Add Loyalty Card"
                  >
                    <Crown size={20} />
                  </button>
                )}
              </div>
            </div>

            {renderLoyaltyBanner()}

            <div className="flex-1 p-4 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-20">
                {displayItems.map((item) => {
                  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleProductClick(item)}
                      className={`group relative flex flex-col justify-between h-32 p-3 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]
                                hover:border-${activeConcept?.color.split('-')[0]}-400 hover:shadow-lg
                            `}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-start">
                          <span
                            className={`font-bold text-left text-sm md:text-base xl:text-lg leading-tight block mb-1 group-hover:text-${activeConcept?.color.split('-')[0]}-600 dark:group-hover:text-${activeConcept?.color.split('-')[0]}-400 transition-colors pr-6 text-zinc-900 dark:text-zinc-100`}
                          >
                            {item.name}
                          </span>
                        </div>
                        {item.requiresMods && (
                          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-1 rounded-md inline-block mt-1">
                            Mods Req
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end items-end w-full border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2 group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                        <span className="font-mono text-base md:text-lg xl:text-xl font-bold text-zinc-700 dark:text-zinc-200">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {hasModifiers && (
                        <div
                          className="absolute top-3 right-3 text-zinc-400 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors bg-zinc-100 dark:bg-zinc-900/50 rounded-md p-0.5"
                          title="Modifiers Available"
                        >
                          <SlidersHorizontal size={14} />
                        </div>
                      )}

                      {!hasModifiers && (
                        <div
                          className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-zinc-200 dark:border-zinc-800 transition-colors group-hover:border-${activeConcept?.color.split('-')[0]}-400 rounded-tr-xl`}
                        ></div>
                      )}
                    </button>
                  );
                })}
                {displayItems.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center h-48 text-zinc-400 dark:text-zinc-700">
                    <Utensils size={48} className="mb-4 opacity-20" />
                    <span className="font-mono text-xs tracking-widest">NO ITEMS AVAILABLE</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {mode === 'BUILD' && buildingProduct && (
          <div className="absolute inset-0 z-20 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950">
            <OrderBuilder
              product={buildingProduct}
              editItem={editingItem || undefined}
              onComplete={handleOrderComplete}
              onCancel={handleOrderCancel}
              onStepChange={(current, total) => setBuildProgress({ current, total })}
            />
          </div>
        )}
      </div>

      {/* --- BOTTOM SECTION: TICKET RAIL --- */}
      <div
        className={`
          bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 flex flex-col shadow-[0_-5px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-5px_30px_rgba(0,0,0,0.5)] z-30 shrink-0
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${mode === 'LOYALTY' ? 'h-0 overflow-hidden' : isTicketExpanded ? 'h-full' : 'h-[35%]'}
      `}
      >
        <div className="flex-1 min-h-0 flex flex-col bg-zinc-50 dark:bg-zinc-900/50 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTicketExpanded(!isTicketExpanded);
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 z-10 rounded-b-xl flex items-center justify-center shadow-lg border-x border-b border-zinc-200 dark:border-zinc-900 transition-colors"
            title={isTicketExpanded ? 'Collapse View' : 'Expand View'}
          >
            {isTicketExpanded ? (
              <ChevronDown size={24} strokeWidth={3} />
            ) : (
              <ChevronUp size={24} strokeWidth={3} />
            )}
          </button>

          <div className="flex-1 px-3 pb-3 pt-10 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent flex flex-col gap-2">
            {mode === 'BUILD' && buildingProduct && (
              <div className="w-full h-16 shrink-0 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900/50 border border-dashed border-lime-500/50 dark:border-lime-400/50 rounded-xl p-3 flex flex-row items-center justify-between animate-pulse">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lime-600 dark:text-lime-400 font-mono text-[10px] uppercase tracking-widest">
                      {editingItem ? 'Editing' : 'Building'}
                    </span>
                    {buildProgress.total > 0 && (
                      <span className="bg-lime-100 dark:bg-lime-400/20 text-lime-600 dark:text-lime-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                        {buildProgress.current}/{buildProgress.total}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-300 text-sm truncate">
                    {buildingProduct.name}
                  </span>
                </div>
              </div>
            )}

            {state.items.length === 0 && mode !== 'BUILD' ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-700 font-mono text-xs tracking-widest opacity-50">
                {state.editingOrder ? '-- EMPTY ORDER --' : '-- READY FOR ORDER --'}
              </div>
            ) : (
              state.items.map((item) => (
                <div
                  key={item.uniqueId}
                  className={`
                                group bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-2 flex flex-col min-h-[56px] shrink-0 shadow-sm
                                ${editingItem?.uniqueId === item.uniqueId ? 'border-lime-500/50 bg-lime-50 dark:bg-lime-900/10' : ''}
                                ${item.isDiscounted ? 'border-l-4 border-l-yellow-400' : ''}
                            `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-200 block truncate">
                            {item.name}
                          </span>
                          {item.isDiscounted && (
                            <span className="ml-2 text-[9px] bg-yellow-400 text-zinc-900 px-1 rounded font-bold uppercase">
                              Gold Perk
                            </span>
                          )}
                        </div>

                        <div className="mt-1 space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {item.selectedModifiers
                              ?.filter((m) => {
                                const group = item.modifierGroups?.find((g) => g.id === m.groupId);
                                if (group?.variant === 'sub_item') return false;
                                if (group?.dependency) {
                                  const parentGroup = item.modifierGroups?.find(
                                    (pg) => pg.id === group.dependency?.groupId
                                  );
                                  if (parentGroup?.variant === 'sub_item') return false;
                                }
                                return true;
                              })
                              .map((mod) => (
                                <span
                                  key={`${mod.groupId}-${mod.optionId}`}
                                  className="text-[9px] px-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] inline-flex items-center"
                                >
                                  {mod.variation !== 'Normal' && (
                                    <span
                                      className={`mr-1 ${mod.variation === 'No' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}
                                    >
                                      {mod.variation}
                                    </span>
                                  )}
                                  {mod.name}
                                </span>
                              ))}
                          </div>

                          {item.selectedModifiers
                            ?.filter(
                              (m) =>
                                item.modifierGroups?.find((g) => g.id === m.groupId)?.variant ===
                                'sub_item'
                            )
                            .map((subItem) => (
                              <div
                                key={subItem.optionId}
                                className="flex flex-row flex-wrap items-center gap-2 mt-1"
                              >
                                <div className="flex items-center text-xs text-lime-600 dark:text-lime-400 font-bold shrink-0">
                                  <span className="w-1.5 h-1.5 bg-lime-600 dark:bg-lime-400 rounded-full mr-2"></span>
                                  {subItem.name}
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {item.selectedModifiers
                                    ?.filter((m) => {
                                      const group = item.modifierGroups?.find(
                                        (g) => g.id === m.groupId
                                      );
                                      return group?.dependency?.groupId === subItem.groupId;
                                    })
                                    .map((nestedMod) => (
                                      <span
                                        key={nestedMod.optionId}
                                        className="text-[9px] px-1 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-800"
                                      >
                                        {nestedMod.name}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono font-bold text-lg ${item.isDiscounted ? 'text-yellow-500 dark:text-yellow-400 line-through decoration-zinc-500 text-sm' : 'text-zinc-700 dark:text-zinc-200'}`}
                        >
                          $
                          {(
                            item.price +
                            (item.selectedModifiers?.reduce((a, m) => a + m.price, 0) || 0)
                          ).toFixed(2)}
                        </span>
                        {item.isDiscounted && (
                          <span className="font-mono font-bold text-lg text-lime-600 dark:text-lime-400">
                            $0.00
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pl-2 self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                        className="h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                      >
                        <PencilLine size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: 'REMOVE_ITEM', payload: item.uniqueId });
                        }}
                        className="h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={cartEndRef} />
          </div>
        </div>

        <div className="h-14 shrink-0 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center px-4 md:px-6 shadow-inner z-20 overflow-hidden">
          <div className="flex-1 flex items-center justify-between font-mono text-zinc-500 text-[10px] md:text-xs xl:text-sm border-r border-zinc-200 dark:border-zinc-800 pr-3 md:pr-6 mr-3 md:mr-6">
            <span className="truncate">SUBTOTAL</span>
            <span className="text-zinc-900 dark:text-zinc-300">${total.toFixed(2)}</span>
          </div>
          <div className="flex-1 flex items-center justify-between font-mono text-zinc-500 text-[10px] md:text-xs xl:text-sm border-r border-zinc-200 dark:border-zinc-800 pr-3 md:pr-6 mr-3 md:mr-6">
            <span className="truncate">TAX</span>
            <span className="text-zinc-900 dark:text-zinc-300">${tax.toFixed(2)}</span>
          </div>
          <div className="flex-1 flex items-center justify-between font-mono text-zinc-500 text-[10px] md:text-xs xl:text-sm border-r border-zinc-200 dark:border-zinc-800 pr-3 md:pr-6 mr-3 md:mr-6">
            <span className="truncate">ITEMS</span>
            <span className="text-zinc-900 dark:text-zinc-300">{state.items.length}</span>
          </div>
          <div className="flex-[1.5] flex items-center justify-between min-w-0">
            <span className="font-bold text-xs md:text-sm xl:text-base text-zinc-400 uppercase tracking-wide truncate mr-2">
              Total Due
            </span>
            <span className="font-mono text-lg md:text-2xl xl:text-3xl font-bold text-lime-600 dark:text-lime-400 truncate">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-auto shrink-0 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 p-3 border-t border-zinc-200 dark:border-zinc-900 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (state.items.length > 0) setIsCheckoutOpen(true);
            }}
            disabled={state.items.length === 0}
            className={`w-full h-20 rounded-xl font-bold text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(132,204,22,0.3)] active:scale-[0.99] transition-all flex items-center justify-center space-x-3
                    ${state.items.length === 0 ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none' : 'bg-lime-500 hover:bg-lime-400 text-zinc-950'}
                `}
          >
            <ShoppingBag size={24} strokeWidth={2.5} />
            <span>{state.editingOrder ? 'Review Changes' : 'Create Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Stage);
