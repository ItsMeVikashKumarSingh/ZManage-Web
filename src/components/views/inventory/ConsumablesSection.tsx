import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, AlertTriangle, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Edit3, Trash2, X, Loader2, 
  Download, Building2 
} from 'lucide-react';
import { api, ConsumableRecord, VaultRecord } from '../../../lib/api';
import { exportToCsv } from '../../../lib/exportUtils';

const CONSUMABLE_CATEGORIES = [
  'All Categories',
  'Tapes & Adhesives',
  'Batteries & Power Cells',
  'Backdrops & Seamless Paper',
  'Fluids & Atmospherics',
  'Memory & Media Cards',
  'Cleaning & Maintenance',
  'Other Expendables'
];

interface ConsumablesSectionProps {
  vaults: VaultRecord[];
}

export const ConsumablesSection: React.FC<ConsumablesSectionProps> = ({ vaults }) => {
  const [consumables, setConsumables] = useState<ConsumableRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ConsumableRecord | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<{ item: ConsumableRecord; action: 'add' | 'deduct' } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({
    name: '',
    category: 'Tapes & Adhesives',
    stock_quantity: 10,
    unit: 'rolls',
    min_reorder_level: 3,
    unit_cost: 450,
    location_id: ''
  });

  const loadConsumables = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getConsumables();
      setConsumables(res.consumables || []);
      setLowStockCount(res.low_stock_count || 0);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch consumables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsumables();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.createConsumable({
        name: form.name.trim(),
        category: form.category,
        stock_quantity: Number(form.stock_quantity) || 0,
        unit: form.unit.trim() || 'units',
        min_reorder_level: Number(form.min_reorder_level) || 5,
        unit_cost: Number(form.unit_cost) || 0,
        location_id: form.location_id || undefined
      });
      setSuccessMsg('Consumable item added');
      setShowAddModal(false);
      setForm({
        name: '',
        category: 'Tapes & Adhesives',
        stock_quantity: 10,
        unit: 'rolls',
        min_reorder_level: 3,
        unit_cost: 450,
        location_id: ''
      });
      await loadConsumables();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add consumable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !form.name.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.updateConsumable(editingItem.id, {
        name: form.name.trim(),
        category: form.category,
        unit: form.unit.trim() || 'units',
        min_reorder_level: Number(form.min_reorder_level) || 5,
        unit_cost: Number(form.unit_cost) || 0,
        location_id: form.location_id || null
      });
      setSuccessMsg('Consumable updated');
      setEditingItem(null);
      await loadConsumables();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update consumable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustAmount <= 0) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.adjustConsumableStock(adjustingItem.item.id, {
        action: adjustingItem.action,
        amount: adjustAmount,
        reason: adjustReason.trim() || undefined
      });
      setSuccessMsg(`Stock ${adjustingItem.action === 'add' ? 'restocked' : 'deducted'} successfully`);
      setAdjustingItem(null);
      setAdjustAmount(1);
      setAdjustReason('');
      await loadConsumables();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.deleteConsumable(id);
      setSuccessMsg('Consumable deleted');
      setDeletingId(null);
      await loadConsumables();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete consumable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (item: ConsumableRecord) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      stock_quantity: item.stock_quantity,
      unit: item.unit,
      min_reorder_level: item.min_reorder_level,
      unit_cost: item.unit_cost,
      location_id: item.location_id || ''
    });
  };

  // Filtering
  const filteredItems = consumables.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesCat = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesLoc = selectedLocation === 'all' || item.location_id === selectedLocation;
    return matchesSearch && matchesCat && matchesLoc;
  });

  const handleExport = () => {
    exportToCsv('zmanage-consumables-stock.csv', filteredItems, [
      { header: 'Item Name', accessor: (i) => i.name },
      { header: 'Category', accessor: (i) => i.category },
      { header: 'In Stock', accessor: (i) => i.stock_quantity },
      { header: 'Unit', accessor: (i) => i.unit },
      { header: 'Min Reorder Level', accessor: (i) => i.min_reorder_level },
      { header: 'Unit Cost (INR)', accessor: (i) => i.unit_cost },
      { header: 'Vault Location', accessor: (i) => i.location_name || 'Unassigned' },
      { header: 'Status', accessor: (i) => (i.is_low_stock ? 'LOW STOCK' : 'IN STOCK') }
    ]);
  };

  return (
    <div className="space-y-3.5">
      {/* Alert banner if low stock exists */}
      {lowStockCount > 0 && (
        <div className="py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <div>
              <span className="font-semibold">{lowStockCount} item{lowStockCount > 1 ? 's' : ''} below reorder threshold!</span>
              <span className="text-[11px] opacity-80 ml-2 hidden sm:inline">Restock before upcoming shoots.</span>
            </div>
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 bg-paper/60 dark:bg-zinc-900/60 px-3.5 py-2 rounded-xl border border-ash dark:border-zinc-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-steel dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search tape, batteries, paper..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dub-input w-full pl-9 py-1 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="dub-input text-xs py-1"
          >
            {CONSUMABLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {vaults.length > 0 && (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="dub-input text-xs py-1"
            >
              <option value="all">All Vaults</option>
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="dub-btn-outline text-xs px-2.5 py-1.5 flex items-center gap-1.5"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-steel dark:text-zinc-400" /> Export CSV
          </button>

          <button
            onClick={() => {
              setForm({
                name: '',
                category: 'Tapes & Adhesives',
                stock_quantity: 10,
                unit: 'rolls',
                min_reorder_level: 3,
                unit_cost: 450,
                location_id: ''
              });
              setShowAddModal(true);
            }}
            className="dub-btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add Consumable
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Consumables Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-steel dark:text-zinc-400 space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          <span className="text-xs">Loading expendable supplies...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-ash dark:border-zinc-800 bg-paper/40 dark:bg-zinc-900/40">
          <Package className="w-10 h-10 text-fog dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-charcoal dark:text-zinc-200">No Consumables Found</h3>
          <p className="text-xs text-steel dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            Track expendables like gaffer tape, AA batteries, and seamless backdrop rolls so you never run out during a shoot.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="dub-btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Item
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ash dark:border-zinc-800 bg-paper/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-ash/40 dark:bg-zinc-800/40 text-steel dark:text-zinc-400 font-medium uppercase text-[10px] tracking-wider border-b border-ash dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vault / Location</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-center">Threshold</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash/60 dark:divide-zinc-800/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-ash/20 dark:hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 font-medium text-charcoal dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-steel dark:text-zinc-400">{item.category}</td>
                  <td className="py-3 px-4 text-steel dark:text-zinc-400">
                    {item.location_name ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Building2 className="w-3 h-3" /> {item.location_name}
                      </span>
                    ) : (
                      <span className="text-fog dark:text-zinc-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold font-mono text-charcoal dark:text-zinc-100 text-sm">
                      {item.stock_quantity}
                    </span>{' '}
                    <span className="text-[10px] text-steel dark:text-zinc-500">{item.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-steel dark:text-zinc-400 font-mono">
                    {item.min_reorder_level} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-steel dark:text-zinc-400 font-mono">
                    ₹{item.unit_cost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.is_low_stock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-500 border border-red-500/20 inline-flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Restock Button */}
                      <button
                        onClick={() => {
                          setAdjustingItem({ item, action: 'add' });
                          setAdjustAmount(5);
                          setAdjustReason('Restock purchase');
                        }}
                        className="px-2 py-1 text-[11px] font-medium rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1"
                        title="Restock / Add Quantity"
                      >
                        <ArrowUpRight className="w-3 h-3" /> Restock
                      </button>

                      {/* Deduct Button */}
                      <button
                        onClick={() => {
                          setAdjustingItem({ item, action: 'deduct' });
                          setAdjustAmount(1);
                          setAdjustReason('Packed for shoot');
                        }}
                        className="px-2 py-1 text-[11px] font-medium rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1"
                        title="Deduct for shoot"
                      >
                        <ArrowDownRight className="w-3 h-3" /> Deduct
                      </button>

                      <button
                        onClick={() => openEdit(item)}
                        className="p-1 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-1 text-steel dark:text-zinc-400 hover:text-red-500"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Consumable Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-ash dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-500" />
                {editingItem ? 'Edit Consumable Item' : 'Add Consumable / Expendable'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleUpdate : handleCreate} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pro Gaff Black 2-inch or AA Batteries 4-pack"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="dub-input w-full text-xs py-1.5"
                  >
                    {CONSUMABLE_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Storage Vault
                  </label>
                  <select
                    value={form.location_id}
                    onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                    className="dub-input w-full text-xs py-1.5"
                  >
                    <option value="">Unassigned</option>
                    {vaults.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {!editingItem && (
                  <div>
                    <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                      Initial Qty
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.stock_quantity}
                      onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                      className="dub-input w-full text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="rolls, packs"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Reorder Alert
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.min_reorder_level}
                    onChange={(e) => setForm({ ...form, min_reorder_level: Number(e.target.value) })}
                    className="dub-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                  Unit Cost (INR ₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.unit_cost}
                  onChange={(e) => setForm({ ...form, unit_cost: Number(e.target.value) })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ash dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !form.name.trim()}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment (Restock / Deduct) Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-ash dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
                {adjustingItem.action === 'add' ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-amber-500" />
                )}
                {adjustingItem.action === 'add' ? 'Restock Item' : 'Deduct Stock for Shoot'}
              </h3>
              <button
                onClick={() => setAdjustingItem(null)}
                className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="p-4 space-y-3.5">
              <div>
                <span className="text-xs text-steel dark:text-zinc-400">Target Item:</span>
                <div className="text-sm font-semibold text-charcoal dark:text-zinc-100 mt-0.5">
                  {adjustingItem.item.name}
                </div>
                <div className="text-[11px] text-steel dark:text-zinc-400 mt-0.5">
                  Current Stock: <strong className="font-mono">{adjustingItem.item.stock_quantity} {adjustingItem.item.unit}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                  Quantity to {adjustingItem.action === 'add' ? 'Add' : 'Deduct'} *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="dub-input w-full text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                  Reason / Note
                </label>
                <input
                  type="text"
                  placeholder={adjustingItem.action === 'add' ? 'Vendor invoice, restock' : 'For Pre-Wedding Shoot, studio use'}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ash dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || adjustAmount <= 0}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm {adjustingItem.action === 'add' ? 'Restock' : 'Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100">Delete Consumable Item?</h3>
              <p className="text-xs text-steel dark:text-zinc-400 mt-1">
                This item will be soft-deleted from active stock tracking.
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
