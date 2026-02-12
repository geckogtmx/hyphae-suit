/**
 * @link e:\git\hyphae-pos\src\components\CheckoutModal.tsx
 * @author Hyphae POS Team
 * @description Comprehensive payment processing and order review screen.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Split,
  X,
  DollarSign,
  List,
  Edit,
  Delete,
  PencilLine,
  Trash2,
  Plus,
  Coins,
} from 'lucide-react';
import { OrderItem, PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  total: number;
  items: OrderItem[];
  onConfirmPayment: (
    method: PaymentMethod,
    amount: number,
    isFull: boolean,
    confirmationNumber?: string,
    tenderedAmount?: number,
    tipAmount?: number
  ) => void;
  amountAlreadyPaid?: number;
  onEditItem?: (item: OrderItem) => void;
  onRemoveItem?: (id: string) => void;
}

type CheckoutStep = 'ORDER_REVIEW' | 'METHOD_SELECT' | 'CONFIRM_STANDARD' | 'SPLIT_DASHBOARD';

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  tax,
  total,
  items,
  onConfirmPayment,
  amountAlreadyPaid = 0,
  onEditItem,
  onRemoveItem,
}) => {
  const [step, setStep] = useState<CheckoutStep>('ORDER_REVIEW');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const [activeInput, setActiveInput] = useState<'PRIMARY' | 'TIP'>('PRIMARY');
  const [tenderedValue, setTenderedValue] = useState('');
  const [tipValue, setTipValue] = useState('');
  const [keepChange, setKeepChange] = useState(false);

  const [splitPayments, setSplitPayments] = useState<{ method: PaymentMethod; amount: number }[]>(
    []
  );
  const [splitInput, setSplitInput] = useState('');
  const [partialMethod, setPartialMethod] = useState<PaymentMethod>('Cash');

  const balanceDue = total - amountAlreadyPaid;
  const isRefund = balanceDue < -0.01;
  const isZeroBalance = Math.abs(balanceDue) < 0.01;

  // Stable ID for the session
  const [displayId] = useState(() => Math.floor(Math.random() * 1000));

  const resetStandardState = () => {
    setTenderedValue('');
    setTipValue('');
    setActiveInput('PRIMARY');
    setKeepChange(false);
  };

  // Initial setup handled by mounting fresh component
  useEffect(() => {
    // Ensuring clean slate on mount if needed
    setStep('ORDER_REVIEW');
    resetStandardState();
    setSplitPayments([]);
    setSplitInput('');
    setPartialMethod('Cash');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedItems = useMemo(() => {
    const groups: Record<
      string,
      { key: string; mainItem: OrderItem; items: OrderItem[]; total: number }
    > = {};

    items.forEach((item) => {
      const sortedMods = [...(item.selectedModifiers || [])].sort((a, b) => {
        const gA = a.groupId || '';
        const gB = b.groupId || '';
        return gA.localeCompare(gB) || (a.optionId || '').localeCompare(b.optionId || '');
      });
      const modSig = sortedMods.map((m) => `${m.groupId}-${m.optionId}-${m.variation}`).join('|');
      const signature = `${item.id}|${item.isDiscounted}|${item.notes || ''}|${modSig}`;

      if (!groups[signature]) {
        groups[signature] = {
          key: signature,
          mainItem: item,
          items: [],
          total: 0,
        };
      }
      groups[signature].items.push(item);
      groups[signature].total += item.finalPrice;
    });

    return Object.values(groups);
  }, [items]);

  if (!isOpen) return null;

  const handleMethodSelect = (method: PaymentMethod) => {
    if (method === 'Split') {
      setStep('SPLIT_DASHBOARD');
      resetStandardState(); // Explicit reset
      setSplitPayments([]);
      setSplitInput('');
    } else {
      setSelectedMethod(method);
      setStep('CONFIRM_STANDARD');
      resetStandardState(); // Explicit reset
    }
  };

  const currentTip = parseFloat(tipValue) || 0;
  const currentTendered = parseFloat(tenderedValue) || 0;
  const totalCharge = Math.abs(balanceDue) + currentTip;

  let changeDue = 0;
  if (selectedMethod === 'Cash') {
    changeDue = currentTendered - totalCharge;
  }

  const toggleKeepChange = () => {
    if (keepChange) {
      setKeepChange(false);
      setTipValue('');
    } else {
      setKeepChange(true);
      const potentialTip = Math.max(0, currentTendered - Math.abs(balanceDue));
      setTipValue(potentialTip.toFixed(2));
    }
  };

  const handleStandardConfirm = () => {
    if (selectedMethod) {
      const confirmationNum = selectedMethod === 'Clip' ? tenderedValue : undefined;
      const tendered = selectedMethod === 'Cash' ? currentTendered : undefined;
      onConfirmPayment(selectedMethod, totalCharge, true, confirmationNum, tendered, currentTip);
    }
  };

  const handleZeroBalanceConfirm = () => onConfirmPayment('Cash', 0, true);

  const splitTotalPaid = splitPayments.reduce((acc, p) => acc + p.amount, 0);
  const splitRemaining = Math.max(0, balanceDue - splitTotalPaid);

  const handleAddSplitPayment = () => {
    const amount = parseFloat(splitInput);
    if (!amount || isNaN(amount) || amount <= 0) return;
    setSplitPayments([...splitPayments, { method: partialMethod, amount }]);
    setSplitInput('');
  };

  const handleRemoveSplitPayment = (index: number) => {
    setSplitPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalizeSplit = () => {
    onConfirmPayment('Split', balanceDue, true);
  };

  const handleSetRemainder = () => setSplitInput(splitRemaining.toFixed(2));

  const handleKeypadInput = (val: string) => {
    if (activeInput === 'PRIMARY') {
      if (val === '.' && tenderedValue.includes('.')) return;
      if (tenderedValue.length > 10) return;
      setTenderedValue((prev) => prev + val);
    } else {
      if (keepChange) setKeepChange(false);
      if (val === '.' && tipValue.includes('.')) return;
      if (tipValue.length > 8) return;
      setTipValue((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    if (activeInput === 'PRIMARY') {
      setTenderedValue((prev) => prev.slice(0, -1));
    } else {
      if (keepChange) setKeepChange(false);
      setTipValue((prev) => prev.slice(0, -1));
    }
  };

  const handleSplitNumpad = (val: string) => {
    if (val === '.' && splitInput.includes('.')) return;
    if (splitInput.length > 8) return;
    setSplitInput((prev) => prev + val);
  };
  const handleSplitBackspace = () => setSplitInput((prev) => prev.slice(0, -1));

  const renderOrderReview = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {groupedItems.map((group, idx) => {
            const item = group.mainItem;
            const count = group.items.length;

            return (
              <div
                key={`${group.key}-${idx}`}
                className="bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col shadow-sm relative group hover:border-lime-500/50 transition-all h-full min-h-[180px]"
              >
                <div className="flex justify-between items-start mb-3 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                  <div className="flex items-center min-w-0 pr-2">
                    {count > 1 && (
                      <span className="bg-lime-500 text-zinc-950 font-bold font-mono text-sm px-1.5 py-0.5 rounded mr-2 shrink-0">
                        {count}x
                      </span>
                    )}
                    <span
                      className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight truncate"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-lg text-zinc-700 dark:text-zinc-300">
                    ${group.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex-1 content-start flex flex-wrap gap-1.5 mb-4 align-content-start">
                  {item.selectedModifiers
                    ?.filter((m) => {
                      if (m.name === 'Single') return false;
                      const group = item.modifierGroups?.find((g) => g.id === m.groupId);
                      if (!group) return true;
                      if (group.variant === 'sub_item') return false;
                      if (group.dependency) {
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
                        className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 font-medium border border-zinc-200 dark:border-zinc-700"
                      >
                        {mod.variation !== 'Normal' && (
                          <span
                            className={`mr-1 font-bold ${mod.variation === 'No' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}
                          >
                            {mod.variation}
                          </span>
                        )}
                        {mod.name}
                      </span>
                    ))}

                  {item.selectedModifiers
                    ?.filter(
                      (m) =>
                        item.modifierGroups?.find((g) => g.id === m.groupId)?.variant === 'sub_item'
                    )
                    .map((subItem) => (
                      <div
                        key={subItem.optionId}
                        className="flex items-center bg-zinc-50 dark:bg-zinc-900/50 rounded px-2 py-1 border border-zinc-200 dark:border-zinc-800 w-full mt-1"
                      >
                        <span className="text-xs text-lime-600 dark:text-lime-400 font-bold mr-2 whitespace-nowrap">
                          + {subItem.name}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.selectedModifiers
                            ?.filter((m) => {
                              const group = item.modifierGroups?.find((g) => g.id === m.groupId);
                              return group?.dependency?.groupId === subItem.groupId;
                            })
                            .map((nestedMod) => (
                              <span
                                key={nestedMod.optionId}
                                className="text-[10px] px-1.5 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-700 whitespace-nowrap"
                              >
                                {nestedMod.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                  {onEditItem && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-lg text-xs font-bold uppercase flex items-center justify-center transition-colors"
                    >
                      <PencilLine size={14} className="mr-1" /> Edit {count > 1 ? 'One' : ''}
                    </button>
                  )}
                  {onRemoveItem && (
                    <button
                      onClick={() => group.items.forEach((i) => onRemoveItem(i.uniqueId))}
                      className="w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-20 backdrop-blur-sm shadow-[0_-5px_25px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-6 md:gap-8">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              Subtotal
            </span>
            <span className="font-mono text-3xl font-bold text-zinc-700 dark:text-zinc-300">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Tax</span>
            <span className="font-mono text-3xl font-bold text-zinc-700 dark:text-zinc-300">
              ${tax.toFixed(2)}
            </span>
          </div>
          {amountAlreadyPaid > 0 && (
            <>
              <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                  Paid
                </span>
                <span className="font-mono text-3xl font-bold text-zinc-700 dark:text-zinc-300">
                  -${amountAlreadyPaid.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 px-8 py-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <span className="text-base font-bold text-zinc-400 uppercase tracking-widest text-right leading-tight">
            {isRefund ? 'Refund Due' : 'Total Due'}
          </span>
          <span
            className={`font-mono text-5xl font-bold ${isRefund ? 'text-red-500 dark:text-red-400' : 'text-lime-600 dark:text-lime-400'}`}
          >
            ${Math.abs(balanceDue).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex space-x-6 shrink-0 p-4 bg-zinc-50 dark:bg-zinc-950 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={onClose}
          className="flex-1 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl font-bold uppercase text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center space-x-3 text-lg"
        >
          <Edit size={24} />
          <span>Modify Order</span>
        </button>
        <button
          onClick={() => {
            if (isZeroBalance) handleZeroBalanceConfirm();
            else if (isRefund) {
              setStep('METHOD_SELECT');
              resetStandardState();
            } else {
              setStep('METHOD_SELECT');
              resetStandardState();
            }
          }}
          className={`flex-[2] h-20 rounded-2xl font-bold uppercase text-zinc-950 transition-colors shadow-xl text-xl tracking-widest ${isRefund ? 'bg-red-500 hover:bg-red-400' : 'bg-lime-500 hover:bg-lime-400'}`}
        >
          {isZeroBalance ? 'Update Order' : isRefund ? 'Process Refund' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );

  const renderMethodSelect = () => (
    <div className="h-full animate-in slide-in-from-right duration-300 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-2 gap-6 p-8">
        {['Cash', 'Clip', 'Transfer'].map((m) => (
          <button
            key={m}
            onClick={() => handleMethodSelect(m as PaymentMethod)}
            className="h-64 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:border-lime-500 dark:hover:border-lime-400 border-2 border-zinc-200 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center p-8 transition-all group shadow-lg"
          >
            {m === 'Cash' && (
              <Banknote
                size={80}
                className="text-zinc-400 dark:text-zinc-500 group-hover:text-lime-600 dark:group-hover:text-lime-400 mb-6"
              />
            )}
            {m === 'Clip' && (
              <CreditCard
                size={80}
                className="text-zinc-400 dark:text-zinc-500 group-hover:text-lime-600 dark:group-hover:text-lime-400 mb-6"
              />
            )}
            {m === 'Transfer' && (
              <ArrowRightLeft
                size={80}
                className="text-zinc-400 dark:text-zinc-500 group-hover:text-lime-600 dark:group-hover:text-lime-400 mb-6"
              />
            )}
            <span className="text-3xl font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">
              {m}
            </span>
          </button>
        ))}
        {!isRefund && (
          <button
            onClick={() => handleMethodSelect('Split')}
            className="h-64 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-lime-500 dark:hover:border-lime-400 rounded-3xl flex flex-col items-center justify-center p-8 transition-all group"
          >
            <Split
              size={80}
              className="text-zinc-400 dark:text-zinc-500 group-hover:text-lime-600 dark:group-hover:text-lime-400 mb-6"
            />
            <span className="text-3xl font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">
              Partial / Split
            </span>
          </button>
        )}
      </div>
    </div>
  );

  const renderStandardConfirm = () => (
    <div className="grid grid-cols-2 gap-12 h-full p-8 animate-in slide-in-from-right duration-200">
      <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-700/50 p-8 flex flex-col shadow-inner">
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setActiveInput('PRIMARY')}
            className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs tracking-wider border-2 transition-all ${activeInput === 'PRIMARY' ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}
          >
            {selectedMethod === 'Cash' ? 'Cash Tendered' : 'Ref Number'}
          </button>
          <button
            onClick={() => {
              setActiveInput('TIP');
              setKeepChange(false);
            }}
            className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs tracking-wider border-2 transition-all ${activeInput === 'TIP' ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}
          >
            Tip Amount
          </button>
        </div>

        <div className="relative mb-6">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 text-2xl font-bold">
            {activeInput === 'TIP' || selectedMethod === 'Cash' ? '$' : '#'}
          </span>
          <input
            type="text"
            value={activeInput === 'PRIMARY' ? tenderedValue : tipValue}
            readOnly
            placeholder="0.00"
            className={`w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-2 rounded-2xl py-5 pl-12 pr-6 text-4xl font-mono text-black dark:text-white outline-none cursor-default shadow-sm transition-colors text-right ${activeInput === 'PRIMARY' ? 'border-lime-500 dark:border-lime-400' : 'border-zinc-200 dark:border-zinc-700 focus:border-lime-500'}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 w-full flex-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeypadInput(key)}
              className="h-20 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-b-4 border-zinc-200 dark:border-zinc-700 rounded-2xl text-3xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:border-b-0 active:translate-y-1 active:bg-lime-50 dark:active:bg-lime-900/20 active:text-lime-600 dark:active:text-lime-400 transition-all shadow-sm"
            >
              {key}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="h-20 bg-red-50 dark:bg-red-900/10 border-b-4 border-red-100 dark:border-red-900/30 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm active:border-b-0 active:translate-y-1"
          >
            <Delete size={32} />
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md mx-auto space-y-6">
          <div className="w-full flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Order Balance</span>
            <span className="text-2xl font-mono font-bold text-zinc-700 dark:text-zinc-300">
              ${Math.abs(balanceDue).toFixed(2)}
            </span>
          </div>

          <div
            onClick={() => {
              setActiveInput('TIP');
              setKeepChange(false);
            }}
            className={`w-full flex justify-between items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${activeInput === 'TIP' ? 'bg-lime-50 dark:bg-lime-900/10 border-lime-500' : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-zinc-500 font-bold uppercase tracking-wider flex items-center">
              <Plus size={16} className="mr-2" /> Tip
            </span>
            <span className="text-2xl font-mono font-bold text-lime-600 dark:text-lime-400">
              +${currentTip.toFixed(2)}
            </span>
          </div>

          <div className="bg-zinc-900 w-full p-6 rounded-3xl border border-zinc-800 shadow-xl text-center">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] block mb-2">
              Total Charge
            </span>
            <span className="text-6xl font-mono font-bold text-white tracking-tighter">
              ${totalCharge.toFixed(2)}
            </span>
          </div>

          {selectedMethod === 'Cash' && !isRefund && (
            <div className="w-full">
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                  Change Due
                </span>
                <span
                  className={`font-mono text-3xl font-bold ${changeDue < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}
                >
                  ${changeDue.toFixed(2)}
                </span>
              </div>
              {changeDue > 0 && !keepChange && (
                <button
                  onClick={toggleKeepChange}
                  className="w-full mt-2 py-3 text-xs font-bold uppercase text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20 rounded-xl transition-colors flex items-center justify-center border border-dashed border-lime-500/30"
                >
                  <Coins size={14} className="mr-2" /> Keep Change as Tip
                </button>
              )}
              {keepChange && (
                <button
                  onClick={toggleKeepChange}
                  className="w-full mt-2 py-3 text-xs font-bold uppercase text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center justify-center"
                >
                  <X size={14} className="mr-2" /> Cancel Keep Change
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 w-full flex flex-col gap-4">
          <button
            onClick={handleStandardConfirm}
            disabled={
              (selectedMethod === 'Cash' && changeDue < 0) ||
              (selectedMethod === 'Clip' && tenderedValue.length === 0)
            }
            className={`w-full h-24 rounded-2xl font-bold uppercase tracking-widest text-2xl transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] 
                        ${
                          (selectedMethod === 'Cash' && changeDue < 0) ||
                          (selectedMethod === 'Clip' && tenderedValue.length === 0)
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
                            : isRefund
                              ? 'bg-red-500 text-white hover:bg-red-400'
                              : 'bg-lime-500 text-zinc-950 hover:bg-lime-400 shadow-lime-500/30'
                        }`}
          >
            {selectedMethod === 'Clip' ? 'Process Card & Close' : 'Confirm Payment'}
          </button>
          <button
            onClick={() => {
              setStep('METHOD_SELECT');
              resetStandardState();
            }}
            className="w-full h-16 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-bold uppercase tracking-wider transition-colors"
          >
            Back to Methods
          </button>
        </div>
      </div>
    </div>
  );

  const renderSplitDashboard = () => {
    return (
      <div className="grid grid-cols-2 gap-12 h-full p-8 animate-in slide-in-from-right duration-200">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col shadow-inner">
          <h3 className="text-zinc-400 font-bold uppercase tracking-widest mb-6 text-center text-sm">
            Add Payment Transaction
          </h3>

          <div className="relative mb-6">
            <DollarSign
              className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500"
              size={32}
            />
            <input
              type="number"
              value={splitInput}
              readOnly
              placeholder="0.00"
              className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-700 rounded-3xl py-6 pl-16 pr-24 text-5xl font-mono text-black dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none text-center placeholder-zinc-300 dark:placeholder-zinc-700"
            />
            <button
              onClick={handleSetRemainder}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 transition-colors"
            >
              Max
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {['Cash', 'Clip', 'Transfer'].map((m) => (
              <button
                key={m}
                onClick={() => setPartialMethod(m as PaymentMethod)}
                className={`py-4 rounded-xl border-2 font-bold uppercase text-xs flex flex-col items-center justify-center transition-all ${partialMethod === m ? 'bg-lime-50 dark:bg-lime-900/20 border-lime-500 dark:border-lime-400 text-lime-700 dark:text-lime-400 shadow-sm' : 'bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                {m === 'Cash' && <Banknote size={24} className="mb-1" />}
                {m === 'Clip' && <CreditCard size={24} className="mb-1" />}
                {m === 'Transfer' && <ArrowRightLeft size={24} className="mb-1" />}
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
              <button
                key={key}
                onClick={() => handleSplitNumpad(key)}
                className="bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-b-4 border-zinc-200 dark:border-zinc-800 rounded-xl text-2xl font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:border-b-0 active:translate-y-1 transition-all shadow-sm"
              >
                {key}
              </button>
            ))}
            <button
              onClick={handleSplitBackspace}
              className="bg-red-50 dark:bg-red-900/10 border-b-4 border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm active:border-b-0 active:translate-y-1"
            >
              <Delete size={24} />
            </button>
          </div>

          <button
            onClick={handleAddSplitPayment}
            className="mt-6 w-full h-16 bg-zinc-900 dark:bg-zinc-50 dark:bg-zinc-900 text-white dark:text-zinc-900 rounded-2xl font-bold uppercase tracking-widest text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
          >
            <Plus size={24} className="mr-2" /> Add Payment
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col mb-6 overflow-hidden">
            <h3 className="text-zinc-400 font-bold uppercase tracking-widest mb-4 text-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-4">
              Transaction Ledger
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {splitPayments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 opacity-50">
                  <List size={48} className="mb-2" />
                  <span className="text-xs uppercase font-bold tracking-widest">
                    No Payments Added
                  </span>
                </div>
              ) : (
                splitPayments.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-left-2"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mr-3">
                        {p.method === 'Cash' && <Banknote size={14} />}
                        {p.method === 'Clip' && <CreditCard size={14} />}
                        {p.method === 'Transfer' && <ArrowRightLeft size={14} />}
                      </div>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase text-sm">
                        {p.method}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-mono font-bold text-lg text-zinc-900 dark:text-white mr-3">
                        ${p.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveSplitPayment(idx)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between text-zinc-500 text-sm">
                <span>Total Paid</span>
                <span className="font-mono font-bold">${splitTotalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl">
                <span className="text-xs font-bold uppercase text-zinc-500">Remaining Balance</span>
                <span
                  className={`font-mono text-2xl font-bold ${splitRemaining > 0.01 ? 'text-red-500' : 'text-lime-600 dark:text-lime-400'}`}
                >
                  ${splitRemaining.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 h-20">
            <button
              onClick={() => {
                setStep('METHOD_SELECT');
                resetStandardState();
              }}
              className="w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-bold uppercase text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalizeSplit}
              disabled={splitRemaining > 0.01}
              className={`flex-1 rounded-2xl font-bold uppercase tracking-widest text-xl transition-all shadow-xl
                        ${
                          splitRemaining > 0.01
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
                            : 'bg-lime-500 hover:bg-lime-400 text-zinc-950'
                        }
                    `}
            >
              Finalize Order
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/80 dark:bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-[95%] h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transition-colors duration-300">
        <div className="h-20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-zinc-50 dark:bg-zinc-950 shrink-0">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-widest uppercase flex items-center">
            {step === 'ORDER_REVIEW' ? 'Review Order' : 'Checkout'}
            <span className="text-zinc-400 dark:text-zinc-600 mx-4 text-3xl font-thin">/</span>
            <span className="text-zinc-400 font-mono text-lg">#{displayId}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 min-h-0 overflow-hidden flex flex-col">
          {step === 'ORDER_REVIEW' && renderOrderReview()}
          {step === 'METHOD_SELECT' && renderMethodSelect()}
          {step === 'CONFIRM_STANDARD' && renderStandardConfirm()}
          {step === 'SPLIT_DASHBOARD' && renderSplitDashboard()}
        </div>
        {step === 'METHOD_SELECT' && (
          <div className="h-24 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between px-8 shrink-0">
            <button
              onClick={() => {
                setStep('ORDER_REVIEW');
                resetStandardState();
              }}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline uppercase tracking-wider"
            >
              Back to Review
            </button>
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase text-zinc-500 tracking-[0.2em] font-bold mb-1">
                {isRefund ? 'Refund Due' : 'Balance Due'}
              </span>
              <span
                className={`text-4xl font-mono font-bold ${isRefund ? 'text-red-500 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}
              >
                ${Math.abs(balanceDue).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
