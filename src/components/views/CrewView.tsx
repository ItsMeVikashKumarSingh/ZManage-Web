import React, { useState, useEffect } from 'react';
import { 
  Users, DownloadCloud, Phone, Check, Shield, Search, Loader2, 
  Plus, Edit3, Trash2, X, Mail, DollarSign, UserCheck, Download, MoreVertical
} from 'lucide-react';
import { api, WorkerRecord, ImportCandidate } from '../../lib/api';
import { exportToCsv } from '../../lib/exportUtils';

const STANDARD_ROLES = [
  'Lead Cinematographer',
  'Camera Operator',
  'Drone Pilot',
  'Lighting Director / Gaffer',
  'Sound Engineer',
  'Video Editor',
  'Colorist',
  'Production Assistant',
  'Grip / Rigging Tech',
  'Photographer',
  'Studio Manager',
  'Other / Custom'
];

interface TabPermissionConfig {
  id: string;
  label: string;
  category: string;
}

const ALL_TABS: TabPermissionConfig[] = [
  { id: 'ai', label: 'Zorvik AI Copilot', category: 'Intelligence' },
  { id: 'analytics', label: 'Executive Analytics', category: 'Operations' },
  { id: 'bookings', label: 'Client Bookings', category: 'Operations' },
  { id: 'schedule', label: 'Operations Timeline', category: 'Operations' },
  { id: 'inventory', label: 'Hardware Assets', category: 'Logistics' },
  { id: 'kits', label: 'Equipment Kits & Bundles', category: 'Logistics' },
  { id: 'consumables', label: 'Consumables Stock', category: 'Logistics' },
  { id: 'vaults', label: 'Storage Vaults & Hubs', category: 'Logistics' },
  { id: 'crew', label: 'Workforce & Team', category: 'Workforce' },
  { id: 'payouts', label: 'Compensation Ledger', category: 'Finance' },
  { id: 'logs', label: 'Security & Audit Logs', category: 'Security' }
];

const ROLE_PRESETS: Record<string, { name: string; description: string; tabs: string[] }> = {
  admin: {
    name: 'Admin',
    description: 'Unrestricted access across all operational, financial, and security modules.',
    tabs: ['ai', 'analytics', 'bookings', 'schedule', 'inventory', 'kits', 'consumables', 'vaults', 'crew', 'payouts', 'logs']
  },
  manager: {
    name: 'Studio Manager',
    description: 'Full studio operations, logistics, and crew management (excludes financial payouts and security logs).',
    tabs: ['ai', 'analytics', 'bookings', 'schedule', 'inventory', 'kits', 'consumables', 'vaults', 'crew']
  },
  logistics: {
    name: 'Logistics Lead',
    description: 'Hardware, kits, consumables, vaults storage, and equipment scheduling.',
    tabs: ['inventory', 'kits', 'consumables', 'vaults', 'schedule']
  },
  finance: {
    name: 'Finance & Accounts',
    description: 'Compensation ledger, team rates, and executive financial analytics.',
    tabs: ['payouts', 'crew', 'analytics']
  },
  crew: {
    name: 'Field Crew / Specialist',
    description: 'Operations schedule timeline and Zorvik AI assistant.',
    tabs: ['schedule', 'ai']
  },
  custom: {
    name: 'Custom',
    description: 'Hand-picked module permissions tailored for unique roles.',
    tabs: []
  }
};

export const CrewView: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [candidates, setCandidates] = useState<Array<ImportCandidate & { selected: boolean }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingWorker, setEditingWorker] = useState<WorkerRecord | null>(null);
  const [permissionWorker, setPermissionWorker] = useState<WorkerRecord | null>(null);
  const [selectedRoleTier, setSelectedRoleTier] = useState<string>('crew');
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState<boolean>(false);
  const [defaultDayRate, setDefaultDayRate] = useState<number>(4500);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [customRoleInput, setCustomRoleInput] = useState<string>('');
  const [editingCustomRole, setEditingCustomRole] = useState<string>('');
  const [defaultImportWorkerType, setDefaultImportWorkerType] = useState<'freelance' | 'contractor' | 'in_house'>('freelance');

  // Row Action Menu State (Three-dot dropdown)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New Worker Form
  const [newWorker, setNewWorker] = useState({
    name: '',
    phone: '',
    email: '',
    primary_role: STANDARD_ROLES[0],
    worker_type: 'freelance' as const,
    day_rate: 3500,
    upi_id: '',
    bank_account: '',
    ifsc: ''
  });

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getWorkers();
      setWorkers(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch team members');
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
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    loadWorkers();
    loadCandidates();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
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
          primary_role: c.auth_role || 'Specialist',
          worker_type: defaultImportWorkerType,
          day_rate: defaultDayRate
        })),
        default_worker_type: defaultImportWorkerType,
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

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const effectiveRole = newWorker.primary_role === 'Other / Custom' 
        ? (customRoleInput.trim() || 'Specialist') 
        : (newWorker.primary_role.trim() || 'Team Member');

      await api.createWorker({
        name: newWorker.name,
        phone: newWorker.phone,
        email: newWorker.email || undefined,
        primary_role: effectiveRole,
        worker_type: newWorker.worker_type,
        day_rate: Number(newWorker.day_rate) || 0,
        currency: 'INR',
        payment_details: {
          upi_id: newWorker.upi_id || undefined,
          bank_account: newWorker.bank_account || undefined,
          ifsc: newWorker.ifsc || undefined
        },
        status: 'active'
      });
      await loadWorkers();
      setShowAddModal(false);
      setCustomRoleInput('');
      setNewWorker({
        name: '',
        phone: '',
        email: '',
        primary_role: STANDARD_ROLES[0],
        worker_type: 'freelance',
        day_rate: 3500,
        upi_id: '',
        bank_account: '',
        ifsc: ''
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    try {
      setIsSubmitting(true);
      const effectiveRole = editingWorker.primary_role === 'Other / Custom'
        ? (editingCustomRole.trim() || 'Specialist')
        : (editingWorker.primary_role.trim() || 'Team Member');

      await api.updateWorker(editingWorker.id, {
        name: editingWorker.name,
        phone: editingWorker.phone,
        email: editingWorker.email,
        primary_role: effectiveRole,
        worker_type: editingWorker.worker_type,
        day_rate: Number(editingWorker.day_rate) || 0,
        status: editingWorker.status,
        payment_details: editingWorker.payment_details
      });
      await loadWorkers();
      setEditingWorker(null);
      setEditingCustomRole('');
    } catch (err: any) {
      alert(err.message || 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to remove this member from the team roster?')) return;
    try {
      setDeletingId(id);
      await api.deleteWorker(id);
      await loadWorkers();
    } catch (err: any) {
      alert(err.message || 'Failed to remove worker');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredWorkers = workers.filter(w => {
    const q = searchQuery.toLowerCase();
    return (w.name || '').toLowerCase().includes(q) ||
           (w.primary_role || '').toLowerCase().includes(q) ||
           (w.phone || '').toLowerCase().includes(q) ||
           (w.email || '').toLowerCase().includes(q);
  });

  const handleOpenPermissions = (w: WorkerRecord) => {
    setOpenMenuId(null);
    setPermissionWorker(w);
    const tier = w.role_tier || 'crew';
    setSelectedRoleTier(tier);
    if (w.allowed_tabs && w.allowed_tabs.length > 0) {
      setSelectedTabs([...w.allowed_tabs]);
    } else if (ROLE_PRESETS[tier]) {
      setSelectedTabs([...ROLE_PRESETS[tier].tabs]);
    } else {
      setSelectedTabs([...ROLE_PRESETS.crew.tabs]);
    }
  };

  const handleSelectPreset = (tier: string) => {
    setSelectedRoleTier(tier);
    if (tier !== 'custom' && ROLE_PRESETS[tier]) {
      setSelectedTabs([...ROLE_PRESETS[tier].tabs]);
    }
  };

  const handleToggleTab = (tabId: string) => {
    let next: string[];
    if (selectedTabs.includes(tabId)) {
      next = selectedTabs.filter(t => t !== tabId);
    } else {
      next = [...selectedTabs, tabId];
    }
    setSelectedTabs(next);

    if (selectedRoleTier !== 'custom') {
      const preset = ROLE_PRESETS[selectedRoleTier]?.tabs || [];
      if (preset.length !== next.length || !preset.every(t => next.includes(t))) {
        setSelectedRoleTier('custom');
      }
    }
  };

  const handleSavePermissions = async () => {
    if (!permissionWorker) return;
    try {
      setIsSavingPermissions(true);
      await api.updateWorkerPermissions(permissionWorker.id, {
        role_tier: selectedRoleTier,
        allowed_tabs: selectedTabs
      });
      await loadWorkers();
      setPermissionWorker(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update member permissions');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleExportCrew = () => {
    exportToCsv('team_workforce_roster', filteredWorkers, [
      { header: 'Member Name', accessor: w => w.name },
      { header: 'Primary Role', accessor: w => w.primary_role },
      { header: 'Access Tier', accessor: w => w.role_tier || 'crew' },
      { header: 'Allowed Tabs', accessor: w => (w.allowed_tabs || []).join(';') },
      { header: 'Employment Type', accessor: w => w.worker_type },
      { header: 'Phone', accessor: w => w.phone || '' },
      { header: 'Email', accessor: w => w.email || '' },
      { header: 'Day Rate (INR)', accessor: w => w.day_rate || 0 },
      { header: 'Payment Details', accessor: w => w.payment_details?.upi_id || w.payment_details?.bank_account || '' },
      { header: 'Status', accessor: w => w.status }
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal flex items-center gap-2">
            <Users className="w-5 h-5 text-electric" /> Team & Workforce Roster
          </h1>
          <p className="text-xs text-steel max-w-xl">
            Manage staff, contractors, day-rate agreements, and 1-tap user onboarding across any project.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          <button
            onClick={() => {
              loadCandidates();
              setShowImportModal(true);
            }}
            className="dub-btn-outline text-xs px-3.5 py-2 flex items-center gap-1.5 text-charcoal hover:bg-paper cursor-pointer shrink-0"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-electric" /> 1-Tap Sync
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Member
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadWorkers} className="underline text-xs ml-2">Retry</button>
        </div>
      )}

      {/* Search & Export Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-fog absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team by name, role, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="dub-input w-full pl-10 text-xs"
          />
        </div>

        <button
          onClick={handleExportCrew}
          className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0 cursor-pointer"
          title="Export crew to CSV"
        >
          <Download className="w-3.5 h-3.5 text-electric" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Roster Table */}
      <div className="dub-card overflow-hidden bg-white border border-ash">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel">Loading workforce from ZManage-APIs...</span>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="p-12 text-center text-xs text-steel">
            No team members found. Click <span className="font-semibold text-charcoal">Add Member</span> or use 1-Tap Sync.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[240px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-paper/60 text-steel font-medium border-b border-ash">
                <tr>
                  <th className="py-2.5 px-4">NAME & CONTACT</th>
                  <th className="py-2.5 px-4">ROLE</th>
                  <th className="py-2.5 px-4">ACCESS TIER</th>
                  <th className="py-2.5 px-4">TYPE</th>
                  <th className="py-2.5 px-4">DAY RATE</th>
                  <th className="py-2.5 px-4">STATUS</th>
                  <th className="py-2.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ash text-charcoal">
                {filteredWorkers.map((w, index) => {
                  const isNearBottom = index >= filteredWorkers.length - 2 && filteredWorkers.length > 2;
                  const tier = w.role_tier || 'crew';
                  return (
                    <tr key={w.id} className="hover:bg-paper/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-medium text-charcoal">{w.name}</div>
                        <div className="text-[11px] text-fog font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-fog" /> {w.phone || 'No phone'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="dub-pill text-[10px] py-0.5 px-2 bg-paper text-steel uppercase font-mono">
                          {(w.primary_role || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenPermissions(w)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-ash dark:border-zinc-700 bg-paper/60 dark:bg-zinc-800/60 hover:bg-paper dark:hover:bg-zinc-800 hover:border-purple-500/50 transition cursor-pointer text-left"
                          title="Click to configure tab permissions"
                        >
                          <Shield className={`w-3 h-3 shrink-0 ${
                            tier === 'admin' ? 'text-purple-500' :
                            tier === 'manager' ? 'text-blue-500' :
                            tier === 'logistics' ? 'text-amber-500' :
                            tier === 'finance' ? 'text-emerald-500' :
                            tier === 'crew' ? 'text-cyan-500' :
                            'text-zinc-400'
                          }`} />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono uppercase font-semibold text-charcoal dark:text-zinc-200 leading-tight">
                              {tier}
                            </span>
                            <span className="text-[9px] text-fog dark:text-zinc-400 font-mono leading-tight">
                              {(w.allowed_tabs && w.allowed_tabs.length > 0) ? `${w.allowed_tabs.length} tabs` : 'All tabs'}
                            </span>
                          </div>
                        </button>
                      </td>
                      <td className="py-3 px-4 capitalize text-steel">
                        {(w.worker_type || '').replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-charcoal">
                        ₹{Number(w.day_rate).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-vividGreen font-medium capitalize">
                          <span className="w-1.5 h-1.5 rounded-full bg-vividGreen" /> {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === w.id ? null : w.id);
                            }}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              openMenuId === w.id
                                ? 'bg-paper dark:bg-zinc-800 border-ash dark:border-zinc-700 text-charcoal dark:text-zinc-100 shadow-xs'
                                : 'border-transparent hover:border-ash dark:hover:border-zinc-700 hover:bg-paper dark:hover:bg-zinc-800 text-steel hover:text-charcoal dark:hover:text-zinc-200'
                            }`}
                            title="More actions"
                            aria-label="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === w.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-floating p-1 z-40 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-100 ${
                                isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleOpenPermissions(w)}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2 transition cursor-pointer"
                              >
                                <Shield className="w-3.5 h-3.5 shrink-0" />
                                <span>Configure Tab Access</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setEditingWorker(w);
                                  if (!STANDARD_ROLES.includes(w.primary_role)) {
                                    setEditingCustomRole(w.primary_role);
                                  } else {
                                    setEditingCustomRole('');
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 text-xs font-medium text-charcoal dark:text-zinc-200 flex items-center gap-2 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-steel dark:text-zinc-400 shrink-0" />
                                <span>Edit Member Details</span>
                              </button>

                              <div className="border-t border-ash dark:border-zinc-800 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDeleteWorker(w.id);
                                }}
                                disabled={deletingId === w.id}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                              >
                                {deletingId === w.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span>Remove Member</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal">Add Team Member / Contractor</h2>
                <p className="text-xs text-steel">Add custom workforce members, rates, and banking details.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-fog hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newWorker.name}
                  onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newWorker.phone}
                    onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={newWorker.email}
                    onChange={e => setNewWorker({ ...newWorker, email: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Primary Role *</label>
                  <select
                    value={STANDARD_ROLES.includes(newWorker.primary_role) ? newWorker.primary_role : 'Other / Custom'}
                    onChange={e => {
                      const val = e.target.value;
                      setNewWorker({ ...newWorker, primary_role: val });
                      if (val !== 'Other / Custom') {
                        setCustomRoleInput('');
                      }
                    }}
                    className="dub-input w-full text-xs font-medium"
                  >
                    {STANDARD_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Contract / Worker Type *</label>
                  <select
                    value={newWorker.worker_type}
                    onChange={e => setNewWorker({ ...newWorker, worker_type: e.target.value as any })}
                    className="dub-input w-full text-xs font-medium"
                  >
                    <option value="freelance">Freelance</option>
                    <option value="contractor">Contractor</option>
                    <option value="in_house">In-House Staff</option>
                  </select>
                </div>
              </div>

              {newWorker.primary_role === 'Other / Custom' && (
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Specify Custom Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Boom Operator, Steadicam Specialist"
                    value={customRoleInput}
                    onChange={e => setCustomRoleInput(e.target.value)}
                    className="dub-input w-full text-xs"
                    autoFocus
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Agreed Day Rate (₹)</label>
                  <input
                    type="number"
                    value={newWorker.day_rate === 0 ? '' : newWorker.day_rate}
                    onChange={e => setNewWorker({ ...newWorker, day_rate: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">UPI ID for Payouts</label>
                  <input
                    type="text"
                    placeholder="username@upi"
                    value={newWorker.upi_id}
                    onChange={e => setNewWorker({ ...newWorker, upi_id: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
              </div>

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
                  disabled={isSubmitting}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <h2 className="text-sm font-semibold font-satoshi text-charcoal">Edit Member Profile</h2>
              <button onClick={() => setEditingWorker(null)} className="text-fog hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingWorker.name}
                  onChange={e => setEditingWorker({ ...editingWorker, name: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editingWorker.phone}
                    onChange={e => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Contract / Worker Type *</label>
                  <select
                    value={editingWorker.worker_type || 'freelance'}
                    onChange={e => setEditingWorker({ ...editingWorker, worker_type: e.target.value as any })}
                    className="dub-input w-full text-xs font-medium"
                  >
                    <option value="freelance">Freelance</option>
                    <option value="contractor">Contractor</option>
                    <option value="in_house">In-House Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">Role *</label>
                <select
                  value={STANDARD_ROLES.includes(editingWorker.primary_role) ? editingWorker.primary_role : 'Other / Custom'}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingWorker({ ...editingWorker, primary_role: val });
                    if (val !== 'Other / Custom') {
                      setEditingCustomRole('');
                    }
                  }}
                  className="dub-input w-full text-xs font-medium"
                >
                  {STANDARD_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {(!STANDARD_ROLES.includes(editingWorker.primary_role) || editingWorker.primary_role === 'Other / Custom') && (
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Specify Custom Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Steadicam Specialist, Colorist"
                    value={editingCustomRole}
                    onChange={e => setEditingCustomRole(e.target.value)}
                    className="dub-input w-full text-xs"
                    autoFocus
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Day Rate (₹)</label>
                  <input
                    type="number"
                    value={editingWorker.day_rate === 0 ? '' : (editingWorker.day_rate ?? '')}
                    onChange={e => setEditingWorker({ ...editingWorker, day_rate: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Status</label>
                  <select
                    value={editingWorker.status}
                    onChange={e => setEditingWorker({ ...editingWorker, status: e.target.value as any })}
                    className="dub-input w-full text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">UPI ID for Settlements</label>
                <input
                  type="text"
                  value={editingWorker.payment_details?.upi_id || ''}
                  onChange={e => setEditingWorker({
                    ...editingWorker,
                    payment_details: { ...editingWorker.payment_details, upi_id: e.target.value }
                  })}
                  className="dub-input w-full text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ash">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Tap Onboarding Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal">
                  1-Tap Team Onboarding
                </h2>
                <p className="text-xs text-steel">
                  Import registered platform users and staff directly into the operations roster.
                </p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-fog hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
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
                  <div className="p-4 text-center text-xs text-steel">No registered platform users found.</div>
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

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">
                    Contract / Worker Type *
                  </label>
                  <select
                    value={defaultImportWorkerType}
                    onChange={e => setDefaultImportWorkerType(e.target.value as any)}
                    className="dub-input w-full text-xs font-medium"
                  >
                    <option value="freelance">Freelance</option>
                    <option value="contractor">Contractor</option>
                    <option value="in_house">In-House Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">
                    Default Day Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={defaultDayRate === 0 ? '' : defaultDayRate}
                    onChange={e => setDefaultDayRate(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
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

      {/* Tab Permissions & Role Configuration Modal */}
      {permissionWorker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-[#0f0f14] border border-ash dark:border-zinc-800 w-full max-w-xl space-y-5 rounded-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-ash dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold font-satoshi text-charcoal dark:text-zinc-100 flex items-center gap-2">
                    <span>Manage Tab Permissions</span>
                    <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-normal">({permissionWorker.name})</span>
                  </h2>
                  <p className="text-xs text-steel dark:text-zinc-400">
                    Define operational role presets and authorize granular tab access across ZManage.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPermissionWorker(null)} 
                className="text-fog hover:text-charcoal dark:text-zinc-400 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Role Tier Selector (Presets) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-steel dark:text-zinc-400 mb-2">
                  Role Tier Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLE_PRESETS).map(([tierKey, preset]) => {
                    const isSelected = selectedRoleTier === tierKey;
                    return (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => handleSelectPreset(tierKey)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-xs'
                            : 'border-ash dark:border-zinc-800 bg-paper/50 dark:bg-zinc-900/60 hover:bg-paper dark:hover:bg-zinc-800 text-charcoal dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-semibold capitalize">{preset.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                        </div>
                        <span className="text-[10px] text-fog dark:text-zinc-400 line-clamp-2 leading-tight">
                          {preset.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Tab Toggles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-steel dark:text-zinc-400">
                    Operational Modules Access ({selectedTabs.length} of {ALL_TABS.length} enabled)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTabs(ALL_TABS.map(t => t.id));
                        setSelectedRoleTier('admin');
                      }}
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-fog dark:text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTabs([]);
                        setSelectedRoleTier('custom');
                      }}
                      className="text-[11px] text-steel dark:text-zinc-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-ash dark:border-zinc-800 rounded-xl p-2.5 bg-paper/30 dark:bg-zinc-900/40 max-h-56 overflow-y-auto">
                  {ALL_TABS.map(tab => {
                    const isChecked = selectedTabs.includes(tab.id);
                    return (
                      <div
                        key={tab.id}
                        onClick={() => handleToggleTab(tab.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer ${
                          isChecked
                            ? 'border-purple-500/40 bg-purple-500/5 dark:bg-purple-950/20 text-charcoal dark:text-zinc-100'
                            : 'border-ash/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/60 text-steel dark:text-zinc-400 hover:bg-paper dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-ash dark:border-zinc-700 text-purple-600 focus:ring-0 cursor-pointer"
                          />
                          <div className="truncate">
                            <div className="text-xs font-medium text-charcoal dark:text-zinc-200 truncate">{tab.label}</div>
                            <div className="text-[10px] text-fog dark:text-zinc-500 font-mono">{tab.category}</div>
                          </div>
                        </div>
                        {isChecked && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-ash dark:border-zinc-800">
              <span className="text-[11px] text-fog dark:text-zinc-400 font-mono">
                Audit event logged upon save.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPermissionWorker(null)}
                  className="dub-btn-outline text-xs px-3.5 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingPermissions}
                  onClick={handleSavePermissions}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingPermissions && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Permissions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
