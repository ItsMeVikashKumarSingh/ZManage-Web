import React, { useState, useEffect } from 'react';
import { MapPin, Users, Camera, Plus, Loader2, Share2, Copy, Check, FileText } from 'lucide-react';
import { api, AllocationRecord, AssetRecord, WorkerRecord } from '../../lib/api';

export const ScheduleView: React.FC = () => {
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetRecord[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Digital Call Sheet Modal State
  const [activeCallSheet, setActiveCallSheet] = useState<AllocationRecord | null>(null);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);

  // New Shoot Form
  const [newShoot, setNewShoot] = useState({
    shoot_title: '',
    shoot_venue: '',
    client_name: '',
    client_phone: '',
    shoot_date: '',
    start_time: '10:00',
    end_time: '18:00',
    notes: '',
    asset_ids: [] as string[],
    worker_ids: [] as string[]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [allAllocations, assets, workers] = await Promise.all([
        api.getAllocations(),
        api.getAssets(),
        api.getWorkers()
      ]);
      setAllocations(allAllocations || []);
      setAvailableAssets(assets || []);
      setAvailableWorkers(workers || []);

      if (!selectedDate && allAllocations && allAllocations.length > 0) {
        const firstDate = allAllocations[0].start_time?.split('T')[0];
        if (firstDate) setSelectedDate(firstDate);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch schedule from ZManage-APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dates = Array.from(new Set(allocations.map(a => a.start_time?.split('T')[0]).filter(Boolean)));
  const filtered = allocations.filter(a => !selectedDate || a.start_time?.startsWith(selectedDate));

  const handleCreateShoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoot.shoot_date) return alert('Please specify a shoot date');

    try {
      setIsSubmitting(true);
      const startDateTime = `${newShoot.shoot_date}T${newShoot.start_time}:00Z`;
      const endDateTime = `${newShoot.shoot_date}T${newShoot.end_time}:00Z`;

      await api.createAllocation({
        shoot_title: newShoot.shoot_title,
        shoot_venue: newShoot.shoot_venue,
        client_name: newShoot.client_name,
        client_phone: newShoot.client_phone,
        start_time: startDateTime,
        end_time: endDateTime,
        notes: newShoot.notes,
        asset_ids: newShoot.asset_ids,
        crew: newShoot.worker_ids.map(workerId => {
          const w = availableWorkers.find(x => x.id === workerId);
          return {
            worker_id: workerId,
            assigned_role: w?.primary_role || 'Crew Member',
            call_time: startDateTime,
            wrap_time: endDateTime,
            agreed_pay: w?.day_rate || 0
          };
        })
      });

      await loadData();
      setShowAddModal(false);
      setNewShoot({
        shoot_title: '',
        shoot_venue: '',
        client_name: '',
        client_phone: '',
        shoot_date: '',
        start_time: '10:00',
        end_time: '18:00',
        notes: '',
        asset_ids: [],
        worker_ids: []
      });
    } catch (err: any) {
      alert(`Double-Booking Conflict Guard: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssetSelect = (id: string) => {
    setNewShoot(prev => ({
      ...prev,
      asset_ids: prev.asset_ids.includes(id)
        ? prev.asset_ids.filter(x => x !== id)
        : [...prev.asset_ids, id]
    }));
  };

  const toggleWorkerSelect = (id: string) => {
    setNewShoot(prev => ({
      ...prev,
      worker_ids: prev.worker_ids.includes(id)
        ? prev.worker_ids.filter(x => x !== id)
        : [...prev.worker_ids, id]
    }));
  };

  // WhatsApp Call Sheet Formatter
  const generateCallSheetText = (evt: AllocationRecord) => {
    const startTimeStr = new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = new Date(evt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date(evt.start_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    const matchedGear = (evt.asset_ids || []).map(id => availableAssets.find(a => a.id === id)?.name || id).filter(Boolean);
    const matchedCrew = (evt.worker_ids || []).map(id => {
      const w = availableWorkers.find(x => x.id === id);
      return w ? `${w.name} (${w.primary_role})` : id;
    }).filter(Boolean);

    return `*🎬 OFFICIAL SHOOT CALL SHEET — ZManage Operations*\n\n` +
      `*Event*: ${evt.shoot_title}\n` +
      `*Date*: ${dateStr}\n` +
      `*Call Time*: ${startTimeStr} – Wrap: ${endTimeStr}\n` +
      `*Venue / Location*: ${evt.shoot_venue || 'TBD'}\n` +
      (evt.client_name ? `*Client Point of Contact*: ${evt.client_name} (${evt.client_phone || 'No phone'})\n` : '') +
      `\n*👥 Dispatched Crew Members*:\n` +
      (matchedCrew.length > 0 ? matchedCrew.map(c => `• ${c}`).join('\n') : '• No crew assigned yet') +
      `\n\n*📷 Allocated Kit & Hardware*:\n` +
      (matchedGear.length > 0 ? matchedGear.map(g => `• ${g}`).join('\n') : '• No gear allocated') +
      (evt.notes ? `\n\n*Special Instructions*: ${evt.notes}` : '') +
      `\n\n_Generated via Zorvik ZManage Operations Console._`;
  };

  const handleCopyCallSheet = (evt: AllocationRecord) => {
    const text = generateCallSheetText(evt);
    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal">Operations Timeline</h1>
          <p className="text-xs text-steel">Live shoot bookings, collision prevention locks, and WhatsApp call sheet generator.</p>
        </div>

        <div className="flex items-center gap-3">
          {dates.length > 0 && (
            <div className="flex items-center gap-1.5 bg-paper p-1 rounded-xl border border-ash overflow-x-auto max-w-xs">
              {dates.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition shrink-0 ${
                    selectedDate === d
                      ? 'bg-white text-charcoal border border-smoke shadow-subtle'
                      : 'text-steel hover:text-charcoal'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Book Shoot
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadData} className="underline text-xs ml-2">Retry</button>
        </div>
      )}

      {/* Event Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel">Loading timeline from database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dub-card p-12 bg-white text-center text-xs text-steel">
            No shoots booked for {selectedDate || 'the current timeline'}. Click "Book Shoot" to allocate gear and crew.
          </div>
        ) : (
          filtered.map(evt => (
            <div key={evt.id} className="dub-card p-5 bg-white space-y-4 transition hover:border-smoke">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-ash">
                <div>
                  <span className="text-xs font-mono font-semibold text-electric">
                    {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(evt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <h3 className="text-base font-semibold text-charcoal">{evt.shoot_title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {evt.shoot_venue && (
                    <div className="flex items-center gap-1 text-xs text-steel">
                      <MapPin className="w-3.5 h-3.5 text-fog" />
                      <span>{evt.shoot_venue}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setActiveCallSheet(evt)}
                    className="dub-btn-outline text-xs px-3 py-1 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-steel" /> Call Sheet
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[11px] font-semibold text-steel uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-fog" /> Locked Hardware Kit ({evt.asset_ids?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(evt.asset_ids || []).map(id => {
                      const matched = availableAssets.find(a => a.id === id);
                      return (
                        <span key={id} className="text-xs px-2.5 py-1 rounded-md font-mono border bg-paper text-charcoal border-ash">
                          {matched ? matched.name : id.substring(0, 8)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-steel uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-fog" /> Dispatched Crew ({evt.worker_ids?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(evt.worker_ids || []).map(id => {
                      const matched = availableWorkers.find(w => w.id === id);
                      return (
                        <span key={id} className="text-xs px-2.5 py-1 rounded-md border bg-paper text-charcoal border-ash">
                          {matched ? matched.name : id.substring(0, 8)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Digital Call Sheet Modal */}
      {activeCallSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ash">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal">Digital Call Sheet & Shoot Brief</h2>
                <p className="text-xs text-steel">{activeCallSheet.shoot_title}</p>
              </div>
              <button
                onClick={() => handleCopyCallSheet(activeCallSheet)}
                className="dub-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5 text-vividGreen" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBrief ? 'Copied Brief!' : 'Copy for WhatsApp'}
              </button>
            </div>

            {/* Formatted Brief Preview */}
            <div className="bg-paper p-4 rounded-xl border border-ash font-mono text-xs text-charcoal whitespace-pre-wrap leading-relaxed">
              {generateCallSheetText(activeCallSheet)}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveCallSheet(null)}
                className="dub-btn-outline text-xs px-4 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Shoot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-sm font-semibold font-satoshi text-charcoal">Book Shoot & Allocate Kit</h2>
            <form onSubmit={handleCreateShoot} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel mb-1">Shoot / Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kapoor Wedding — Reception"
                  value={newShoot.shoot_title}
                  onChange={e => setNewShoot({ ...newShoot, shoot_title: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Client Point of Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Kapoor"
                    value={newShoot.client_name}
                    onChange={e => setNewShoot({ ...newShoot, client_name: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Client Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newShoot.client_phone}
                    onChange={e => setNewShoot({ ...newShoot, client_phone: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel mb-1">Venue Location</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Hyatt, Ballroom A, New Delhi"
                  value={newShoot.shoot_venue}
                  onChange={e => setNewShoot({ ...newShoot, shoot_venue: e.target.value })}
                  className="dub-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newShoot.shoot_date}
                    onChange={e => setNewShoot({ ...newShoot, shoot_date: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Call Time</label>
                  <input
                    type="time"
                    required
                    value={newShoot.start_time}
                    onChange={e => setNewShoot({ ...newShoot, start_time: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel mb-1">Wrap Time</label>
                  <input
                    type="time"
                    required
                    value={newShoot.end_time}
                    onChange={e => setNewShoot({ ...newShoot, end_time: e.target.value })}
                    className="dub-input w-full text-xs"
                  />
                </div>
              </div>

              {/* Hardware Allocation Checklist */}
              <div>
                <label className="block text-xs font-medium text-steel mb-1.5">
                  Allocate Hardware ({newShoot.asset_ids.length} selected)
                </label>
                <div className="border border-ash rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-paper/50">
                  {availableAssets.map(asset => (
                    <label
                      key={asset.id}
                      className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition ${
                        newShoot.asset_ids.includes(asset.id)
                          ? 'bg-white border border-ash font-medium text-charcoal'
                          : 'text-steel hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newShoot.asset_ids.includes(asset.id)}
                          onChange={() => toggleAssetSelect(asset.id)}
                          className="rounded border-ash text-electric focus:ring-0"
                        />
                        <span>{asset.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-fog">{asset.code}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Crew Dispatch Checklist */}
              <div>
                <label className="block text-xs font-medium text-steel mb-1.5">
                  Dispatch Crew ({newShoot.worker_ids.length} selected)
                </label>
                <div className="border border-ash rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-paper/50">
                  {availableWorkers.map(worker => (
                    <label
                      key={worker.id}
                      className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition ${
                        newShoot.worker_ids.includes(worker.id)
                          ? 'bg-white border border-ash font-medium text-charcoal'
                          : 'text-steel hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newShoot.worker_ids.includes(worker.id)}
                          onChange={() => toggleWorkerSelect(worker.id)}
                          className="rounded border-ash text-electric focus:ring-0"
                        />
                        <span>{worker.name}</span>
                      </div>
                      <span className="text-[10px] text-fog capitalize">{worker.primary_role}</span>
                    </label>
                  ))}
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
                  Confirm Shoot & Lock Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
