import { useState } from 'react';
import { Header, Navigation } from './components/layout.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FlightControl } from './components/flight-control';
import { InventoryDashboard } from './components/inventory/dashboard';
import { ReceivingForm } from './components/inventory/receiving';
import { InventoryTransfer } from './components/inventory/transfer';
import { RecipesList } from './components/RecipesList';
import { OrderView } from './components/orders/OrderView';

function App() {
  const [activeRoute, setActiveRoute] = useState<string>('prep');

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-ink-100 text-white font-sans selection:bg-teal-mid selection:text-white">
        <Header status="active" />

        <main className="pt-16 pb-20 px-4 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden">
          {activeRoute === 'prep' && <FlightControl />}
          {activeRoute === 'kds' && <OrderView />}
          {activeRoute === 'inventory' && <InventoryDashboard />}
          {activeRoute === 'receiving' && <div className="p-4 h-full flex items-center justify-center"><ReceivingForm /></div>}
          {activeRoute === 'transfer' && <InventoryTransfer />}
          {activeRoute === 'recipes' && <RecipesList />}
          {activeRoute === 'ops' && <div className="p-10 text-center text-gray-400">Ops/Shift Log (Coming Phase 4)</div>}
        </main>

        <Navigation
          currentRoute={activeRoute as any}
          onNavigate={(route) => setActiveRoute(route)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
