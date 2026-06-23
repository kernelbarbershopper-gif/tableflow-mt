import React, { useState } from 'react';
import { Order, MenuItem } from '../types';
import { TrendingUp, BarChart4, Download, RefreshCw, AlertCircle, ShoppingCart, BellRing, Check, ShieldCheck } from 'lucide-react';

interface ReportsViewProps {
  completedOrders: Order[];
  menuItems: MenuItem[];
}

export default function ReportsView({
  completedOrders,
  menuItems
}: ReportsViewProps) {
  const [exportTarget, setExportTarget] = useState<'QuickBooks' | 'Xero'>('QuickBooks');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');
  const [incomingAlert, setIncomingAlert] = useState<string | null>(null);

  const calculateFinancialMetrics = () => {
    let salesTotal = 0;
    let costTotal = 0;
    let taxTotal = 0;
    let dineInCount = 0;
    let takeoutCount = 0;
    let deliveryCount = 0;

    completedOrders.forEach(order => {
      salesTotal += order.total;
      taxTotal += order.tax;
      
      if (order.type === 'dine-in') dineInCount++;
      else if (order.type === 'takeout') takeoutCount++;
      else if (order.type === 'delivery') deliveryCount++;

      // calculate raw food costs
      order.items.forEach(it => {
        const matchingDish = menuItems.find(mi => mi.id === it.menuItemId);
        if (matchingDish) {
          costTotal += matchingDish.cost * it.quantity;
        } else {
          costTotal += (it.price * 0.3) * it.quantity; // 30% rule fallback
        }
      });
    });

    const netSales = salesTotal;
    const totalIngredientsCost = costTotal;
    const finalTax = taxTotal;
    const profit = netSales - totalIngredientsCost - finalTax;

    return {
      netSales,
      totalIngredientsCost,
      finalTax,
      profit,
      dineInCount,
      takeoutCount,
      deliveryCount
    };
  };

  const metrics = calculateFinancialMetrics();

  const triggerDataExport = (target: 'QuickBooks' | 'Xero') => {
    // Generate CSV export on flight
    const headers = 'Order_ID,Date,Type,Cost_USD,Revenue_USD,ResortTax_USD,Total_USD\n';
    const rows = completedOrders.map(o => 
      `${o.id.slice(-8)},${new Date(o.createdAt).toLocaleDateString()},${o.type},${(o.subtotal * 0.3).toFixed(2)},${o.subtotal.toFixed(2)},${o.tax.toFixed(2)},${o.total.toFixed(2)}`
    ).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tableflow_export_${target.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessMessage(`Excel CSV generated & downloaded instantly for ${target}. Upload it direct to your Ledger book.`);
    setTimeout(() => setDownloadSuccessMessage(''), 6000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-1 text-slate-800">
      
      {/* Alert Banner */}
      {incomingAlert && (
        <div className="col-span-12 anim-fade-in bg-amber-800 text-white p-3.5 rounded-xl font-bold flex items-center justify-between shadow-lg border border-amber-900">
          <span className="flex items-center gap-2"><BellRing className="h-5 w-5 animate-bounce" /> {incomingAlert}</span>
          <button onClick={() => setIncomingAlert(null)} className="text-white hover:text-amber-250 text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {/* Totals Scorecards Row */}
      <div className="col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Gross Net Revenue</span>
          <p className="font-mono font-black text-2xl text-slate-910 mt-1">${metrics.netSales.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">▲ +14% month-over-month</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Food COGS (Cost)</span>
          <p className="font-mono font-black text-2xl text-slate-910 mt-1">${metrics.totalIngredientsCost.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Target: 30% of turnover rate</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Resort Tax Buffer</span>
          <p className="font-mono font-black text-2xl text-amber-900 mt-1">${metrics.finalTax.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Montana state-regulated local dues</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Net Operating Profit</span>
          <p className="font-mono font-black text-2xl text-emerald-800 mt-1">${metrics.profit.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">▲ Secure margins</p>
        </div>
      </div>

      {/* Main Analytics Graphs Placeholders or Real Visualizers */}
      <div className="xl:col-span-8 space-y-6 flex flex-col justify-start">
        {/* Dynamic breakdown bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800">Operational Channels Breakdown</h3>
            <p className="text-xs text-slate-400">Total orders processed today: {metrics.dineInCount + metrics.takeoutCount + metrics.deliveryCount}</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Dine-In Operations (Table sales)</span>
                <span>{metrics.dineInCount} reservations ({Math.round(metrics.dineInCount / (metrics.dineInCount + metrics.takeoutCount + metrics.deliveryCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-800 h-full rounded-full" style={{ width: `${metrics.dineInCount / (metrics.dineInCount + metrics.takeoutCount + metrics.deliveryCount) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Direct Takeout Orders</span>
                <span>{metrics.takeoutCount} guest collections ({Math.round(metrics.takeoutCount / (metrics.dineInCount + metrics.takeoutCount + metrics.deliveryCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${metrics.takeoutCount / (metrics.dineInCount + metrics.takeoutCount + metrics.deliveryCount) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>3rd Party Integrated Delivery (DoorDash, Uber Eats)</span>
                <span>{metrics.deliveryCount} dropoffs ({Math.round(metrics.deliveryCount / (metrics.dineInCount + metrics.takeoutCount + metrics.deliveryCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${metrics.deliveryCount / (metrics.dineInCount + metrics.takeoutCount + metrics.deliveryCount) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Logs */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800">Closed Sales Stream Log</h3>
            <p className="text-xs text-slate-405">Review completed bills, tips, and taxes collected to sync manually if required.</p>
          </div>

          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-2 px-3">Order ID</th>
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2 text-right">Subtotal</th>
                  <th className="py-2 px-2 text-right">Tax (Resort)</th>
                  <th className="py-2 px-3 text-right">Grand Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {completedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-405">
                      No transactions recorded this Shift yet.
                    </td>
                  </tr>
                ) : (
                  [...completedOrders].reverse().map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-850 font-mono">#{ord.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[9px] text-slate-400">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide inline-block ${
                          ord.type === 'dine-in' ? 'bg-amber-100 text-amber-900' : ord.type === 'takeout' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ord.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">${ord.subtotal.toFixed(2)}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-amber-800">${ord.tax.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">${ord.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* side bars: QuickBooks Export Box & Delivery Simulator Box */}
      <div className="xl:col-span-4 space-y-6 flex flex-col justify-start">
        {/* Ledger Export Sync */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-3.5 text-left">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-amber-800" /> Export Accounting Logs
          </h4>
          <p className="text-slate-500 text-xs leading-relaxed">
            Montana state taxes require meticulous ledgers. Sync TableFlow transactions directly to QuickBooks or Xero in safe CSV matrices.
          </p>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 border border-slate-150 rounded-xl text-xs">
            <button
              onClick={() => setExportTarget('QuickBooks')}
              className={`py-1.5 rounded-lg text-center font-bold ${
                exportTarget === 'QuickBooks' ? 'bg-amber-800 text-white' : 'bg-transparent text-slate-600'
              }`}
            >
              QuickBooks Online
            </button>
            <button
              onClick={() => setExportTarget('Xero')}
              className={`py-1.5 rounded-lg text-center font-bold ${
                exportTarget === 'Xero' ? 'bg-amber-800 text-white' : 'bg-transparent text-slate-600'
              }`}
            >
              Xero Ledger
            </button>
          </div>

          <button
            onClick={() => triggerDataExport(exportTarget)}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 mt-2 transition cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export QuickBooks CSV
          </button>

          {downloadSuccessMessage && (
            <p className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-2 text-[10px] rounded-lg anim-fade-in font-medium">
              🔔 {downloadSuccessMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
