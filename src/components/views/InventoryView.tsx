import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Check, CheckCircle2, Clock, AlertTriangle, Shield, 
  Loader2, Sparkles, Wrench, Trash2, Edit3, X, Tag, Download,
  FileText, History, Calendar, ArrowUpRight, MoreVertical, MessageSquarePlus,
  Building2, Layers, Boxes, QrCode, Scan, Printer
} from 'lucide-react';
import { api, AssetRecord, AssetHistoryRecord, AssetNoteRecord, VaultRecord } from '../../lib/api';
import { exportToCsv } from '../../lib/exportUtils';
import { useToast } from '../Toast';
import { useConfirm } from '../ConfirmModal';
import { VaultsSection } from './inventory/VaultsSection';
import { ConsumablesSection } from './inventory/ConsumablesSection';
import { KitsSection } from './inventory/KitsSection';
import { QrScannerModal } from './inventory/QrScannerModal';
import { PrintableLabelModal, PrintableLabelItem } from './inventory/PrintableLabelModal';

const DEFAULT_PRESET_CATEGORIES = [
  'Cameras',
  'Lenses',
  'Lighting',
  'Audio & Mics',
  'Drones & Aerial',
  'Grip & Support',
  'Laptops & Computing',
  'Storage & Drives',
  'Monitors & Displays',
  'Power & Batteries',
  'Tools & Rigging',
  'Supplies & Consumables'
];

export interface InventoryViewProps {
  initialSubTab?: 'assets' | 'kits' | 'consumables' | 'vaults';
  onSubTabChange?: (tab: 'assets' | 'kits' | 'consumables' | 'vaults') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ initialSubTab = 'assets', onSubTabChange }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'kits' | 'consumables' | 'vaults'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tab: 'assets' | 'kits' | 'consumables' | 'vaults') => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };
  const [vaults, setVaults] = useState<VaultRecord[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const [inventory, setInventory] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Category / Group Modal State
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [categoryModalTarget, setCategoryModalTarget] = useState<'new' | 'edit'>('new');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');

  // Return Inspection Modal State
  const [inspectingAsset, setInspectingAsset] = useState<AssetRecord | null>(null);
  const [returnCondition, setReturnCondition] = useState<'excellent' | 'good' | 'fair' | 'in_repair'>('excellent');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [isInspecting, setIsInspecting] = useState<boolean>(false);

  // Edit Modal State
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Asset Details & Usage History State
  const [historyAsset, setHistoryAsset] = useState<AssetRecord | null>(null);
  const [historyLogs, setHistoryLogs] = useState<AssetHistoryRecord[]>([]);
  const [historyNotes, setHistoryNotes] = useState<AssetNoteRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteCondition, setNewNoteCondition] = useState<'excellent' | 'good' | 'fair' | 'in_repair'>('excellent');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Row Action Menu State (Three-dot dropdown)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // QR Code Scanner & Label Printing States
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printModalTitle, setPrintModalTitle] = useState<string>('Print Gear Asset QR Labels');
  const [printItems, setPrintItems] = useState<PrintableLabelItem[]>([]);

  // New Asset Form
  const [newAsset, setNewAsset] = useState({
    name: '',
    code: '',
    category: 'Cameras',
    serial_number: '',
    purchase_cost: 0,
    condition: 'excellent' as const,
    location_id: '',
    is_maintenance_applicable: false,
    maintenance_interval_days: 90,
    is_depreciation_applicable: false,
    salvage_value: 0,
    useful_life_months: 36
  });

  const loadAssets = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [data, vaultsData] = await Promise.all([
        api.getAssets(),
        api.getVaults().catch(() => [])
      ]);
      setInventory(data || []);
      setVaults(vaultsData || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch inventory from ZManage-APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Dynamically extract categories from all registered products + presets
  const dynamicCategories = Array.from(new Set(inventory.map(a => a.category?.trim() || 'General'))).filter(Boolean);
  const allAvailableCategories = Array.from(new Set([...dynamicCategories, ...DEFAULT_PRESET_CATEGORIES]));

  const filteredCategoriesList = allAvailableCategories.filter(c =>
    c.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const handleSelectCategory = (catName: string) => {
    const clean = catName.trim();
    if (!clean) return;
    if (categoryModalTarget === 'new') {
      setNewAsset(prev => ({ ...prev, category: clean }));
    } else if (editingAsset) {
      setEditingAsset(prev => prev ? ({ ...prev, category: clean }) : null);
    }
    setShowCategoryModal(false);
  };

  const handleApplyCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    handleSelectCategory(customCategoryInput.trim());
    setCustomCategoryInput('');
  };

  const filtered = inventory.filter(a => {
    const matchCat = selectedCategory === 'all' || (a.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchLoc = selectedLocation === 'all' || a.location_id === selectedLocation;
    const matchSearch = (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchLoc && matchSearch;
  });

  const handleExportInventory = () => {
    exportToCsv('hardware_equipment_inventory', filtered, [
      { header: 'Asset Code', accessor: a => a.code || '' },
      { header: 'Product Name', accessor: a => a.name },
      { header: 'Category', accessor: a => a.category || 'General' },
      { header: 'Serial Number', accessor: a => a.serial_number || '' },
      { header: 'Condition', accessor: a => a.condition },
      { header: 'Status', accessor: a => a.status },
      { header: 'Purchase Cost (INR)', accessor: a => a.purchase_cost || 0 },
      { header: 'Purchase Date', accessor: a => a.purchase_date || '' }
    ]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createAsset({
        name: newAsset.name,
        code: newAsset.code.trim() || undefined,
        category: newAsset.category.trim() || 'General',
        serial_number: newAsset.serial_number.trim() || undefined,
        condition: newAsset.condition,
        status: 'available',
        purchase_cost: Number(newAsset.purchase_cost) || 0,
        currency: 'INR',
        location_id: newAsset.location_id || undefined,
        is_maintenance_applicable: newAsset.is_maintenance_applicable,
        maintenance_interval_days: Number(newAsset.maintenance_interval_days) || 90,
        is_depreciation_applicable: newAsset.is_depreciation_applicable,
        salvage_value: Number(newAsset.salvage_value) || 0,
        useful_life_months: Number(newAsset.useful_life_months) || 36
      });
      await loadAssets();
      setShowAddModal(false);
      toast.success('Equipment asset registered successfully');
      setNewAsset({
        name: '',
        code: '',
        category: 'Cameras',
        serial_number: '',
        purchase_cost: 0,
        condition: 'excellent',
        location_id: '',
        is_maintenance_applicable: false,
        maintenance_interval_days: 90,
        is_depreciation_applicable: false,
        salvage_value: 0,
        useful_life_months: 36
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to register equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (asset: AssetRecord) => {
    if (asset.status === 'on_shoot') {
      setInspectingAsset(asset);
      setReturnCondition(asset.condition || 'excellent');
      setReturnNotes('');
    } else {
      handleCheckout(asset);
    }
  };

  const handleCheckout = async (asset: AssetRecord) => {
    try {
      await api.updateAsset(asset.id, { status: 'on_shoot' });
      await loadAssets();
      toast.success('Gear checked out for shoot');
    } catch (err: any) {
      toast.error(err.message || 'Check-out failed');
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
      toast.success('Return inspection recorded');
    } catch (err: any) {
      toast.error(err.message || 'Return inspection failed');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    try {
      setIsEditing(true);
      await api.updateAsset(editingAsset.id, {
        name: editingAsset.name.trim(),
        code: editingAsset.code?.trim() || undefined,
        category: editingAsset.category?.trim() || 'General',
        serial_number: editingAsset.serial_number?.trim() || undefined,
        condition: editingAsset.condition,
        purchase_cost: Number(editingAsset.purchase_cost) || 0,
        maintenance_notes: editingAsset.maintenance_notes || undefined,
        location_id: editingAsset.location_id || null,
        is_maintenance_applicable: editingAsset.is_maintenance_applicable,
        maintenance_interval_days: Number(editingAsset.maintenance_interval_days) || 90,
        is_depreciation_applicable: editingAsset.is_depreciation_applicable,
        salvage_value: Number(editingAsset.salvage_value) || 0,
        useful_life_months: Number(editingAsset.useful_life_months) || 36
      });
      await loadAssets();
      setEditingAsset(null);
      toast.success('Asset details updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item details');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Asset',
      message: 'Are you sure you want to delete this item from your vault? This action cannot be undone.',
      confirmText: 'Delete Asset',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      setIsDeleting(true);
      setDeletingId(id);
      await api.deleteAsset(id);
      await loadAssets();
      toast.success('Asset deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete asset');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleOpenHistory = async (asset: AssetRecord) => {
    setHistoryAsset(asset);
    setLoadingHistory(true);
    setHistoryLogs([]);
    setHistoryNotes([]);
    setShowAddNoteForm(false);
    setNewNoteText('');
    setNewNoteCondition((asset.condition as any) || 'excellent');
    try {
      const res = await api.getAssetHistory(asset.id);
      if (res && res.history) {
        setHistoryLogs(res.history);
      }
      if (res && res.notes_history) {
        setHistoryNotes(res.notes_history);
      } else if (res && res.asset?.specs?.notes_history) {
        setHistoryNotes(res.asset.specs.notes_history);
      }
      if (res && res.asset) {
        setHistoryAsset(res.asset);
      }
    } catch (err: any) {
      console.error('Failed to load asset history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddDirectNote = async () => {
    if (!historyAsset || !newNoteText.trim()) return;
    try {
      setIsAddingNote(true);
      const res = await api.addAssetNote(historyAsset.id, {
        note: newNoteText.trim(),
        condition: newNoteCondition,
        action: 'maintenance'
      });
      if (res && res.notes_history) {
        setHistoryNotes(res.notes_history);
      }
      if (res && res.asset) {
        setHistoryAsset(res.asset);
      }
      setNewNoteText('');
      setShowAddNoteForm(false);
      await loadAssets();
      toast.success('Asset note recorded');
    } catch (err: any) {
      toast.error(err.message || 'Failed to record note');
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal flex items-center gap-2">
            <Package className="w-5 h-5 text-electric" /> Products & Equipment Vault
          </h1>
          <p className="text-xs text-steel">
            Add custom products, track serial numbers, manage condition life cycles, and check out gear.
          </p>
        </div>

        {activeSubTab === 'assets' && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setShowScannerModal(true)}
              className="dub-btn-outline text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer shrink-0 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
              title="Scan QR / Barcode for fast check-in or return"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-500" />
              <span>Scan QR / Barcode</span>
            </button>

            <button
              onClick={() => {
                const printable = filtered.map(a => ({
                  id: a.id,
                  code: a.code || a.id.slice(0, 8),
                  name: a.name,
                  category: a.category,
                  serial_number: a.serial_number,
                  location_name: a.location_name,
                  type: 'asset' as const,
                  condition: a.condition
                }));
                setPrintItems(printable);
                setPrintModalTitle(`Print QR Labels (${printable.length} Items)`);
                setShowPrintModal(true);
              }}
              className="dub-btn-outline text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Print QR sticker sheet for all visible gear"
            >
              <Printer className="w-3.5 h-3.5 text-purple-500" />
              <span>Print QR Labels</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product / Gear
            </button>
          </div>
        )}
      </div>

      {/* Sub-Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ash/30 dark:bg-zinc-800/40 border border-ash/60 dark:border-zinc-800 w-fit overflow-x-auto">
        <button
          onClick={() => handleSubTabChange('assets')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeSubTab === 'assets'
              ? 'bg-paper dark:bg-zinc-900 text-charcoal dark:text-zinc-100 shadow-sm border border-ash dark:border-zinc-700'
              : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-purple-500" />
          Hardware Assets ({inventory.length})
        </button>

        <button
          onClick={() => handleSubTabChange('kits')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeSubTab === 'kits'
              ? 'bg-paper dark:bg-zinc-900 text-charcoal dark:text-zinc-100 shadow-sm border border-ash dark:border-zinc-700'
              : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-500" />
          Equipment Kits & Bundles
        </button>

        <button
          onClick={() => handleSubTabChange('consumables')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeSubTab === 'consumables'
              ? 'bg-paper dark:bg-zinc-900 text-charcoal dark:text-zinc-100 shadow-sm border border-ash dark:border-zinc-700'
              : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-amber-500" />
          Consumables Stock
        </button>

        <button
          onClick={() => handleSubTabChange('vaults')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeSubTab === 'vaults'
              ? 'bg-paper dark:bg-zinc-900 text-charcoal dark:text-zinc-100 shadow-sm border border-ash dark:border-zinc-700'
              : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-purple-400" />
          Storage Vaults ({vaults.length})
        </button>
      </div>

      {activeSubTab === 'kits' && <KitsSection vaults={vaults} />}
      {activeSubTab === 'consumables' && <ConsumablesSection vaults={vaults} />}
      {activeSubTab === 'vaults' && <VaultsSection />}

      {activeSubTab === 'assets' && (
        <>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadAssets} className="underline text-xs ml-2">Retry</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="dub-card px-3.5 py-2 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Total Items</span>
            <div className="text-base font-satoshi font-bold text-charcoal dark:text-zinc-100">{inventory.length}</div>
          </div>
          <Package className="w-4 h-4 text-steel dark:text-zinc-500 opacity-60" />
        </div>
        <div className="dub-card px-3.5 py-2 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Available Now</span>
            <div className="text-base font-satoshi font-bold text-vividGreen">
              {inventory.filter(a => a.status === 'available').length}
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-vividGreen opacity-60" />
        </div>
        <div className="dub-card px-3.5 py-2 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">On Shoot / In Use</span>
            <div className="text-base font-satoshi font-bold text-electric">
              {inventory.filter(a => a.status === 'on_shoot' || a.status === 'in_use').length}
            </div>
          </div>
          <Clock className="w-4 h-4 text-electric opacity-60" />
        </div>
        <div className="dub-card px-3.5 py-2 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Maintenance</span>
            <div className="text-base font-satoshi font-bold text-tangerine">
              {inventory.filter(a => a.status === 'maintenance' || a.status === 'in_repair').length}
            </div>
          </div>
          <Wrench className="w-4 h-4 text-tangerine opacity-60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-charcoal text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                : 'bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
            }`}
          >
            All Items ({inventory.length})
          </button>
          {dynamicCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-charcoal text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Export Toolbar */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {vaults.length > 0 && (
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="dub-input text-xs py-1.5"
            >
              <option value="all">All Vaults</option>
              {vaults.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-fog absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="dub-input w-full pl-10 text-xs"
            />
          </div>

          <button
            onClick={handleExportInventory}
            className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Export items to CSV"
          >
            <Download className="w-3.5 h-3.5 text-electric" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="dub-card bg-white border border-ash overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel">Loading items from ZManage-APIs...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-steel">
            No items found matching criteria. Click <span className="font-semibold text-charcoal">Add Product / Gear</span> above to register.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[260px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-ash bg-paper/60 text-steel font-medium">
                  <th className="py-2.5 px-4 font-mono text-[11px]">CODE / SKU</th>
                  <th className="py-2.5 px-4">ITEM & CATEGORY</th>
                  <th className="py-2.5 px-4 font-mono text-[11px]">SERIAL NO</th>
                  <th className="py-2.5 px-4">CONDITION</th>
                  <th className="py-2.5 px-4">STATUS</th>
                  <th className="py-2.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ash">
                {filtered.map((asset, index) => {
                  const isNearBottom = index >= filtered.length - 2 && filtered.length > 2;
                  return (
                    <tr key={asset.id} className="hover:bg-paper/40 transition">
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-charcoal">
                        {asset.code || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-charcoal">
                          <button
                            onClick={() => handleOpenHistory(asset)}
                            className="hover:text-electric hover:underline text-left cursor-pointer transition"
                            title="Click to view full usage & return inspection details"
                          >
                            {asset.name}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-fog capitalize inline-flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" /> {asset.category || 'General'}
                          </span>
                          {asset.location_name && (
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-500/10">
                              <Building2 className="w-2.5 h-2.5" /> {asset.location_name}
                            </span>
                          )}
                          {asset.is_maintenance_applicable && (
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-cyan-500/10">
                              <Wrench className="w-2.5 h-2.5" /> Service: {asset.next_service_due || `Every ${asset.maintenance_interval_days || 90}d`}
                            </span>
                          )}
                        </div>
                        {asset.maintenance_notes && (
                          <div 
                            onClick={() => handleOpenHistory(asset)}
                            className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 cursor-pointer transition max-w-sm"
                            title={`Return Inspection Note: ${asset.maintenance_notes}. Click to view full log.`}
                          >
                            <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="font-semibold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">Return Note:</span>
                            <span className="truncate italic">"{asset.maintenance_notes}"</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal">
                        <div>{asset.serial_number || 'N/A'}</div>
                        {asset.is_depreciation_applicable && asset.book_value !== undefined && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans" title="Straight-line depreciated book value">
                            Val: ₹{asset.book_value.toLocaleString()}
                          </div>
                        )}
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
                        {(asset.status === 'on_shoot' || asset.status === 'in_use') && (
                          <span className="dub-badge-blue text-[10px] font-mono inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> IN USE
                          </span>
                        )}
                        {(asset.status === 'maintenance' || asset.status === 'in_repair') && (
                          <span className="dub-badge-tangerine text-[10px] font-mono inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> MAINTENANCE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === asset.id ? null : asset.id);
                            }}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              openMenuId === asset.id
                                ? 'bg-paper dark:bg-zinc-800 border-ash dark:border-zinc-700 text-charcoal dark:text-zinc-100 shadow-xs'
                                : 'border-transparent hover:border-ash dark:hover:border-zinc-700 hover:bg-paper dark:hover:bg-zinc-800 text-steel hover:text-charcoal dark:hover:text-zinc-200'
                            }`}
                            title="More actions"
                            aria-label="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === asset.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 w-52 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-floating p-1 z-40 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-100 ${
                                isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleActionClick(asset);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 text-xs font-medium text-charcoal dark:text-zinc-200 flex items-center gap-2 transition cursor-pointer"
                              >
                                {asset.status === 'available' ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-electric shrink-0" />
                                    <span>Check-out Gear</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-vividGreen shrink-0" />
                                    <span>Return Inspection</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleOpenHistory(asset);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 text-xs font-medium text-charcoal dark:text-zinc-200 flex items-center gap-2 transition cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5 text-steel dark:text-zinc-400 shrink-0" />
                                <span>Usage & Notes History</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setPrintItems([{
                                    id: asset.id,
                                    code: asset.code || asset.id.slice(0, 8),
                                    name: asset.name,
                                    category: asset.category,
                                    serial_number: asset.serial_number,
                                    location_name: asset.location_name,
                                    type: 'asset',
                                    condition: asset.condition
                                  }]);
                                  setPrintModalTitle(`Print QR Label: ${asset.name}`);
                                  setShowPrintModal(true);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 text-xs font-medium text-charcoal dark:text-zinc-200 flex items-center gap-2 transition cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span>Print QR Label</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setEditingAsset(asset);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 text-xs font-medium text-charcoal dark:text-zinc-200 flex items-center gap-2 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-steel dark:text-zinc-400 shrink-0" />
                                <span>Edit Item Details</span>
                              </button>

                              <div className="border-t border-ash dark:border-zinc-800 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDelete(asset.id);
                                }}
                                disabled={isDeleting && deletingId === asset.id}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                              >
                                {isDeleting && deletingId === asset.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span>Delete Item</span>
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
      </>
      )}

      {/* Return Inspection Modal */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-md space-y-4">
            <h2 className="text-sm font-semibold font-satoshi text-charcoal">Return Condition Inspection</h2>
            <div className="p-3.5 rounded-xl bg-paper border border-ash text-xs space-y-1">
              <div className="font-semibold text-charcoal">{inspectingAsset.name}</div>
              <div className="font-mono text-steel text-[11px]">SKU: {inspectingAsset.code || inspectingAsset.id.substring(0, 8)}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Observed Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['excellent', 'good', 'fair', 'in_repair'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setReturnCondition(c)}
                      className={`p-2 rounded-lg border text-xs font-medium capitalize text-left transition ${
                        returnCondition === c
                          ? 'border-charcoal bg-paper font-semibold'
                          : 'border-ash text-steel hover:bg-paper'
                      }`}
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">Maintenance / Inspection Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Scratches on casing, serviced firmware..."
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="dub-input w-full text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ash">
              <button
                type="button"
                onClick={() => setInspectingAsset(null)}
                className="dub-btn-outline text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isInspecting}
                onClick={handleConfirmReturn}
                className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
              >
                {isInspecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Details & Usage History Modal */}
      {historyAsset && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-ash dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-electric flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold font-satoshi text-charcoal dark:text-zinc-100">
                      {historyAsset.name}
                    </h2>
                    <span className="dub-badge-blue text-[10px] font-mono py-0.5 px-1.5">
                      {historyAsset.code || 'NO SKU'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-steel dark:text-zinc-400 mt-0.5">
                    <span className="capitalize">{historyAsset.category || 'General'}</span>
                    <span>•</span>
                    <span className="font-mono">SN: {historyAsset.serial_number || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setHistoryAsset(null)} 
                className="text-fog hover:text-charcoal dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Latest Return Inspection & Condition Banner */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Latest Return Inspection Note
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold capitalize px-2 py-0.5 rounded-full ${
                  historyAsset.condition === 'excellent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                  historyAsset.condition === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                  historyAsset.condition === 'fair' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                  'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                }`}>
                  <Shield className="w-3 h-3" /> Condition: {historyAsset.condition?.replace('_', ' ')}
                </span>
              </div>

              {historyAsset.maintenance_notes ? (
                <div className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-xs font-medium text-charcoal dark:text-zinc-200">
                  <span className="italic">"{historyAsset.maintenance_notes}"</span>
                </div>
              ) : (
                <p className="text-xs text-amber-900/70 dark:text-amber-300/70">
                  No return notes or defects reported. Gear is certified in {historyAsset.condition?.replace('_', ' ')} condition.
                </p>
              )}
            </div>

            {/* Quick Fleet Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-paper dark:bg-zinc-800/50 border border-ash dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-medium text-fog uppercase tracking-wider block">Live Status</span>
                <div className="text-xs font-semibold capitalize text-charcoal dark:text-zinc-200 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    historyAsset.status === 'available' ? 'bg-vividGreen' :
                    historyAsset.status === 'on_shoot' || historyAsset.status === 'in_use' ? 'bg-electric' : 'bg-tangerine'
                  }`} />
                  {historyAsset.status.replace('_', ' ')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-paper dark:bg-zinc-800/50 border border-ash dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-medium text-fog uppercase tracking-wider block">Asset Valuation</span>
                <div className="text-xs font-semibold text-charcoal dark:text-zinc-200 font-mono">
                  ₹{Number(historyAsset.purchase_cost || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-paper dark:bg-zinc-800/50 border border-ash dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-medium text-fog uppercase tracking-wider block">Dispatched Shoots</span>
                <div className="text-xs font-semibold text-charcoal dark:text-zinc-200 font-mono">
                  {historyLogs.length} Total
                </div>
              </div>
            </div>

            {/* Historical Notes & Inspection Log */}
            <div className="space-y-3 pt-2 border-t border-ash dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-charcoal dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-electric" /> Inspection & Return Notes History
                  </h3>
                  <span className="text-[11px] text-steel dark:text-zinc-400 font-mono">
                    {historyNotes.length} Notes Logged
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddNoteForm(prev => !prev)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-ash dark:border-zinc-700 bg-paper dark:bg-zinc-800 text-charcoal dark:text-zinc-200 hover:border-electric transition flex items-center gap-1 cursor-pointer font-medium"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-electric" />
                  {showAddNoteForm ? 'Cancel' : 'Log Note'}
                </button>
              </div>

              {/* Inline Add Note Form */}
              {showAddNoteForm && (
                <div className="p-3.5 rounded-xl bg-paper dark:bg-zinc-800/60 border border-ash dark:border-zinc-700 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-charcoal dark:text-zinc-200">
                      Record Maintenance / Inspection Note
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-steel dark:text-zinc-400 font-medium">Condition:</span>
                      <select
                        value={newNoteCondition}
                        onChange={e => setNewNoteCondition(e.target.value as any)}
                        className="text-xs py-1 px-2 rounded-lg border border-ash dark:border-zinc-700 bg-white dark:bg-zinc-900 text-charcoal dark:text-zinc-200"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="in_repair">In Repair</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Enter observation, return notes, or maintenance details..."
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-ash dark:border-zinc-700 resize-none text-charcoal dark:text-zinc-100 placeholder:text-fog"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowAddNoteForm(false); setNewNoteText(''); }}
                      className="dub-btn-outline text-xs px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isAddingNote || !newNoteText.trim()}
                      onClick={handleAddDirectNote}
                      className="dub-btn-primary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isAddingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Save Note
                    </button>
                  </div>
                </div>
              )}

              {/* Historical Notes List */}
              {loadingHistory ? (
                <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-electric animate-spin" />
                  <span className="text-xs text-steel">Retrieving inspection records...</span>
                </div>
              ) : historyNotes.length === 0 ? (
                <div className="p-5 text-center rounded-xl bg-paper/60 dark:bg-zinc-800/30 border border-dashed border-ash dark:border-zinc-700 space-y-1">
                  <p className="text-xs font-medium text-charcoal dark:text-zinc-300">No Earlier Notes Logged</p>
                  <p className="text-[11px] text-steel dark:text-zinc-400">
                    Notes recorded during check-in inspections and maintenance updates will appear chronologically here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {historyNotes.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="p-3 rounded-xl bg-paper dark:bg-zinc-800/50 border border-ash dark:border-zinc-800 text-xs space-y-1.5 hover:border-smoke dark:hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${
                            entry.condition === 'excellent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                            entry.condition === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                            entry.condition === 'fair' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                            'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            <Shield className="w-2.5 h-2.5" /> Condition: {entry.condition?.replace('_', ' ') || 'Good'}
                          </span>
                          <span className="text-[10px] text-steel dark:text-zinc-400 capitalize px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 font-mono">
                            {entry.action === 'return_inspection' ? 'Return Inspection' : 'Maintenance Log'}
                          </span>
                        </div>
                        <span className="text-[11px] text-steel dark:text-zinc-400 font-mono">
                          {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-lg border border-ash dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-200">
                        <span className="italic">"{entry.note}"</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Usage History Log */}
            <div className="space-y-2 pt-2 border-t border-ash dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-charcoal dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-steel" /> Shoot Allocation & Usage Log
                </h3>
                <span className="text-[11px] text-steel dark:text-zinc-400 font-mono">
                  {historyLogs.length} Records
                </span>
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-electric animate-spin" />
                  <span className="text-xs text-steel">Retrieving usage timeline...</span>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-paper/60 dark:bg-zinc-800/30 border border-dashed border-ash dark:border-zinc-700 space-y-1">
                  <p className="text-xs font-medium text-charcoal dark:text-zinc-300">No Historical Shoots Logged</p>
                  <p className="text-[11px] text-steel dark:text-zinc-400">
                    When this gear is locked for bookings or checked out to crew in the Operations Timeline, usage and check-in return records will automatically populate here.
                  </p>
                </div>
              ) : (
                <div className="border border-ash dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-ash dark:divide-zinc-800">
                  {historyLogs.map(log => (
                    <div key={log.id} className="p-3 hover:bg-paper/50 dark:hover:bg-zinc-800/50 transition text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-charcoal dark:text-zinc-200">
                          {log.allocations?.title || 'Production Event'}
                        </span>
                        <span className="dub-badge-blue text-[10px] font-mono capitalize">
                          {log.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-steel dark:text-zinc-400">
                        {log.allocations?.venue && <span>Venue: {log.allocations.venue}</span>}
                        {log.allocations?.client_name && <span>Client: {log.allocations.client_name}</span>}
                        <span>
                          Period: {new Date(log.lock_start).toLocaleDateString()} {new Date(log.lock_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(log.lock_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {log.return_condition && (
                          <span className="text-vividGreen font-medium">Return Condition: {log.return_condition}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-ash dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setHistoryAsset(null)}
                className="dub-btn-outline text-xs px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <h2 className="text-sm font-semibold font-satoshi text-charcoal">Edit Item Details</h2>
              <button onClick={() => setEditingAsset(null)} className="text-fog hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Item / Product Name</label>
                <input
                  type="text"
                  required
                  value={editingAsset.name}
                  onChange={e => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Code / SKU</label>
                  <input
                    type="text"
                    value={editingAsset.code || ''}
                    onChange={e => setEditingAsset({ ...editingAsset, code: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Category / Group *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryModalTarget('edit');
                      setCategorySearch('');
                      setShowCategoryModal(true);
                    }}
                    className="dub-input w-full text-xs text-left flex items-center justify-between hover:border-steel/60 transition-colors bg-canvas/30"
                  >
                    <span className="font-medium text-charcoal truncate">{editingAsset.category || 'Select category'}</span>
                    <span className="dub-badge-blue text-[10px] py-0.5 px-1.5 shrink-0 ml-1">Change</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={editingAsset.serial_number || ''}
                    onChange={e => setEditingAsset({ ...editingAsset, serial_number: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={editingAsset.purchase_cost === 0 ? '' : (editingAsset.purchase_cost ?? '')}
                    onChange={e => setEditingAsset({ ...editingAsset, purchase_cost: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">Condition</label>
                <select
                  value={editingAsset.condition}
                  onChange={e => setEditingAsset({ ...editingAsset, condition: e.target.value as any })}
                  className="dub-input w-full text-xs"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="in_repair">In Repair</option>
                </select>
              </div>

              {/* Vault Location Selector */}
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Storage Vault / Location</label>
                <select
                  value={editingAsset.location_id || ''}
                  onChange={e => setEditingAsset({ ...editingAsset, location_id: e.target.value || null })}
                  className="dub-input w-full text-xs"
                >
                  <option value="">Unassigned</option>
                  {vaults.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Optional Maintenance Tracking Toggle */}
              <div className="p-3 rounded-lg border border-ash dark:border-zinc-800 bg-ash/20 dark:bg-zinc-800/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingAsset.is_maintenance_applicable)}
                    onChange={e => setEditingAsset({ ...editingAsset, is_maintenance_applicable: e.target.checked })}
                    className="rounded border-ash text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-charcoal dark:text-zinc-200 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-purple-500" /> Enable Maintenance Tracking
                  </span>
                </label>
                {editingAsset.is_maintenance_applicable && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-steel dark:text-zinc-400 mb-0.5">Interval (Days)</label>
                      <input
                        type="number"
                        min={1}
                        value={editingAsset.maintenance_interval_days || 90}
                        onChange={e => setEditingAsset({ ...editingAsset, maintenance_interval_days: Number(e.target.value) })}
                        className="dub-input w-full text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-steel dark:text-zinc-400 mb-0.5">Next Due Date</label>
                      <input
                        type="date"
                        value={editingAsset.next_service_due || ''}
                        onChange={e => setEditingAsset({ ...editingAsset, next_service_due: e.target.value || null })}
                        className="dub-input w-full text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Depreciation Tracking Toggle */}
              <div className="p-3 rounded-lg border border-ash dark:border-zinc-800 bg-ash/20 dark:bg-zinc-800/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingAsset.is_depreciation_applicable)}
                    onChange={e => setEditingAsset({ ...editingAsset, is_depreciation_applicable: e.target.checked })}
                    className="rounded border-ash text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-charcoal dark:text-zinc-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-500" /> Enable Straight-Line Depreciation
                  </span>
                </label>
                {editingAsset.is_depreciation_applicable && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-steel dark:text-zinc-400 mb-0.5">Salvage Value (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={editingAsset.salvage_value || 0}
                        onChange={e => setEditingAsset({ ...editingAsset, salvage_value: Number(e.target.value) })}
                        className="dub-input w-full text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-steel dark:text-zinc-400 mb-0.5">Useful Life (Months)</label>
                      <input
                        type="number"
                        min={1}
                        value={editingAsset.useful_life_months || 36}
                        onChange={e => setEditingAsset({ ...editingAsset, useful_life_months: Number(e.target.value) })}
                        className="dub-input w-full text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ash">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="dub-btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  {isEditing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal">Add Product / Gear</h2>
                <p className="text-xs text-steel">Register any physical product, equipment, or fleet item into your workspace.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-fog hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Mic System / Sony A7IV"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Code / SKU</label>
                  <input
                    type="text"
                    placeholder="Leave blank for auto-code"
                    value={newAsset.code}
                    onChange={e => setNewAsset({ ...newAsset, code: e.target.value })}
                    className="dub-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Category / Group *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryModalTarget('new');
                      setCategorySearch('');
                      setShowCategoryModal(true);
                    }}
                    className="dub-input w-full text-xs text-left flex items-center justify-between hover:border-steel/60 transition-colors bg-canvas/30"
                  >
                    <span className="font-medium text-charcoal truncate">{newAsset.category || 'Select category'}</span>
                    <span className="dub-badge-blue text-[10px] py-0.5 px-1.5 shrink-0 ml-1">Browse</span>
                  </button>
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

              <div>
                <label className="block text-xs font-medium text-steel mb-1">Estimated / Purchase Value (₹)</label>
                <input
                  type="number"
                  placeholder="35000"
                  value={newAsset.purchase_cost === 0 ? '' : newAsset.purchase_cost}
                  onChange={e => setNewAsset({ ...newAsset, purchase_cost: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="dub-input w-full text-xs font-mono"
                />
              </div>

              {/* Vault Location Selector */}
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Storage Vault / Location</label>
                <select
                  value={newAsset.location_id}
                  onChange={e => setNewAsset({ ...newAsset, location_id: e.target.value })}
                  className="dub-input w-full text-xs"
                >
                  <option value="">Unassigned</option>
                  {vaults.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Optional Maintenance Tracking Toggle */}
              <div className="p-3 rounded-lg border border-ash dark:border-zinc-800 bg-ash/20 dark:bg-zinc-800/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAsset.is_maintenance_applicable}
                    onChange={e => setNewAsset({ ...newAsset, is_maintenance_applicable: e.target.checked })}
                    className="rounded border-ash text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-charcoal dark:text-zinc-200 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-purple-500" /> Enable Maintenance Tracking
                  </span>
                </label>
                {newAsset.is_maintenance_applicable && (
                  <div>
                    <label className="block text-[10px] text-steel dark:text-zinc-400 mb-0.5">Service Interval (Days)</label>
                    <input
                      type="number"
                      min={1}
                      value={newAsset.maintenance_interval_days}
                      onChange={e => setNewAsset({ ...newAsset, maintenance_interval_days: Number(e.target.value) })}
                      className="dub-input w-full text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Optional Depreciation Tracking Toggle */}
              <div className="p-3 rounded-lg border border-ash dark:border-zinc-800 bg-ash/20 dark:bg-zinc-800/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAsset.is_depreciation_applicable}
                    onChange={e => setNewAsset({ ...newAsset, is_depreciation_applicable: e.target.checked })}
                    className="rounded border-ash text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-charcoal dark:text-zinc-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-500" /> Enable Straight-Line Depreciation
                  </span>
                </label>
                {newAsset.is_depreciation_applicable && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-steel dark:text-zinc-400 mb-0.5">Salvage Value (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={newAsset.salvage_value}
                        onChange={e => setNewAsset({ ...newAsset, salvage_value: Number(e.target.value) })}
                        className="dub-input w-full text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-steel dark:text-zinc-400 mb-0.5">Useful Life (Months)</label>
                      <input
                        type="number"
                        min={1}
                        value={newAsset.useful_life_months}
                        onChange={e => setNewAsset({ ...newAsset, useful_life_months: Number(e.target.value) })}
                        className="dub-input w-full text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
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
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Category / Group Selection & Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-ash">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold font-satoshi text-charcoal">Select Category or Group</h2>
                  <p className="text-xs text-steel">Assign to an existing group or define a custom category.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-fog hover:text-charcoal p-1 rounded-md hover:bg-canvas transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="text"
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                placeholder="Search category (e.g. Camera, Audio, Lighting)..."
                className="dub-input w-full pl-8 text-xs"
                autoFocus
              />
            </div>

            {/* Existing Categories from Workspace */}
            {dynamicCategories.length > 0 && !categorySearch.trim() && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-steel uppercase tracking-wider">
                  In Use in Workspace
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dynamicCategories.map(cat => {
                    const count = inventory.filter(i => (i.category || 'General').toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className="dub-btn-outline text-xs px-2.5 py-1 flex items-center gap-1.5 hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Tag className="w-3 h-3 text-steel" />
                        <span>{cat}</span>
                        <span className="text-[10px] text-steel bg-canvas px-1.5 py-0.2 rounded-full">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All / Filtered Categories Grid */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-steel uppercase tracking-wider">
                {categorySearch.trim() ? `Search Results (${filteredCategoriesList.length})` : 'Popular Presets'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredCategoriesList.map(cat => {
                  const isCurrent = (categoryModalTarget === 'new' ? newAsset.category : editingAsset?.category) === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`text-xs px-3 py-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-medium'
                          : 'border-ash hover:border-steel bg-white text-charcoal'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
                {filteredCategoriesList.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-steel">
                    No matching standard preset found. You can create it below.
                  </div>
                )}
              </div>
            </div>

            {/* Create Custom Category */}
            <div className="pt-3 border-t border-ash space-y-2">
              <label className="block text-[11px] font-semibold text-steel uppercase tracking-wider">
                Create Custom Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Specialty Rig, Underwater Housing, Prop"
                  value={customCategoryInput}
                  onChange={e => setCustomCategoryInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCustomCategory();
                    }
                  }}
                  className="dub-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomCategory}
                  disabled={!customCategoryInput.trim()}
                  className="dub-btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Apply
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-ash">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="dub-btn-outline text-xs px-3 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Browser QR / Barcode Scanner Modal */}
      <QrScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        inventory={inventory}
        onSelectAsset={(asset) => {
          handleActionClick(asset);
        }}
        title="Scan Asset QR / Barcode"
        subtitle="Point camera at equipment label or type code for instantaneous check-out or return inspection"
      />

      {/* Printable QR Sticker Sheet Modal */}
      <PrintableLabelModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title={printModalTitle}
        items={printItems}
      />
    </div>
  );
};
