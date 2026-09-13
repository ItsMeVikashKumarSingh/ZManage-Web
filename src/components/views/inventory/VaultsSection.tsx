import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit3, Trash2, X, Loader2, 
  Layers, Package, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { api, VaultRecord } from '../../../lib/api';

export const VaultsSection: React.FC = () => {
  const [vaults, setVaults] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingVault, setEditingVault] = useState<VaultRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [vaultForm, setVaultForm] = useState({
    name: '',
    description: ''
  });

  const loadVaults = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getVaults();
      setVaults(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch storage vaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaults();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultForm.name.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.createVault({
        name: vaultForm.name.trim(),
        description: vaultForm.description.trim() || undefined
      });
      setSuccessMsg('Vault created successfully');
      setShowAddModal(false);
      setVaultForm({ name: '', description: '' });
      await loadVaults();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create vault');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVault || !vaultForm.name.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.updateVault(editingVault.id, {
        name: vaultForm.name.trim(),
        description: vaultForm.description.trim() || null
      });
      setSuccessMsg('Vault updated successfully');
      setEditingVault(null);
      await loadVaults();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update vault');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.deleteVault(id);
      setSuccessMsg('Vault deleted successfully');
      setDeletingId(null);
      await loadVaults();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete vault');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (v: VaultRecord) => {
    setEditingVault(v);
    setVaultForm({
      name: v.name,
      description: v.description || ''
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 bg-paper/60 dark:bg-zinc-900/60 px-3.5 py-2.5 rounded-xl border border-ash dark:border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-charcoal dark:text-zinc-100 leading-tight">
              Storage Locations & Physical Vaults
            </h2>
            <span className="text-[11px] text-steel dark:text-zinc-400 hidden sm:inline">
              Track gear lockers, studio shelves, and mobile production vans
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setVaultForm({ name: '', description: '' });
            setShowAddModal(true);
          }}
          className="dub-btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Vault
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Vaults Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 text-steel dark:text-zinc-400 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <span className="text-xs">Loading storage locations...</span>
        </div>
      ) : vaults.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-ash dark:border-zinc-800 bg-paper/40 dark:bg-zinc-900/40">
          <Building2 className="w-8 h-8 text-fog dark:text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-charcoal dark:text-zinc-200">No Storage Vaults Defined Yet</h3>
          <p className="text-xs text-steel dark:text-zinc-400 max-w-sm mx-auto mt-0.5 mb-3">
            Add locations like &quot;Main Studio Vault&quot;, &quot;Equipment Van 1&quot;, or &quot;Locker B-3&quot; to assign gear.
          </p>
          <button
            onClick={() => {
              setVaultForm({ name: '', description: '' });
              setShowAddModal(true);
            }}
            className="dub-btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Vault
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              className="p-3 rounded-xl border border-ash dark:border-zinc-800 bg-paper/80 dark:bg-zinc-900/80 backdrop-blur-md flex flex-col justify-between hover:border-purple-500/40 transition shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal dark:text-zinc-100">{vault.name}</h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active Hub
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(vault)}
                      className="p-1 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200 hover:bg-ash/50 dark:hover:bg-zinc-800/60 rounded transition"
                      title="Edit Vault"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeletingId(vault.id)}
                      className="p-1 text-steel dark:text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition"
                      title="Delete Vault"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {vault.description && (
                  <p className="text-[11px] text-steel dark:text-zinc-400 mb-2 line-clamp-1">
                    {vault.description}
                  </p>
                )}
              </div>

              {/* Counts Inline Strip */}
              <div className="pt-2 mt-1.5 border-t border-ash/60 dark:border-zinc-800/60 flex items-center justify-between text-xs text-steel dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-purple-400" />
                  <strong className="text-charcoal dark:text-zinc-200">{vault.asset_count || 0}</strong> Assets
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <strong className="text-charcoal dark:text-zinc-200">{vault.kit_count || 0}</strong> Kits
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-amber-400" />
                  <strong className="text-charcoal dark:text-zinc-200">{vault.consumable_count || 0}</strong> Stock
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vault Modal */}
      {(showAddModal || editingVault) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-ash dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                {editingVault ? 'Edit Storage Vault' : 'Create New Storage Vault'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingVault(null);
                }}
                className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingVault ? handleUpdate : handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                  Vault / Location Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Equipment Locker A or Van 1"
                  value={vaultForm.name}
                  onChange={(e) => setVaultForm({ ...vaultForm, name: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                  Description / Physical Address
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Floor 2 Studio Locker room, Shelf 3-B"
                  value={vaultForm.description}
                  onChange={(e) => setVaultForm({ ...vaultForm, description: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ash dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVault(null);
                  }}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !vaultForm.name.trim()}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingVault ? 'Save Changes' : 'Create Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100">Delete Storage Vault?</h3>
              <p className="text-xs text-steel dark:text-zinc-400 mt-1">
                Equipment and kits assigned to this vault will become unassigned. No assets will be deleted.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="dub-btn-outline text-xs px-3.5 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDelete(deletingId)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs px-4 py-1.5 font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
