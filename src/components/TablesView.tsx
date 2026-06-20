import React, { useState } from 'react';
import { Table, Reservation } from '../types';
import { LayoutGrid, Calendar, Users, Clock, AlertTriangle, ArrowRight, UserCheck, Mail, Phone, CalendarCheck, CheckCircle, Send, Plus } from 'lucide-react';

interface TablesViewProps {
  tables: Table[];
  reservations: Reservation[];
  onAddReservation: (res: Reservation) => void;
  onUpdateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved') => void;
}

export default function TablesView({
  tables,
  reservations,
  onAddReservation,
  onUpdateTableStatus
}: TablesViewProps) {
  const [waitlist, setWaitlist] = useState<{ id: string; name: string; size: number; phone: string; joinedAt: string }[]>([
    { id: 'w1', name: 'Butch Cassidy', size: 3, phone: '(406) 555-0777', joinedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString() },
    { id: 'w2', name: 'Teddy Roosevelt', size: 2, phone: '(406) 555-1901', joinedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() }
  ]);
  
  const [newWaitName, setNewWaitName] = useState('');
  const [newWaitSize, setNewWaitSize] = useState(2);
  const [newWaitPhone, setNewWaitPhone] = useState('');

  // Reservation form states
  const [resName, setResName] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resSize, setResSize] = useState(4);
  const [resTime, setResTime] = useState('');
  const [selectedTableForRes, setSelectedTableForRes] = useState('');
  const [resNotes, setResNotes] = useState('');

  // SMS & Mail simulator trigger values
  const [notificationLog, setNotificationLog] = useState<{ id: string; message: string; type: 'sms' | 'email'; timestamp: string }[]>([]);

  const handleAddToWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaitName || !newWaitPhone) return;

    const newEntry = {
      id: `w_${Date.now()}`,
      name: newWaitName,
      size: Number(newWaitSize),
      phone: newWaitPhone,
      joinedAt: new Date().toISOString()
    };

    setWaitlist(prev => [...prev, newEntry]);
    
    // Simulate Confirmation SMS
    addNotification(`SMS sent to ${newWaitName} at ${newWaitPhone}: "Hi ${newWaitName}! TableFlow waiting list spot confirmed. Spot #3. Estimated wait 15 min."`, 'sms');

    // Reset
    setNewWaitName('');
    setNewWaitPhone('');
    setNewWaitSize(2);
  };

  const handleNotifyWaitlist = (id: string) => {
    const person = waitlist.find(w => w.id === id);
    if (!person) return;

    addNotification(`SMS sent to ${person.name} at ${person.phone}: "TableFlow MT: Your table of ${person.size} is now ready! Please approach the host counter."`, 'sms');
  };

  const handleSeatWaitlist = (id: string, tableId: string) => {
    const person = waitlist.find(w => w.id === id);
    if (!person) return;

    onUpdateTableStatus(tableId, 'occupied');
    setWaitlist(prev => prev.filter(w => w.id !== id));
    addNotification(`Notification: Seated ${person.name} party at Table ${tables.find(t => t.id === tableId)?.number || ''}`, 'sms');
  };

  const handleRemoveWaitlist = (id: string) => {
    setWaitlist(prev => prev.filter(w => w.id !== id));
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resEmail || !resPhone || !resTime) return;

    const newRes: Reservation = {
      id: `res_${Date.now()}`,
      customerName: resName,
      customerEmail: resEmail,
      customerPhone: resPhone,
      partySize: Number(resSize),
      dateTime: resTime,
      tableId: selectedTableForRes || undefined,
      status: 'confirmed',
      notes: resNotes || undefined
    };

    onAddReservation(newRes);

    if (selectedTableForRes) {
      onUpdateTableStatus(selectedTableForRes, 'reserved');
    }

    // Simulate Confirmation E-mail & SMS
    addNotification(`E-mail sent to ${resName} (${resEmail}): "TableFlow Booking System: Reservation Confirmed for ${ResMonthDay(resTime)}. We look forward to absolute comfort rústico!"`, 'email');
    addNotification(`SMS sent to ${resName} at ${resPhone}: "TableFlow Confirm: Reservation locked in for ${ResMonthDay(resTime)}. Respond CANCEL to cancel."`, 'sms');

    // Reset Form
    setResName('');
    setResEmail('');
    setResPhone('');
    setResNotes('');
    setResTime('');
    setSelectedTableForRes('');
  };

  const addNotification = (message: string, type: 'sms' | 'email') => {
    const log = {
      id: `notif_${Date.now()}_${Math.random()}`,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotificationLog(prev => [log, ...prev]);
  };

  function ResMonthDay(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full p-1 text-slate-800">
      {/* Table Map Visualizer */}
      <div className="xl:col-span-8 space-y-6 flex flex-col justify-start">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                <LayoutGrid className="h-5 w-5 text-amber-800" /> Interactive Montana Table Map
              </h3>
              <p className="text-xs text-slate-500">Click a table to toggle status visually between Available, Occupied, Reserved</p>
            </div>
            
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="flex items-center gap-1.5 px-2 py-0.5"><span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span> Available</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5"><span className="h-3 w-3 rounded-full bg-red-500 inline-block"></span> Occupied</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5"><span className="h-3 w-3 rounded-full bg-amber-500 inline-block"></span> Reserved</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {tables.map(table => {
              const statusColors = {
                available: 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900',
                occupied: 'border-red-200 bg-red-50/40 hover:bg-red-50 text-red-900',
                reserved: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50 text-amber-900'
              };

              const statusBadge = {
                available: 'bg-emerald-100 text-emerald-800 text-[10px]',
                occupied: 'bg-red-100 text-red-800 text-[10px]',
                reserved: 'bg-amber-100 text-amber-800 text-[10px]'
              };

              // Simple occup duration calc simulation
              let durationStr = '';
              if (table.occupiedSince) {
                const diffMin = Math.round((Date.now() - new Date(table.occupiedSince).getTime()) / 60000);
                durationStr = `${diffMin}m active`;
              }

              return (
                <div 
                  key={table.id}
                  onClick={() => {
                    // Quick state toggling simulator
                    const nextStatus = table.status === 'available' ? 'occupied' : table.status === 'occupied' ? 'reserved' : 'available';
                    onUpdateTableStatus(table.id, nextStatus);
                  }}
                  className={`border-2 p-4 rounded-2xl flex flex-col justify-between h-32 cursor-pointer transition relative group overflow-hidden ${statusColors[table.status]}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-2xl font-black text-slate-800/80">
                      T-{table.number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusBadge[table.status]}`}>
                      {table.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-650">
                      <Users className="h-3.5 w-3.5" />
                      <span>Cap: {table.capacity}</span>
                    </div>

                    {table.status === 'occupied' && (
                      <div className="flex items-center gap-1.5 text-[100%] text-red-700/90 font-mono font-bold animate-pulse text-[11px]">
                        <Clock className="h-3 w-3" />
                        <span>{durationStr || 'just seated'}</span>
                      </div>
                    )}
                  </div>

                  {/* Gentle overlay for visual interaction hint */}
                  <div className="absolute inset-x-0 bottom-0 py-0.5 text-center bg-slate-900/5 hover:bg-slate-900/10 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                    Change status
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waitlist Section */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-800" /> Active Montana Waitlist
            </h4>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {waitlist.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Nobody in waiting list. Hosts can welcome direct dine-ins.
                </div>
              ) : (
                waitlist.map((item, idx) => {
                  const minutesAgo = Math.round((Date.now() - new Date(item.joinedAt).getTime()) / 60000);
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span className="text-slate-400">#{idx + 1}</span> {item.name}
                          <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.size} Guests
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium font-mono">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {item.phone}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> waiting {minutesAgo}m</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleNotifyWaitlist(item.id)}
                          className="px-2 py-1 bg-amber-50 rounded-lg hover:bg-amber-100 text-amber-800 font-bold transition flex items-center gap-1 border border-amber-100"
                        >
                          <Send className="h-3 w-3" /> Notify SMS
                        </button>
                        
                        {/* Seating Trigger selector */}
                        <div className="relative group">
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleSeatWaitlist(item.id, e.target.value);
                            }}
                            className="bg-emerald-600 text-white rounded-lg px-2 py-1 text-xs font-bold hover:bg-emerald-700 transition cursor-pointer outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>Seat At...</option>
                            {tables.filter(t => t.status === 'available').map(t => (
                              <option key={t.id} value={t.id}>Table {t.number}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWaitlist(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <form onSubmit={handleAddToWaitlist} className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-3">
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Add Quick Waitlist</h5>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Guest Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Doc Holliday"
                    value={newWaitName}
                    onChange={(e) => setNewWaitName(e.target.value)}
                    className="w-full bg-white p-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Cell Number</label>
                  <input
                    type="phone"
                    required
                    placeholder="(406) 555-0312"
                    value={newWaitPhone}
                    onChange={(e) => setNewWaitPhone(e.target.value)}
                    className="w-full bg-white p-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Size (Party)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newWaitSize}
                    onChange={(e) => setNewWaitSize(Number(e.target.value))}
                    className="w-full bg-white p-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-700 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow"
            >
              <Plus className="h-3.5 w-3.5" /> Book Space
            </button>
          </form>
        </div>
      </div>

      {/* Reservation Scheduling Sidebar */}
      <div className="xl:col-span-4 space-y-6 flex flex-col h-full">
        {/* New Reservation Form Box */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-amber-800" /> Book Montana Table
          </h4>

          <form onSubmit={handleCreateReservation} className="space-y-3 mr-0">
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Party Host</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frank Billings"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="guest@mail.com"
                    value={resEmail}
                    onChange={(e) => setResEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Cellular</label>
                  <input
                    type="tel"
                    required
                    placeholder="(406) 555-8889"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Party Size</label>
                  <select
                    value={resSize}
                    onChange={(e) => setResSize(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n} Guests</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Assign Table</label>
                  <select
                    value={selectedTableForRes}
                    onChange={(e) => setSelectedTableForRes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">No table pre-set</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        Table {t.number} ({t.capacity} cap)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={resTime}
                  onChange={(e) => setResTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Special Notes</label>
                <textarea
                  placeholder="Gluten allergies, high-chair, etc..."
                  rows={2}
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold cursor-pointer shadow transition"
            >
              Complete Reservation
            </button>
          </form>
        </div>

        {/* Live Notification log for user to see the actions! */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-md space-y-3">
          <h4 className="font-bold text-xs text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> SMS & E-mail Log (Simulated)
          </h4>
          <span className="block text-[9px] text-slate-400">
            Simulates automated outgoing customer messaging triggers
          </span>
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto font-mono text-[10px]">
            {notificationLog.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No automation logs captured yet.</p>
            ) : (
              notificationLog.map(log => (
                <div key={log.id} className="border-b border-slate-800 pb-2 flex gap-1.5 items-start">
                  {log.type === 'sms' ? (
                    <span className="bg-green-950 text-green-400 text-[8px] font-bold uppercase tracking-wider px-1 rounded whitespace-nowrap">sms</span>
                  ) : (
                    <span className="bg-blue-950 text-blue-400 text-[8px] font-bold uppercase tracking-wider px-1 rounded whitespace-nowrap">mail</span>
                  )}
                  <div>
                    <p className="text-slate-300 break-words leading-relaxed">{log.message}</p>
                    <span className="text-[8px] text-slate-500">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
