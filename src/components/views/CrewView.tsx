import React, { useState, useEffect } from 'react';
import { Users, DownloadCloud, Phone, Check, Shield, Search, Loader2 } from 'lucide-react';
import { api, WorkerRecord, ImportCandidate } from '../../lib/api';

export const CrewView: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [candidates, setCandidates] = useState<Array<ImportCandidate & { selected: boolean }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [defaultDayRate, setDefaultDayRate] = useState<number>(4500);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getWorkers();
      setWorkers(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch crew members');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      const res = await api.getImportCandidates();
      const mapped = (res.candidates || []).map(c => ({
        ...c,
        selected: !c.is_already_worker
      }));
      setCandidates(mapped);
    } catch (err: any) {
      // Non-blocking
    }
  };

  useEffect(() => {
    loadWorkers();
    loadCandidates();
  }, []);

  const allSelected = candidates.length > 0 && candidates.filter(c => !c.is_already_worker).every(c => c.selected);

  const toggleSelectAll = () => {
    const next = !allSelected;
    setCandidates(candidates.map(c => c.is_already_worker ? c : { ...c, selected: next }));
  };

  const toggleCandidate = (id: string) => {
    setCandidates(candidates.map(c => c.user_id === id ? { ...c, selected: !c.selected } : c));
  };

  const handleExecuteImport = async () => {
    const selected = candidates.filter(c => c.selected && !c.is_already_worker);
    if (selected.length === 0) return;

    try {
      setIsImporting(true);
      await api.batchImportWorkers({
        selected_users: selected.map(c => ({
          user_id: c.user_id,
          name: c.name,
          phone: c.phone || '+91 98000 00000',
          email: c.email,
          primary_role: c.auth_role === 'admin' ? 'lead_photographer' : 'cinematographer',
          worker_type: 'freelance',
          day_rate: defaultDayRate
        })),
        default_worker_type: 'freelance',
        default_day_rate: defaultDayRate
      });

      await loadWorkers();
      await loadCandidates();
      setShowImportModal(false);
    } catch (err: any) {
      alert(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal">Team & Freelancers</h1>
          <p className="text-xs text-steel">Manage crew members, day rates, and 1-tap user onboarding from studio staff.</p>
        </div>

        <button
          onClick={() => {
            loadCandidates();
            setShowImportModal(true);
          }}
          className="dub-btn-outline text-xs px-4 py-2 flex items-center gap-1.5 text-charcoal hover:bg-paper"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-electric" /> 1-Tap Team Onboarding
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadWorkers} className="underline text-xs ml-2">Retry</button>
        </div>
      )}

      <div className="dub-card overflow-hidden bg-white">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel">Loading active crew roster from ZManage-APIs...</span>
          </div>
        ) : workers.length === 0 ? (
          <div className="p-12 text-center text-xs text-steel">
            No crew members currently added. Use "1-Tap Team Onboarding" to sync registered staff.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-steel text-[11px] font-medium uppercase tracking-wider border-b border-ash">
              <tr>
                <th className="py-3 px-4">Name & Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Day Rate</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash text-charcoal">
              {workers.map(w => (
                <tr key={w.id} className="hover:bg-paper/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-charcoal text-sm">{w.name}</div>
                    <div className="text-xs text-fog font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-fog" /> {w.phone || w.email}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="dub-pill text-[11px] py-0.5 px-2 bg-paper text-steel uppercase font-mono">
                      {(w.primary_role || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 capitalize text-xs text-steel">
                    {(w.worker_type || '').replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-charcoal">
                    ₹{Number(w.day_rate).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs text-vividGreen font-medium">
                      <span className="w-2 h-2 rounded-full bg-vividGreen" /> {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 1-Tap Onboarding Modal (Dub Style) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal">
                  1-Tap Team Onboarding from Studio
                </h2>
                <p className="text-xs text-steel">
                  Import registered platform users and studio staff directly into the operations roster.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-steel">Available Candidates ({candidates.length})</span>
                <button
                  onClick={toggleSelectAll}
                  className="text-electric hover:underline text-xs font-medium"
                >
                  {allSelected ? 'Deselect All' : 'Select All Available'}
                </button>
              </div>

              <div className="divide-y divide-ash border border-ash rounded-xl max-h-56 overflow-y-auto">
                {candidates.length === 0 ? (
                  <div className="p-4 text-center text-xs text-steel">No new registered platform users found.</div>
                ) : (
                  candidates.map(c => (
                    <div
                      key={c.user_id}
                      onClick={() => !c.is_already_worker && toggleCandidate(c.user_id)}
                      className={`p-3 flex items-center justify-between transition cursor-pointer ${
                        c.is_already_worker ? 'opacity-40 bg-paper/50 cursor-not-allowed' : 'hover:bg-paper/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={c.is_already_worker}
                          checked={c.selected}
                          onChange={() => {}}
                          className="rounded border-ash text-electric focus:ring-0"
                        />
                        <div>
                          <div className="text-xs font-medium text-charcoal">{c.name}</div>
                          <div className="text-[11px] text-fog font-mono">{c.email || c.phone}</div>
                        </div>
                      </div>

                      <div>
                        {c.is_already_worker ? (
                          <span className="text-[10px] font-mono text-fog bg-paper px-2 py-0.5 rounded-full border border-ash">
                            Already Added
                          </span>
                        ) : (
                          <span className="dub-pill text-[10px] py-0.5 px-2 bg-paper text-steel font-mono">
                            {c.auth_role || 'Staff'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-steel mb-1">
                  Default Day Rate for Imported Members (₹)
                </label>
                <input
                  type="number"
                  value={defaultDayRate}
                  onChange={e => setDefaultDayRate(Number(e.target.value))}
                  className="dub-input w-full text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ash">
              <button
                onClick={() => setShowImportModal(false)}
                className="dub-btn-outline text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                disabled={isImporting || candidates.filter(c => c.selected && !c.is_already_worker).length === 0}
                onClick={handleExecuteImport}
                className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
              >
                {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Import Selected ({candidates.filter(c => c.selected && !c.is_already_worker).length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
