import React, { useState } from 'react';
import { MenuItem, Table, Order, OrderItem } from '../types';
import { Smartphone, Scan, QrCode, ShoppingBag, Plus, Minus, ArrowRight, ChefHat, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuViewProps {
  menuItems: MenuItem[];
  tables: Table[];
  onAddOrder: (order: Order) => void;
}

export default function MenuView({
  menuItems,
  tables,
  onAddOrder
}: MenuViewProps) {
  const [selectedTableNumber, setSelectedTableNumber] = useState<'10' | '11' | '12' | '14' | '20 (Bar)' | '30 (Patio)'>('11');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [orderMethod, setOrderMethod] = useState<'table' | 'takeout'>('table');
  const [takeoutName, setTakeoutName] = useState('');
  const [takeoutPhone, setTakeoutPhone] = useState('');
  const [hasScanned, setHasScanned] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Burgers' | 'Steaks & Fish' | 'Desserts'>('All');
  const [cookingSimulatorText, setCookingSimulatorText] = useState('');

  const phoneCategories: ('All' | 'Burgers' | 'Steaks & Fish' | 'Desserts')[] = [
    'All', 'Burgers', 'Steaks & Fish', 'Desserts'
  ];

  const handlePhoneAddToCart = (itemId: string) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const handlePhoneRemoveFromCart = (itemId: string) => {
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

  const calculatePhoneTotals = () => {
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

    const tax = subtotal * 0.04; // Big Sky 4% tax
    const total = subtotal + tax;

    return { subtotal, tax, total, itemsList };
  };

  const { subtotal, tax, total, itemsList } = calculatePhoneTotals();

  const handleClientPlaceOrder = () => {
    if (itemsList.length === 0) return;

    const matchedTable = tables.find(t => t.number === selectedTableNumber);

    const newOrder: Order = {
      id: `client_o_${Date.now()}`,
      tableId: orderMethod === 'table' ? (matchedTable?.id || undefined) : undefined,
      type: orderMethod === 'table' ? 'dine-in' : 'takeout',
      status: 'pending',
      items: itemsList,
      subtotal,
      tax,
      tip: 0, // Customer tipping later inside POS checkout
      total,
      createdAt: new Date().toISOString(),
      customerName: orderMethod === 'takeout' ? (takeoutName || 'Anonymous Web') : `Mesa/Table ${selectedTableNumber}`,
      customerPhone: orderMethod === 'takeout' ? (takeoutPhone || undefined) : undefined
    };

    onAddOrder(newOrder);

    // Audio/Vibe trigger
    setCookingSimulatorText(`🔥 order to the kitchen! Sent Table: ${selectedTableNumber}. Sent to line cooks instantly.`);

    // Clear cart & variables
    setCart({});
    setTimeout(() => {
      setCookingSimulatorText('');
    }, 4500);
  };

  const filteredPhoneItems = menuItems.filter(item => {
    if (selectedCategory === 'All') return ['Burgers', 'Steaks & Fish', 'Desserts'].includes(item.category);
    return item.category === selectedCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-1 text-slate-800">
      {/* Configuration & Instructional Left Rail */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-amber-700" />
            <h3 className="font-bold text-lg tracking-tight">QR Code Ordering Simulator</h3>
          </div>
          <p className="text-slate-650 text-xs leading-relaxed">
            In modern Montana gastronomy, QR codes bridge the staffing gaps in remote resort towns. Customers scan to order direct, automatically notifying local prep kitchens.
          </p>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-3">
            <h4 className="font-bold text-xs text-amber-900 uppercase">Test Settings</h4>
            
              <div className="space-y-3 font-medium text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Select Table QR:</label>
                  <select
                  value={selectedTableNumber}
                  onChange={(e: any) => setSelectedTableNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2 rounded-lg"
                >
                  <option value="10">Table 10 (2 Seats)</option>
                  <option value="11">Table 11 (2 Seats)</option>
                  <option value="12">Table 12 (4 Seats)</option>
                  <option value="14">Table 14 (4 Seats)</option>
                  <option value="20 (Bar)">Table 20 (Bar Counter)</option>
                  <option value="30 (Patio)">Table 30 (Al Fresco Patio)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Option</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderMethod('table');
                      setHasScanned(true);
                    }}
                    className={`p-2 rounded-lg text-center border font-semibold ${
                      orderMethod === 'table' ? 'bg-amber-800 border-amber-900 text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    Dine-In Phone QR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderMethod('takeout');
                      setHasScanned(true);
                    }}
                    className={`p-2 rounded-lg text-center border font-semibold ${
                      orderMethod === 'takeout' ? 'bg-amber-800 border-amber-900 text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    Online Takeout Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2">
            <div className="relative p-2 bg-slate-50 rounded-lg">
              <QrCode className="h-28 w-28 text-slate-705" />
              <Scan className="absolute top-1 left-1 h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Scan Table {selectedTableNumber} QR Code</p>
              <p className="text-[10px] text-slate-400">Generated dynamically for TableFlow MT platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Screen Frame */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="relative border-[10px] border-slate-900 rounded-[35px] w-full max-w-[340px] h-[640px] shadow-2xl bg-slate-50 overflow-hidden flex flex-col justify-between">
          
          {/* Phone Top Notch Bar */}
          <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 z-30 flex items-center justify-center p-1">
            <span className="w-16 h-4 bg-slate-900 rounded-full inline-block"></span>
            <div className="absolute left-6 text-[8px] text-slate-300 font-bold">9:41</div>
            <div className="absolute right-6 text-[8px] text-slate-300 font-bold flex items-center gap-1">
              <span>5G</span>
              <span className="w-3 h-2 border border-slate-400 rounded-sm inline-block"></span>
            </div>
          </div>

          {/* Cooking alert success */}
          <AnimatePresence>
            {cookingSimulatorText && (
              <motion.div 
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 12 }}
                exit={{ opacity: 0, y: -45 }}
                className="absolute top-6 inset-x-3 bg-slate-950/95 backdrop-blur-sm p-3 rounded-2xl text-white text-xs z-40 shadow-xl border border-amber-600 flex items-center gap-2"
              >
                <ChefHat className="h-5 w-5 text-amber-500 animate-bounce" />
                <div>
                  <p className="font-bold">TableFlow Kitchen Dispatch</p>
                  <p className="text-[10px] text-slate-300">{cookingSimulatorText}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Web App Body inside Smartphone */}
          <div className="pt-8 h-full flex flex-col justify-between p-3.5 bg-slate-50 overflow-y-auto w-full pb-16">
            
            {/* Store Header inside phone */}
            <div className="space-y-1 mb-4 text-center border-b border-slate-100 pb-3">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black tracking-wide inline-block uppercase">
                {orderMethod === 'table' ? `Table ${selectedTableNumber} Active` : 'Takeout Active'}
              </span>
              <h4 className="font-bold text-slate-800 text-sm">🏔️ TableFlow MT</h4>
              <p className="text-[10px] text-slate-450">Mobile Montana Diners Companion</p>
            </div>

            {orderMethod === 'takeout' && (
              <div className="space-y-2 bg-amber-50/50 p-2 rounded-xl mb-3 border border-amber-100">
                <p className="text-[10px] font-bold text-amber-900">Your Takeout Info</p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <input
                    type="text"
                    required
                    placeholder="Marcus"
                    value={takeoutName}
                    onChange={(e) => setTakeoutName(e.target.value)}
                    className="p-1 px-1.5 bg-white border border-slate-200 rounded"
                  />
                  <input
                    type="phone"
                    required
                    placeholder="(406) ..."
                    value={takeoutPhone}
                    onChange={(e) => setTakeoutPhone(e.target.value)}
                    className="p-1 px-1.5 bg-white border border-slate-200 rounded"
                  />
                </div>
              </div>
            )}

            {/* Menu categories phone bar */}
            <div className="flex gap-1 overflow-x-auto pb-2 justify-start mb-2 scrollbar-none">
              {phoneCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap outline-none cursor-pointer ${
                    selectedCategory === cat ? 'bg-amber-800 text-white' : 'bg-white border border-slate-150 text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Phone Items Container List */}
            <div className="space-y-2.5 flex-grow max-h-[340px] overflow-y-auto pr-0.5">
              {filteredPhoneItems.map(item => {
                const itemQty = cart[item.id] || 0;
                return (
                  <div key={item.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex gap-2.5 shadow-sm items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0 pr-1 select-none">
                      <div className="flex justify-between items-start gap-1">
                        <p className="font-bold text-slate-800 text-xs truncate leading-snug">{item.name}</p>
                        <span className="font-bold text-slate-900 text-xs whitespace-nowrap">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                      
                      <div className="flex justify-between items-center mt-2 pt-1">
                        <span className="text-[8px] bg-slate-50 text-amber-700 border border-slate-100 px-1.5 rounded font-bold">
                          {item.popular ? 'Best' : 'Fresh'}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {itemQty > 0 && (
                            <>
                              <button 
                                onClick={() => handlePhoneRemoveFromCart(item.id)}
                                className="w-5 h-5 rounded bg-slate-100 border border-slate-200 text-xs flex items-center justify-center text-slate-700"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold font-mono px-1">{itemQty}</span>
                            </>
                          )}
                          <button 
                            onClick={() => handlePhoneAddToCart(item.id)}
                            className="w-5 h-5 rounded bg-amber-800 text-white text-xs flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phone Bottom Sticky Shopping Bar */}
          <div className="absolute bottom-3 inset-x-3 bg-white border border-slate-150 p-2.5 rounded-2xl flex items-center justify-between shadow-xl z-20">
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Subtotal due</span>
              <p className="font-mono text-xs font-bold text-slate-900">${subtotal.toFixed(2)} (+tax)</p>
            </div>

            <button
              onClick={handleClientPlaceOrder}
              disabled={itemsList.length === 0}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer leading-none transition ${
                itemsList.length === 0 
                  ? 'bg-slate-100 text-slate-455 cursor-not-allowed' 
                  : 'bg-emerald-600 font-extrabold text-white hover:bg-emerald-700'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Order to Cooks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
