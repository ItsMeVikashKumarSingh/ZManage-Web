import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Clock, ArrowUpRight, Receipt, Check } from 'lucide-react';

interface PayoutRecord {
  id: string;
  workerName: string;
  shootTitle: string;
  date: string;
  basePay: number;
  overtime: number;
  totalAmount: number;
  status: 'pending' | 'paid';
  referenceNumber?: string;
  upiId?: string;
}

const INITIAL_PAYOUTS: PayoutRecord[] = [
  {
    id: 'pay-1',
    workerName: 'Amit Kumar',
    shootTitle: 'Arora Wedding (Sangeet)',
    date: '2026-09-12',
    basePay: 6000,
    overtime: 1500,
    totalAmount: 7500,
    status: 'pending',
    upiId: 'amit.photo@okaxis'
  },
  {
    id: 'pay-2',
    workerName: 'Rohan Joshi',
    shootTitle: 'Arora Wedding (Drone Cinematography)',
    date: '2026-09-12',
    basePay: 5000,
    overtime: 0,
    totalAmount: 5000,
    status: 'pending',
    upiId: 'rohan.drones@paytm'
  },
  {
    id: 'pay-3',
    workerName: 'Priya Nair',
    shootTitle: 'Lumina Studio Fashion Commercial',
    date: '2026-09-08',
    basePay: 4500,
    overtime: 500,
    totalAmount: 5000,
    status: 'paid',
    referenceNumber: 'UTR-9928104821',
    upiId: 'priya@icici'
  }
];

export const WorkerPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [settleTarget, setSettleTarget] = useState<PayoutRecord | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');

  const pendingTotal = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const paidTotal = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleTarget) return;

    setPayouts(payouts.map(p => {
      if (p.id === settleTarget.id) {
        return {
          ...p,
          status: 'paid',
          referenceNumber: utrInput || `UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}`
        };
      }
      return p;
    }));

    setSettleTarget(null);
    setUtrInput('');
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border-amber-500/30 relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5" /> Pending Compensation
          </div>
          <div className="text-2xl font-heading font-extrabold text-white mt-2">
            ₹{pendingTotal.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">2 gigs awaiting payout settlement</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Settled This Month
          </div>
          <div className="text-2xl font-heading font-extrabold text-white mt-2">
            ₹{paidTotal.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Direct bank / UPI transfers completed</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-purple-500/30 relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1.5 mb-1">
            <Receipt className="w-3.5 h-3.5" /> Active Freelancers
          </div>
          <div className="text-2xl font-heading font-extrabold text-white mt-2">
            3 Dispatched
          </div>
          <p className="text-xs text-slate-400 mt-1">Contractor day-rate agreements active</p>
        </div>
      </div>

      {/* Payouts Ledger Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-cyber-border">
        <div className="p-4 pb-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-heading font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-cyber-cyan" /> Worker Compensation Ledger
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cyber-dark/80 text-slate-400 text-[11px] uppercase font-mono tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Worker & Shoot Details</th>
                <th className="py-3.5 px-4">Base Pay</th>
                <th className="py-3.5 px-4">Overtime</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status & Reference</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {payouts.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{p.workerName}</div>
                    <div className="text-xs text-slate-400">{p.shootTitle}</div>
                    <div className="text-[11px] font-mono text-purple-300 mt-0.5">UPI: {p.upiId}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">₹{p.basePay.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-amber-300">+₹{p.overtime.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-cyan-400">₹{p.totalAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    {p.status === 'paid' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                          <Check className="w-3 h-3" /> Settled
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">{p.referenceNumber}</div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSettleTarget(p);
                          setUtrInput('');
                        }}
                        className="px-3 py-1.5 bg-cyber-purple/20 text-purple-300 hover:bg-cyber-purple hover:text-white border border-cyber-purple/40 rounded-xl text-xs font-semibold transition"
                      >
                        Settle Payout
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Settle Payout */}
      {settleTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md border border-purple-500/40 space-y-4">
            <h3 className="text-base font-heading font-bold text-slate-100">Settle Worker Payout</h3>
            <div className="p-3 bg-cyber-dark/80 rounded-xl border border-white/5 space-y-1 text-xs">
              <div className="text-slate-400">Worker: <span className="text-slate-200 font-bold">{settleTarget.workerName}</span></div>
              <div className="text-slate-400">Shoot: <span className="text-slate-200">{settleTarget.shootTitle}</span></div>
              <div className="text-slate-400">Amount Due: <span className="text-cyan-400 font-mono font-bold">₹{settleTarget.totalAmount.toLocaleString()}</span></div>
              <div className="text-slate-400">UPI ID: <span className="text-purple-300 font-mono">{settleTarget.upiId}</span></div>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Bank UTR / Transaction Reference</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. UTR-9284029482"
                  value={utrInput}
                  onChange={e => setUtrInput(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-xl text-slate-200 focus:outline-none focus:border-cyber-cyan font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSettleTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
