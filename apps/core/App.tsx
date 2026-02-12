import React, { useState, useEffect } from 'react';
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
  Recipe, 
  FinancialMetrics, 
  VendorInvoice, 
  AccountsReceivableItem,
  PaymentGatewayConfig,
  DeliveryPartnerConfig
} from './types/schema';
import { GeminiService } from './lib/gemini';
import { InventoryService } from './lib/inventory';

// --- MOCK DATA (Code B-Smash) ---
const MOCK_DATA = {
  concepts: [
    { id: 'cbs_01', name: 'Code B-Smash', color: 'orange-500', flowType: 'sequential' }
  ] as Concept[],
  categories: [
    { id: 'cat_burgers', name: 'Smash Burgers', conceptId: 'cbs_01' },
    { id: 'cat_sides', name: 'Sides', conceptId: 'cbs_01' }
  ],
  products: [
    {
      id: 'item_compiler',
      name: 'The Compiler',
      price: 120.00,
      categoryId: 'cat_burgers',
      requiresMods: true,
      stock: 100,
      metadata: { kitchenLabel: 'Compiler' },
      inventoryMetadata: { recipeId: 'recipe_compiler_burger' },
      active: true,
      stationId: 'station_grill',
      timeMetadata: { cookTimeSeconds: 240, activePrepTimeSeconds: 45 },
      logisticsMetadata: { volumetricScore: 4, requiresContainer: true, packagingDims: [15, 15, 8] },
      prepBatchSize: 10,
      costOfGoods: 3.50,
      recipeText: "1. Portion beef to 70g balls..."
    },
    {
      id: 'item_recursive',
      name: 'Recursive Onion',
      price: 110.00,
      categoryId: 'cat_burgers',
      requiresMods: true,
      stock: 50,
      metadata: { kitchenLabel: 'Rec Onion' },
      active: true,
      stationId: 'station_grill',
      timeMetadata: { cookTimeSeconds: 300, activePrepTimeSeconds: 60 },
      logisticsMetadata: { volumetricScore: 5, requiresContainer: true, packagingDims: [15, 15, 10] },
      prepBatchSize: 8,
      costOfGoods: 2.90,
      recipeText: "1. Slice onions paper thin..."
    },
    {
      id: 'item_sweet_fries',
      name: 'Sweet Potato Arrays',
      price: 65.00,
      categoryId: 'cat_sides',
      requiresMods: false,
      metadata: { kitchenLabel: 'Swt Pot Fry' },
      inventoryMetadata: { recipeId: 'recipe_sweet_fries' },
      active: true,
      stationId: 'station_fryer',
      timeMetadata: { cookTimeSeconds: 180, activePrepTimeSeconds: 15 },
      logisticsMetadata: { volumetricScore: 3, requiresContainer: true, packagingDims: [10, 8, 12] },
      prepBatchSize: 20,
      costOfGoods: 0.85,
      recipeText: "1. Cut potatoes into 1/4 inch strips..."
    }
  ] as Product[],
  inventory: [
    { id: 'inv_beef', name: 'Ground Beef 70/30', stockUnit: 'kg', parLevel: 10, currentStock: 12.5, costPerUnit: 12.50, state: 'RAW' },
    { id: 'inv_bun', name: 'Tangzhong Buns', stockUnit: 'pcs', parLevel: 24, currentStock: 8, costPerUnit: 0.80, state: 'RAW' }, 
    { id: 'inv_cheese', name: 'American Cheese', stockUnit: 'slices', parLevel: 50, currentStock: 45, costPerUnit: 0.20, state: 'RAW' },
    { id: 'inv_sauce_house', name: 'B-Smash Sauce', stockUnit: 'kg', parLevel: 5, currentStock: 4, costPerUnit: 8.00, state: 'PREP' },
    { id: 'inv_onion', name: 'White Onions', stockUnit: 'kg', parLevel: 10, currentStock: 9, costPerUnit: 2.00, state: 'RAW' },
    { id: 'inv_sweet_potato', name: 'Sweet Potatoes (Cut)', stockUnit: 'kg', parLevel: 15, currentStock: 14, costPerUnit: 4.50, state: 'PREP' },
    { id: 'inv_fry_oil', name: 'Fryer Oil Blend', stockUnit: 'liters', parLevel: 20, currentStock: 18, costPerUnit: 3.00, state: 'RAW' }
  ] as InventoryItem[]
};

const RECIPE_MOCK_DATA: Recipe[] = [
  {
    productId: 'item_compiler',
    name: 'The Compiler Recipe',
    stationId: 'station_grill',
    cookTimeSeconds: 240, 
    activePrepTimeSeconds: 45, 
    volumetricScore: 4, 
    components: [
      { inventoryId: 'inv_beef', quantity: 0.140, unit: 'kg' }, 
      { inventoryId: 'inv_bun', quantity: 1, unit: 'pcs' },
      { inventoryId: 'inv_cheese', quantity: 2, unit: 'slices' },
      { inventoryId: 'inv_sauce_house', quantity: 0.030, unit: 'kg' }
    ]
  },
  {
    productId: 'item_recursive',
    name: 'Recursive Onion Recipe',
    stationId: 'station_grill',
    cookTimeSeconds: 300, 
    activePrepTimeSeconds: 60,
    volumetricScore: 5, 
    components: [
      { inventoryId: 'inv_beef', quantity: 0.100, unit: 'kg' }, 
      { inventoryId: 'inv_onion', quantity: 0.080, unit: 'kg' }, 
      { inventoryId: 'inv_bun', quantity: 1, unit: 'pcs' },
      { inventoryId: 'inv_cheese', quantity: 1, unit: 'slices' }
    ]
  },
  {
    productId: 'item_sweet_fries',
    name: 'Sweet Potato Fry Recipe',
    stationId: 'station_fryer',
    cookTimeSeconds: 180, 
    activePrepTimeSeconds: 15, 
    volumetricScore: 3,
    components: [
      { inventoryId: 'inv_sweet_potato', quantity: 0.200, unit: 'kg' },
      { inventoryId: 'inv_fry_oil', quantity: 0.010, unit: 'liters' }
    ]
  }
];

const FINANCIAL_MOCK_DATA = {
  metrics: {
    totalRevenueMXN: 145000.00,
    totalTaxCollectedMXN: 20000.00,
    grossProfitMargin: 0.65,
    laborCostPercent: 0.22,
    totalExpensesMXN: 48000.00
  } as FinancialMetrics,
  vendorInvoices: [
    { id: 'ap_001', supplier: 'Premium Meat Co.', amount: 12500.00, dueDate: '2025-12-13', status: 'Pending' },
    { id: 'ap_002', supplier: 'Local Produce Vendor', amount: 5750.00, dueDate: '2025-12-02', status: 'Overdue' }
  ] as VendorInvoice[],
  accountsReceivable: [
    { id: 'ar_001', partner: 'Uber Eats', amount: 3500.00, dueDate: '2025-12-05', status: 'Pending' },
    { id: 'ar_002', partner: 'Catering Client A', amount: 2000.00, dueDate: '2025-12-20', status: 'Pending' }
  ] as AccountsReceivableItem[]
};

const INTEGRATION_MOCK_DATA = {
  paymentGateway: {
    provider: "Stripe",
    status: "Active",
    liveApiKey: "sk_live_***********",
    payoutFrequency: "Daily",
    lastPayoutDate: "2025-12-01",
    lastPayoutAmount: 1845.20,
  } as PaymentGatewayConfig,
  deliveryPartners: [
    {
      name: "Uber Eats",
      apiStatus: "Active",
      menuSyncStatus: "In Sync (4:30 PM CST)",
      commissionRate: 0.30,
      lastError: "None",
      partnerToken: "uber_tok_*******",
    },
    {
      name: "DoorDash",
      apiStatus: "Scheduled Maintenance",
      menuSyncStatus: "Pending Sync",
      commissionRate: 0.25,
      lastError: "401: Invalid Credentials",
      partnerToken: "dash_tok_*******",
    }
  ] as DeliveryPartnerConfig[]
};

// MOCK DATA for the Financial Health Card
const FINANCIAL_HEALTH = {
  totalRevenueMXN: 145000.00,
  grossProfitMargin: 0.65, // 65%
  totalTaxCollectedMXN: 20000.00,
  overdueAPAlert: 5750.00, // Overdue Accounts Payable
  pendingARAlert: 3500.00, // Pending Accounts Receivable (Uber Eats)
  topSellerName: "The Compiler (Classic)",
  topSellerCount: 385 // Operational Metric (units sold)
};

// --- COMPONENTS ---

// 1. Navigation Header Rail (Top)
const NavigationHeader = ({ 
  activeView, 
  setView, 
  onlineCount 
}: { 
  activeView: string, 
  setView: (v: string) => void, 
  onlineCount: number 
}) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'intelligence', icon: Brain, label: 'AI Hub' },
    { id: 'finance', icon: Scale, label: 'Finance' },
    { id: 'products', icon: UtensilsCrossed, label: 'Product Config' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'devices', icon: Server, label: 'Fleet' },
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
      <nav className="flex items-center gap-1">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${
                isActive 
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
      </nav>

      {/* Right: System Status */}
      <div className="flex items-center justify-end gap-4 w-48">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Wifi size={14} className={onlineCount > 0 ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-red-500"} />
          <span className="text-xs font-mono font-bold text-gray-300">{onlineCount} UNITS</span>
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

        <div className="col-span-12 md:col-span-12 lg:col-span-6 glass-panel glass-panel-hover rounded-2xl p-6 flex items-center justify-between">
            <div>
               <div className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center gap-2">
                 <Package size={14} /> Inventory Health
               </div>
               <div className="text-4xl font-mono font-bold text-white">{inventory.length} SKUs</div>
               <div className="text-xs text-gray-500 mt-1 font-mono">TOTAL TRACKED ITEMS</div>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-white/10 border-t-brand flex items-center justify-center">
               <span className="font-mono font-bold text-brand">92%</span>
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
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string}[]>([
    { role: 'agent', text: 'Trainer Agent Online. RAG System Active.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setTimeout(() => {
        setMessages(prev => [...prev, { role: 'agent', text: "Accessing SOP Database... \n\n[MOCK] Cleaning Protocol 713 retrieved." }]);
    }, 800);
    setInput('');
  };

  return (
    <GlassViewWrapper title="Hyphae Intelligence" icon={Brain}>
       <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
          {/* Sidebar for Agents */}
          <div className="border-r border-white/10 p-6 space-y-4 bg-black/20">
             <div className="text-xs font-mono text-gray-500 uppercase mb-4">Active Neural Nets</div>
             {[
               { name: 'Kitchen Optimizer', code: 'KPO', status: 'Active', color: 'text-emerald-400' },
               { name: 'Logistics', code: 'PLS', status: 'Standby', color: 'text-blue-400' },
               { name: 'Trainer', code: 'SOP', status: 'Interactive', color: 'text-purple-400' },
             ].map((a, i) => (
               <div key={i} className={`p-4 rounded-xl border border-white/5 ${a.status === 'Interactive' ? 'bg-white/10 border-brand/20' : 'bg-transparent'}`}>
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-200">{a.name}</span>
                    <div className={`w-2 h-2 rounded-full ${a.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <div className={`text-xs font-mono mt-1 ${a.color}`}>{a.status}</div>
               </div>
             ))}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col bg-black/40">
             <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-brand/20 text-brand-glow border border-brand/20' : 'bg-white/5 text-gray-300 border border-white/5'}`}>
                      <div className="text-[10px] font-mono opacity-50 mb-1 uppercase">{m.role}</div>
                      {m.text}
                    </div>
                  </div>
                ))}
             </div>
             <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-2">
                  <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50 font-mono text-sm"
                    placeholder="Query Vector Database..."
                  />
                  <button onClick={handleSend} className="p-3 bg-brand/20 text-brand rounded-xl border border-brand/20 hover:bg-brand/30 transition-colors">
                    <Send size={20} />
                  </button>
                </div>
             </div>
          </div>
       </div>
    </GlassViewWrapper>
  );
};

const ProductConfigView = ({ products, recipes, inventory }: { products: Product[], recipes: Recipe[], inventory: InventoryItem[] }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'production'>('sales');

  // Helper to find data
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedRecipe = recipes.find(r => r.productId === selectedProductId);

  // Helper to get inventory details for display in Production Tab
  const getIngredientDetails = (invId: string) => {
    return inventory.find(i => i.id === invId);
  };

  if (selectedProductId && selectedProduct) {
    // DETAIL VIEW (Multi-Tab Item Editor)
    return (
      <GlassViewWrapper title="Product Configuration" icon={UtensilsCrossed}>
         <div className="bg-black/20 border-b border-white/10 px-6 py-4 flex items-center gap-4">
             <button onClick={() => setSelectedProductId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h3 className="font-bold text-xl text-white">{selectedProduct.name}</h3>
                <div className="text-xs text-gray-500 font-mono">Product ID: {selectedProduct.id}</div>
             </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-6 px-8 pt-4 border-b border-white/10">
            <button 
               onClick={() => setActiveTab('sales')} 
               className={`pb-3 text-sm font-bold font-mono tracking-wide transition-colors ${activeTab === 'sales' ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-white'}`}
            >
               SALES & PRICING
            </button>
            <button 
               onClick={() => setActiveTab('production')} 
               className={`pb-3 text-sm font-bold font-mono tracking-wide transition-colors ${activeTab === 'production' ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-white'}`}
            >
               PRODUCTION & COST
            </button>
         </div>

         <div className="p-8">
            {activeTab === 'sales' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                  {/* Sales Fields */}
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs text-gray-500 font-mono uppercase block mb-2">Display Name</label>
                        <input readOnly value={selectedProduct.name} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-bold" />
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 font-mono uppercase block mb-2">Retail Price ($)</label>
                        <input readOnly value={selectedProduct.price.toFixed(2)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono" />
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 font-mono uppercase block mb-2">Category</label>
                        <div className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-gray-400">{selectedProduct.categoryId}</div>
                     </div>
                  </div>
                  
                  {/* Status & Toggles */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-6">
                     <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold text-gray-200">POS Availability</span>
                        <div className={`w-12 h-6 rounded-full p-1 flex items-center ${selectedProduct.active ? 'bg-brand justify-end' : 'bg-gray-700 justify-start'}`}>
                           <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                        </div>
                     </div>
                     <div className="text-xs text-gray-500 font-mono">
                        Kitchen Label: <span className="text-white">{selectedProduct.metadata?.kitchenLabel}</span>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left: Recipe & Costing */}
                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-bold text-gray-300 uppercase font-mono">Explosion Logic (BOM)</h4>
                         <span className="text-xs text-gray-500">Based on Prep/Raw State</span>
                      </div>
                      
                      {selectedRecipe ? (
                         <div className="space-y-3">
                            {selectedRecipe.components.map((comp, idx) => {
                               const invDetails = getIngredientDetails(comp.inventoryId);
                               return (
                                  <div key={idx} className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                         <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${invDetails?.state === 'RAW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                            {invDetails?.state || 'UNK'}
                                         </div>
                                         <span className="text-sm text-gray-200">{invDetails?.name || comp.inventoryId}</span>
                                      </div>
                                      <div className="font-mono text-sm text-gray-400">
                                         {comp.quantity} {comp.unit}
                                      </div>
                                  </div>
                               );
                            })}
                         </div>
                      ) : (
                         <div className="p-8 border border-dashed border-white/20 rounded-xl text-center text-gray-500 text-sm">
                            No Recipe Linked. Costing unavailable.
                         </div>
                      )}

                      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                         <span className="text-sm font-bold text-gray-400">Theoretical Cost</span>
                         <span className="text-2xl font-mono font-bold text-white">${selectedProduct.costOfGoods?.toFixed(2)}</span>
                      </div>
                  </div>

                  {/* Right: Operational Config */}
                  <div className="bg-black/30 rounded-xl p-6 border border-white/10 space-y-6">
                      <h4 className="text-sm font-bold text-gray-300 uppercase font-mono flex items-center gap-2">
                         <Factory size={16} /> Kitchen Operations
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-[10px] text-gray-500 uppercase mb-1">Station Routing</div>
                            <div className="font-bold text-white">{selectedProduct.stationId}</div>
                         </div>
                         <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-[10px] text-gray-500 uppercase mb-1">Batch Size</div>
                            <div className="font-mono font-bold text-white">{selectedProduct.prepBatchSize || 1} Units</div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="text-[10px] text-gray-500 uppercase">Production Timing</div>
                         <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex">
                            <div style={{width: '20%'}} className="bg-blue-500 h-full"></div>
                            <div style={{width: '60%'}} className="bg-orange-500 h-full"></div>
                         </div>
                         <div className="flex justify-between text-xs font-mono text-gray-400">
                            <span className="text-blue-400">Prep: {selectedProduct.timeMetadata?.activePrepTimeSeconds}s</span>
                            <span className="text-orange-400">Cook: {selectedProduct.timeMetadata?.cookTimeSeconds}s</span>
                         </div>
                      </div>
                  </div>
               </div>
            )}
         </div>
      </GlassViewWrapper>
    );
  }

  // LIST VIEW
  return (
    <GlassViewWrapper title="Product Configuration" icon={UtensilsCrossed}>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {products.map(p => (
           <div 
             key={p.id} 
             onClick={() => setSelectedProductId(p.id)}
             className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:bg-white/10 hover:border-brand/30 transition-all"
           >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand/20 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
              <h3 className="font-bold text-white relative z-10 group-hover:text-brand transition-colors">{p.name}</h3>
              <div className="font-mono text-gray-300 text-lg font-bold mt-1">${p.price.toFixed(2)}</div>
              <div className="mt-4 flex gap-2">
                 {p.logisticsMetadata?.requiresContainer && (
                   <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/20">BOX REQ</span>
                 )}
                 <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-1 rounded border border-white/10">{p.metadata?.kitchenLabel}</span>
              </div>
           </div>
         ))}
      </div>
    </GlassViewWrapper>
  );
};

const InventoryView = ({ inventory }: { inventory: InventoryItem[] }) => (
  <GlassViewWrapper title="Inventory Core" icon={Package}>
     <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
           <thead className="bg-white/5 text-gray-500 font-mono text-xs uppercase">
              <tr>
                 <th className="p-4">Item Name</th>
                 <th className="p-4">State</th>
                 <th className="p-4">Stock</th>
                 <th className="p-4">Value</th>
                 <th className="p-4 text-right">Status</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                   <td className="p-4 font-medium text-white">{item.name}</td>
                   <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border ${item.state === 'RAW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                         {item.state}
                      </span>
                   </td>
                   <td className="p-4 font-mono">
                      {item.currentStock} <span className="text-gray-600">{item.stockUnit}</span>
                   </td>
                   <td className="p-4 font-mono text-gray-400">
                      ${(item.currentStock * item.costPerUnit).toFixed(2)}
                   </td>
                   <td className="p-4 text-right">
                      {item.currentStock <= (item.parLevel || 0) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">LOW</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/10">OK</span>
                      )}
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
     </div>
  </GlassViewWrapper>
);

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
  const [recipes] = useState<Recipe[]>(RECIPE_MOCK_DATA);
  const [transactions] = useState<TransactionRecord[]>([
    { id: 't1', posId: 'POS-01', timestamp: new Date().toISOString(), items: [], total: 120.00, paymentMethod: 'card', status: 'completed' },
    { id: 't2', posId: 'POS-01', timestamp: new Date().toISOString(), items: [], total: 65.00, paymentMethod: 'qr', status: 'completed' },
  ]);
  const [devices] = useState<DeviceState[]>([
    { id: 'd1', name: 'Counter iPad 01', status: 'online', lastHeartbeat: new Date().toISOString(), batteryLevel: 82, appVersion: '1.2.0', currentMenuVersion: 'v1.2.4', pendingUploads: 0 },
    { id: 'd2', name: 'Kitchen KDS', status: 'online', lastHeartbeat: new Date().toISOString(), batteryLevel: 100, appVersion: '1.2.0', currentMenuVersion: 'v1.2.4', pendingUploads: 0 },
  ]);

  const onlineCount = devices.filter(d => d.status === 'online').length;

  useEffect(() => {
    // Force dark mode for HUD aesthetic
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen text-gray-200 selection:bg-brand selection:text-black font-sans">
      <NavigationHeader activeView={activeView} setView={setView} onlineCount={onlineCount} />
      
      <main className="relative z-0">
        {activeView === 'dashboard' && <DashboardView transactions={transactions} products={products} inventory={inventory} />}
        {activeView === 'finance' && <FinanceView />}
        {activeView === 'intelligence' && <IntelligenceView />}
        {activeView === 'products' && <ProductConfigView products={products} recipes={recipes} inventory={inventory} />}
        {activeView === 'inventory' && <InventoryView inventory={inventory} />}
        {activeView === 'devices' && <DevicesView devices={devices} />}
      </main>
    </div>
  );
};

export default App;