import React, { useState } from 'react';
import { Camera, Plus, CheckCircle, Clock, AlertTriangle, Shield, Search } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  code: string;
  category: string;
  serialNumber: string;
  condition: 'excellent' | 'good' | 'fair' | 'in_repair';
  status: 'available' | 'on_shoot' | 'maintenance';
  dayRate: number;
  imageUrl: string;
  currentAssignment?: string;
}

const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Sony FX3 Cinema Camera #1',
    code: 'CAM-FX3-01',
    category: 'camera',
    serialNumber: 'SN-849204',
    condition: 'excellent',
    status: 'available',
    dayRate: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Sony FE 70-200mm f/2.8 GM II',
    code: 'LNS-70200-02',
    category: 'lens',
    serialNumber: 'SN-294819',
    condition: 'excellent',
    status: 'on_shoot',
    dayRate: 2000,
    currentAssignment: 'Kapoor Wedding (Reception)',
    imageUrl: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'DJI Mavic 3 Pro Cine Combo',
    code: 'DRN-MVC-01',
    category: 'drone',
    serialNumber: 'SN-661920',
    condition: 'good',
    status: 'available',
    dayRate: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    name: 'Aputure 600d Pro Light Rig',
    code: 'LGT-600D-01',
    category: 'lighting',
    serialNumber: 'SN-339102',
    condition: 'in_repair',
    status: 'maintenance',
    dayRate: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'
  }
];

export const AssetVault: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<Asset | null>(null);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    name: '',
    code: '',
    category: 'camera',
    serialNumber: '',
    dayRate: 3000
  });

  const filteredAssets = assets.filter(a => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Asset = {
      id: Date.now().toString(),
      name: newAsset.name,
      code: newAsset.code || `ASSET-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newAsset.category,
      serialNumber: newAsset.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      condition: 'excellent',
      status: 'available',
      dayRate: Number(newAsset.dayRate) || 2500,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
    };
    setAssets([created, ...assets]);
    setShowAddModal(false);
    setNewAsset({ name: '', code: '', category: 'camera', serialNumber: '', dayRate: 3000 });
  };

  const handleToggleCheckout = (assetId: string) => {
    setAssets(assets.map(a => {
      if (a.id === assetId) {
        if (a.status === 'available') {
          return { ...a, status: 'on_shoot', currentAssignment: 'Wedding Shoot (Checked out)' };
        } else {
          return { ...a, status: 'available', currentAssignment: undefined };
        }
      }
      return a;
    }));
    setShowCheckoutModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search gear or serial #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-cyber-dark/80 border border-cyber-border rounded-xl text-sm focus:outline-none focus:border-cyber-cyan transition text-slate-200 placeholder-slate-500 w-64"
            />
          </div>
          <div className="flex items-center gap-1 bg-cyber-dark/60 p-1 rounded-xl border border-cyber-border">
            {['all', 'camera', 'lens', 'drone', 'lighting'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  selectedCategory === cat 
                    ? 'bg-cyber-purple text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyber-purple to-purple-800 text-white rounded-xl text-sm font-semibold hover:glow-purple transition border border-purple-500/30"
        >
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between hover:border-cyber-cyan/50 transition duration-300">
            <div>
              {/* Gear Photo & Status Badge */}
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover opacity-80 hover:scale-105 transition duration-500" />
                <div className="absolute top-3 right-3">
                  {asset.status === 'available' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                      <CheckCircle className="w-3 h-3" /> Available
                    </span>
                  )}
                  {asset.status === 'on_shoot' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                      <Clock className="w-3 h-3" /> On Shoot
                    </span>
                  )}
                  {asset.status === 'maintenance' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                      <AlertTriangle className="w-3 h-3" /> In Repair
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 left-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                    {asset.code}
                  </span>
                </div>
              </div>

              {/* Specs & Metadata */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-slate-100 text-sm line-clamp-1">{asset.name}</h3>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Serial: <span className="font-mono text-slate-300">{asset.serialNumber}</span></span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Shield className="w-3 h-3 text-cyan-400" /> {asset.condition}
                  </span>
                </div>
                {asset.currentAssignment && (
                  <p className="text-xs text-purple-300 bg-purple-950/30 p-2 rounded-lg border border-purple-500/20">
                    Assigned: {asset.currentAssignment}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0">
              <button
                onClick={() => handleToggleCheckout(asset.id)}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  asset.status === 'available'
                    ? 'bg-cyber-purple/20 text-purple-300 hover:bg-cyber-purple hover:text-white border border-cyber-purple/40'
                    : 'bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-500/30'
                }`}
              >
                {asset.status === 'available' ? 'Check-Out for Shoot' : 'Return & Inspect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add New Equipment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md border border-cyber-purple/40 space-y-4">
            <h3 className="text-base font-heading font-bold text-slate-100">Register New Equipment</h3>
            <form onSubmit={handleAddAsset} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Equipment Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sony A7 IV Body #2"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-xl text-slate-200 focus:outline-none focus:border-cyber-cyan"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-xl text-slate-200 focus:outline-none focus:border-cyber-cyan"
                  >
                    <option value="camera">Camera</option>
                    <option value="lens">Lens</option>
                    <option value="drone">Drone</option>
                    <option value="lighting">Lighting</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="SN-XXXXXX"
                    value={newAsset.serialNumber}
                    onChange={e => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-xl text-slate-200 focus:outline-none focus:border-cyber-cyan font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyber-purple text-white rounded-xl text-xs font-semibold hover:glow-purple transition"
                >
                  Save Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
