import React, { useState } from 'react';
import { Customer } from '../types';
import { Award, User, Phone, Mail, AwardIcon, Sparkles, Send, Search, UserPlus, Star } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomerPoints: (id: string, newPoints: number) => void;
}

export default function CustomersView({
  customers,
  onAddCustomer,
  onUpdateCustomerPoints
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Loyalty simulation notifications logger
  const [smsNotificationMsg, setSmsNotificationMsg] = useState('');
  const [lastDispatchedSMS, setLastDispatchedSMS] = useState<string | null>(null);

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newEmail) return;

    const newCust: Customer = {
      id: `c_${Date.now()}`,
      name: newName,
      phone: newPhone,
      email: newEmail,
      points: 100, // Welcome gift points
      joinDate: new Date().toISOString().split('T')[0],
      notes: newNotes || undefined,
      loyaltyTier: 'Bronze'
    };

    onAddCustomer(newCust);

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');

    // Trigger feedback SMS
    setLastDispatchedSMS(`SMS sent to ${newCust.name}: "Welcome to TableFlow MT Loyalty! You've received 100 bonus Montana Gold points. Treat yourself well!"`);
    setTimeout(() => setLastDispatchedSMS(null), 6000);
  };

  const handleSendSpecialCampaign = (tier: string) => {
    const totalSent = customers.filter(c => tier === 'All' || c.loyaltyTier === tier).length;
    setLastDispatchedSMS(`Bulk Campaign Sent successfully to ${totalSent} clients on ${tier} Tier: "Happy Summer Solstice from TableFlow MT! Swing by for a FREE pint of Bozeman Amber Ale!"`);
    setTimeout(() => setLastDispatchedSMS(null), 7000);
  };

  const getTierMetadata = (points: number) => {
    if (points >= 1000) return { tier: 'Platinium' as const, color: 'bg-zinc-900 border-zinc-700 text-zinc-100', icon: '💎' };
    if (points >= 500) return { tier: 'Gold' as const, color: 'bg-amber-150 border-amber-300 text-amber-900', icon: '⭐️' };
    if (points >= 200) return { tier: 'Silver' as const, color: 'bg-slate-100 border-slate-300 text-slate-800', icon: '🥈' };
    return { tier: 'Bronze' as const, color: 'bg-orange-50 border-orange-200 text-orange-850', icon: '🪵' };
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-1 text-slate-800">
      
      {/* Loyal bulk campaign sender bar */}
      <div className="col-span-12 bg-amber-800 text-amber-50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm flex items-center gap-1.5"><Sparkles className="h-4.5 w-4.5 text-amber-300" /> Automated Montana Gold Loyalty Campaigns</h4>
          <p className="text-[11px] text-amber-200 mt-0.5">Send custom curated rewards campaign to loyalty tiers via automated SMS integrations</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button 
            onClick={() => handleSendSpecialCampaign('All')}
            className="px-3.5 py-1.5 bg-amber-900 hover:bg-amber-950 rounded-xl transition cursor-pointer"
          >
            All Guests (SMS)
          </button>
          <button 
            onClick={() => handleSendSpecialCampaign('Gold')}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 rounded-xl transition cursor-pointer border border-amber-600"
          >
            Gold Tier Only
          </button>
          <button 
            onClick={() => handleSendSpecialCampaign('Platinium')}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition cursor-pointer"
          >
            💎 Platinium Deals
          </button>
        </div>
      </div>

      {lastDispatchedSMS && (
        <div className="col-span-12 anim-fade-in bg-zinc-900 text-emerald-450 p-2.5 rounded-xl border border-zinc-800 font-mono text-[10px] flex items-center gap-2">
          <span className="animate-ping h-2 w-2 rounded-full bg-emerald-400 inline-block shrink-0"></span>
          <span>⚡️ {lastDispatchedSMS}</span>
        </div>
      )}

      {/* Customer Registry Form and searchable CRM list */}
      <div className="xl:col-span-8 space-y-6 flex flex-col justify-start">
        <div className="bg-white rounded-2xl border border-slate-105 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-800">Montana CRM Customer Directory</h3>
              <p className="text-xs text-slate-400">Total registered guests: {customers.length}. Points accumulate automatically from dining receipts ($1 = 10 pts).</p>
            </div>

            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search phone, email, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 pl-9 pr-3 py-1.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomers.map(cust => {
              const meta = getTierMetadata(cust.points);
              return (
                <div key={cust.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/40 hover:bg-slate-50 transition duration-150 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{cust.name}</h4>
                        <p className="text-[10px] text-slate-405 font-medium font-mono">Member since: {cust.joinDate}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase border tracking-wider flex items-center gap-1 ${meta.color}`}>
                        <span>{meta.icon}</span> {meta.tier}
                      </span>
                    </div>

                    <div className="space-y-1 border-t border-dashed border-slate-200/80 pt-2 text-[11px] text-slate-650">
                      <p className="flex items-center gap-1.5 font-mono"><Phone className="h-3.5 w-3.5 text-slate-405" /> {cust.phone}</p>
                      <p className="flex items-center gap-1.5 font-mono"><Mail className="h-3.5 w-3.5 text-slate-405" /> {cust.email}</p>
                      {cust.notes && <p className="text-[10px] italic text-slate-500 mt-1 bg-yellow-50/50 p-1 rounded font-medium border border-yellow-100">“{cust.notes}”</p>}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center bg-white/70 p-1.5 rounded-xl">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-455 font-bold uppercase block tracking-wider">Total Reward Points</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{cust.points} Pts</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateCustomerPoints(cust.id, cust.points + 50)}
                        className="p-1 px-2 text-[10px] font-bold text-amber-800 hover:bg-amber-100/50 transition rounded bg-amber-50"
                      >
                        +50 Pts
                      </button>
                      <button
                        onClick={() => onUpdateCustomerPoints(cust.id, Math.max(0, cust.points - 100))}
                        disabled={cust.points < 100}
                        className="p-1 px-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition rounded disabled:opacity-30"
                      >
                        Redeem (100)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Guest Enrollment Form */}
      <div className="xl:col-span-4 flex flex-col h-full">
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-amber-800" /> Enroll Montana Guest
          </h4>

          <form onSubmit={handleRegisterCustomer} className="space-y-3 mr-0 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Full Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Charles Russell"
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Phone Cell</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(406) 555-0104"
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="russell@art.com"
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Food Preferences & Notes</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Prefers window booths, loves Huckleberry pie, etc..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
            >
              Enroll & Add Guest
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
