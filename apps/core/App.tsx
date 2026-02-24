import React, { useState, useEffect } from 'react';
import { seedClientDatabase } from './lib/clientSeed';
import { SuppliersView } from './views/SuppliersView';
import { InventoryView } from './views/InventoryView';
import { RecipesView } from './views/RecipesView';
import { ForecastView } from './views/ForecastView';

import {
   LayoutDashboard,
   UtensilsCrossed,
   Settings,
   Sun,
   Moon,
   Wifi,
   Package,
   Battery,
   CloudUpload,
   Server,
   AlertTriangle,
   CheckCircle2,
   AlertOctagon,
   ChefHat,
   Clock,
   Flame,
   Scale,
   Trash2,
   X,
   Monitor,
   ChevronDown,
   ChevronUp,
   Brain,
   Truck,
   Activity,
   MessageSquare,
   Calendar,
   TrendingUp,
   Send,
   Bot,
   DollarSign,
   PieChart,
   Wallet,
   Zap,
   Box,
   Layers,
   ArrowUpRight,
   TrendingDown,
   Award,
   AlertCircle,
   Link,
   CreditCard,
   RefreshCw,
   Globe,
   ArrowLeft,
   Factory
} from 'lucide-react';
import {
   Concept,
   Category,
   Product,
   InventoryItem,
   DeviceState,
   TransactionRecord,
   RecipeDefinition,
   FinancialMetrics,
   VendorInvoice,
   AccountsReceivableItem,
   PaymentGatewayConfig,
   DeliveryPartnerConfig
} from './types/schema';
import { ApiClient } from './lib/apiClient';
import { InventoryService } from './lib/inventory';
import { ProductBuilder } from './components/ProductBuilder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConceptManagerModal } from './components/ConceptManagerModal';
import {
   CONCEPTS,
   CATEGORIES,
   PRODUCTS,
   INVENTORY_ITEMS,
   RECIPES,
   FINANCIAL_MOCK_DATA,
   INTEGRATION_MOCK_DATA,
   FINANCIAL_HEALTH_OVERVIEW as FINANCIAL_HEALTH
} from '@hyphae/database/mock_data';

// --- MOCK DATA (Code B-Smash) ---
// --- MOCK DATA (Consolidated) ---
const MOCK_DATA = {
   concepts: CONCEPTS,
   categories: CATEGORIES,
   products: PRODUCTS,
   inventory: INVENTORY_ITEMS
};

const RECIPE_MOCK_DATA = RECIPES;

// --- COMPONENTS ---

// 1. Navigation Header Rail (Top)
const NavigationHeader = ({
   activeView,
   setView,
   devices
}: {
   activeView: string,
   setView: (v: string) => void,
   devices: DeviceState[]
}) => {
   // ... other code ...

   // ... other code ...

   const mainItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
      { id: 'intelligence', icon: Brain, label: 'AI Hub' },
      { id: 'finance', icon: Scale, label: 'Finance' },
      { id: 'forecast', icon: TrendingUp, label: 'Forecast' },
      { id: 'devices', icon: Server, label: 'Fleet' },
   ];

   const pipelineItems = [
      { id: 'suppliers', icon: Truck, label: 'Supply Chain' },
      { id: 'inventory', icon: Package, label: 'Stock' },
      { id: 'kitchen', icon: ChefHat, label: 'Recipes' },
      { id: 'products', icon: UtensilsCrossed, label: 'Catalog' },
   ];

   return (
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
         {/* Left: Brand Identity */}
         <div className="flex items-center gap-3 w-48">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
               <div className="w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_10px_#84cc16]"></div>
            </div>
            <div>
               <h1 className="text-sm font-bold text-white tracking-widest font-mono">HYPHAE<span className="text-brand">.CORE</span></h1>
               <p className="text-[9px] text-gray-500 font-mono tracking-wide">COMMAND HUD</p>
            </div>
         </div>

         {/* Center: Navigation Rail */}
         <nav className="flex items-center gap-6">
            <div className="flex items-center gap-1">
               {mainItems.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                     <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${isActive
                           ? 'bg-white/10 text-brand border border-white/10 shadow-[0_0_15px_rgba(132,204,22,0.1)]'
                           : 'text-gray-400 hover:text-white hover:bg-white/5'
                           }`}
                     >
                        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-xs font-bold tracking-wide transition-all ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                           {item.label}
                        </span>
                        {isActive && (
                           <div className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full shadow-[0_0_10px_#84cc16]"></div>
                        )}
                     </button>
                  );
               })}
            </div>

            {/* Separator */}
            <div className="w-[1px] h-6 bg-white/10 rounded-full" />

            {/* Golden Pipeline Block */}
            <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-full border border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
               {pipelineItems.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                     <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 group ${isActive
                           ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                           : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                           }`}
                     >
                        <item.icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-xs font-bold tracking-wide transition-all ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                           {item.label}
                        </span>
                     </button>
                  );
               })}
            </div>
         </nav>

         {/* Right: System Status */}
         <div className="flex items-center justify-end gap-3 w-56">
            <div className="flex items-center gap-2">
               {/* POS Status */}
               <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10" title="POS Units">
                  <Monitor size={12} className={devices.some(d => d.type === 'POS' && d.status === 'online') ? "text-brand" : "text-gray-600"} />
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                     {devices.filter(d => d.type === 'POS' && d.status === 'online').length}
                  </span>
               </div>
               {/* KDS Status */}
               <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10" title="Kitchen Units">
                  <ChefHat size={12} className={devices.some(d => d.type === 'KDS' && d.status === 'online') ? "text-emerald-400" : "text-gray-600"} />
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                     {devices.filter(d => d.type === 'KDS' && d.status === 'online').length}
                  </span>
               </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand to-emerald-500 flex items-center justify-center text-black font-bold text-xs border border-white/20">
               AD
            </div>
         </div>
      </header>
   );
};

// --- VIEWS ---

const DashboardView = ({
   transactions,
   inventory
}: {
   transactions: TransactionRecord[],
   products: Product[],
   inventory: InventoryItem[]
}) => {
   const lowStockItems = InventoryService.getLowStockItems(inventory);
   const [alertsCollapsed, setAlertsCollapsed] = useState(false);
   const [loyaltySummary, setLoyaltySummary] = useState({ totalMembers: 0, recentEnrollments: 0 });

   useEffect(() => {
      // Seed the client-side DB for browser testing
      seedClientDatabase().then(() => console.log('Client DB Ready'));

      // Fetch Loyalty Metrics
      ApiClient.getLoyaltySummary().then(setLoyaltySummary);
   }, []);

   return (
      <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">

         {/* THE BENTO GRID */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* 1. FINANCIAL HEALTH CARD (Hero) */}
            <div className="col-span-12 md:col-span-8 glass-panel glass-panel-hover rounded-2xl p-8 relative overflow-hidden group flex flex-col justify-between">
               <div className="absolute top-0 right-0 p-48 bg-brand/5 blur-[120px] rounded-full group-hover:bg-brand/10 transition-all duration-700"></div>

               {/* Top Section: Main Revenue & AP Alert */}
               <div>
                  <div className="flex justify-between items-start relative z-10">
                     <div className="flex items-center gap-2 text-brand font-mono text-sm tracking-widest mb-1 opacity-80">
                        <DollarSign size={14} /> LIVE REVENUE STREAM
                     </div>
                     <div className="flex flex-col items-end">
                        <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-emerald-400 flex items-center gap-2">
                           <TrendingUp size={12} /> +12.4%
                        </div>
                     </div>
                  </div>

                  <div className="text-6xl lg:text-7xl font-mono font-bold text-white text-glow tracking-tighter mt-2">
                     ${FINANCIAL_HEALTH.totalRevenueMXN.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  {/* Overdue AP Alert Strip */}
                  {FINANCIAL_HEALTH.overdueAPAlert > 0 && (
                     <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border-l-2 border-red-500 rounded-r-md">
                        <AlertCircle size={14} className="text-red-500" />
                        <span className="text-xs font-mono text-red-200 font-bold tracking-wide">
                           OVERDUE AP DETECTED: PAY ${FINANCIAL_HEALTH.overdueAPAlert.toLocaleString()}
                        </span>
                     </div>
                  )}
               </div>

               {/* Bottom Grid: Secondary Metrics & Top Seller */}
               <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/5 relative z-10">

                  {/* Left: Margins */}
                  <div className="flex gap-8">
                     <div>
                        <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Gross Margin</div>
                        <div className="text-2xl font-mono font-bold text-white flex items-end gap-2">
                           {(FINANCIAL_HEALTH.grossProfitMargin * 100).toFixed(1)}%
                           <TrendingUp size={16} className="text-emerald-500 mb-1" />
                        </div>
                     </div>
                     <div>
                        <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Tax Collected</div>
                        <div className="text-2xl font-mono font-bold text-gray-300">
                           ${(FINANCIAL_HEALTH.totalTaxCollectedMXN / 1000).toFixed(1)}k
                        </div>
                     </div>
                  </div>

                  {/* Right: Operational Metric (Top Seller) */}
                  <div className="pl-8 border-l border-white/10">
                     <div className="flex items-center gap-2 text-[10px] text-brand font-mono uppercase mb-2">
                        <Award size={12} /> Top Performing Item
                     </div>
                     <div className="font-bold text-white text-lg leading-tight">
                        {FINANCIAL_HEALTH.topSellerName}
                     </div>
                     <div className="text-xs text-gray-400 font-mono mt-1">
                        <span className="text-white font-bold">{FINANCIAL_HEALTH.topSellerCount}</span> UNITS SOLD
                     </div>
                  </div>
               </div>
            </div>

            {/* 2. ALERT BLOCK (Top Right) */}
            <div className={`col-span-12 md:col-span-4 glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col transition-all duration-300 ${lowStockItems.length > 0 ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : ''}`}>
               <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-red-400 font-mono text-sm tracking-widest font-bold">
                     <button onClick={() => setAlertsCollapsed(!alertsCollapsed)} className="hover:text-red-300 transition-colors">
                        <AlertOctagon size={16} />
                     </button>
                     SYSTEM ALERTS
                  </div>
                  {lowStockItems.length > 0 && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
               </div>

               <div className={`flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide transition-all duration-300 ${alertsCollapsed ? 'h-0 opacity-0' : 'opacity-100'}`}>
                  {lowStockItems.length > 0 ? (
                     lowStockItems.map(item => (
                        <div key={item.id} className="bg-black/40 border border-red-500/30 p-3 rounded-lg flex items-start gap-3">
                           <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                           <div>
                              <div className="text-sm font-bold text-red-100">{item.name}</div>
                              <div className="text-xs text-red-400/80 mt-0.5 font-mono">
                                 {InventoryService.getAlertMessage(item)}
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                        <CheckCircle2 size={32} className="text-emerald-500/50" />
                        <span className="text-xs font-mono">ALL SYSTEMS NOMINAL</span>
                     </div>
                  )}
               </div>
               {alertsCollapsed && lowStockItems.length > 0 && (
                  <div className="text-xs text-red-400 font-mono mt-2">
                     {lowStockItems.length} alerts hidden. Click icon to expand.
                  </div>
               )}
            </div>

            {/* 3. AGENT INTELLIGENCE STRIP (Middle) */}
            <div className="col-span-12 glass-panel glass-panel-hover rounded-2xl p-6">
               <div className="flex items-center gap-2 text-gray-400 font-mono text-xs tracking-widest mb-6 uppercase">
                  <Brain size={14} className="text-purple-400" /> AI Agent Swarm Status
               </div>

               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                     { label: 'LOGISTICS', code: 'PLS', status: 'Standby', color: 'text-blue-400', bg: 'bg-blue-500' },
                     { label: 'OPTIMIZER', code: 'KPO', status: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500' },
                     { label: 'TRAINER', code: 'SOP', status: 'Ready', color: 'text-purple-400', bg: 'bg-purple-500' },
                     { label: 'FORECAST', code: 'PLN', status: 'Sleep', color: 'text-amber-400', bg: 'bg-amber-500' },
                     { label: 'ENGINEER', code: 'PRF', status: 'Manual', color: 'text-rose-400', bg: 'bg-rose-500' },
                  ].map((agent) => (
                     <div key={agent.code} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start">
                           <span className={`text-[10px] font-bold ${agent.color} font-mono`}>{agent.code}</span>
                           <div className={`w-1.5 h-1.5 rounded-full ${agent.bg} shadow-[0_0_8px] ${agent.color}`}></div>
                        </div>
                        <div className="text-xs font-bold text-gray-300">{agent.label}</div>
                        <div className="text-[10px] text-gray-500 font-mono uppercase">{agent.status}</div>
                     </div>
                  ))}
               </div>
            </div>

            {/* 4. METRICS ROW (Bottom) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel glass-panel-hover rounded-2xl p-6">
               <div className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center gap-2">
                  <Activity size={14} /> Labor Efficiency
               </div>
               <div className="text-4xl font-mono font-bold text-white">22.0%</div>
               <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                  <div className="bg-brand w-[22%] h-full shadow-[0_0_10px_#84cc16]"></div>
               </div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel glass-panel-hover rounded-2xl p-6">
               <div className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center gap-2">
                  <TrendingDown size={14} /> OpEx Ratio
               </div>
               <div className="text-4xl font-mono font-bold text-white">$48k</div>
               <div className="text-xs text-gray-500 mt-2 font-mono">MONTHLY RUN RATE</div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel glass-panel-hover rounded-2xl p-6">
               <div className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center gap-2">
                  <Award size={14} className="text-brand" /> Loyalty Base
               </div>
               <div className="text-4xl font-mono font-bold text-white">{loyaltySummary.totalMembers}</div>
               <div className="text-[10px] text-emerald-400 mt-2 font-mono">+{loyaltySummary.recentEnrollments} IN LAST 30D</div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel glass-panel-hover rounded-2xl p-6 flex items-center justify-between">
               <div>
                  <div className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center gap-2">
                     <Package size={14} /> Inventory
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">{inventory.length} SKUs</div>
               </div>
               <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-brand flex items-center justify-center">
                  <span className="font-mono text-[10px] font-bold text-brand">92%</span>
               </div>
            </div>

         </div>
      </div>
   );
};

// --- WRAPPERS FOR OTHER VIEWS (Apply Glass Theme) ---

const GlassViewWrapper = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
   <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-8 flex items-center gap-3">
         <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Icon className="text-brand" size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            <div className="h-0.5 w-12 bg-brand mt-1 shadow-[0_0_10px_#84cc16]"></div>
         </div>
      </div>
      <div className="glass-panel rounded-3xl p-1 overflow-hidden">
         {children}
      </div>
   </div>
);

// Reuse existing logic but wrap in new styling
const FinanceView = () => {
   const { metrics, vendorInvoices, accountsReceivable } = FINANCIAL_MOCK_DATA;
   const { paymentGateway, deliveryPartners } = INTEGRATION_MOCK_DATA;
   const [activeTab, setActiveTab] = useState<'overview' | 'integrations'>('overview');

   return (
      <GlassViewWrapper title="Finance & Strategy" icon={Scale}>
         {/* Tab Navigation */}
         <div className="flex gap-4 px-6 pt-6 pb-2 border-b border-white/10">
            <button
               onClick={() => setActiveTab('overview')}
               className={`px-4 py-2 text-sm font-bold font-mono tracking-wide rounded-t-lg transition-colors ${activeTab === 'overview' ? 'text-brand border-b-2 border-brand bg-white/5' : 'text-gray-500 hover:text-white'}`}
            >
               DASHBOARD & LEDGER
            </button>
            <button
               onClick={() => setActiveTab('integrations')}
               className={`px-4 py-2 text-sm font-bold font-mono tracking-wide rounded-t-lg transition-colors ${activeTab === 'integrations' ? 'text-brand border-b-2 border-brand bg-white/5' : 'text-gray-500 hover:text-white'}`}
            >
               INTEGRATIONS & SETTLEMENT
            </button>
         </div>

         <div className="p-6">
            {activeTab === 'overview' ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h3 className="font-mono text-sm text-gray-400 uppercase">Accounts Payable</h3>
                     <div className="space-y-2">
                        {vendorInvoices.map(inv => (
                           <div key={inv.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                              <div>
                                 <div className="font-bold text-gray-200">{inv.supplier}</div>
                                 <div className="text-xs text-gray-500 font-mono">{inv.dueDate}</div>
                              </div>
                              <div className="text-right">
                                 <div className="font-mono font-bold text-white">${inv.amount.toLocaleString()}</div>
                                 <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${inv.status === 'Overdue' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{inv.status}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <h3 className="font-mono text-sm text-gray-400 uppercase">Accounts Receivable</h3>
                     <div className="space-y-2">
                        {accountsReceivable.map(inv => (
                           <div key={inv.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                              <div>
                                 <div className="font-bold text-gray-200">{inv.partner}</div>
                                 <div className="text-xs text-gray-500 font-mono">{inv.dueDate}</div>
                              </div>
                              <div className="text-right">
                                 <div className="font-mono font-bold text-white">${inv.amount.toLocaleString()}</div>
                                 <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{inv.status}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Payment Gateway Block */}
                  <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center gap-2 text-brand font-mono text-xs uppercase mb-4">
                           <CreditCard size={14} /> Merchant Gateway
                        </div>
                        <div className="flex items-center justify-between mb-6">
                           <span className="text-2xl font-bold text-white">{paymentGateway.provider}</span>
                           <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/10">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                              <span className="text-[10px] font-bold uppercase">{paymentGateway.status}</span>
                           </div>
                        </div>
                        <div className="space-y-3 font-mono text-sm text-gray-400">
                           <div className="flex justify-between">
                              <span>Payout Freq:</span>
                              <span className="text-white">{paymentGateway.payoutFrequency}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>Last Payout:</span>
                              <span className="text-white">{paymentGateway.lastPayoutDate}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>Amount:</span>
                              <span className="text-white">${paymentGateway.lastPayoutAmount.toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                     <button className="mt-8 w-full py-3 bg-brand/10 text-brand border border-brand/20 rounded-xl hover:bg-brand/20 transition-all font-bold text-sm flex items-center justify-center gap-2">
                        <RefreshCw size={16} /> Process Settlement Webhooks
                     </button>
                  </div>

                  {/* Delivery Partners Table */}
                  <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                     <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase">
                           <Globe size={14} /> Delivery Logistics API
                        </div>
                        <div className="text-xs text-gray-500 font-mono">Sync Interval: 15m</div>
                     </div>
                     <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-black/20 text-gray-500 font-mono text-xs uppercase">
                           <tr>
                              <th className="p-4">Partner</th>
                              <th className="p-4">API Status</th>
                              <th className="p-4">Sync State</th>
                              <th className="p-4">Commission</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {deliveryPartners.map((partner) => {
                              const hasError = partner.lastError && partner.lastError !== "None";
                              return (
                                 <tr key={partner.name} className={`hover:bg-white/5 transition-colors ${hasError ? 'bg-red-500/5' : ''}`}>
                                    <td className="p-4 font-bold text-white">{partner.name}</td>
                                    <td className="p-4">
                                       <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase border ${hasError ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                          {partner.apiStatus}
                                       </div>
                                       {hasError && <div className="text-[10px] text-red-400 mt-1 font-mono">{partner.lastError}</div>}
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gray-400">{partner.menuSyncStatus}</td>
                                    <td className="p-4 font-mono text-white">{(partner.commissionRate * 100).toFixed(0)}%</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}
         </div>
      </GlassViewWrapper>
   );
};

const IntelligenceView = () => {
   const [activeAgentCode, setActiveAgentCode] = useState('BKP');
   const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([
      { role: 'agent', text: 'AI Bookkeeper Online. How can I help you analyze financials today?' }
   ]);
   const [input, setInput] = useState('');
   const [isThinking, setIsThinking] = useState(false);

   const handleSend = async () => {
      if (!input.trim() || isThinking) return;

      const newMessages: { role: 'user' | 'agent', text: string }[] = [
         ...messages,
         { role: 'user', text: input }
      ];
      setMessages(newMessages);
      setInput('');
      setIsThinking(true);

      const response = await ApiClient.chatAgent(newMessages, activeAgentCode);

      setMessages(prev => [...prev, { role: 'agent', text: response }]);
      setIsThinking(false);
   };

   const agents = [
      { name: 'AI Bookkeeper', code: 'BKP', status: activeAgentCode === 'BKP' ? 'Interactive' : 'Standby', color: activeAgentCode === 'BKP' ? 'text-brand' : 'text-gray-500' },
      { name: 'Pred. Forecaster', code: 'FCT', status: activeAgentCode === 'FCT' ? 'Interactive' : 'Standby', color: activeAgentCode === 'FCT' ? 'text-emerald-400' : 'text-gray-500' },
      { name: 'SOP Trainer', code: 'SOP', status: activeAgentCode === 'SOP' ? 'Interactive' : 'Standby', color: activeAgentCode === 'SOP' ? 'text-purple-400' : 'text-gray-500' },
   ];

   const handleAgentSwitch = (code: string, name: string) => {
      setActiveAgentCode(code);
      setMessages([{ role: 'agent', text: `${name} Online. Ready for your queries.` }]);
   };

   return (
      <GlassViewWrapper title="Hyphae Intelligence" icon={Brain}>
         <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
            {/* Sidebar for Agents */}
            <div className="border-r border-white/10 p-6 space-y-4 bg-black/20">
               <div className="text-xs font-mono text-gray-500 uppercase mb-4">Active Neural Nets</div>
               {agents.map((a, i) => (
                  <div
                     key={i}
                     onClick={() => handleAgentSwitch(a.code, a.name)}
                     className={`p-4 rounded-xl border border-white/5 cursor-pointer transition-colors ${a.status === 'Interactive' ? 'bg-white/10 border-brand/20' : 'bg-transparent hover:bg-white/5'}`}
                  >
                     <div className="flex justify-between items-center">
                        <span className={`font-bold ${a.status === 'Interactive' ? 'text-white' : 'text-gray-400'}`}>{a.name}</span>
                        <div className={`w-2 h-2 rounded-full ${a.status === 'Interactive' ? 'bg-brand shadow-[0_0_10px_rgba(202,240,49,0.5)]' : 'bg-gray-700'}`}></div>
                     </div>
                     <div className={`text-xs font-mono mt-1 ${a.color}`}>{a.status}</div>
                  </div>
               ))}
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2 flex flex-col bg-black/40 h-full overflow-hidden relative">
               <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-0 scroll-smooth" id="chat-scroll-container">
                  {messages.map((m, i) => (
                     <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-brand/20 text-brand-glow border border-brand/20' : 'bg-white/5 text-gray-300 border border-white/5'}`}>
                           <div className="text-[10px] font-mono opacity-50 mb-1 uppercase">{m.role}</div>
                           {m.text.split('\n').map((line, l) => (
                              <div key={l} className={l > 0 ? 'mt-1' : ''}>{line}</div>
                           ))}
                        </div>
                     </div>
                  ))}
                  {/* Invisible anchor for auto-scroll */}
                  <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
               </div>
               <div className="p-4 border-t border-white/10 bg-white/5 shrink-0 z-10">
                  <div className="flex gap-2">
                     <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={isThinking}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50 font-mono text-sm disabled:opacity-50"
                        placeholder={`Query ${agents.find(a => a.code === activeAgentCode)?.name}...`}
                     />
                     <button onClick={handleSend} disabled={isThinking} className="p-3 bg-brand/20 text-brand rounded-xl border border-brand/20 hover:bg-brand/30 transition-colors disabled:opacity-50">
                        <Send size={20} />
                     </button>
                  </div>
               </div>
               <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between shrink-0 z-10 items-center">
                  <div className="text-xs text-gray-500 font-mono">
                     {isThinking ? '🧠 Neural Net analyzing...' : 'System Idle'}
                  </div>
                  <button
                     onClick={async () => {
                        handleAgentSwitch('FCT', 'Pred. Forecaster');
                        setMessages([{ role: 'user', text: "Run Predictive Prep List Forecast" }]);
                        setIsThinking(true);
                        try {
                           const report = await ApiClient.getForecast();
                           setMessages(prev => [...prev, { role: 'agent', text: report }]);
                        } catch (e) {
                           setMessages(prev => [...prev, { role: 'agent', text: "Forecast Failed: Backend unavailable." }]);
                        } finally {
                           setIsThinking(false);
                        }
                     }}
                     disabled={isThinking}
                     className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 disabled:opacity-50 border border-emerald-400/20 px-3 py-1.5 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20"
                  >
                     <Zap size={14} /> RUN PREDICTIVE FORECAST
                  </button>
               </div>
            </div>
         </div>
      </GlassViewWrapper>
   );
};

const ProductConfigView = () => {
   const [products, setProducts] = useState<Product[]>([]);
   const [trash, setTrash] = useState<Product[]>([]);
   const [recipes, setRecipes] = useState<RecipeDefinition[]>([]);
   const [inventory, setInventory] = useState<InventoryItem[]>([]);
   const [concepts, setConcepts] = useState<Concept[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);

   const [selectedConceptId, setSelectedConceptId] = useState<string>('');
   const [showTrash, setShowTrash] = useState(false);
   const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
   const [loading, setLoading] = useState(true);

   const loadAllData = async () => {
      setLoading(true);
      const [p, t, r, i, c, cats] = await Promise.all([
         ApiClient.getProducts(),
         ApiClient.getTrash(),
         ApiClient.getRecipes(),
         ApiClient.getInventory(),
         ApiClient.getConcepts(),
         ApiClient.getCategories()
      ]);
      setProducts(p && p.length > 0 ? p : MOCK_DATA.products);
      setTrash(t || []);
      setRecipes(r || []);
      setInventory(i || []);
      setConcepts(c && c.length > 0 ? c : MOCK_DATA.concepts);
      setCategories(cats && cats.length > 0 ? cats : MOCK_DATA.categories);

      if (c && c.length > 0 && !selectedConceptId) {
         setSelectedConceptId(c[0].id);
      } else if (!c || c.length === 0) {
         setSelectedConceptId(MOCK_DATA.concepts[0].id);
      }
      setLoading(false);
   };

   useEffect(() => {
      loadAllData();
   }, []);

   const handleSave = async (updatedProducts: Product[]) => {
      // Update local states immediately for responsive UI
      setProducts(prev => prev.map(p => {
         const updated = updatedProducts.find(u => u.id === p.id);
         return updated || p;
      }));

      setTrash(prev => prev.map(p => {
         const updated = updatedProducts.find(u => u.id === p.id);
         return updated || p;
      }));

      // Handle new products added in the builder (always start as active)
      const isNew = (u: Product) => !products.find(p => p.id === u.id) && !trash.find(p => p.id === u.id);
      const newProducts = updatedProducts.filter(isNew);

      if (newProducts.length > 0) {
         setProducts(prev => [...prev, ...newProducts]);
      }

      // Sync with API - send the complete set of known items
      // We combine current products, trash, and any new ones, applying updates
      const allProducts = [...products, ...trash, ...newProducts].map(p => {
         const updated = updatedProducts.find(u => u.id === p.id);
         return updated || p;
      });

      await ApiClient.updateProducts(allProducts);
   };

   const handleDelete = async (productId: string) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      await ApiClient.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setTrash(prev => [...prev, product]);
   };

   const handleRestore = async (productId: string) => {
      const product = trash.find(p => p.id === productId);
      if (!product) return;

      await ApiClient.restoreProduct(productId);
      setTrash(prev => prev.filter(p => p.id !== productId));
      setProducts(prev => [...prev, product]);
   };

   const handlePermanentDelete = async (productId: string) => {
      if (!confirm('PERMANENTLY DELETE FROM ARCHIVES? This cannot be undone.')) return;
      await ApiClient.permanentlyDeleteProduct(productId);
      setTrash(prev => prev.filter(p => p.id !== productId));
   };

   if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-brand font-mono animate-pulse">Initializing Knowledge Base...</div>;

   const activeConcept = concepts.find(c => c.id === selectedConceptId) || concepts[0];
   const conceptCategories = categories.filter(c => c.conceptId === selectedConceptId);

   const currentItems = showTrash ? trash : products;
   const filteredProducts = currentItems.filter(p =>
      conceptCategories.some(cat => cat.id === p.categoryId)
   );

   return (
      <div className="p-6 pt-24 pb-12 max-w-[1600px] mx-auto min-h-screen">
         <div className="flex items-center justify-between mb-8">
            {/* Concept Switcher */}
            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5 w-fit">
               {concepts.map(c => (
                  <button
                     key={c.id}
                     onClick={() => {
                        setSelectedConceptId(c.id);
                        setShowTrash(false);
                     }}
                     className={`px-6 py-2.5 rounded-xl font-black text-xs tracking-widest transition-all ${selectedConceptId === c.id && !showTrash
                        ? `bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10`
                        : 'text-gray-500 hover:text-gray-300'}`}
                  >
                     {c.name.toUpperCase()}
                  </button>
               ))}
               <button
                  onClick={() => setIsConceptModalOpen(true)}
                  className="px-3 py-2 rounded-xl text-gray-500 hover:text-white border border-dashed border-white/20 hover:border-white/50 transition-colors ml-2"
                  title="Manage Modes & Categories"
               >
                  <Settings size={16} />
               </button>
            </div>

            <button
               onClick={() => setShowTrash(!showTrash)}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs tracking-widest transition-all border ${showTrash
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-black/40 text-gray-500 border-white/5 hover:text-gray-300'}`}
            >
               <span className="relative flex h-2 w-2">
                  {trash.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${trash.length > 0 ? 'bg-red-500' : 'bg-gray-700'}`}></span>
               </span>
               {showTrash ? 'VIEW ACTIVE MENU' : 'RECYCLE BIN'}
            </button>
         </div>

         <ProductBuilder
            products={filteredProducts}
            onSave={handleSave}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            isTrashMode={showTrash}
            categories={conceptCategories}
            recipes={recipes}
            inventory={inventory}
            activeConcept={activeConcept}
         />

         <ConceptManagerModal
            isOpen={isConceptModalOpen}
            onClose={() => setIsConceptModalOpen(false)}
            onConceptUpdated={loadAllData}
         />
      </div>
   );
};

// InventoryView moved to ./views/InventoryView.tsx

const DevicesView = ({ devices }: { devices: DeviceState[] }) => (
   <GlassViewWrapper title="Device Fleet" icon={Server}>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
         {devices.map(d => (
            <div key={d.id} className="bg-black/30 border border-white/10 rounded-xl p-6 flex items-center gap-4">
               <div className={`p-3 rounded-full ${d.status === 'online' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  <Wifi size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-white">{d.name}</h3>
                  <div className="text-xs text-gray-500 font-mono mt-1">BATTERY: {d.batteryLevel}% | VERSION: {d.appVersion}</div>
               </div>
            </div>
         ))}
      </div>
   </GlassViewWrapper>
);

// --- MAIN APP ---

const App = () => {
   const [activeView, setView] = useState('dashboard');
   const [isDark, setIsDark] = useState(true);

   // MOCK DATA INJECTION
   const [products] = useState<Product[]>(MOCK_DATA.products);
   const [inventory] = useState<InventoryItem[]>(MOCK_DATA.inventory);
   const [recipes] = useState<RecipeDefinition[]>(RECIPE_MOCK_DATA);
   const [transactions] = useState<TransactionRecord[]>([
      { id: 't1', posId: 'POS-01', timestamp: new Date().toISOString(), items: [], total: 120.00, paymentMethod: 'card', status: 'completed' },
      { id: 't2', posId: 'POS-01', timestamp: new Date().toISOString(), items: [], total: 65.00, paymentMethod: 'qr', status: 'completed' },
   ]);
   const [devices] = useState<DeviceState[]>([
      { id: 'd1', name: 'Counter iPad 01', type: 'POS', status: 'online', lastHeartbeat: new Date().toISOString(), batteryLevel: 82, appVersion: '1.2.0', currentMenuVersion: 'v1.2.4', pendingUploads: 0 },
      { id: 'd2', name: 'Kitchen KDS', type: 'KDS', status: 'online', lastHeartbeat: new Date().toISOString(), batteryLevel: 100, appVersion: '1.2.0', currentMenuVersion: 'v1.2.4', pendingUploads: 0 },
   ]);

   const onlineCount = devices.filter(d => d.status === 'online').length;

   useEffect(() => {
      // Force dark mode for HUD aesthetic
      document.documentElement.classList.add('dark');
   }, []);

   const handleSaveProducts = async (updatedProducts: Product[]) => {
      // In a real app, this would be an API call
      console.log('Saving products:', updatedProducts);
      // setProducts(updatedProducts); // If we had a setter, but we only have initial state rn
   };

   return (
      <ErrorBoundary>
         <div className="min-h-screen text-gray-200 selection:bg-brand selection:text-black font-sans">
            <NavigationHeader activeView={activeView} setView={setView} devices={devices} />

            <main className="relative z-0">
               {activeView === 'dashboard' && <DashboardView transactions={transactions} products={products} inventory={inventory} />}
               {activeView === 'finance' && <FinanceView />}
               {activeView === 'intelligence' && <IntelligenceView />}
               {activeView === 'products' && (
                  <ProductConfigView />
               )}
               {activeView === 'inventory' && <InventoryView />}
               {activeView === 'kitchen' && <RecipesView />}
               {activeView === 'suppliers' && <SuppliersView />}
               {activeView === 'forecast' && <ForecastView />}
               {activeView === 'devices' && <DevicesView devices={devices} />}
            </main>
         </div>
      </ErrorBoundary>
   );
};

export default App;