import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Receipt, Check, Loader2 } from 'lucide-react';
import { api, PayoutRecord, PayoutsSummary } from '../../lib/api';

export const PayoutsView: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [summary, setSummary] = useState<PayoutsSummary>({
    pending_total: 0,
    settled_total: 0,
    pending_count: 0,
    settled_count: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [target, setTarget] = useState<PayoutRecord | null>(null);
  const [utr, setUtr] = useState<string>('');
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [list, sum] = await Promise.all([
        api.getPayouts(),
        api.getPayoutsSummary()
      ]);
      setPayouts(list || []);
      if (sum) setSummary(sum);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch payouts');
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
      await api.settlePayout(target.id, utr || `UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      await loadData();
      setTarget(null);
      setUtr('');
    } catch (err: any) {
      alert(err.message || 'Settlement failed');
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-satoshi font-semibold text-charcoal">Worker Compensation & Payouts</h1>
        <p className="text-xs text-steel">Financial ledger tracking contractor fees, overtime, and settlement proofs via ZManage-APIs.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadData} className="underline text-xs ml-2">Retry</button>
        </div>
      )}

      {/* Dub 3-Tile Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dub-card p-5 bg-white space-y-1">
          <div className="text-xs text-steel font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-tangerine" /> Pending Compensation
          </div>
          <div className="text-2xl font-bold font-satoshi text-charcoal">
            ₹{(summary.pending_total || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-fog">{summary.pending_count || 0} shifts awaiting payout</div>
        </div>

        <div className="dub-card p-5 bg-white space-y-1">
          <div className="text-xs text-steel font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-vividGreen" /> Settled Total
          </div>
          <div className="text-2xl font-bold font-satoshi text-charcoal">
            ₹{(summary.settled_total || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-vividGreen font-medium">{summary.settled_count || 0} verified UTR transactions</div>
        </div>

        <div className="dub-card p-5 bg-white space-y-1">
          <div className="text-xs text-steel font-medium flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-electric" /> Dispatched Shifts
          </div>
          <div className="text-2xl font-bold font-satoshi text-charcoal">
            {payouts.length} Shifts
          </div>
          <div className="text-[11px] text-fog">Standard day-rate agreements</div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="dub-card overflow-hidden bg-white">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel">Loading payout records from database...</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-xs text-steel">
            No payouts currently in the ledger. Payouts are generated automatically upon shoot wrap.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-steel text-[11px] font-medium uppercase tracking-wider border-b border-ash">
              <tr>
                <th className="py-3 px-4">Worker & Shift</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status & Proof</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash text-charcoal">
              {payouts.map(p => (
                <tr key={p.id} className="hover:bg-paper/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-charcoal text-sm">{p.workers?.name || 'Assigned Crew'}</div>
                    <div className="text-xs text-steel">{p.workers?.phone || 'Contact on file'}</div>
                    {p.workers?.payment_details?.upi_id && (
                      <div className="text-[11px] font-mono text-fog mt-0.5">UPI: {p.workers.payment_details.upi_id}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-charcoal">
                    ₹{Number(p.amount).toLocaleString()} {p.currency}
                  </td>
                  <td className="py-3.5 px-4">
                    {p.status === 'pending' && (
                      <span className="dub-badge-tangerine text-[11px] font-mono inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    )}
                    {p.status === 'settled' && (
                      <div>
                        <span className="dub-badge-mint text-[11px] font-mono inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> SETTLED
                        </span>
                        {p.utr_reference && (
                          <div className="text-[10px] font-mono text-fog mt-1">Ref: {p.utr_reference}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.status === 'pending' ? (
                      <button
                        onClick={() => setTarget(p)}
                        className="dub-btn-primary text-xs px-3 py-1.5"
                      >
                        Settle & Upload UTR
                      </button>
                    ) : (
                      <span className="text-xs text-fog font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Settle Modal (Dub Style) */}
      {target && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-md space-y-4">
            <h2 className="text-sm font-semibold font-satoshi text-charcoal">Confirm Shift Payout</h2>
            <div className="p-3.5 rounded-xl bg-paper border border-ash text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-steel">Recipient:</span>
                <span className="font-semibold text-charcoal">{target.workers?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel">UPI Address:</span>
                <span className="font-mono text-charcoal">{target.workers?.payment_details?.upi_id || 'Direct Transfer'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-ash font-bold">
                <span>Total Due:</span>
                <span className="text-electric">₹{Number(target.amount).toLocaleString()} {target.currency}</span>
              </div>
            </div>

            <form onSubmit={handleSettle} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">
                  Bank UTR / UPI Reference Number
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
    </div>
  );
};
