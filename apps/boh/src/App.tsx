import { useState } from 'react';
import { Header, Navigation } from './components/layout';
import { FlightControl } from './components/flight-control';
import { InventoryDashboard } from './components/inventory/dashboard';
import { ReceivingForm } from './components/inventory/receiving';
// import { RecipesList } from './components/recipes'; // Planning

function App() {
  const [activeRoute, setActiveRoute] = useState<string>('prep');

  return (
    <div className="min-h-screen bg-ink-100 text-white font-sans selection:bg-teal-mid selection:text-white">
      <Header status="active" />

      <main className="pt-16 pb-20 px-4 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden">
        {activeRoute === 'prep' && <FlightControl />}
        {activeRoute === 'inventory' && <InventoryDashboard />}
        {activeRoute === 'receiving' && <div className="p-4 h-full flex items-center justify-center"><ReceivingForm /></div>}
        {activeRoute === 'recipes' && <div className="p-10 text-center text-gray-400">Recipe Library (Coming Phase 2.3)</div>}
        {activeRoute === 'ops' && <div className="p-10 text-center text-gray-400">Ops/Shift Log (Coming Phase 4)</div>}
      </main>

      <Navigation
        currentRoute={activeRoute as any}
        onNavigate={(route) => setActiveRoute(route)}
      />
    </div>
  );
}

export default App;
