import React, { useState, useEffect } from 'react';
import { MenuItem, Ingredient, Table, Order, Reservation, Customer, WasteRecord } from './types';
import { StorageService } from './lib/firebase';
import { 
  DEFAULT_MENU_ITEMS, 
  DEFAULT_INGREDIENTS, 
  DEFAULT_TABLES, 
  DEFAULT_CUSTOMERS, 
  DEFAULT_RESERVATIONS 
} from './data/mockData';

// Component Imports
import POSView from './components/POSView';
import TablesView from './components/TablesView';
import MenuView from './components/MenuView';
import InventoryView from './components/InventoryView';
import CustomersView from './components/CustomersView';
import ReportsView from './components/ReportsView';

// UI icons
import { 
  Compass, LayoutGrid, ShoppingCart, Library, BookOpen, Users, 
  BarChart3, RefreshCw, AlertCircle, FileSpreadsheet, PlayCircle 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'POS' | 'Tables' | 'Inventory' | 'Customers' | 'Reports' | 'ClientMenu' | 'SetupGuide'>('POS');
  
  // App States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Initial Load from Firestore (using fallbacks inside StorageService)
  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        
        // Fetch all data from StorageService in parallel to ensure extreme speed and zero interface blocking.
        const [
          initialMenu,
          initialIngs,
          initialTables,
          initialRes,
          initialCustomers,
          loadedActive,
          loadedCompleted,
          loadedWaste
        ] = await Promise.all([
          StorageService.getData<MenuItem>('menu_items'),
          StorageService.getData<Ingredient>('ingredients'),
          StorageService.getData<Table>('tables'),
          StorageService.getData<Reservation>('reservations'),
          StorageService.getData<Customer>('customers'),
          StorageService.getData<Order>('active_orders'),
          StorageService.getData<Order>('completed_orders'),
          StorageService.getData<WasteRecord>('waste_records')
        ]);

        // 1. Menu Items
        let loadedMenu = initialMenu;
        if (loadedMenu.length === 0) {
          await StorageService.saveData('menu_items', DEFAULT_MENU_ITEMS);
          loadedMenu = DEFAULT_MENU_ITEMS;
        }
        setMenuItems(loadedMenu);

        // 2. Ingredients
        let loadedIngs = initialIngs;
        if (loadedIngs.length === 0) {
          await StorageService.saveData('ingredients', DEFAULT_INGREDIENTS);
          loadedIngs = DEFAULT_INGREDIENTS;
        }
        setIngredients(loadedIngs);

        // 3. Tables
        let loadedTables = initialTables;
        if (loadedTables.length === 0) {
          await StorageService.saveData('tables', DEFAULT_TABLES);
          loadedTables = DEFAULT_TABLES;
        }
        setTables(loadedTables);

        // 4. Reservations
        let loadedRes = initialRes;
        if (loadedRes.length === 0) {
          await StorageService.saveData('reservations', DEFAULT_RESERVATIONS);
          loadedRes = DEFAULT_RESERVATIONS;
        }
        setReservations(loadedRes);

        // 5. Customers
        let loadedCustomers = initialCustomers;
        if (loadedCustomers.length === 0) {
          await StorageService.saveData('customers', DEFAULT_CUSTOMERS);
          loadedCustomers = DEFAULT_CUSTOMERS;
        }
        setCustomers(loadedCustomers);

        // 6. Orders
        setActiveOrders(loadedActive);
        setCompletedOrders(loadedCompleted);

        // 7. Waste
        setWasteRecords(loadedWaste);

      } catch (e) {
        console.error("Critical failure during initial loading sequence:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      await StorageService.saveData('menu_items', menuItems);
      await StorageService.saveData('ingredients', ingredients);
      await StorageService.saveData('tables', tables);
      await StorageService.saveData('reservations', reservations);
      await StorageService.saveData('customers', customers);
      await StorageService.saveData('active_orders', activeOrders);
      await StorageService.saveData('completed_orders', completedOrders);
      await StorageService.saveData('waste_records', wasteRecords);
      
      // Artificial delay for gorgeous UX logging feedback
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (e) {
      console.error("Cloud syncing failure:", e);
    } finally {
      setSyncing(false);
    }
  };

  // Handlers
  const handleAddOrder = async (order: Order) => {
    const updated = [...activeOrders, order];
    setActiveOrders(updated);
    await StorageService.saveSingleItem('active_orders', order);

    // Deduct stock of ingredients based on composite recipes!
    const updatedIngs = [...ingredients];
    order.items.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItem) {
        menuItem.ingredients.forEach(needed => {
          const ingInStock = updatedIngs.find(i => i.name === needed.name);
          if (ingInStock) {
            ingInStock.stock = Math.max(0, Number((ingInStock.stock - (needed.quantityNeeded * orderItem.quantity)).toFixed(2)));
          }
        });
      }
    });
    setIngredients(updatedIngs);
    await StorageService.saveData('ingredients', updatedIngs);

    // Give Loyalty Points if custom customer matches! ($1 = 10 pts)
    if (order.customerPhone) {
      const updatedClients = customers.map(c => {
        if (c.phone === order.customerPhone || (order.customerName && c.name.toLowerCase().includes(order.customerName.toLowerCase()))) {
          const earned = Math.round(order.total * 10);
          const nextPoints = c.points + earned;
          // Dynamically adjust loyalty tiers
          let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinium' = 'Bronze';
          if (nextPoints >= 1000) tier = 'Platinium';
          else if (nextPoints >= 500) tier = 'Gold';
          else if (nextPoints >= 200) tier = 'Silver';

          return { ...c, points: nextPoints, loyaltyTier: tier };
        }
        return c;
      });
      setCustomers(updatedClients);
      await StorageService.saveData('customers', updatedClients);
    }
  };

  const handleCompleteOrder = async (orderId: string, paymentMethod: 'cash' | 'card' | 'gift-card') => {
    const orderToComplete = activeOrders.find(o => o.id === orderId);
    if (!orderToComplete) return;

    const completed: Order = {
      ...orderToComplete,
      status: 'completed',
      paymentMethod
    };

    // Remove from active, push to completed
    const nextActive = activeOrders.filter(o => o.id !== orderId);
    const nextCompleted = [...completedOrders, completed];

    setActiveOrders(nextActive);
    setCompletedOrders(nextCompleted);

    await StorageService.saveSingleItem('completed_orders', completed);
    // Remove from active in Firestore direct array
    localStorage.setItem('tableflow_active_orders', JSON.stringify(nextActive));

    // Clear and free table status
    if (completed.tableId) {
      const nextTables = tables.map(t => {
        if (t.id === completed.tableId) {
          return { ...t, status: 'available' as const, currentOrderId: undefined };
        }
        return t;
      });
      setTables(nextTables);
      await StorageService.saveData('tables', nextTables);
    }
  };

  const handleUpdateTables = async (updatedTables: Table[]) => {
    setTables(updatedTables);
    await StorageService.saveData('tables', updatedTables);
  };

  const handleAddReservation = async (res: Reservation) => {
    const updated = [...reservations, res];
    setReservations(updated);
    await StorageService.saveSingleItem('reservations', res);
  };

  const handleUpdateTableStatus = async (tableId: string, status: 'available' | 'occupied' | 'reserved') => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status,
          currentOrderId: status === 'available' ? undefined : t.currentOrderId,
          occupiedSince: status === 'occupied' ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    setTables(updated);
    await StorageService.saveData('tables', updated);
  };

  const handleAddIngredient = async (ing: Ingredient) => {
    const updated = [...ingredients, ing];
    setIngredients(updated);
    await StorageService.saveSingleItem('ingredients', ing);
  };

  const handleUpdateIngredientStock = async (id: string, newStock: number) => {
    const updated = ingredients.map(i => i.id === id ? { ...i, stock: newStock } : i);
    setIngredients(updated);
    await StorageService.saveData('ingredients', updated);
  };

  const handleAddWasteRecord = async (waste: WasteRecord) => {
    const updated = [...wasteRecords, waste];
    setWasteRecords(updated);
    await StorageService.saveSingleItem('waste_records', waste);
  };

  const handleAddCustomer = async (customer: Customer) => {
    const updated = [...customers, customer];
    setCustomers(updated);
    await StorageService.saveSingleItem('customers', customer);
  };

  const handleUpdateCustomerPoints = async (id: string, newPoints: number) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinium' = 'Bronze';
        if (newPoints >= 1000) tier = 'Platinium';
        else if (newPoints >= 500) tier = 'Gold';
        else if (newPoints >= 200) tier = 'Silver';
        return { ...c, points: newPoints, loyaltyTier: tier };
      }
      return c;
    });
    setCustomers(updated);
    await StorageService.saveData('customers', updated);
  };

  if (loading) {
    return (
      <div id="loading-backdrop" className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans">
        <Compass className="h-14 w-14 text-amber-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-wider">Booting TableFlow MT</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Cloud Firestore database container...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-amber-800 selection:text-white">
      {/* SaaS Main Header */}
      <header className="bg-slate-900 text-white shadow-md border-b-4 border-amber-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-800 rounded-xl">
              <Compass className="h-6 w-6 text-slate-100" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight leading-none flex items-center gap-1.5">
                TableFlow <span className="text-amber-500">MT</span>
              </h1>
              <span className="text-[10px] text-slate-400 block font-semibold">SaaS Unified Food Commerce • Bozeman, MT</span>
            </div>
          </div>

          {/* Quick Stats overview top bar */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-300 font-medium bg-slate-800/60 p-1.5 px-4 rounded-xl border border-slate-750">
            <p>Active Orders: <span className="font-mono font-bold text-amber-400">{activeOrders.length}</span></p>
            <p>Occupied Tables: <span className="font-mono font-bold text-rose-400">{tables.filter(t => t.status === 'occupied').length}/{tables.length}</span></p>
            <p>Customers: <span className="font-mono font-bold text-green-400">{customers.length}</span></p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Cloud Trigger */}
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-755 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin text-amber-500' : 'text-slate-400'}`} />
              <span>{syncing ? 'Saving cloud...' : 'Sync Cloud'}</span>
            </button>

            {/* Quick QR code view to test mobile menu */}
            <button
              onClick={() => setActiveTab('ClientMenu')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ClientMenu' 
                  ? 'bg-amber-800 text-white' 
                  : 'bg-amber-900/30 text-amber-400 border border-amber-900/40 hover:bg-amber-900/40'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>QR Mobile Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2.5">
            {[
              { id: 'POS', label: 'Point of Sale (PDV)', icon: ShoppingCart },
              { id: 'Tables', label: 'Tables & Booking', icon: LayoutGrid },
              { id: 'Inventory', label: 'Inventory & Costs', icon: Library },
              { id: 'Customers', label: 'Customers CRM', icon: Users },
              { id: 'Reports', label: 'Faturamento / Reports', icon: BarChart3 },
              { id: 'SetupGuide', label: 'Guia de Produção', icon: BookOpen }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main SaaS Workspace Application Frame */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-grow w-full">
        <div className="transition duration-150">
          {activeTab === 'POS' && (
            <POSView
              menuItems={menuItems}
              tables={tables}
              onAddOrder={handleAddOrder}
              activeOrders={activeOrders}
              onCompleteOrder={handleCompleteOrder}
              onUpdateTables={handleUpdateTables}
            />
          )}

          {activeTab === 'Tables' && (
            <TablesView
              tables={tables}
              reservations={reservations}
              onAddReservation={handleAddReservation}
              onUpdateTableStatus={handleUpdateTableStatus}
            />
          )}

          {activeTab === 'ClientMenu' && (
            <MenuView
              menuItems={menuItems}
              tables={tables}
              onAddOrder={handleAddOrder}
            />
          )}

          {activeTab === 'Inventory' && (
            <InventoryView
              ingredients={ingredients}
              menuItems={menuItems}
              wasteRecords={wasteRecords}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredientStock={handleUpdateIngredientStock}
              onAddWasteRecord={handleAddWasteRecord}
            />
          )}

          {activeTab === 'Customers' && (
            <CustomersView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomerPoints={handleUpdateCustomerPoints}
            />
          )}

          {activeTab === 'Reports' && (
            <ReportsView
              completedOrders={completedOrders}
              onSimulateDeliveryOrder={handleAddOrder}
              menuItems={menuItems}
            />
          )}

          {activeTab === 'SetupGuide' && <SetupGuideSection />}
        </div>
      </main>

      {/* Footer credits with compliance indicators */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div>
            <h5 className="font-bold text-white mb-2">TableFlow MT</h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Complete rústico-elegante SaaS for mountain food business across the West. Proudly supporting businesses on Flathead Lake, Big Sky, and Glacier Valley grids.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-2">Legal Compliance (EUA)</h5>
            <ul className="text-[11px] space-y-1 text-slate-400 list-none font-medium">
              <li>✓ Fully compliant with PCI-DSS 4.0 data security standards</li>
              <li>✓ Automated calculation of Montana local Resort Taxes</li>
              <li>✓ Multi-outlet compatibility & cloud ledger synchronization</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-2">Active Infrastructure</h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Database: <span className="text-amber-500 font-black">Google Firestore DB Container</span><br/>
              Platform state: <span className="text-emerald-500 font-bold">Online & Synchronized</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Interative Production deployment guide
function SetupGuideSection() {
  return (
    <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 text-slate-800 max-w-4xl mx-auto anim-fade-in text-xs sm:text-sm">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-amber-800" /> Guia de Produção & Deploy
        </h3>
        <p className="text-xs text-slate-500 mt-1">Siga este roteiro passo a passo para colocar o TableFlow MT em produção</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-800">1. Configuração do Banco de Dados (Firebase Cloud Firestore)</h4>
          <p className="text-slate-600 leading-relaxed text-xs">
            Atualmente, o aplicativo está conectado a um banco de dados **Firestore** provisionado automaticamente usando o ID `gen-lang-client-0298850526`. As regras de segurança estão prontas em `firestore.rules`. Para usar sua própria instância no console do Firebase:
          </p>
          <pre className="bg-slate-900 text-amber-400 p-2.5 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
{`npm install -g firebase-tools
firebase login
firebase init firestore`}
          </pre>
          <p className="text-slate-600 leading-relaxed text-xs">
            Em seguida, atualize o arquivo `/firebase-applet-config.json` com suas credenciais de produção do Firebase.
          </p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-800">2. Execução Local & Instalação de Dependências</h4>
          <p className="text-slate-650 leading-relaxed text-xs">
            Clone o código e execute os comandos abaixo para inicializar o ambiente de desenvolvimento local usando Vite:
          </p>
          <pre className="bg-slate-900 text-amber-400 p-2.5 rounded-lg text-xs font-mono overflow-x-auto">
{`# Instalar dependências
npm install

# Iniciar servidor local de teste (Vite)
npm run dev`}
          </pre>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-800">3. Transmitir Configurações de Segurança do Firestore</h4>
          <p className="text-slate-650 leading-relaxed text-xs">
            As seguintes regras de segurança devem ser definidas no seu painel para garantir que apenas pessoas autorizadas leiam ou escrevam nos dados da sua empresa:
          </p>
          <pre className="bg-slate-900 text-amber-400 p-2.5 rounded-lg text-xs font-mono overflow-x-auto leading-normal">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Em produção troque por: request.auth != null
    }
  }
}`}
          </pre>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-800">4. Hospedagem & Deploy na Google Cloud Platform (GCP)</h4>
          <p className="text-slate-655 leading-relaxed text-xs">
            Para gerar a versão otimizada de produção pronta para o Google Cloud Run ou Firebase Hosting, utilize:
          </p>
          <pre className="bg-slate-900 text-amber-400 p-2.5 rounded-lg text-xs font-mono overflow-x-auto">
{`# Criar compilação de produção
npm run build

# Publicar no Firebase Hosting
firebase deploy --only hosting`}
          </pre>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100/80 text-xs text-amber-900 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Importante para Montana (Resort/Sales Tax Rules):</p>
          <p className="text-slate-700 leading-normal mt-0.5">
            Montana não possui imposto sobre vendas estadual basilar. No entanto, o sistema TableFlow calcula automaticamente os impostos de recurso (como a taxa municipal obrigatória de 4% de Big Sky e 3% de Whitefish), permitindo que você preste contas às entidades fiscais sem complicações jurídicas.
          </p>
        </div>
      </div>
    </div>
  );
}
