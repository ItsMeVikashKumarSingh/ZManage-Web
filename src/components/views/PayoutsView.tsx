import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Receipt, Check, Loader2, Plus, 
  DollarSign, X, ArrowUpRight, Search, FileText, Download
} from 'lucide-react';
import { api, PayoutRecord, PayoutsSummary, WorkerRecord } from '../../lib/api';
import { exportToCsv } from '../../lib/exportUtils';
import { useToast } from '../Toast';

export const PayoutsView: React.FC = () => {
  const toast = useToast();
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [summary, setSummary] = useState<PayoutsSummary>({
    pending_total: 0,
    settled_total: 0,
    pending_count: 0,
    settled_count: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Settlement Modal State
  const [target, setTarget] = useState<PayoutRecord | null>(null);
  const [utr, setUtr] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('upi');
  const [isSettling, setIsSettling] = useState<boolean>(false);

  // Manual Record Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newPayout, setNewPayout] = useState({
    worker_id: '',
    amount: 3500,
    payment_mode: 'upi' as const,
    notes: '',
    is_already_paid: false,
    reference_number: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [list, sum, workersList] = await Promise.all([
        api.getPayouts(),
        api.getPayoutsSummary(),
        api.getWorkers()
      ]);
      setPayouts(list || []);
      
      // Calculate ledger-derived fallback totals and counts to guarantee UI consistency
      const rawList = list || [];
      const isSettled = (p: any) => p.status === 'settled' || p.payout_status === 'paid' || p.payout_status === 'settled';
      const isPending = (p: any) => p.status === 'pending' || p.payout_status === 'pending' || p.payout_status === 'approved';

      const fallbackSettledCount = rawList.filter(isSettled).length;
      const fallbackPendingCount = rawList.filter(isPending).length;
      const fallbackSettledTotal = rawList.filter(isSettled).reduce((acc, p: any) => acc + (Number(p.total_amount ?? p.amount) || 0), 0);
      const fallbackPendingTotal = rawList.filter(isPending).reduce((acc, p: any) => acc + (Number(p.total_amount ?? p.amount) || 0), 0);

      setSummary({
        pending_total: sum?.pending_total ?? fallbackPendingTotal,
        settled_total: sum?.settled_total ?? sum?.paid_total ?? fallbackSettledTotal,
        pending_count: sum?.pending_count ?? fallbackPendingCount,
        settled_count: sum?.settled_count ?? fallbackSettledCount
      });
      setWorkers(workersList || []);
      if (workersList && workersList.length > 0 && !newPayout.worker_id) {
        setNewPayout(prev => ({ ...prev, worker_id: workersList[0].id }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch payouts from ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    try {
      setIsSettling(true);
      await api.settlePayout(
        target.id, 
        utr || `UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        paymentMode
      );
      await loadData();
      setTarget(null);
      setUtr('');
      toast.success('Payout settled successfully');
    } catch (err: any) {
      toast.error(err.message || 'Settlement failed');
    } finally {
      setIsSettling(false);
    }
  };

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayout.worker_id) {
      toast.error('Please select a team member or contractor');
      return;
    }

    try {
      setIsCreating(true);
      await api.createPayout({
        worker_id: newPayout.worker_id,
        total_amount: Number(newPayout.amount) || 0,
        currency: 'INR',
        payout_status: newPayout.is_already_paid ? 'paid' : 'pending',
        payment_mode: newPayout.payment_mode,
        reference_number: newPayout.reference_number || undefined,
        notes: newPayout.notes || undefined
      });
      await loadData();
      setShowAddModal(false);
      toast.success('Payout recorded successfully');
      setNewPayout({
        worker_id: workers[0]?.id || '',
        amount: 3500,
        payment_mode: 'upi',
        notes: '',
        is_already_paid: false,
        reference_number: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payout');
    } finally {
      setIsCreating(false);
    }
  };

  const filtered = payouts.filter(p => {
    const matchStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && (p.status === 'pending' || (p as any).payout_status === 'pending')) ||
      (statusFilter === 'settled' && (p.status === 'settled' || (p as any).payout_status === 'paid'));
    
    const workerName = p.workers?.name || '';
    const matchSearch = workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.utr_reference || (p as any).reference_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleExportPayouts = () => {
    exportToCsv('worker_payouts_ledger', filtered, [
      { header: 'Payout ID', accessor: p => p.id },
      { header: 'Worker Name', accessor: p => p.workers?.name || p.worker_id },
      { header: 'Worker Phone', accessor: p => p.workers?.phone || '' },
      { header: 'Payment Mode', accessor: p => (p as any).payment_mode || 'upi' },
      { header: 'Amount (INR)', accessor: p => (p as any).total_amount || p.amount || 0 },
      { header: 'Settlement Status', accessor: p => p.status || (p as any).payout_status },
      { header: 'Created Date', accessor: p => p.created_at?.split('T')[0] || '' },
      { header: 'UTR / Reference', accessor: p => p.utr_reference || (p as any).reference_number || '' }
    ]);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-electric" /> Worker Compensation & Payouts Ledger
          </h1>
          <p className="text-xs text-steel dark:text-zinc-400 max-w-xl">
            Track contractor compensations, settle shifts via UPI / IMPS, and maintain audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="dub-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Record Direct Payout
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadData} className="underline text-xs ml-2">Retry</button>
        </div>
      )}

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="dub-card px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-steel dark:text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-tangerine" /> Pending Settlements
            </div>
            <div className="text-lg font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              ₹{(summary.pending_total || 0).toLocaleString()}
            </div>
          </div>
          <span className="text-[11px] text-fog dark:text-zinc-500 font-mono text-right">{summary.pending_count || 0} pending</span>
        </div>

        <div className="dub-card px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-steel dark:text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-vividGreen" /> Settled Total
            </div>
            <div className="text-lg font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              ₹{((summary.settled_total ?? summary.paid_total) || 0).toLocaleString()}
            </div>
          </div>
          <span className="text-[11px] text-vividGreen font-medium text-right">{summary.settled_count || 0} settled</span>
        </div>

        <div className="dub-card px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-steel dark:text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-electric" /> Total Ledger Entries
            </div>
            <div className="text-lg font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              {payouts.length} Records
            </div>
          </div>
          <span className="text-[11px] text-fog dark:text-zinc-500 text-right">Ledger</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5">
          {(['all', 'pending', 'settled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition cursor-pointer ${
                statusFilter === tab
                  ? 'bg-charcoal text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
              }`}
            >
              {tab === 'all' ? 'All Transactions' : tab === 'pending' ? 'Pending' : 'Settled'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-fog absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by worker or UTR..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="dub-input w-full pl-10 text-xs"
            />
          </div>

          <button
            onClick={handleExportPayouts}
            className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Export payouts to CSV"
          >
            <Download className="w-3.5 h-3.5 text-electric" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="dub-card overflow-hidden bg-white border border-ash">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel">Loading ledger transactions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-steel">
            No payouts found matching criteria. Click "Record Payout / Expense" to log worker compensation.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-paper/60 text-steel font-medium border-b border-ash">
              <tr>
                <th className="py-2.5 px-4">RECIPIENT</th>
                <th className="py-2.5 px-4">AMOUNT</th>
                <th className="py-2.5 px-4">PAYMENT MODE</th>
                <th className="py-2.5 px-4">STATUS & REFERENCE</th>
                <th className="py-2.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash text-charcoal">
              {filtered.map(p => {
                const isPaid = p.status === 'settled' || (p as any).payout_status === 'paid';
                const totalAmt = (p as any).total_amount || p.amount;
                const refNum = p.utr_reference || (p as any).reference_number;
                const mode = (p as any).payment_mode || 'upi';

                return (
                  <tr key={p.id} className="hover:bg-paper/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-medium text-charcoal">{p.workers?.name || 'Assigned Crew'}</div>
                      <div className="text-[11px] text-steel">{p.workers?.phone || 'On file'}</div>
                      {p.workers?.payment_details?.upi_id && (
                        <div className="text-[10px] font-mono text-fog mt-0.5">UPI: {p.workers.payment_details.upi_id}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-charcoal">
                      ₹{Number(totalAmt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[11px] text-steel">
                      {mode.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      {isPaid ? (
                        <div>
                          <span className="dub-badge-mint text-[10px] font-mono inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> SETTLED
                          </span>
                          {refNum && (
                            <div className="text-[10px] font-mono text-fog mt-0.5">Ref: {refNum}</div>
                          )}
                        </div>
                      ) : (
                        <span className="dub-badge-tangerine text-[10px] font-mono inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isPaid ? (
                        <button
                          onClick={() => setTarget(p)}
                          className="dub-btn-primary text-xs px-3 py-1"
                        >
                          Settle & Add UTR
                        </button>
                      ) : (
                        <span className="text-[11px] text-fog font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Settle Modal */}
      {target && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-md space-y-4">
            <h2 className="text-sm font-semibold font-satoshi text-charcoal">Confirm Shift & Worker Payout</h2>
            <div className="p-3.5 rounded-xl bg-paper border border-ash text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-steel">Recipient:</span>
                <span className="font-semibold text-charcoal">{target.workers?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel">UPI Address:</span>
                <span className="font-mono text-charcoal">{target.workers?.payment_details?.upi_id || 'Bank on file'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-ash font-bold">
                <span>Total Due:</span>
                <span className="text-electric">₹{Number((target as any).total_amount || target.amount).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleSettle} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="dub-input w-full text-xs"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">IMPS / NEFT Bank Transfer</option>
                  <option value="cash">Direct Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">
                  Bank UTR / UPI Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 429182049102"
                  value={utr}
                  onChange={e => setUtr(e.target.value)}
                  className="dub-input w-full text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ash">
                <button
                  type="button"
                  onClick={() => setTarget(null)}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSettling}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isSettling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payout Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal">Record Payout / Compensation</h2>
                <p className="text-xs text-steel">Log worker gig fee, rental expense, or bonus payout.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-fog hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePayout} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Select Team Member *</label>
                <select
                  required
                  value={newPayout.worker_id}
                  onChange={e => setNewPayout({ ...newPayout, worker_id: e.target.value })}
                  className="dub-input w-full text-xs"
                >
                  {workers.length === 0 ? (
                    <option value="">No team members found</option>
                  ) : (
                    workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.primary_role})</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newPayout.amount === 0 ? '' : newPayout.amount}
                    onChange={e => setNewPayout({ ...newPayout, amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Payment Method</label>
                  <select
                    value={newPayout.payment_mode}
                    onChange={e => setNewPayout({ ...newPayout, payment_mode: e.target.value as any })}
                    className="dub-input w-full text-xs"
                  >
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Extra hours on shoot / drone battery rental"
                  value={newPayout.notes}
                  onChange={e => setNewPayout({ ...newPayout, notes: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPayout.is_already_paid}
                    onChange={e => setNewPayout({ ...newPayout, is_already_paid: e.target.checked })}
                    className="rounded border-ash text-electric focus:ring-0"
                  />
                  <span className="text-xs font-medium text-charcoal">Already paid & settled</span>
                </label>
              </div>

              {newPayout.is_already_paid && (
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">UTR / Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9811220049"
                    value={newPayout.reference_number}
                    onChange={e => setNewPayout({ ...newPayout, reference_number: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ash">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
