import React, { useState, useEffect } from 'react';
import { Camera, Plus, Search, Check, Clock, AlertTriangle, Shield, Loader2, Sparkles, Wrench } from 'lucide-react';
import { api, AssetRecord } from '../../lib/api';

export const InventoryView: React.FC = () => {
  const [inventory, setInventory] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Return Inspection Modal State
  const [inspectingAsset, setInspectingAsset] = useState<AssetRecord | null>(null);
  const [returnCondition, setReturnCondition] = useState<'excellent' | 'good' | 'fair' | 'in_repair'>('excellent');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [isInspecting, setIsInspecting] = useState<boolean>(false);

  // New Asset Form
  const [newAsset, setNewAsset] = useState({
    name: '',
    code: '',
    category: 'camera',
    serial_number: '',
    purchase_cost: 35000,
    condition: 'excellent' as const
  });

  const loadAssets = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getAssets();
      setInventory(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch inventory from ZManage-APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const filtered = inventory.filter(a => {
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchSearch = (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createAsset({
        name: newAsset.name,
        code: newAsset.code.trim() || undefined, // Backend auto-generates CAM-001, LNS-001 if blank!
        category: newAsset.category,
        serial_number: newAsset.serial_number.trim() || undefined,
        condition: newAsset.condition,
        status: 'available',
        purchase_cost: Number(newAsset.purchase_cost) || 0,
        currency: 'INR'
      });
      await loadAssets();
      setShowAddModal(false);
      setNewAsset({ name: '', code: '', category: 'camera', serial_number: '', purchase_cost: 35000, condition: 'excellent' });
    } catch (err: any) {
      alert(err.message || 'Failed to register equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (asset: AssetRecord) => {
    if (asset.status === 'on_shoot') {
      // Prompt return condition inspection modal
      setInspectingAsset(asset);
      setReturnCondition(asset.condition || 'excellent');
      setReturnNotes('');
    } else {
      // Instant check-out
      handleCheckout(asset);
    }
  };

  const handleCheckout = async (asset: AssetRecord) => {
    try {
      await api.updateAsset(asset.id, { status: 'on_shoot' });
      await loadAssets();
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    }
  };

  const handleConfirmReturn = async () => {
    if (!inspectingAsset) return;
    try {
      setIsInspecting(true);
      const nextStatus = returnCondition === 'in_repair' ? 'maintenance' : 'available';
      await api.updateAsset(inspectingAsset.id, {
        status: nextStatus,
        condition: returnCondition,
        maintenance_notes: returnNotes.trim() ? returnNotes : inspectingAsset.maintenance_notes
      });
      await loadAssets();
      setInspectingAsset(null);
    } catch (err: any) {
      alert(err.message || 'Return inspection failed');
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stat Line */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal">Equipment Vault</h1>
          <p className="text-xs text-steel">Physical asset tracking, auto-sequence codes, and return condition inspections.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Register Equipment
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadAssets} className="underline text-xs ml-2">Retry</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="dub-card p-4 bg-white">
          <span className="text-[11px] font-medium text-fog uppercase tracking-wider">Total Assets</span>
          <div className="text-xl font-satoshi font-bold text-charcoal mt-1">{inventory.length}</div>
        </div>
        <div className="dub-card p-4 bg-white">
          <span className="text-[11px] font-medium text-fog uppercase tracking-wider">Available Now</span>
          <div className="text-xl font-satoshi font-bold text-vividGreen mt-1">
            {inventory.filter(a => a.status === 'available').length}
          </div>
        </div>
        <div className="dub-card p-4 bg-white">
          <span className="text-[11px] font-medium text-fog uppercase tracking-wider">On Active Shoot</span>
          <div className="text-xl font-satoshi font-bold text-electric mt-1">
            {inventory.filter(a => a.status === 'on_shoot').length}
          </div>
        </div>
        <div className="dub-card p-4 bg-white">
          <span className="text-[11px] font-medium text-fog uppercase tracking-wider">Maintenance / Repair</span>
          <div className="text-xl font-satoshi font-bold text-tangerine mt-1">
            {inventory.filter(a => a.status === 'maintenance').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'camera', 'lens', 'drone', 'lighting', 'audio', 'gimbal'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition ${
                selectedCategory === cat
                  ? 'bg-charcoal text-white font-semibold'
                  : 'bg-white border border-ash text-steel hover:text-charcoal hover:border-smoke'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-fog absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gear by name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="dub-input w-full pl-8 text-xs"
          />
        </div>
      </div>

      {/* Equipment Table (Dub Border-First Table) */}
      <div className="dub-card bg-white border border-ash overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel">Loading live inventory from ZManage-APIs...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-steel">
            No equipment found matching criteria. Click <span className="font-semibold text-charcoal">Register Equipment</span> above to add to vault.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-ash bg-paper/60 text-steel font-medium">
                  <th className="py-2.5 px-4 font-mono text-[11px]">CODE / SKU</th>
                  <th className="py-2.5 px-4">EQUIPMENT</th>
                  <th className="py-2.5 px-4 font-mono text-[11px]">SERIAL NO</th>
                  <th className="py-2.5 px-4">CONDITION</th>
                  <th className="py-2.5 px-4">STATUS</th>
                  <th className="py-2.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ash">
                {filtered.map(asset => (
                  <tr key={asset.id} className="hover:bg-paper/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] font-semibold text-charcoal">
                      {asset.code || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-charcoal">{asset.name}</div>
                      <span className="text-[10px] text-fog capitalize inline-flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" /> {asset.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-charcoal">
                      {asset.serial_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium capitalize ${
                        asset.condition === 'excellent' ? 'text-vividGreen' :
                        asset.condition === 'good' ? 'text-steel' :
                        asset.condition === 'fair' ? 'text-tangerine' : 'text-red-500'
                      }`}>
                        <Shield className="w-3 h-3" /> {asset.condition?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {asset.status === 'available' && (
                        <span className="dub-badge-mint text-[10px] font-mono inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> AVAILABLE
                        </span>
                      )}
                      {asset.status === 'on_shoot' && (
                        <span className="dub-badge-blue text-[10px] font-mono inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ON SHOOT
                        </span>
                      )}
                      {asset.status === 'maintenance' && (
                        <span className="dub-badge-tangerine text-[10px] font-mono inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> IN REPAIR
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleActionClick(asset)}
                        className={`text-[11px] py-1 px-2.5 rounded-lg border transition ${
                          asset.status === 'available'
                            ? 'border-ash text-charcoal hover:bg-paper'
                            : 'border-electric bg-blue-50 text-electric hover:bg-blue-100 font-medium'
                        }`}
                      >
                        {asset.status === 'available' ? 'Check-out' : 'Return Inspect'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Inspection Modal */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card bg-white max-w-md w-full p-6 space-y-4 shadow-xl border border-ash">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal">Return & Health Inspection</h2>
                <p className="text-xs text-steel mt-0.5">{inspectingAsset.name} ({inspectingAsset.code})</p>
              </div>
              <Wrench className="w-4 h-4 text-electric" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-steel mb-1.5">Return Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['excellent', 'good', 'fair', 'in_repair'] as const).map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setReturnCondition(cond)}
                      className={`p-2 rounded-lg border text-left capitalize transition ${
                        returnCondition === cond
                          ? 'border-electric bg-blue-50 text-electric font-semibold'
                          : 'border-ash text-charcoal hover:bg-paper'
                      }`}
                    >
                      {cond.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">Maintenance Notes / Inspection Log</label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  placeholder="e.g. Lens front element cleaned, sensor in perfect shape. Battery #2 returned drained."
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingAsset(null)}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  disabled={isInspecting}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isInspecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Complete Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card bg-white max-w-md w-full p-6 space-y-4 shadow-xl border border-ash">
            <h2 className="text-sm font-semibold font-satoshi text-charcoal">Register New Equipment</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony FX3 Cinema Line Body #2"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-steel">Asset Code (SKU)</label>
                    <span className="text-[10px] text-electric font-mono flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Auto-Gen
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Leave blank for auto-code"
                    value={newAsset.code}
                    onChange={e => setNewAsset({ ...newAsset, code: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="dub-input w-full text-xs capitalize"
                  >
                    <option value="camera">Camera (CAM)</option>
                    <option value="lens">Lens (LNS)</option>
                    <option value="drone">Drone (DRN)</option>
                    <option value="lighting">Lighting (LGT)</option>
                    <option value="audio">Audio (AUD)</option>
                    <option value="gimbal">Gimbal (GMB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-99881122"
                    value={newAsset.serial_number}
                    onChange={e => setNewAsset({ ...newAsset, serial_number: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Initial Condition</label>
                  <select
                    value={newAsset.condition}
                    onChange={e => setNewAsset({ ...newAsset, condition: e.target.value as any })}
                    className="dub-input w-full text-xs"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="in_repair">In Repair</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
