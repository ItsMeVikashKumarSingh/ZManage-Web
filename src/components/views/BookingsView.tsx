import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ticket, Search, DownloadCloud, Calendar, Clock, MapPin, 
  Phone, Mail, Plus, Loader2, CheckCircle2, 
  Sparkles, Camera, Users, ArrowRight, Download, X
} from 'lucide-react';
import { api, BookingCandidate, AssetRecord, WorkerRecord, AllocationRecord } from '../../lib/api';
import { exportToCsv } from '../../lib/exportUtils';

const PRESET_PACKAGES: Record<string, { label: string; defaultPrice: number }> = {
  'Silver Wedding Package': { label: 'Silver Wedding Package', defaultPrice: 50000 },
  'Gold Royal Wedding Package': { label: 'Gold Royal Wedding Package', defaultPrice: 120000 },
  'Pre-Wedding Cinematic Shoot': { label: 'Pre-Wedding Cinematic Shoot', defaultPrice: 45000 },
  'Studio Portrait & Model Portfolio': { label: 'Studio Portrait & Model Portfolio', defaultPrice: 15000 },
  'Corporate Event & Conference': { label: 'Corporate Event & Conference', defaultPrice: 35000 },
  'Commercial Brand & Ad Campaign': { label: 'Commercial Brand & Ad Campaign', defaultPrice: 85000 },
  'Custom': { label: 'Custom Project / Bespoke Order', defaultPrice: 0 }
};

export const BookingsView: React.FC = () => {
  const [bookings, setBookings] = useState<BookingCandidate[]>([]);
  const [existingAllocations, setExistingAllocations] = useState<AllocationRecord[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetRecord[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'scheduled' | 'unscheduled'>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Offline Order Creation Modal
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  const [isSubmittingOffline, setIsSubmittingOffline] = useState<boolean>(false);
  const [offlineForm, setOfflineForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    package_preset: 'Silver Wedding Package',
    custom_package_name: '',
    event_date: '',
    event_time: '10:00',
    venue: '',
    amount: '50000',
    payment_status: 'advance_received',
    notes: ''
  });

  // Shoot Scheduling Modal from a Booking
  const [schedulingBooking, setSchedulingBooking] = useState<BookingCandidate | null>(null);
  const [isSubmittingShoot, setIsSubmittingShoot] = useState<boolean>(false);
  const [shootForm, setShootForm] = useState({
    shoot_title: '',
    shoot_venue: '',
    client_name: '',
    client_phone: '',
    shoot_date: '',
    start_time: '09:00',
    end_time: '18:00',
    notes: '',
    asset_ids: [] as string[],
    worker_ids: [] as string[]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [candidatesRes, allocsRes, assets, workers] = await Promise.all([
        api.getBookingCandidates(),
        api.getAllocations(),
        api.getAssets(),
        api.getWorkers()
      ]);

      setBookings(candidatesRes.candidates || []);
      setExistingAllocations(allocsRes || []);
      setAvailableAssets(assets || []);
      setAvailableWorkers(workers || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load bookings from Studio platform');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncLatest = async () => {
    try {
      setIsSyncing(true);
      await loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePackagePresetChange = (preset: string) => {
    const defaultPrice = PRESET_PACKAGES[preset]?.defaultPrice ?? 0;
    setOfflineForm(prev => ({
      ...prev,
      package_preset: preset,
      amount: preset === 'Custom' ? prev.amount : String(defaultPrice)
    }));
  };

  const handleCreateOfflineOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineForm.client_name.trim()) return alert('Please enter client name');
    if (!offlineForm.event_date) return alert('Please enter event date');

    const finalPackageName = offlineForm.package_preset === 'Custom'
      ? (offlineForm.custom_package_name.trim() || 'Custom Offline Shoot')
      : offlineForm.package_preset;

    try {
      setIsSubmittingOffline(true);
      await api.createOfflineBooking({
        client_name: offlineForm.client_name.trim(),
        client_phone: offlineForm.client_phone.trim(),
        client_email: offlineForm.client_email.trim(),
        package_name: finalPackageName,
        event_date: offlineForm.event_date,
        event_time: offlineForm.event_time,
        venue: offlineForm.venue.trim() || 'Studio Floor / On-Location',
        amount: Number(offlineForm.amount) || 0,
        payment_status: offlineForm.payment_status,
        notes: offlineForm.notes.trim()
      });

      await loadData();
      setShowOfflineModal(false);
      setOfflineForm({
        client_name: '',
        client_phone: '',
        client_email: '',
        package_preset: 'Silver Wedding Package',
        custom_package_name: '',
        event_date: '',
        event_time: '10:00',
        venue: '',
        amount: '50000',
        payment_status: 'advance_received',
        notes: ''
      });
    } catch (err: any) {
      alert(`Failed to create offline order: ${err.message}`);
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  const handleExportOrders = () => {
    exportToCsv('studio_client_bookings', filteredBookings, [
      { header: 'Order ID', accessor: b => b.order_id },
      { header: 'Package Name', accessor: b => b.package_name },
      { header: 'Client Name', accessor: b => b.client_name },
      { header: 'Client Phone', accessor: b => b.client_phone },
      { header: 'Client Email', accessor: b => b.client_email },
      { header: 'Event Date', accessor: b => b.event_date },
      { header: 'Call Time', accessor: b => b.start_time?.split('T')[1]?.slice(0, 5) || '09:00' },
      { header: 'Wrap Time', accessor: b => b.end_time?.split('T')[1]?.slice(0, 5) || '18:00' },
      { header: 'Venue', accessor: b => b.venue },
      { header: 'Amount (INR)', accessor: b => b.amount },
      { header: 'Order Status', accessor: b => b.status },
      { header: 'Order Type', accessor: b => b.is_offline ? 'Offline / Walk-in' : 'Studio Online' },
      { header: 'Shoot Scheduled', accessor: b => isBookingScheduled(b.booking_id) ? 'Yes' : 'No' }
    ]);
  };

  // Open Shoot Scheduler for this specific booking
  const handleOpenScheduler = (booking: BookingCandidate) => {
    setSchedulingBooking(booking);
    setShootForm({
      shoot_title: `${booking.package_name} - ${booking.client_name}`,
      shoot_venue: booking.venue || 'Studio / Location TBD',
      client_name: booking.client_name,
      client_phone: booking.client_phone,
      shoot_date: booking.event_date || new Date().toISOString().split('T')[0],
      start_time: booking.start_time?.split('T')[1]?.slice(0, 5) || '09:00',
      end_time: booking.end_time?.split('T')[1]?.slice(0, 5) || '18:00',
      notes: `Studio Booking Ref: ${booking.booking_id}. Order ID: ${booking.order_id}. Email: ${booking.client_email}. Package: ${booking.package_name}.`,
      asset_ids: [],
      worker_ids: []
    });
  };

  const toggleAsset = (id: string) => {
    setShootForm(prev => ({
      ...prev,
      asset_ids: prev.asset_ids.includes(id)
        ? prev.asset_ids.filter(x => x !== id)
        : [...prev.asset_ids, id]
    }));
  };

  const toggleWorker = (id: string) => {
    setShootForm(prev => ({
      ...prev,
      worker_ids: prev.worker_ids.includes(id)
        ? prev.worker_ids.filter(x => x !== id)
        : [...prev.worker_ids, id]
    }));
  };

  const handleConfirmShoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shootForm.shoot_date) return alert('Please enter a shoot date');

    try {
      setIsSubmittingShoot(true);
      const startDateTime = `${shootForm.shoot_date}T${shootForm.start_time}:00Z`;
      const endDateTime = `${shootForm.shoot_date}T${shootForm.end_time}:00Z`;

      await api.createAllocation({
        shoot_title: shootForm.shoot_title,
        shoot_venue: shootForm.shoot_venue,
        client_name: shootForm.client_name,
        client_phone: shootForm.client_phone,
        start_time: startDateTime,
        end_time: endDateTime,
        notes: shootForm.notes,
        asset_ids: shootForm.asset_ids,
        crew: shootForm.worker_ids.map(workerId => {
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
      setSchedulingBooking(null);
    } catch (err: any) {
      alert(`Double-Booking Conflict: ${err.message}`);
    } finally {
      setIsSubmittingShoot(false);
    }
  };

  // Helper to check if a booking has an active scheduled shoot in allocations
  const isBookingScheduled = (bookingId: string) => {
    return existingAllocations.some(a => a.notes && a.notes.includes(bookingId) && a.status !== 'cancelled');
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const scheduled = isBookingScheduled(b.booking_id);

      if (statusFilter === 'scheduled' && !scheduled) return false;
      if (statusFilter === 'unscheduled' && scheduled) return false;
      if (statusFilter === 'confirmed' && b.status !== 'confirmed') return false;
      if (statusFilter === 'pending' && b.status !== 'pending') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPackage = b.package_name.toLowerCase().includes(q);
        const matchClient = b.client_name.toLowerCase().includes(q);
        const matchOrder = b.order_id.toLowerCase().includes(q);
        const matchPhone = b.client_phone.toLowerCase().includes(q);
        const matchEmail = b.client_email.toLowerCase().includes(q);
        const matchVenue = b.venue.toLowerCase().includes(q);
        if (!matchPackage && !matchClient && !matchOrder && !matchPhone && !matchEmail && !matchVenue) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery, existingAllocations]);

  // Financial & Count Summary Metrics
  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  }, [bookings]);

  const scheduledCount = useMemo(() => {
    return bookings.filter(b => isBookingScheduled(b.booking_id)).length;
  }, [bookings, existingAllocations]);

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-electric" /> Client Bookings & Orders
          </h1>
          <p className="text-xs text-steel dark:text-zinc-400 max-w-xl">
            Incoming studio package purchases, client event dates, and production shoot scheduling queue.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
          <button
            onClick={handleSyncLatest}
            disabled={isSyncing}
            className="dub-btn-outline text-xs px-3.5 py-1.5 flex items-center gap-1.5 text-charcoal dark:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 cursor-pointer shrink-0"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing...
              </>
            ) : (
              <>
                <DownloadCloud className="w-3.5 h-3.5 text-electric" /> 1-Tap Sync from Studio
              </>
            )}
          </button>

          <button
            onClick={() => setShowOfflineModal(true)}
            className="dub-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> New Offline Order
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Total Orders</div>
            <div className="text-base font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              {bookings.length}
            </div>
          </div>
          <span className="text-[10px] text-steel dark:text-zinc-500 hidden sm:inline">Platform & Walk-in</span>
        </div>

        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Confirmed</div>
            <div className="text-base font-bold font-satoshi text-emerald-600 dark:text-emerald-400 mt-0.5">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
          </div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 hidden sm:inline">Confirmed</span>
        </div>

        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Shoots Scheduled</div>
            <div className="text-base font-bold font-satoshi text-electric mt-0.5">
              {scheduledCount} / {bookings.length}
            </div>
          </div>
          <span className="text-[10px] text-steel dark:text-zinc-500 hidden sm:inline">On Timeline</span>
        </div>

        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Order Value</div>
            <div className="text-base font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5 font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-[10px] text-steel dark:text-zinc-500 hidden sm:inline">Pipeline</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-fog dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by package, order ID, client name, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="dub-input text-xs pl-10 py-1.5 w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-paper dark:bg-zinc-900 p-1 rounded-xl border border-ash dark:border-zinc-800 shrink-0 overflow-x-auto">
            {(['all', 'confirmed', 'scheduled', 'unscheduled'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer shrink-0 ${
                  statusFilter === status
                    ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 shadow-xs font-semibold'
                    : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportOrders}
            className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 text-charcoal dark:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            title="Export filtered orders to CSV"
          >
            <Download className="w-3.5 h-3.5 text-electric" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadData} className="underline text-xs ml-2 cursor-pointer">Retry</button>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel dark:text-zinc-400 font-mono">Loading client orders...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="dub-card p-12 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 text-center text-xs text-steel dark:text-zinc-400">
            No client package bookings found matching the current criteria.
          </div>
        ) : (
          filteredBookings.map(b => {
            const scheduled = isBookingScheduled(b.booking_id);

            return (
              <div
                key={b.booking_id}
                className="dub-card p-5 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 space-y-3 transition hover:border-smoke dark:hover:border-zinc-700"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-ash dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-charcoal dark:text-zinc-100">
                        {b.package_name}
                      </span>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-paper dark:bg-zinc-800 text-steel dark:text-zinc-400 border border-ash dark:border-zinc-700">
                        Order #{b.order_id}
                      </span>

                      {b.is_offline && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-medium">
                          Offline / Walk-in
                        </span>
                      )}

                      {scheduled ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Shoot Scheduled
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Shoot Awaiting Production
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-steel dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Customer: <strong className="text-charcoal dark:text-zinc-200">{b.client_name}</strong></span>
                      {b.client_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-fog" /> {b.client_phone}
                        </span>
                      )}
                      {b.client_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-fog" /> {b.client_email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-charcoal dark:text-zinc-100">
                        ₹{(b.amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                        {b.status}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenScheduler(b)}
                      className="dub-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule Shoot
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-steel dark:text-zinc-400 pt-1">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-fog" /> Event Date: <strong className="text-charcoal dark:text-zinc-200 font-mono">{b.event_date || 'TBD'}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-fog" /> Call: <span className="font-mono text-charcoal dark:text-zinc-200">{b.start_time?.split('T')[1]?.slice(0, 5) || '09:00'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-fog" /> Venue: <span className="text-charcoal dark:text-zinc-200">{b.venue || 'Studio / On-Location'}</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-fog dark:text-zinc-500">
                    Ref: {b.booking_id.slice(0, 13)}...
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Shoot Modal Pre-filled from Order */}
      {schedulingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ash dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-electric" /> Schedule Shoot for Order #{schedulingBooking.order_id}
                </h2>
                <p className="text-xs text-steel dark:text-zinc-400">
                  Allocate gear and dispatch crew to transfer this client order onto the Operations Timeline.
                </p>
              </div>

              <button
                onClick={() => setSchedulingBooking(null)}
                className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 text-xs cursor-pointer p-1 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmShoot} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Shoot Title *
                </label>
                <input
                  type="text"
                  required
                  value={shootForm.shoot_title}
                  onChange={e => setShootForm({ ...shootForm, shoot_title: e.target.value })}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={shootForm.shoot_venue}
                  onChange={e => setShootForm({ ...shootForm, shoot_venue: e.target.value })}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={shootForm.client_name}
                    onChange={e => setShootForm({ ...shootForm, client_name: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="text"
                    value={shootForm.client_phone}
                    onChange={e => setShootForm({ ...shootForm, client_phone: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Shoot Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={shootForm.shoot_date}
                    onChange={e => setShootForm({ ...shootForm, shoot_date: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Call Time
                  </label>
                  <input
                    type="time"
                    required
                    value={shootForm.start_time}
                    onChange={e => setShootForm({ ...shootForm, start_time: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Wrap Time
                  </label>
                  <input
                    type="time"
                    required
                    value={shootForm.end_time}
                    onChange={e => setShootForm({ ...shootForm, end_time: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              {/* Hardware Lock Checklist */}
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1.5">
                  Reserve Hardware Kit ({shootForm.asset_ids.length} selected)
                </label>
                <div className="border border-ash dark:border-zinc-800 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-paper/50 dark:bg-zinc-900/50">
                  {availableAssets.length === 0 ? (
                    <span className="text-xs text-fog dark:text-zinc-500 italic">No gear available</span>
                  ) : (
                    availableAssets.map(asset => (
                      <label
                        key={asset.id}
                        className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition ${
                          shootForm.asset_ids.includes(asset.id)
                            ? 'bg-white dark:bg-zinc-800 border border-ash dark:border-zinc-700 font-medium text-charcoal dark:text-zinc-100'
                            : 'text-steel dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shootForm.asset_ids.includes(asset.id)}
                            onChange={() => toggleAsset(asset.id)}
                            className="rounded border-ash text-electric focus:ring-0 cursor-pointer"
                          />
                          <span>{asset.name}</span>
                        </div>
                        <span className="text-[10px] text-fog dark:text-zinc-500 font-mono">{asset.category}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Crew Dispatch Checklist */}
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1.5">
                  Dispatch Crew ({shootForm.worker_ids.length} selected)
                </label>
                <div className="border border-ash dark:border-zinc-800 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-paper/50 dark:bg-zinc-900/50">
                  {availableWorkers.length === 0 ? (
                    <span className="text-xs text-fog dark:text-zinc-500 italic">No crew available</span>
                  ) : (
                    availableWorkers.map(worker => (
                      <label
                        key={worker.id}
                        className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition ${
                          shootForm.worker_ids.includes(worker.id)
                            ? 'bg-white dark:bg-zinc-800 border border-ash dark:border-zinc-700 font-medium text-charcoal dark:text-zinc-100'
                            : 'text-steel dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shootForm.worker_ids.includes(worker.id)}
                            onChange={() => toggleWorker(worker.id)}
                            className="rounded border-ash text-electric focus:ring-0 cursor-pointer"
                          />
                          <span>{worker.name}</span>
                        </div>
                        <span className="text-[10px] text-fog dark:text-zinc-500 capitalize">{worker.primary_role.replace('_', ' ')}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingBooking(null)}
                  className="dub-btn-outline text-xs px-3 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShoot}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingShoot ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Confirming...
                    </>
                  ) : (
                    <>
                      Confirm & Add to Timeline <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Offline Order Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-ash dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal dark:text-zinc-100 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-electric" /> New Offline / Walk-in Order
                </h2>
                <p className="text-xs text-steel dark:text-zinc-400">
                  Record client contracts, phone inquiries, and studio walk-in bookings directly.
                </p>
              </div>

              <button
                onClick={() => setShowOfflineModal(false)}
                className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 text-xs cursor-pointer p-1 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOfflineOrder} className="space-y-3">
              {/* Client Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Singhania"
                    value={offlineForm.client_name}
                    onChange={e => setOfflineForm({ ...offlineForm, client_name: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={offlineForm.client_phone}
                    onChange={e => setOfflineForm({ ...offlineForm, client_phone: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  placeholder="client@company.com"
                  value={offlineForm.client_email}
                  onChange={e => setOfflineForm({ ...offlineForm, client_email: e.target.value })}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Package Selector */}
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Package / Production Tier *
                </label>
                <select
                  value={offlineForm.package_preset}
                  onChange={e => handlePackagePresetChange(e.target.value)}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                >
                  {Object.entries(PRESET_PACKAGES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label} {info.defaultPrice > 0 ? `(₹${info.defaultPrice.toLocaleString('en-IN')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {offlineForm.package_preset === 'Custom' && (
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Custom Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mercedes Benz Auto Expo Commercial"
                    value={offlineForm.custom_package_name}
                    onChange={e => setOfflineForm({ ...offlineForm, custom_package_name: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
              )}

              {/* Event Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Target Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={offlineForm.event_date}
                    onChange={e => setOfflineForm({ ...offlineForm, event_date: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Call Time
                  </label>
                  <input
                    type="time"
                    value={offlineForm.event_time}
                    onChange={e => setOfflineForm({ ...offlineForm, event_time: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Studio Floor 1 / Taj Palace, Mumbai"
                  value={offlineForm.venue}
                  onChange={e => setOfflineForm({ ...offlineForm, venue: e.target.value })}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Agreed Total Amount (INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="50000"
                    value={offlineForm.amount}
                    onChange={e => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={offlineForm.payment_status}
                    onChange={e => setOfflineForm({ ...offlineForm, payment_status: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  >
                    <option value="advance_received">Advance / Deposit Received</option>
                    <option value="paid_offline">Paid in Full (Cash / Transfer)</option>
                    <option value="pending">Pending Payment</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Order Brief & Special Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Client requested 2 drone shots and 4K uncompressed raw reels. Advance received."
                  value={offlineForm.notes}
                  onChange={e => setOfflineForm({ ...offlineForm, notes: e.target.value })}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ash dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowOfflineModal(false)}
                  className="dub-btn-outline text-xs px-3 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffline}
                  className="dub-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingOffline ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating Order...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Save Offline Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
