import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Search, Trash2, Edit3, X, Loader2, 
  Download, Building2, ChevronDown, ChevronUp, AlertCircle, 
  CheckCircle2, PlusCircle, MinusCircle, QrCode, Printer
} from 'lucide-react';
import { api, AssetKitRecord, KitItemRecord, VaultRecord } from '../../../lib/api';
import { exportToCsv } from '../../../lib/exportUtils';
import { PrintableLabelModal, PrintableLabelItem } from './PrintableLabelModal';

interface KitsSectionProps {
  vaults: VaultRecord[];
}

export const KitsSection: React.FC<KitsSectionProps> = ({ vaults }) => {
  const [kits, setKits] = useState<AssetKitRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [expandedKitIds, setExpandedKitIds] = useState<Record<string, boolean>>({});

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingKit, setEditingKit] = useState<AssetKitRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printModalTitle, setPrintModalTitle] = useState<string>('Print Kit QR Labels');
  const [printItems, setPrintItems] = useState<PrintableLabelItem[]>([]);

  // Form
  const [form, setForm] = useState<{
    name: string;
    code: string;
    category: string;
    total_kits_count: number;
    location_id: string;
    description: string;
    items: Array<{
      category_or_name: string;
      quantity_required: number;
      item_type: 'asset_category' | 'specific_asset' | 'consumable';
    }>;
  }>({
    name: '',
    code: '',
    category: 'Production Rig',
    total_kits_count: 1,
    location_id: '',
    description: '',
    items: [
      { category_or_name: 'Camera Body', quantity_required: 1, item_type: 'asset_category' },
      { category_or_name: 'Standard Zoom Lens', quantity_required: 1, item_type: 'asset_category' },
      { category_or_name: 'V-Mount Batteries', quantity_required: 2, item_type: 'asset_category' }
    ]
  });

  const loadKits = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getKits();
      setKits(data || []);
      // Expand all by default
      const initialExpanded: Record<string, boolean> = {};
      (data || []).forEach((k) => { initialExpanded[k.id] = true; });
      setExpandedKitIds(initialExpanded);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch equipment kits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKits();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedKitIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { category_or_name: '', quantity_required: 1, item_type: 'asset_category' }]
    }));
  };

  const handleRemoveItemRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setForm((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, items: nextItems };
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const validItems: KitItemRecord[] = form.items
      .filter((i) => i.category_or_name.trim().length > 0)
      .map((i) => ({
        category_or_name: i.category_or_name.trim(),
        quantity_required: Math.max(1, Number(i.quantity_required) || 1),
        item_type: i.item_type || 'asset_category'
      }));

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.createKit({
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        category: form.category.trim() || 'Production Rig',
        total_kits_count: Math.max(1, Number(form.total_kits_count) || 1),
        location_id: form.location_id || undefined,
        description: form.description.trim() || undefined,
        items: validItems
      });
      setSuccessMsg('Equipment Kit created successfully');
      setShowAddModal(false);
      setForm({
        name: '',
        code: '',
        category: 'Production Rig',
        total_kits_count: 1,
        location_id: '',
        description: '',
        items: [
          { category_or_name: 'Camera Body', quantity_required: 1, item_type: 'asset_category' },
          { category_or_name: 'Standard Zoom Lens', quantity_required: 1, item_type: 'asset_category' },
          { category_or_name: 'V-Mount Batteries', quantity_required: 2, item_type: 'asset_category' }
        ]
      });
      await loadKits();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create equipment kit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKit || !form.name.trim()) return;

    const validItems: KitItemRecord[] = form.items
      .filter((i) => i.category_or_name.trim().length > 0)
      .map((i) => ({
        category_or_name: i.category_or_name.trim(),
        quantity_required: Math.max(1, Number(i.quantity_required) || 1),
        item_type: i.item_type || 'asset_category'
      }));

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.updateKit(editingKit.id, {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        category: form.category.trim() || 'Production Rig',
        total_kits_count: Math.max(1, Number(form.total_kits_count) || 1),
        location_id: form.location_id || null,
        description: form.description.trim() || null,
        items: validItems
      });
      setSuccessMsg('Kit updated successfully');
      setEditingKit(null);
      await loadKits();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update kit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.deleteKit(id);
      setSuccessMsg('Kit deleted successfully');
      setDeletingId(null);
      await loadKits();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete kit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (k: AssetKitRecord) => {
    setEditingKit(k);
    setForm({
      name: k.name,
      code: k.code || '',
      category: k.category,
      total_kits_count: k.total_kits_count || 1,
      location_id: k.location_id || '',
      description: k.description || '',
      items: (k.items && k.items.length > 0)
        ? k.items.map((i) => ({
            category_or_name: i.category_or_name,
            quantity_required: i.quantity_required,
            item_type: i.item_type || 'asset_category'
          }))
        : [{ category_or_name: 'Camera Body', quantity_required: 1, item_type: 'asset_category' }]
    });
  };

  // Filter
  const filteredKits = kits.filter((k) => {
    const matchesSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      k.code?.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesLoc = selectedLocation === 'all' || k.location_id === selectedLocation;
    return matchesSearch && matchesLoc;
  });

  const handleExport = () => {
    exportToCsv('zmanage-kits-bundles.csv', filteredKits, [
      { header: 'Kit Code', accessor: (k) => k.code || '' },
      { header: 'Kit Name', accessor: (k) => k.name },
      { header: 'Category', accessor: (k) => k.category },
      { header: 'Total Kits Owned', accessor: (k) => k.total_kits_count },
      { header: 'Vault Location', accessor: (k) => k.location_name || 'Unassigned' },
      {
        header: 'Items Specified',
        accessor: (k) =>
          (k.items || []).map((i) => `${i.category_or_name} (x${i.quantity_required})`).join(', ')
      }
    ]);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 bg-paper/60 dark:bg-zinc-900/60 px-3.5 py-2 rounded-xl border border-ash dark:border-zinc-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-steel dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search kits by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dub-input w-full pl-9 py-1 text-xs"
            />
          </div>

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
            onClick={() => {
              const printable = filteredKits.map((k) => ({
                id: k.id,
                code: k.code || k.id.slice(0, 8),
                name: k.name,
                category: k.category,
                location_name: k.location_name,
                type: 'kit' as const
              }));
              setPrintItems(printable);
              setPrintModalTitle(`Print Kit QR Labels (${printable.length} Bundles)`);
              setShowPrintModal(true);
            }}
            className="dub-btn-outline text-xs px-2.5 py-1.5 flex items-center gap-1.5"
            title="Print QR labels for all kits"
          >
            <Printer className="w-3.5 h-3.5 text-purple-500" /> Print Kit Labels
          </button>

          <button
            onClick={handleExport}
            className="dub-btn-outline text-xs px-2.5 py-1.5 flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-steel dark:text-zinc-400" /> Export CSV
          </button>

          <button
            onClick={() => {
              setForm({
                name: '',
                code: '',
                category: 'Production Rig',
                total_kits_count: 1,
                location_id: '',
                description: '',
                items: [
                  { category_or_name: 'Camera Body', quantity_required: 1, item_type: 'asset_category' },
                  { category_or_name: 'Standard Zoom Lens', quantity_required: 1, item_type: 'asset_category' },
                  { category_or_name: 'V-Mount Batteries', quantity_required: 2, item_type: 'asset_category' }
                ]
              });
              setShowAddModal(true);
            }}
            className="dub-btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Create Kit Template
          </button>
        </div>
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

      {/* Kits List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 text-steel dark:text-zinc-400 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <span className="text-xs">Loading kit templates & flight cases...</span>
        </div>
      ) : filteredKits.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-ash dark:border-zinc-800 bg-paper/40 dark:bg-zinc-900/40">
          <Layers className="w-8 h-8 text-fog dark:text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-charcoal dark:text-zinc-200">No Equipment Kits Defined Yet</h3>
          <p className="text-xs text-steel dark:text-zinc-400 max-w-sm mx-auto mt-0.5 mb-3">
            Build composite flight cases (e.g. &quot;Sony Cinema Rig&quot; = Body + Lens + 2x V-Mounts) to reserve all gear in 1 tap.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="dub-btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Kit
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredKits.map((kit) => {
            const isExpanded = expandedKitIds[kit.id];
            return (
              <div
                key={kit.id}
                className="rounded-xl border border-ash dark:border-zinc-800 bg-paper/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden transition hover:border-purple-500/40 shadow-xs"
              >
                {/* Kit Header */}
                <div className="px-3.5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-ash/20 dark:bg-zinc-800/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-semibold text-charcoal dark:text-zinc-100">{kit.name}</h4>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-ash/50 dark:bg-zinc-800 text-steel dark:text-zinc-300">
                          {kit.code}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {kit.total_kits_count} Kit{kit.total_kits_count > 1 ? 's' : ''} Owned
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] text-steel dark:text-zinc-400 mt-0.5">
                        <span>Category: <strong className="text-charcoal dark:text-zinc-200">{kit.category}</strong></span>
                        {kit.location_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-fog dark:text-zinc-500" /> {kit.location_name}
                          </span>
                        )}
                        <span>{(kit.items || []).length} Item Type{(kit.items || []).length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setPrintItems([{
                          id: kit.id,
                          code: kit.code || kit.id.slice(0, 8),
                          name: kit.name,
                          category: kit.category,
                          location_name: kit.location_name,
                          type: 'kit'
                        }]);
                        setPrintModalTitle(`Print Kit QR Label: ${kit.name}`);
                        setShowPrintModal(true);
                      }}
                      className="dub-btn-outline text-xs px-2 py-1 flex items-center gap-1 text-charcoal dark:text-zinc-200"
                      title="Print kit QR label sticker"
                    >
                      <QrCode className="w-3 h-3 text-purple-500" /> QR
                    </button>

                    <button
                      onClick={() => openEdit(kit)}
                      className="dub-btn-outline text-xs px-2 py-1 flex items-center gap-1 text-charcoal dark:text-zinc-200"
                    >
                      <Edit3 className="w-3 h-3 text-steel dark:text-zinc-400" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(kit.id)}
                      className="p-1 rounded text-steel dark:text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Delete Kit"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleExpand(kit.id)}
                      className="p-1 rounded text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200 transition"
                      title={isExpanded ? 'Collapse contents' : 'Expand contents'}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Kit Contents */}
                {isExpanded && (
                  <div className="p-3 border-t border-ash dark:border-zinc-800 space-y-2">
                    {kit.description && (
                      <p className="text-[11px] text-steel dark:text-zinc-400 italic">
                        &quot;{kit.description}&quot;
                      </p>
                    )}

                    <div className="text-[10px] font-semibold text-steel dark:text-zinc-400 uppercase tracking-wider">
                      Kit Contents Per Package:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(kit.items || []).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between p-2 rounded-md bg-ash/30 dark:bg-zinc-800/40 border border-ash/50 dark:border-zinc-800/50 text-xs"
                        >
                          <span className="font-medium text-charcoal dark:text-zinc-200 truncate mr-2">
                            {item.category_or_name}
                          </span>
                          <span className="font-mono font-semibold px-1.5 py-0.2 rounded bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-700 text-charcoal dark:text-zinc-200 text-[10px] shrink-0">
                            x{item.quantity_required}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Kit Modal */}
      {(showAddModal || editingKit) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-ash dark:border-zinc-800 shrink-0">
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                {editingKit ? 'Edit Kit Template' : 'Create Equipment Kit Template'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingKit(null);
                }}
                className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={editingKit ? handleUpdate : handleCreate} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Kit Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony FX3 Cinema Rig"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Kit Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KIT-FX3-01"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cinema Rig or Drone Kit"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Total Kits Owned
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.total_kits_count}
                    onChange={(e) => setForm({ ...form, total_kits_count: Math.max(1, Number(e.target.value)) })}
                    className="dub-input w-full text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                    Home Vault
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

              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-zinc-300 mb-1">
                  Description / Flight Case Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Packed in Pelican 1510 with custom cut foam"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              {/* Dynamic Items Builder */}
              <div className="pt-3 border-t border-ash dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-charcoal dark:text-zinc-200">
                    What is inside ONE kit package?
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Component
                  </button>
                </div>

                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Component name or category (e.g. 24-70mm Lens)"
                        value={item.category_or_name}
                        onChange={(e) => handleItemChange(idx, 'category_or_name', e.target.value)}
                        className="dub-input flex-1 text-xs"
                      />

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-steel dark:text-zinc-400">Qty:</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity_required}
                          onChange={(e) => handleItemChange(idx, 'quantity_required', Math.max(1, Number(e.target.value)))}
                          className="dub-input w-16 text-center text-xs font-mono font-semibold"
                        />
                      </div>

                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-steel dark:text-zinc-400 hover:text-red-500 rounded transition"
                          title="Remove Component"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-ash dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingKit(null);
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
                  {editingKit ? 'Save Kit Changes' : 'Create Kit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100">Delete Kit Template?</h3>
              <p className="text-xs text-steel dark:text-zinc-400 mt-1">
                This template will be removed from your catalog. Individual hardware assets remain intact.
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

      {/* Printable Kit QR Sticker Sheet Modal */}
      <PrintableLabelModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title={printModalTitle}
        items={printItems}
      />
    </div>
  );
};
