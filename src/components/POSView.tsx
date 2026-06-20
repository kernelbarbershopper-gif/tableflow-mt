import React, { useState } from 'react';
import { MenuItem, Order, OrderItem, Table } from '../types';
import { ShoppingCart, User, Plus, Minus, CreditCard, DollarSign, Receipt, Trash2, CheckCircle2, ChevronRight, MessageSquare, Compass } from 'lucide-react';

interface POSViewProps {
  menuItems: MenuItem[];
  tables: Table[];
  onAddOrder: (order: Order) => void;
  activeOrders: Order[];
  onCompleteOrder: (orderId: string, paymentMethod: 'cash' | 'card' | 'gift-card') => void;
  onUpdateTables: (updatedTables: Table[]) => void;
}

export default function POSView({
  menuItems,
  tables,
  onAddOrder,
  activeOrders,
  onCompleteOrder,
  onUpdateTables
}: POSViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Burgers' | 'Steaks & Fish' | 'Sides & Salads' | 'Desserts' | 'Drinks'>('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0.04); // 4% Big Sky resort tax by default
  const [tipPercent, setTipPercent] = useState<number>(0.18); // 18% gratuity default
  const [searchText, setSearchText] = useState('');
  const [showReceipt, setShowReceipt] = useState<Order | null>(null);

  const categories: ('All' | 'Burgers' | 'Steaks & Fish' | 'Sides & Salads' | 'Desserts' | 'Drinks')[] = [
    'All', 'Burgers', 'Steaks & Fish', 'Sides & Salads', 'Desserts', 'Drinks'
  ];

  // Filtering menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const handleAddToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (!updated[itemId]) return prev;
      if (updated[itemId] === 1) {
        delete updated[itemId];
      } else {
        updated[itemId] -= 1;
      }
      return updated;
    });
  };

  const handleClearCart = () => setCart({});

  const cartTotalInfo = () => {
    let subtotal = 0;
    const itemsList: OrderItem[] = [];

    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = menuItems.find(mi => mi.id === itemId);
      const qtyNumber = Number(qty);
      if (item) {
        subtotal += item.price * qtyNumber;
        itemsList.push({
          menuItemId: item.id,
          name: item.name,
          quantity: qtyNumber,
          price: item.price
        });
      }
    });

    const tax = Number((subtotal * taxRate).toFixed(2));
    const tip = Number((subtotal * tipPercent).toFixed(2));
    const total = Number((subtotal + tax + tip).toFixed(2));

    return { subtotal, tax, tip, total, itemsList };
  };

  const { subtotal, tax, tip, total, itemsList } = cartTotalInfo();

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsList.length === 0) return;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      tableId: orderType === 'dine-in' ? (selectedTableId || undefined) : undefined,
      type: orderType,
      status: 'pending',
      items: itemsList,
      subtotal,
      tax,
      tip,
      total,
      createdAt: new Date().toISOString(),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined
    };

    onAddOrder(newOrder);

    // If dine-in, mark selected table as occupied and associate with current order id
    if (orderType === 'dine-in' && selectedTableId) {
      const updatedTables = tables.map(t => {
        if (t.id === selectedTableId) {
          return {
            ...t,
            status: 'occupied' as const,
            currentOrderId: newOrder.id,
            occupiedSince: new Date().toISOString()
          };
        }
        return t;
      });
      onUpdateTables(updatedTables);
    }

    // Reset fields
    setCart({});
    setSelectedTableId('');
    setCustomerName('');
    setCustomerPhone('');
    
    // Auto show receipt simulator or confirmation
    setShowReceipt(newOrder);
  };

  const activeDineInOrders = activeOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div id="pos-layout-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full p-1">
      {/* Receipts Simulator Overlaid Modal */}
      {showReceipt && (
        <div id="receipt-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="receipt-modal" className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-800 border-t-8 border-amber-700 animate-in fade-in zoom-in duration-200">
            <div className="text-center border-b border-dashed border-slate-200 pb-4 mb-4">
              <h3 className="font-bold text-xl text-slate-900 tracking-tight flex items-center justify-center gap-2">
                <Compass className="h-5 w-5 text-amber-700 animate-spin" /> TableFlow MT
              </h3>
              <p className="text-xs text-slate-500 mt-1">Grizzly Pass, Big Sky - Montana</p>
              <p className="text-xs text-slate-400">Pho: (406) 555-FLOW</p>
              <div className="bg-amber-50 text-amber-900 text-xs font-semibold py-1 px-3 rounded-full inline-block mt-3">
                {showReceipt.type === 'dine-in' ? `Dine-In • Table ${tables.find(t => t.id === showReceipt.tableId)?.number || 'Bar'}` : `Type: ${showReceipt.type.toUpperCase()}`}
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 mb-4">
              <p className="flex justify-between"><span>Order Ref:</span> <span className="font-mono font-bold text-slate-900 md:text-sm">{showReceipt.id.slice(-8)}</span></p>
              <p className="flex justify-between"><span>Date:</span> <span>{new Date(showReceipt.createdAt).toLocaleString()}</span></p>
              {showReceipt.customerName && (
                <p className="flex justify-between"><span>Customer:</span> <span className="font-semibold">{showReceipt.customerName}</span></p>
              )}
            </div>

            <div className="border-b border-dashed border-slate-200 pb-3 mb-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Summary</h4>
              <div className="space-y-2">
                {showReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-slate-700 font-medium">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-b border-dashed border-slate-200 pb-3 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${showReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-amber-800">Resort Tax (MT)</span>
                <span>${showReceipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Gratuity Sug. (Tip)</span>
                <span>${showReceipt.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 pt-1">
                <span>Total Due</span>
                <span>${showReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-[10px] text-slate-400 px-4">
                Thank you for supporting Montana local businesses! 100% of resort taxes fund Glacier National Park & Local wildlife conservation programs.
              </p>
              
              {showReceipt.status === 'pending' ? (
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => {
                      onCompleteOrder(showReceipt.id, 'cash');
                      setShowReceipt(null);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-200 font-medium text-xs text-center"
                  >
                    <DollarSign className="h-4 w-4 mb-1" />
                    Cash
                  </button>
                  <button 
                    onClick={() => {
                      onCompleteOrder(showReceipt.id, 'card');
                      setShowReceipt(null);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 font-medium text-xs text-center"
                  >
                    <CreditCard className="h-4 w-4 mb-1" />
                    Card (US)
                  </button>
                  <button 
                    onClick={() => {
                      onCompleteOrder(showReceipt.id, 'gift-card');
                      setShowReceipt(null);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition border border-orange-200 font-medium text-xs text-center"
                  >
                    <GiftCardIcon className="h-4 w-4 mb-1" />
                    Gift-Card
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Paid with {showReceipt.paymentMethod?.toUpperCase()}
                </div>
              )}
              
              <button 
                onClick={() => setShowReceipt(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer mt-2 transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Items Catalog */}
      <div id="catalog-section" className="lg:col-span-8 space-y-6 flex flex-col h-full">
        {/* Search and Category filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-700" /> Catalog & Ordering
            </h2>
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Search Montana flavor..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-3 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
              {searchText && (
                <button 
                  onClick={() => setSearchText('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-amber-800 text-white shadow-md shadow-amber-800/15' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto max-h-[500px]">
          {filteredItems.map(item => {
            const currentQtyInCart = cart[item.id] || 0;
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div className="relative h-32 w-full bg-slate-100">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {item.popular && (
                    <span className="absolute top-2 left-2 bg-amber-800 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                      Montana Best Seller
                    </span>
                  )}
                  {currentQtyInCart > 0 && (
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-lg">
                      {currentQtyInCart} in cart
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2 flex-grow">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                    <span className="font-bold text-sm text-slate-950 whitespace-nowrap">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-550 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                <div className="p-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {currentQtyInCart > 0 && (
                      <button 
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition text-xs"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleAddToCart(item.id)}
                      className="p-1 px-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold transition text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm">No frontier flavors found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart & Quick Operations Panel */}
      <form onSubmit={handlePlaceOrder} id="cart-session-panel" className="lg:col-span-4 bg-white rounded-2xl border border-slate-150 p-4 shadow-sm flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-700" /> Current Cart
            </h3>
            {itemsList.length > 0 && (
              <button 
                type="button" 
                onClick={handleClearCart}
                className="text-slate-400 hover:text-red-500 font-medium text-xs flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Cart items list */}
          <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
            {itemsList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-1">
                <p className="text-xs">Your order list is empty.</p>
                <p className="text-[10px] text-slate-450">Add mountain meals from the catalog left.</p>
              </div>
            ) : (
              itemsList.map(item => (
                <div key={item.menuItemId} className="flex justify-between items-center text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="font-medium pr-1">
                    <span className="font-bold text-amber-800">{item.quantity}x</span> {item.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                    <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-md">
                      <button type="button" onClick={() => handleRemoveFromCart(item.menuItemId)} className="p-1 px-1.5 hover:bg-slate-100 text-slate-500">-</button>
                      <button type="button" onClick={() => handleAddToCart(item.menuItemId)} className="p-1 px-1.5 hover:bg-slate-100 text-slate-500">+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Client Reference */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Service Type</label>
              <div className="grid grid-cols-3 gap-1">
                <button 
                  type="button" 
                  onClick={() => setOrderType('dine-in')}
                  className={`py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                    orderType === 'dine-in' 
                      ? 'bg-amber-100 border-amber-300 text-amber-900' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Dine-In
                </button>
                <button 
                  type="button" 
                  onClick={() => setOrderType('takeout')}
                  className={`py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                    orderType === 'takeout' 
                      ? 'bg-amber-100 border-amber-300 text-amber-900' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Takeout
                </button>
                <button 
                  type="button" 
                  onClick={() => setOrderType('delivery')}
                  className={`py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                    orderType === 'delivery' 
                      ? 'bg-amber-100 border-amber-300 text-amber-900' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>

            {orderType === 'dine-in' ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Assign Table</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="">-- Choose Mesa / Counter --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      Table {t.number} ({t.capacity} Seats) - {t.status === 'occupied' ? 'Occupied 🛠' : 'Available'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 anim-fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Name</label>
                  <input 
                    type="text" 
                    placeholder="Marcus" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-1.5 border border-slate-250 bg-slate-50 text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Phone</label>
                  <input 
                    type="phone" 
                    placeholder="(406) 555-..." 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-1.5 border border-slate-250 bg-slate-50 text-xs rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Adjustments (Resort Tax & Gratuity) */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Resort Tax (MT)</label>
                <select 
                  value={taxRate} 
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full p-1 bg-slate-50 border border-slate-200 text-[11px] rounded"
                >
                  <option value={0.00}>Exempt (0%)</option>
                  <option value={0.03}>Whitefish (3%)</option>
                  <option value={0.04}>Big Sky (4%)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Suggested Tip</label>
                <select 
                  value={tipPercent} 
                  onChange={(e) => setTipPercent(Number(e.target.value))}
                  className="w-full p-1 bg-slate-50 border border-slate-200 text-[11px] rounded"
                >
                  <option value={0.15}>Standard (15%)</option>
                  <option value={0.18}>Gracious (18%)</option>
                  <option value={0.20}>Glacier Gold (20%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Totals & Submit */}
        <div className="border-t border-slate-100 pt-3 mt-4 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-amber-800">
              <span>Resort Tax:</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tip:</span>
              <span className="font-mono">${tip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-100 pt-2">
              <span>Grand Total:</span>
              <span className="font-mono text-base">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={itemsList.length === 0}
            className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg ${
              itemsList.length === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-amber-800 hover:bg-amber-900 text-white shadow-amber-800/15'
            }`}
          >
            <Receipt className="h-4.5 w-4.5" /> Place & Pay Order
          </button>
        </div>
      </form>
    </div>
  );
}

function GiftCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
