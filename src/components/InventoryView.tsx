import React, { useState } from 'react';
import { Ingredient, MenuItem, WasteRecord } from '../types';
import { Layers, AlertTriangle, ArrowUpDown, Plus, DollarSign, PieChart, TrendingUp, HelpCircle } from 'lucide-react';

interface InventoryViewProps {
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  wasteRecords: WasteRecord[];
  onAddIngredient: (ing: Ingredient) => void;
  onUpdateIngredientStock: (id: string, newStock: number) => void;
  onAddWasteRecord: (waste: WasteRecord) => void;
}

export default function InventoryView({
  ingredients,
  menuItems,
  wasteRecords,
  onAddIngredient,
  onUpdateIngredientStock,
  onAddWasteRecord
}: InventoryViewProps) {
  // Ingredient form
  const [ingName, setIngName] = useState('');
  const [ingStock, setIngStock] = useState(10);
  const [ingMin, setIngMin] = useState(5);
  const [ingUnit, setIngUnit] = useState('kg');
  const [ingCost, setIngCost] = useState(2.50);
  const [ingSupplier, setIngSupplier] = useState('');

  // Food waste form
  const [selectedIngForWaste, setSelectedIngForWaste] = useState('');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState('Expired');

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName || !ingUnit || !ingSupplier) return;

    const newIng: Ingredient = {
      id: `ing_${Date.now()}`,
      name: ingName,
      stock: Number(ingStock),
      minStock: Number(ingMin),
      unit: ingUnit,
      costPerUnit: Number(ingCost),
      supplier: ingSupplier
    };

    onAddIngredient(newIng);

    // Reset Form
    setIngName('');
    setIngStock(10);
    setIngMin(5);
    setIngUnit('kg');
    setIngCost(2.50);
    setIngSupplier('');
  };

  const handleReportWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngForWaste || wasteQty <= 0) return;

    const matchedIng = ingredients.find(i => i.id === selectedIngForWaste);
    if (!matchedIng) return;

    const totalLossCost = Number((matchedIng.costPerUnit * wasteQty).toFixed(2));

    const newWaste: WasteRecord = {
      id: `waste_${Date.now()}`,
      ingredientName: matchedIng.name,
      quantity: wasteQty,
      unit: matchedIng.unit,
      cost: totalLossCost,
      reason: wasteReason,
      date: new Date().toISOString()
    };

    onAddWasteRecord(newWaste);

    // Deduct from real stock
    const nextStock = Math.max(0, matchedIng.stock - wasteQty);
    onUpdateIngredientStock(matchedIng.id, nextStock);

    // Reset
    setSelectedIngForWaste('');
    setWasteQty(1);
    setWasteReason('Expired');
  };

  const criticalStockItems = ingredients.filter(i => i.stock <= i.minStock);

  // Profit margins of menu items based on cost vs price
  const topProfitMakers = [...menuItems]
    .map(m => {
      const marginDollar = m.price - m.cost;
      const marginPercent = ((marginDollar / m.price) * 100).toFixed(1);
      return { ...m, marginDollar, marginPercent };
    })
    .sort((a, b) => b.marginDollar - a.marginDollar);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-1 text-slate-800">
      
      {/* Upper Cards Rows */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Critical Stock Alert */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-full flex items-center justify-center ${criticalStockItems.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Critical Stocks</span>
            <p className="font-bold text-lg text-slate-900">{criticalStockItems.length} Low Stock Insumos</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Below customizable buffer minimum</p>
          </div>
        </div>

        {/* Waste Cost Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Waste Lost</span>
            <p className="font-bold text-lg text-rose-700">
              ${wasteRecords.reduce((acc, r) => acc + r.cost, 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{wasteRecords.length} registered kitchen loss reports</p>
          </div>
        </div>

        {/* Avg Margin Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Food Margin</span>
            <p className="font-bold text-lg text-emerald-800">
              {(topProfitMakers.reduce((acc, m) => acc + Number(m.marginPercent), 0) / topProfitMakers.length).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Heathy targets for Montana resort grids</p>
          </div>
        </div>
      </div>

      {/* Ingredients Inventory Table */}
      <div className="xl:col-span-8 flex flex-col justify-start space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="font-bold text-slate-800">Supply Ingredients List</h3>
              <p className="text-xs text-slate-400">All prices in USD. Fast re-stock triggers bypass external workflows.</p>
            </div>
            
            {criticalStockItems.length > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                Action Required!
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <th className="py-2.5 px-3">Ingredient</th>
                  <th className="py-2.5 px-2 text-center text-slate-700">Stock Status</th>
                  <th className="py-2.5 px-2">Cst/Unit</th>
                  <th className="py-2.5 px-2">Supplier</th>
                  <th className="py-2.5 px-3 text-right">Quick Refill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {ingredients.map(ing => {
                  const isLow = ing.stock <= ing.minStock;
                  return (
                    <tr key={ing.id} className={`hover:bg-slate-50/55 transition ${isLow ? 'bg-rose-50/20' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{ing.name}</div>
                        <div className="text-[9px] text-slate-400">Min Buffer: {ing.minStock} {ing.unit}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-bold inline-block text-[11px] ${
                          isLow ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ing.stock} {ing.unit}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono font-bold">${ing.costPerUnit.toFixed(2)}</td>
                      <td className="py-3 px-2 text-slate-500 text-[11px] truncate max-w-[120px]">{ing.supplier}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onUpdateIngredientStock(ing.id, ing.stock + 20)}
                          className="px-2 py-1 bg-amber-50 rounded hover:bg-amber-100 text-amber-800 font-extrabold transition text-[10px]"
                        >
                          +20 {ing.unit}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recipes & Margins of Montana Dishes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800">Menu Profit & Cost Analysis</h3>
            <p className="text-xs text-slate-400">Dynamic margins based on live menu pricing and composite recipes costs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topProfitMakers.map(dish => (
              <div key={dish.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800 text-xs">{dish.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Retail: ${dish.price.toFixed(2)}</span>
                    <span className="text-zinc-600">Cost: ${dish.cost.toFixed(2)}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-1 rounded font-bold font-mono text-[10px] inline-block ${
                    Number(dish.marginPercent) > 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-80 *'
                  }`}>
                    {dish.marginPercent}% margin
                  </span>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">+${dish.marginDollar.toFixed(2)} net</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* side forms: Add Ingredients & Log waste */}
      <div className="xl:col-span-4 space-y-6 flex flex-col justify-start">
        {/* Ingredient Registration Box */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800">Register Supply / Insumo</h4>
          
          <form onSubmit={handleCreateIngredient} className="space-y-3 mr-0 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Ingredient Name</label>
              <input
                type="text"
                required
                value={ingName}
                onChange={(e) => setIngName(e.target.value)}
                placeholder="e.g. Elk Sausage"
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-amber-700 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Starting Stock</label>
                <input
                  type="number"
                  min="0"
                  value={ingStock}
                  onChange={(e) => setIngStock(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-amber-700 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Alert Level Minimum</label>
                <input
                  type="number"
                  min="0"
                  value={ingMin}
                  onChange={(e) => setIngMin(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-amber-700 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Measure Unit</label>
                <select
                  value={ingUnit}
                  onChange={(e) => setIngUnit(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 text-slate-650"
                >
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                  <option value="litres">litres</option>
                  <option value="pints">pints</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Cost/Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ingCost}
                  onChange={(e) => setIngCost(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-amber-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Supplier Company</label>
              <input
                type="text"
                required
                value={ingSupplier}
                onChange={(e) => setIngSupplier(e.target.value)}
                placeholder="Billings Wholesale"
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-amber-700 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
            >
              Add to Supply Chain
            </button>
          </form>
        </div>

        {/* Waste Log Report Box */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800">Report Kitchen Food Waste</h4>

          <form onSubmit={handleReportWaste} className="space-y-3 mr-0 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">SPOILED SUPPLY</label>
              <select
                required
                value={selectedIngForWaste}
                onChange={(e) => setSelectedIngForWaste(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 text-slate-650 font-bold"
              >
                <option value="">-- Choose Ingredient --</option>
                {ingredients.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Has {i.stock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Waste Qty</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={wasteQty}
                  onChange={(e) => setWasteQty(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Reason</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2"
                >
                  <option value="Expired">Expired / Spoiled</option>
                  <option value="Dropped">Dropped / Spilled</option>
                  <option value="Burnt">Burnt in cooking</option>
                  <option value="Customer Return">Customer Return</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedIngForWaste}
              className="w-full py-2 bg-rose-700 text-white rounded-xl font-bold hover:bg-rose-800 disabled:opacity-50 transition"
            >
              Report Loss Record
            </button>
          </form>

          {/* Waste History Stream log */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h5 className="font-bold text-[10px] text-slate-500 uppercase tracking-wide mb-2">Live Spoiled Records</h5>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {wasteRecords.length === 0 ? (
                <p className="text-[10px] text-slate-400">Green kitchens! No waste registered.</p>
              ) : (
                [...wasteRecords].reverse().map(record => (
                  <div key={record.id} className="p-2 rounded-lg bg-rose-50 text-[10px] flex justify-between items-center text-rose-900 leading-tight">
                    <div>
                      <p className="font-bold">{record.ingredientName}</p>
                      <p className="text-[9px] text-slate-500">{record.quantity} {record.unit} • {record.reason}</p>
                    </div>
                    <span className="font-mono font-bold">-${record.cost.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
