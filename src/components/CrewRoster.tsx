import React, { useState } from 'react';
import { Users, UserPlus, DownloadCloud, Check, Phone, DollarSign, Shield } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  primaryRole: string;
  workerType: 'in_house' | 'freelance' | 'contractor';
  dayRate: number;
  status: 'active' | 'on_leave';
}

interface ImportCandidate {
  userId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  selected: boolean;
}

const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-1',
    name: 'Amit Kumar',
    phone: '+91 98765 43210',
    email: 'amit.cinematography@gmail.com',
    primaryRole: 'Lead Photographer',
    workerType: 'freelance',
    dayRate: 6000,
    status: 'active'
  },
  {
    id: 'w-2',
    name: 'Rohan Joshi',
    phone: '+91 98111 22334',
    email: 'rohan.drones@yahoo.com',
    primaryRole: 'Drone Pilot',
    workerType: 'freelance',
    dayRate: 5000,
    status: 'active'
  },
  {
    id: 'w-3',
    name: 'Priya Nair',
    phone: '+91 99887 76655',
    email: 'priya.visuals@outlook.com',
    primaryRole: 'Candid Cinematographer',
    workerType: 'in_house',
    dayRate: 4500,
    status: 'active'
  }
];

const MOCK_PLATFORM_USERS: ImportCandidate[] = [
  { userId: 'u-101', name: 'Sunil Sharma', phone: '+91 98222 11000', email: 'sunil.sharma@gmail.com', role: 'Drone Pilot', selected: true },
  { userId: 'u-102', name: 'Vikram Singh', phone: '+91 97111 44555', email: 'vikram.light@gmail.com', role: 'Lighting Tech', selected: true },
  { userId: 'u-103', name: 'Ananya Roy', phone: '+91 96555 88999', email: 'ananya.editor@gmail.com', role: 'Video Editor', selected: true },
  { userId: 'u-104', name: 'Test Client Account (Guest)', phone: '+91 99999 00000', email: 'test@guest.com', role: 'Client', selected: false }
];

export const CrewRoster: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<ImportCandidate[]>(MOCK_PLATFORM_USERS);
  const [defaultDayRate, setDefaultDayRate] = useState<number>(4500);

  // Master Select All Toggle
  const allSelected = candidates.every(c => c.selected);

  const toggleSelectAll = () => {
    const nextState = !allSelected;
    setCandidates(candidates.map(c => ({ ...c, selected: nextState })));
  };

  const toggleCandidate = (userId: string) => {
    setCandidates(candidates.map(c => c.userId === userId ? { ...c, selected: !c.selected } : c));
  };

  const handleExecuteBatchImport = () => {
    const selected = candidates.filter(c => c.selected);
    const newWorkers: Worker[] = selected.map((c, i) => ({
      id: `w-imp-${Date.now()}-${i}`,
      name: c.name,
      phone: c.phone,
      email: c.email,
      primaryRole: c.role,
      workerType: 'freelance',
      dayRate: defaultDayRate,
      status: 'active'
    }));

    setWorkers([...newWorkers, ...workers]);
    setShowImportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyber-purple" />
          <h2 className="text-base font-heading font-bold text-slate-100">Team & Freelancers Roster</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyber-dark text-cyan-300 rounded-xl text-xs font-semibold hover:bg-cyan-950/40 border border-cyber-borderCyan transition"
          >
            <DownloadCloud className="w-4 h-4 text-cyan-400" /> 1-Tap Team Onboarding
          </button>
        </div>
      </div>

      {/* Workers Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-cyber-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cyber-dark/80 text-slate-400 text-[11px] uppercase font-mono tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Name & Contact</th>
                <th className="py-3.5 px-4">Primary Role</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Day Rate</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {workers.map(w => (
                <tr key={w.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{w.name}</div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-purple-400" /> {w.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <span className="px-2.5 py-1 rounded-lg bg-cyber-purple/10 text-purple-300 border border-cyber-purple/30 text-xs">
                      {w.primaryRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize text-xs text-slate-400">{w.workerType.replace('_', ' ')}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-400">₹{w.dayRate.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs text-purple-300 hover:text-white px-2.5 py-1 rounded-lg hover:bg-cyber-purple/20 transition">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: 1-Tap Team Onboarding */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-xl border border-cyber-cyan/40 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-heading font-bold text-slate-100 flex items-center gap-2">
                  <DownloadCloud className="w-5 h-5 text-cyber-cyan" /> 1-Tap Team Member Onboarding
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detected registered users from your platform. Select whom to add to the crew roster.
                </p>
              </div>
            </div>

            {/* Master Select All Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyber-dark/80 border border-cyber-border">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-cyber-purple focus:ring-0 cursor-pointer"
                />
                <span>Select All ({candidates.length} Detected Users)</span>
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Default Day Rate:</span>
                <input
                  type="number"
                  value={defaultDayRate}
                  onChange={e => setDefaultDayRate(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-black border border-white/10 rounded-lg text-cyan-400 font-mono text-right"
                />
              </div>
            </div>

            {/* Candidate User List with Selective Control */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {candidates.map(candidate => (
                <div
                  key={candidate.userId}
                  onClick={() => toggleCandidate(candidate.userId)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    candidate.selected
                      ? 'bg-cyber-purple/10 border-cyber-purple/50 text-slate-100'
                      : 'bg-cyber-dark/40 border-white/5 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={candidate.selected}
                      onChange={() => {}} // Handled by parent div
                      className="w-4 h-4 rounded text-cyber-purple cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{candidate.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{candidate.phone} • {candidate.email}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-purple-300">
                    {candidate.role}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBatchImport}
                className="px-5 py-2.5 bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-bold rounded-xl text-xs hover:glow-cyan transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Import {candidates.filter(c => c.selected).length} Selected Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
