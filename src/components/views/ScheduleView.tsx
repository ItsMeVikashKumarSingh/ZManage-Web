import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Users, Camera, Plus, Loader2, Copy, Check, FileText, 
  Calendar as CalendarIcon, Clock, Sparkles, Phone,
  MessageCircle, Trash2, AlertTriangle, Search, ChevronLeft, 
  ChevronRight, Layers, LayoutGrid, CheckCircle2, ShieldAlert, Download, DownloadCloud,
  Scan, Ticket, X
} from 'lucide-react';
import { api, AllocationRecord, AssetRecord, WorkerRecord, BookingCandidate, AIRecommendation } from '../../lib/api';
import { exportToCsv } from '../../lib/exportUtils';
import { QrScannerModal } from './inventory/QrScannerModal';

type ViewMode = 'timeline' | 'calendar' | 'agenda';
type StatusFilter = 'all' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface NormalizedAllocation extends AllocationRecord {
  normalizedTitle: string;
  normalizedVenue: string;
  effectiveAssetIds: string[];
  effectiveWorkerIds: string[];
  effectiveStatus: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'tentative';
  isBookingOnly?: boolean;
  bookingCandidate?: BookingCandidate;
}

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ScheduleView: React.FC = () => {
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [bookings, setBookings] = useState<BookingCandidate[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetRecord[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calendar month state
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeCallSheet, setActiveCallSheet] = useState<NormalizedAllocation | null>(null);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);

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

  // Zorvik-AI Recommender State
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [aiRecommendationModel, setAiRecommendationModel] = useState<string>('');

  const todayStr = useMemo(() => getLocalDateString(), []);

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return 'All Dates';
    const today = getLocalDateString();
    
    const tomDate = new Date();
    tomDate.setDate(tomDate.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomDate);

    const yestDate = new Date();
    yestDate.setDate(yestDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yestDate);

    if (dateStr === today) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    if (dateStr === yesterdayStr) return 'Yesterday';

    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatFullDateHeader = (dateStr: string) => {
    if (!dateStr) return 'All Scheduled Dates';
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePrevDay = () => {
    const current = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    current.setDate(current.getDate() - 1);
    const prevStr = getLocalDateString(current);
    setSelectedDate(prevStr);
    setCalendarDate(current);
  };

  const handleNextDay = () => {
    const current = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    current.setDate(current.getDate() + 1);
    const nextStr = getLocalDateString(current);
    setSelectedDate(nextStr);
    setCalendarDate(current);
  };

  const handleTodayJump = () => {
    const now = new Date();
    const str = getLocalDateString(now);
    setSelectedDate(str);
    setCalendarDate(now);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [allAllocations, assets, workers, candidatesRes] = await Promise.all([
        api.getAllocations(),
        api.getAssets(),
        api.getWorkers(),
        api.getBookingCandidates().catch(() => ({ candidates: [] }))
      ]);
      const validAllocations = allAllocations || [];
      const validBookings = candidatesRes?.candidates || [];

      setAllocations(validAllocations);
      setBookings(validBookings);
      setAvailableAssets(assets || []);
      setAvailableWorkers(workers || []);

      if (!selectedDate) {
        const todayLocal = getLocalDateString();
        // Collect all distinct dates across allocations and confirmed bookings
        const allShootDates = [
          ...validAllocations.map(a => a.start_time?.split('T')[0]).filter(Boolean),
          ...validBookings.map(b => b.event_date || b.start_time?.split('T')[0]).filter(Boolean)
        ];

        const hasToday = allShootDates.includes(todayLocal);
        if (hasToday) {
          setSelectedDate(todayLocal);
          setCalendarDate(new Date());
        } else if (allShootDates.length > 0) {
          // Look for nearest upcoming date >= today
          const upcoming = allShootDates.filter(d => d >= todayLocal).sort();
          const targetDate = upcoming.length > 0 ? upcoming[0] : allShootDates.sort().reverse()[0];
          setSelectedDate(targetDate);
          if (targetDate) setCalendarDate(new Date(targetDate + 'T00:00:00'));
        } else {
          setSelectedDate(todayLocal);
        }
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

  // 1. Data Normalization: Combines Allocations & Studio/Offline Bookings seamlessly
  const normalizedAllocations = useMemo<NormalizedAllocation[]>(() => {
    const list: NormalizedAllocation[] = allocations.map(a => {
      const locks = (a as any).asset_locks || [];
      const shifts = (a as any).worker_shifts || [];

      const fallbackAssetIds = locks.map((l: any) => l.asset_id).filter(Boolean);
      const fallbackWorkerIds = shifts.map((s: any) => s.worker_id).filter(Boolean);

      const effectiveAssetIds = a.asset_ids && a.asset_ids.length > 0 ? a.asset_ids : fallbackAssetIds;
      const effectiveWorkerIds = a.worker_ids && a.worker_ids.length > 0 ? a.worker_ids : fallbackWorkerIds;

      return {
        ...a,
        normalizedTitle: a.shoot_title || a.title || 'Untitled Shoot',
        normalizedVenue: a.shoot_venue || a.venue || 'Studio / Location TBD',
        effectiveAssetIds,
        effectiveWorkerIds,
        effectiveStatus: (a.status as any) || 'confirmed',
        isBookingOnly: false
      };
    });

    // Merge unsynced studio/offline bookings as tentative operations
    bookings.forEach(b => {
      const isAlreadyRepresented = allocations.some(alloc => {
        if (alloc.notes && alloc.notes.includes(b.booking_id)) return true;
        if (alloc.notes && alloc.notes.includes(b.order_id)) return true;
        const sameDate = alloc.start_time?.startsWith(b.event_date);
        const samePhone = b.client_phone && alloc.client_phone === b.client_phone;
        return Boolean(sameDate && samePhone);
      });

      if (!isAlreadyRepresented && b.status !== 'cancelled') {
        list.push({
          id: `booking-${b.booking_id}`,
          client_id: '',
          project_id: '',
          title: b.package_name,
          shoot_title: b.package_name,
          venue: b.venue,
          shoot_venue: b.venue,
          client_name: b.client_name,
          client_phone: b.client_phone,
          start_time: b.start_time,
          end_time: b.end_time,
          asset_ids: [],
          worker_ids: [],
          status: 'confirmed',
          notes: `[Studio Booking: ${b.order_id}] · Awaiting gear & crew allocation`,
          normalizedTitle: b.package_name,
          normalizedVenue: b.venue || 'Studio / On-Location',
          effectiveAssetIds: [],
          effectiveWorkerIds: [],
          effectiveStatus: 'confirmed',
          isBookingOnly: true,
          bookingCandidate: b
        });
      }
    });

    return list.sort((x, y) => new Date(x.start_time).getTime() - new Date(y.start_time).getTime());
  }, [allocations, bookings]);

  // Handle allocating gear and crew directly from a booking
  const handleAllocateFromBooking = (booking: BookingCandidate) => {
    setNewShoot({
      shoot_title: booking.package_name || 'Production Shoot',
      shoot_venue: booking.venue || 'Studio Floor / On-Location',
      client_name: booking.client_name || '',
      client_phone: booking.client_phone || '',
      shoot_date: booking.event_date || (booking.start_time?.split('T')[0] || ''),
      start_time: booking.start_time?.split('T')[1]?.slice(0, 5) || '10:00',
      end_time: booking.end_time?.split('T')[1]?.slice(0, 5) || '18:00',
      notes: `[Synced from Studio Booking Ref: ${booking.booking_id}] Order: ${booking.order_id}`,
      asset_ids: [],
      worker_ids: []
    });
    setAiRecommendation(null);
    setShowAddModal(true);
  };

  // Zorvik-AI Kit & Crew Recommender Handler
  const handleGenerateAiRecommendation = async () => {
    if (!newShoot.shoot_title) {
      alert('Please enter a shoot title first (e.g. Wedding Reception, Drone Pre-Wedding)');
      return;
    }

    try {
      setIsAiGenerating(true);
      const res = await api.recommendAllocation({
        shoot_title: newShoot.shoot_title,
        shoot_venue: newShoot.shoot_venue,
        client_name: newShoot.client_name,
        start_time: newShoot.shoot_date ? `${newShoot.shoot_date}T${newShoot.start_time}:00Z` : '',
        end_time: newShoot.shoot_date ? `${newShoot.shoot_date}T${newShoot.end_time}:00Z` : '',
        notes: newShoot.notes
      });

      if (res.success && res.recommendation) {
        setAiRecommendation(res.recommendation);
        setAiRecommendationModel(res.model || 'Zorvik-AI');
      }
    } catch (err: any) {
      alert(`AI Recommendation notice: ${err.message}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyAiRecommendation = () => {
    if (!aiRecommendation) return;

    setNewShoot(prev => {
      const combinedAssets = Array.from(new Set([...prev.asset_ids, ...aiRecommendation.recommended_asset_ids]));
      const combinedWorkers = Array.from(new Set([...prev.worker_ids, ...aiRecommendation.recommended_worker_ids]));
      const tipsText = aiRecommendation.critical_tips && aiRecommendation.critical_tips.length > 0
        ? `\n\n[Zorvik-AI Prep Tips]: ${aiRecommendation.critical_tips.join('; ')}`
        : '';

      return {
        ...prev,
        asset_ids: combinedAssets,
        worker_ids: combinedWorkers,
        notes: prev.notes ? `${prev.notes}${tipsText}` : (tipsText.trim() || prev.notes)
      };
    });
  };

  // 1-Tap Sync all unallocated bookings to the database allocations table
  const handleSyncBookings = async () => {
    try {
      setIsSyncing(true);
      setErrorMsg(null);
      const res = await api.getBookingCandidates();
      const unsynced = (res.candidates || []).filter(c => !c.is_already_synced);

      if (unsynced.length === 0) {
        alert('All client bookings are already synchronized into operations allocations!');
        return;
      }

      await api.batchSyncBookings({
        selected_bookings: unsynced.map(b => ({
          booking_id: b.booking_id,
          title: b.package_name,
          client_name: b.client_name,
          client_phone: b.client_phone,
          venue: b.venue,
          start_time: b.start_time,
          end_time: b.end_time,
          notes: `[1-Tap Synced Booking: ${b.order_id}]`
        }))
      });

      await loadData();
      alert(`Successfully synced ${unsynced.length} client booking(s) to Operations Timeline!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync bookings');
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Real-Time Double-Booking Collision Detection Engine
  const conflicts = useMemo(() => {
    const active = normalizedAllocations.filter(a => a.effectiveStatus !== 'cancelled');
    const detected: Array<{
      id: string;
      allocA: NormalizedAllocation;
      allocB: NormalizedAllocation;
      sharedAssets: string[];
      sharedWorkers: string[];
      date: string;
    }> = [];

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i];
        const b = active[j];

        const aStart = new Date(a.start_time).getTime();
        const aEnd = new Date(a.end_time).getTime();
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();

        // Check if time windows overlap
        if (aStart < bEnd && aEnd > bStart) {
          const sharedA = a.effectiveAssetIds.filter(id => b.effectiveAssetIds.includes(id));
          const sharedW = a.effectiveWorkerIds.filter(id => b.effectiveWorkerIds.includes(id));

          if (sharedA.length > 0 || sharedW.length > 0) {
            detected.push({
              id: `${a.id}-${b.id}`,
              allocA: a,
              allocB: b,
              sharedAssets: sharedA.map(id => availableAssets.find(x => x.id === id)?.name || id),
              sharedWorkers: sharedW.map(id => availableWorkers.find(x => x.id === id)?.name || id),
              date: a.start_time.split('T')[0]
            });
          }
        }
      }
    }
    return detected;
  }, [normalizedAllocations, availableAssets, availableWorkers]);

  // Active Date Conflicts
  const activeDateConflicts = useMemo(() => {
    return conflicts.filter(c => c.date === selectedDate);
  }, [conflicts, selectedDate]);

  // 3. Filtered Allocations
  const filteredAllocations = useMemo(() => {
    return normalizedAllocations.filter(a => {
      // Date filter
      if (selectedDate && !a.start_time?.startsWith(selectedDate)) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && a.effectiveStatus !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.normalizedTitle.toLowerCase().includes(q);
        const matchVenue = a.normalizedVenue.toLowerCase().includes(q);
        const matchClient = (a.client_name || '').toLowerCase().includes(q);
        const matchPhone = (a.client_phone || '').toLowerCase().includes(q);
        const matchCrew = a.effectiveWorkerIds.some(id => {
          const w = availableWorkers.find(worker => worker.id === id);
          return (w?.name || '').toLowerCase().includes(q);
        });
        if (!matchTitle && !matchVenue && !matchClient && !matchPhone && !matchCrew) {
          return false;
        }
      }
      return true;
    });
  }, [normalizedAllocations, selectedDate, statusFilter, searchQuery, availableWorkers]);

  // Unique shoot dates for quick pills
  const availableDates = useMemo(() => {
    return Array.from(new Set(normalizedAllocations.map(a => a.start_time?.split('T')[0]).filter(Boolean))).sort();
  }, [normalizedAllocations]);

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

  const handleDeleteAllocation = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this shoot allocation? Locked gear and assigned crew shifts will be released.')) {
      return;
    }
    try {
      setDeletingId(id);
      await api.deleteAllocation(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel allocation');
    } finally {
      setDeletingId(null);
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
  const generateCallSheetText = (evt: NormalizedAllocation) => {
    const startTimeStr = new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = new Date(evt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date(evt.start_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    const matchedGear = evt.effectiveAssetIds.map(id => availableAssets.find(a => a.id === id)?.name || id).filter(Boolean);
    const matchedCrew = evt.effectiveWorkerIds.map(id => {
      const w = availableWorkers.find(x => x.id === id);
      return w ? `${w.name} (${w.primary_role})` : id;
    }).filter(Boolean);

    return `*OFFICIAL SHOOT CALL SHEET - ZManage Operations*\n\n` +
      `*Event*: ${evt.normalizedTitle}\n` +
      `*Date*: ${dateStr}\n` +
      `*Call Time*: ${startTimeStr} - Wrap: ${endTimeStr}\n` +
      `*Venue / Location*: ${evt.normalizedVenue}\n` +
      (evt.client_name ? `*Client POC*: ${evt.client_name} (${evt.client_phone || 'No phone'})\n` : '') +
      `\n*Dispatched Crew Members*:\n` +
      (matchedCrew.length > 0 ? matchedCrew.map(c => `* ${c}`).join('\n') : '* No crew assigned yet') +
      `\n\n*Allocated Kit & Hardware*:\n` +
      (matchedGear.length > 0 ? matchedGear.map(g => `* ${g}`).join('\n') : '* No gear allocated') +
      (evt.notes ? `\n\n*Special Instructions*: ${evt.notes}` : '') +
      `\n\n_Generated via Zorvik ZManage Operations Console._`;
  };

  const handleCopyCallSheet = (evt: NormalizedAllocation) => {
    const text = generateCallSheetText(evt);
    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleShareWhatsApp = (evt: NormalizedAllocation) => {
    const text = generateCallSheetText(evt);
    const targetPhone = evt.client_phone ? evt.client_phone.replace(/[^0-9]/g, '') : '';
    const url = targetPhone 
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Helper for duration
  const getDurationHours = (start: string, end: string) => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    return Math.max(0.5, Math.round(diff * 10) / 10);
  };

  // Month Calendar Calculations
  const currentMonthYearStr = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0, Sun = 6

  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      shootCount: number;
      allocatedCount: number;
      bookingCount: number;
    }> = [];

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ day: 0, dateStr: '', isCurrentMonth: false, shootCount: 0, allocatedCount: 0, bookingCount: 0 });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const fullDateStr = `${year}-${monthStr}-${dayStr}`;
      const dayAllocs = normalizedAllocations.filter(a => a.start_time?.startsWith(fullDateStr) && a.effectiveStatus !== 'cancelled');
      const bCount = dayAllocs.filter(a => a.isBookingOnly).length;
      const aCount = dayAllocs.filter(a => !a.isBookingOnly).length;

      days.push({
        day: d,
        dateStr: fullDateStr,
        isCurrentMonth: true,
        shootCount: dayAllocs.length,
        allocatedCount: aCount,
        bookingCount: bCount
      });
    }
    return days;
  }, [year, month, daysInMonth, adjustedFirstDay, normalizedAllocations]);

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const handleExportSchedule = () => {
    exportToCsv('operations_shoots_schedule', filteredAllocations, [
      { header: 'Shoot Title', accessor: a => a.normalizedTitle },
      { header: 'Venue / Location', accessor: a => a.normalizedVenue },
      { header: 'Client POC', accessor: a => a.client_name || '' },
      { header: 'Client Phone', accessor: a => a.client_phone || '' },
      { header: 'Shoot Date', accessor: a => a.start_time?.split('T')[0] || '' },
      { header: 'Call Time', accessor: a => a.start_time?.split('T')[1]?.slice(0, 5) || '' },
      { header: 'Wrap Time', accessor: a => a.end_time?.split('T')[1]?.slice(0, 5) || '' },
      { header: 'Locked Gear Count', accessor: a => a.effectiveAssetIds.length },
      { header: 'Assigned Crew Count', accessor: a => a.effectiveWorkerIds.length },
      { header: 'Status', accessor: a => a.effectiveStatus },
      { header: 'Special Notes', accessor: a => a.notes || '' }
    ]);
  };

  // Timeline Hour Ruler (07:00 to 23:00)
  const timelineHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-electric" /> Operations Timeline
          </h1>
          <p className="text-xs text-steel dark:text-zinc-400 max-w-xl">
            Real-time shoot scheduling, zero-collision equipment locks, and direct WhatsApp call sheet dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
          {/* Multi-View Mode Switcher */}
          <div className="flex items-center p-1 bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 shadow-xs font-semibold'
                  : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Timeline
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 shadow-xs font-semibold'
                  : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Calendar
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 shadow-xs font-semibold'
                  : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Agenda
            </button>
          </div>

          {/* 1-Tap Sync Studio Bookings */}
          {bookings.some(b => !b.is_already_synced) && (
            <button
              onClick={handleSyncBookings}
              disabled={isSyncing}
              className="dub-btn-outline text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer shrink-0 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium transition"
              title="Sync online/offline studio client bookings into operations schedule"
            >
              {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}
              <span>1-Tap Sync ({bookings.filter(b => !b.is_already_synced).length})</span>
            </button>
          )}

          <button
            onClick={() => setShowScannerModal(true)}
            className="dub-btn-outline text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer shrink-0 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
            title="Scan asset or kit QR code to check status or gear"
          >
            <Scan className="w-3.5 h-3.5 text-cyan-500" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Book Shoot
          </button>
        </div>
      </div>

      {/* 2. Zero-Collision Guard Alert Banner */}
      {activeDateConflicts.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 flex items-start gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              Zero-Collision Guard: {activeDateConflicts.length} Schedule Conflict Detected
            </div>
            {activeDateConflicts.map(c => (
              <p key={c.id} className="leading-relaxed">
                Overlapping shoots <strong>"{c.allocA.normalizedTitle}"</strong> and <strong>"{c.allocB.normalizedTitle}"</strong> share:
                {c.sharedAssets.length > 0 && <span className="ml-1 text-amber-700 dark:text-amber-300 font-mono">Gear: {c.sharedAssets.join(', ')}</span>}
                {c.sharedWorkers.length > 0 && <span className="ml-1 text-amber-700 dark:text-amber-300 font-mono">Crew: {c.sharedWorkers.join(', ')}</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="space-y-3 pt-1">
        {/* Row 1: Search, Status Filter & Export */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-3.5 h-3.5 text-fog dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by shoot, venue, crew..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="dub-input text-xs pl-10 py-1.5 w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Status Filter & Export Button */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 bg-paper dark:bg-zinc-900 p-1 rounded-xl border border-ash dark:border-zinc-800 shrink-0">
              {(['all', 'confirmed', 'in_progress', 'completed', 'cancelled'] as StatusFilter[]).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition cursor-pointer ${
                    statusFilter === status
                      ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 shadow-xs font-semibold'
                      : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportSchedule}
              className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 text-charcoal dark:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 cursor-pointer shrink-0"
              title="Export filtered schedule to CSV"
            >
              <Download className="w-3.5 h-3.5 text-electric" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Date Navigation, Day Stepping & Dynamic Focus Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 bg-paper/50 dark:bg-zinc-900/40 rounded-2xl border border-ash/70 dark:border-zinc-800/70">
          {/* Day Stepper & Date Picker */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Prev / Today / Next Segmented Control */}
            <div className="flex items-center p-0.5 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl shadow-xs">
              <button
                onClick={handlePrevDay}
                title="Previous Day"
                className="p-1.5 rounded-lg text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleTodayJump}
                title="Jump to Today"
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedDate === todayStr
                    ? 'bg-charcoal dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold shadow-xs'
                    : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-paper dark:hover:bg-zinc-800'
                }`}
              >
                {selectedDate === todayStr && (
                  <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
                )}
                <span>Today</span>
              </button>

              <button
                onClick={handleNextDay}
                title="Next Day"
                className="p-1.5 rounded-lg text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom Date Picker Dropdown Button */}
            <div className="relative inline-flex items-center">
              <input
                type="date"
                value={selectedDate || todayStr}
                onChange={e => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setCalendarDate(new Date(e.target.value + 'T00:00:00'));
                  }
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                title="Pick a custom date"
              />
              <button
                type="button"
                className="px-2.5 py-1.5 rounded-xl border border-ash dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-smoke dark:hover:border-zinc-700 text-charcoal dark:text-zinc-100 text-xs font-medium flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-electric" />
                <span className="font-mono text-xs">{selectedDate ? formatFullDateHeader(selectedDate) : 'All Dates'}</span>
                <span className="text-[10px] text-steel dark:text-zinc-500">▾</span>
              </button>
            </div>
          </div>

          {/* Quick Date Focus Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedDate('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                !selectedDate
                  ? 'bg-charcoal dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold shadow-xs'
                  : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800'
              }`}
            >
              <span>All Dates</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                !selectedDate
                  ? 'bg-white/20 text-white dark:bg-zinc-800 dark:text-zinc-200'
                  : 'bg-ash/50 dark:bg-zinc-800 text-steel dark:text-zinc-400'
              }`}>
                {normalizedAllocations.length}
              </span>
            </button>

            {availableDates.map(d => {
              const isSelected = selectedDate === d;
              const shootCount = normalizedAllocations.filter(a => a.start_time?.startsWith(d) && a.effectiveStatus !== 'cancelled').length;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-charcoal dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold shadow-xs'
                      : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800'
                  }`}
                >
                  <span>{formatFriendlyDate(d)}</span>
                  {shootCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-zinc-800 dark:text-zinc-200'
                        : 'bg-ash/60 dark:bg-zinc-800 text-steel dark:text-zinc-300'
                    }`}>
                      {shootCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadData} className="underline text-xs ml-2 cursor-pointer">Retry</button>
        </div>
      )}

      {/* 4. Main View Surface */}
      {loading ? (
        <div className="p-16 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-electric animate-spin" />
          <span className="text-xs text-steel dark:text-zinc-400 font-mono">Loading operations timeline...</span>
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: VISUAL HOURLY TIMELINE */}
          {viewMode === 'timeline' && (
            <div className="dub-card p-5 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ash dark:border-zinc-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <Clock className="w-4 h-4 text-electric shrink-0" />
                  <span className="text-xs font-semibold text-charcoal dark:text-zinc-100 font-mono uppercase">
                    Hourly Resource Track: {formatFullDateHeader(selectedDate || todayStr)}
                  </span>
                  {(selectedDate === todayStr || (!selectedDate && todayStr)) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-electric/10 text-electric border border-electric/30 font-semibold font-mono">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 p-0.5 rounded-lg">
                    <button
                      onClick={handlePrevDay}
                      className="p-1 rounded-md text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleTodayJump}
                      className={`px-2 py-0.5 text-[11px] font-mono rounded-md transition cursor-pointer ${
                        selectedDate === todayStr
                          ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 font-semibold shadow-xs'
                          : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
                      }`}
                      title="Jump to Today"
                    >
                      Today
                    </button>
                    <button
                      onClick={handleNextDay}
                      className="p-1 rounded-md text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Next Day"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-steel dark:text-zinc-400 font-mono">
                    {filteredAllocations.length} shoot(s) scheduled
                  </span>
                </div>
              </div>

              {filteredAllocations.length === 0 ? (
                <div className="dub-card p-10 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 text-center text-xs text-steel dark:text-zinc-400 space-y-3">
                  <p>No operations or bookings scheduled for <strong className="text-charcoal dark:text-zinc-200">{formatFriendlyDate(selectedDate)}</strong> ({selectedDate || 'Selected Day'}).</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {availableDates.length > 0 && (
                      <button
                        onClick={() => {
                          const today = getLocalDateString();
                          const upcoming = availableDates.filter(d => d >= today);
                          const target = upcoming.length > 0 ? upcoming[0] : availableDates[0];
                          setSelectedDate(target);
                          setCalendarDate(new Date(target + 'T00:00:00'));
                        }}
                        className="dub-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" /> Jump to Scheduled Date ({formatFriendlyDate(availableDates.filter(d => d >= getLocalDateString())[0] || availableDates[0])})
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="dub-btn-outline text-xs px-3 py-1.5 text-charcoal dark:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Shoot
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  {/* Timeline Hour Scale */}
                  <div className="relative border-b border-ash dark:border-zinc-800 pb-2">
                    <div className="grid grid-cols-8 md:grid-cols-16 text-[10px] font-mono text-fog dark:text-zinc-500 text-center">
                      {timelineHours.map(h => (
                        <div key={h} className="truncate">
                          {h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Shoot Bars */}
                  <div className="space-y-3 relative">
                    {filteredAllocations.map(evt => {
                      const start = new Date(evt.start_time);
                      const end = new Date(evt.end_time);

                      const sH = start.getHours() + start.getMinutes() / 60;
                      const eH = end.getHours() + end.getMinutes() / 60;

                      // Clamp between 7 and 23
                      const clampedStart = Math.max(7, Math.min(23, sH));
                      const clampedEnd = Math.max(clampedStart + 0.5, Math.min(23, eH));

                      const leftPercent = ((clampedStart - 7) / 16) * 100;
                      const widthPercent = Math.max(6, ((clampedEnd - clampedStart) / 16) * 100);

                      const isCancelled = evt.effectiveStatus === 'cancelled';
                      const isCompleted = evt.effectiveStatus === 'completed';
                      const isBooking = evt.isBookingOnly;

                      return (
                        <div key={evt.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs px-1">
                            <div className="flex items-center gap-1.5 truncate max-w-sm">
                              {isBooking && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-700/60 shrink-0 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Booking
                                </span>
                              )}
                              <span className="font-semibold text-charcoal dark:text-zinc-100 truncate">
                                {evt.normalizedTitle}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-steel dark:text-zinc-400">
                              {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                              {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({getDurationHours(evt.start_time, evt.end_time)} hrs)
                            </span>
                          </div>

                          <div className="h-10 bg-paper dark:bg-zinc-900/60 rounded-xl relative border border-ash dark:border-zinc-800 overflow-hidden flex items-center">
                            {/* Proportional Duration Bar */}
                            <div
                              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                              onClick={() => {
                                if (evt.isBookingOnly && evt.bookingCandidate) {
                                  handleAllocateFromBooking(evt.bookingCandidate);
                                } else {
                                  setActiveCallSheet(evt);
                                }
                              }}
                              className={`absolute h-full rounded-lg px-2.5 flex items-center justify-between text-xs font-medium cursor-pointer transition shadow-xs hover:opacity-95 ${
                                isBooking
                                  ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/50 hover:bg-amber-500/30'
                                  : isCancelled
                                  ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40'
                                  : isCompleted
                                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40'
                                  : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                              }`}
                              title={isBooking ? "Studio Booking awaiting gear & crew - Click to allocate" : "Click to view digital call sheet"}
                            >
                              <span className="truncate font-semibold text-[11px] flex items-center">
                                {isBooking && <Ticket className="w-3 h-3 inline mr-1 text-purple-500 shrink-0" />}
                                <span className="truncate">{evt.normalizedTitle}</span>
                              </span>
                              <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1">
                                {isBooking ? '+ Allocate Gear & Crew' : evt.normalizedVenue}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: MONTHLY CALENDAR GRID */}
          {viewMode === 'calendar' && (
            <div className="dub-card p-6 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-ash dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-electric" />
                  <h2 className="text-sm font-semibold font-satoshi text-charcoal dark:text-zinc-100">
                    {currentMonthYearStr}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-ash dark:border-zinc-800 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleTodayJump}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg border border-ash dark:border-zinc-800 transition cursor-pointer flex items-center gap-1.5 ${
                      calendarDate.getFullYear() === new Date().getFullYear() && calendarDate.getMonth() === new Date().getMonth() && selectedDate === todayStr
                        ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 font-semibold shadow-xs'
                        : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-paper dark:hover:bg-zinc-800'
                    }`}
                    title="Jump to Today"
                  >
                    {selectedDate === todayStr && <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />}
                    <span>Today</span>
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-ash dark:border-zinc-800 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-steel dark:text-zinc-400 py-1 border-b border-ash dark:border-zinc-800/60 font-mono">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((cell, idx) => {
                  if (!cell.isCurrentMonth) {
                    return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-paper/20 dark:bg-zinc-900/20" />;
                  }

                  const isSelected = selectedDate === cell.dateStr;
                  const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => setSelectedDate(cell.dateStr)}
                      className={`h-20 p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-electric bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                          : 'border-ash dark:border-zinc-800 hover:border-smoke dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-medium ${isToday ? 'px-1.5 py-0.5 rounded-full bg-electric text-white font-bold' : 'text-charcoal dark:text-zinc-100'}`}>
                          {cell.day}
                        </span>

                        {cell.shootCount > 0 && (
                          <div className="flex flex-col items-end gap-0.5">
                            {cell.allocatedCount > 0 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                                {cell.allocatedCount} shoot{cell.allocatedCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {cell.bookingCount > 0 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-700/60">
                                {cell.bookingCount} bkg
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {cell.shootCount > 0 && (
                        <div className="flex items-center gap-1">
                          {cell.bookingCount > 0 && cell.allocatedCount === 0 ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate">Awaiting Gear</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] text-steel dark:text-zinc-400 truncate">
                                {cell.bookingCount > 0 ? `${cell.shootCount} Operations` : 'Locked & Ready'}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: AGENDA / CARD DECK */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-steel dark:text-zinc-400 uppercase tracking-wider font-mono">
                {viewMode === 'agenda' ? 'All Scheduled Operations' : 'Event Manifest Details'} ({filteredAllocations.length})
              </span>
            </div>

            {filteredAllocations.length === 0 ? (
              <div className="dub-card p-10 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 text-center text-xs text-steel dark:text-zinc-400 space-y-3">
                <p>No shoots or bookings match current filters for <strong className="text-charcoal dark:text-zinc-200">{formatFriendlyDate(selectedDate)}</strong>.</p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate('')}
                      className="dub-btn-outline text-xs px-3.5 py-1.5 text-charcoal dark:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Clear Date Filter (Show All {normalizedAllocations.length} Events)
                    </button>
                  )}
                  {bookings.some(b => !b.is_already_synced) && (
                    <button
                      onClick={handleSyncBookings}
                      disabled={isSyncing}
                      className="dub-btn-outline text-xs px-3.5 py-1.5 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" /> 1-Tap Sync Studio Bookings
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="dub-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Book Shoot
                  </button>
                </div>
              </div>
            ) : (
              filteredAllocations.map(evt => {
                const startTimeStr = new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTimeStr = new Date(evt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const duration = getDurationHours(evt.start_time, evt.end_time);

                const isCancelled = evt.effectiveStatus === 'cancelled';
                const isCompleted = evt.effectiveStatus === 'completed';
                const isBooking = evt.isBookingOnly;

                return (
                  <div
                    key={evt.id}
                    className={`dub-card p-4 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 space-y-3 transition hover:border-smoke dark:hover:border-zinc-700 ${
                      isCancelled ? 'opacity-60 bg-paper/40 dark:bg-zinc-950/40' : ''
                    }`}
                  >
                    {/* Event Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-ash dark:border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-electric">
                            {startTimeStr} - {endTimeStr} ({duration} hrs)
                          </span>

                          {isBooking ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold border bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" /> Booking · Awaiting Gear/Crew
                            </span>
                          ) : (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold border ${
                              isCancelled
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                : isCompleted
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            }`}>
                              {evt.effectiveStatus}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-semibold text-charcoal dark:text-zinc-100 mt-1">
                          {evt.normalizedTitle}
                        </h3>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isBooking && evt.bookingCandidate && (
                          <button
                            onClick={() => handleAllocateFromBooking(evt.bookingCandidate!)}
                            className="dub-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Allocate gear & crew to this booking"
                          >
                            <Plus className="w-3.5 h-3.5" /> Allocate Gear & Crew
                          </button>
                        )}

                        <button
                          onClick={() => handleShareWhatsApp(evt)}
                          className="dub-btn-outline text-xs px-2.5 py-1.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          title="Share to WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </button>

                        {!isBooking && (
                          <button
                            onClick={() => setActiveCallSheet(evt)}
                            className="dub-btn-outline text-xs px-2.5 py-1.5 flex items-center gap-1.5 text-charcoal dark:text-zinc-200"
                            title="View Call Sheet"
                          >
                            <FileText className="w-3.5 h-3.5 text-steel dark:text-zinc-400" /> Call Sheet
                          </button>
                        )}

                        {!isCancelled && !isBooking && (
                          <button
                            onClick={() => handleDeleteAllocation(evt.id)}
                            disabled={deletingId === evt.id}
                            className="p-1.5 rounded-lg text-steel dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                            title="Cancel / Delete Shoot"
                          >
                            {deletingId === evt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata Row: Client & Venue */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-steel dark:text-zinc-400">
                      {evt.normalizedVenue && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-fog dark:text-zinc-500" />
                          <span className="font-medium text-charcoal dark:text-zinc-200">{evt.normalizedVenue}</span>
                        </div>
                      )}

                      {evt.client_name && (
                        <div className="flex items-center gap-1.5">
                          <span>Client: <strong className="text-charcoal dark:text-zinc-200">{evt.client_name}</strong></span>
                          {evt.client_phone && (
                            <a
                              href={`tel:${evt.client_phone}`}
                              className="text-electric hover:underline flex items-center gap-1 ml-1"
                            >
                              <Phone className="w-3 h-3" /> {evt.client_phone}
                            </a>
                          )}
                        </div>
                      )}

                      {evt.notes && (
                        <div className="text-[11px] text-fog dark:text-zinc-500 truncate max-w-md">
                          Note: {evt.notes}
                        </div>
                      )}
                    </div>

                    {/* Hardware & Crew Grids or Booking Allocation Callout */}
                    {isBooking ? (
                      <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Hardware kit and crew shifts are awaiting allocation for this client booking.</span>
                        </div>
                        {evt.bookingCandidate && (
                          <button
                            onClick={() => handleAllocateFromBooking(evt.bookingCandidate!)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3 h-3" /> Allocate Now
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                        {/* Locked Hardware Kit */}
                        <div>
                          <span className="text-[11px] font-semibold text-steel dark:text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                            <Camera className="w-3 h-3 text-fog dark:text-zinc-500" /> Locked Hardware Kit ({evt.effectiveAssetIds.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {evt.effectiveAssetIds.length === 0 ? (
                              <span className="text-xs text-fog dark:text-zinc-500 italic">No equipment locked</span>
                            ) : (
                              evt.effectiveAssetIds.map(id => {
                                const matched = availableAssets.find(a => a.id === id);
                                return (
                                  <span
                                    key={id}
                                    className="text-xs px-2.5 py-1 rounded-md font-mono border bg-paper dark:bg-zinc-900 text-charcoal dark:text-zinc-200 border-ash dark:border-zinc-800"
                                  >
                                    {matched ? matched.name : id.substring(0, 8)}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Dispatched Crew */}
                        <div>
                          <span className="text-[11px] font-semibold text-steel dark:text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-fog dark:text-zinc-500" /> Dispatched Crew ({evt.effectiveWorkerIds.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {evt.effectiveWorkerIds.length === 0 ? (
                              <span className="text-xs text-fog dark:text-zinc-500 italic">No crew assigned</span>
                            ) : (
                              evt.effectiveWorkerIds.map(id => {
                                const matched = availableWorkers.find(w => w.id === id);
                                return (
                                  <span
                                    key={id}
                                    className="text-xs px-2.5 py-1 rounded-md border bg-paper dark:bg-zinc-900 text-charcoal dark:text-zinc-200 border-ash dark:border-zinc-800 flex items-center gap-1"
                                  >
                                    <span>{matched ? matched.name : id.substring(0, 8)}</span>
                                    {matched?.primary_role && (
                                      <span className="text-[10px] text-fog dark:text-zinc-500 capitalize">
                                        ({matched.primary_role.replace('_', ' ')})
                                      </span>
                                    )}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 5. Digital Call Sheet Modal */}
      {activeCallSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ash dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold font-satoshi text-charcoal dark:text-zinc-100">
                  Digital Call Sheet & Shoot Brief
                </h2>
                <p className="text-xs text-steel dark:text-zinc-400">{activeCallSheet.normalizedTitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareWhatsApp(activeCallSheet)}
                  className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>

                <button
                  onClick={() => handleCopyCallSheet(activeCallSheet)}
                  className="dub-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  {copiedBrief ? <Check className="w-3.5 h-3.5 text-vividGreen" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBrief ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <pre className="p-4 bg-paper dark:bg-zinc-900/80 rounded-xl border border-ash dark:border-zinc-800 text-xs font-mono whitespace-pre-wrap text-charcoal dark:text-zinc-200 overflow-x-auto leading-relaxed">
              {generateCallSheetText(activeCallSheet)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveCallSheet(null)}
                className="dub-btn-outline text-xs px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Book Shoot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="dub-card shadow-floating p-6 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ash dark:border-zinc-800">
              <h2 className="text-sm font-semibold font-satoshi text-charcoal dark:text-zinc-100">
                Book Production Shoot & Lock Kit
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 text-xs p-1 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShoot} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Shoot / Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kapoor Wedding Reception"
                  value={newShoot.shoot_title}
                  onChange={e => setNewShoot({ ...newShoot, shoot_title: e.target.value })}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Hyatt, Ballroom A"
                  value={newShoot.shoot_venue}
                  onChange={e => setNewShoot({ ...newShoot, shoot_venue: e.target.value })}
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
                    placeholder="e.g. Rohit Kapoor"
                    value={newShoot.client_name}
                    onChange={e => setNewShoot({ ...newShoot, client_name: e.target.value })}
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
                    value={newShoot.client_phone}
                    onChange={e => setNewShoot({ ...newShoot, client_phone: e.target.value })}
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
                    value={newShoot.shoot_date}
                    onChange={e => setNewShoot({ ...newShoot, shoot_date: e.target.value })}
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
                    value={newShoot.start_time}
                    onChange={e => setNewShoot({ ...newShoot, start_time: e.target.value })}
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
                    value={newShoot.end_time}
                    onChange={e => setNewShoot({ ...newShoot, end_time: e.target.value })}
                    className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1">
                  Special Instructions / Brief
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drone permissions secured. Gimbal operator needed at 4 PM."
                  value={newShoot.notes}
                  onChange={e => setNewShoot({ ...newShoot, notes: e.target.value })}
                  className="dub-input text-xs w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Zorvik-AI Kit & Crew Assistant */}
              <div className="p-3 rounded-xl border border-purple-300 dark:border-purple-800/60 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-transparent flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                    <div>
                      <span className="text-xs font-semibold text-purple-900 dark:text-purple-200 block">
                        Zorvik-AI Kit & Crew Assistant
                      </span>
                      <span className="text-[10px] text-steel dark:text-zinc-400">
                        Zero-cost cascade AI engine recommends optimal gear & crew
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiRecommendation}
                    disabled={isAiGenerating || !newShoot.shoot_title}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition disabled:opacity-50"
                  >
                    {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isAiGenerating ? 'Analyzing...' : 'Generate AI Package'}</span>
                  </button>
                </div>

                {/* AI Recommendation Card */}
                {aiRecommendation && (
                  <div className="p-3 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-purple-200 dark:border-purple-800/60 space-y-2 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                      <span className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Confidence: {aiRecommendation.confidence_score}% · {aiRecommendationModel}
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyAiRecommendation}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs cursor-pointer transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Apply to Selection (1-Click)
                      </button>
                    </div>

                    <p className="text-[11px] text-charcoal dark:text-zinc-200 leading-relaxed italic">
                      "{aiRecommendation.ai_summary}"
                    </p>

                    {/* Recommended Gear & Crew Counts */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {aiRecommendation.recommended_asset_ids?.length || 0} Hardware Items
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        {aiRecommendation.recommended_worker_ids?.length || 0} Crew Roles
                      </span>
                    </div>

                    {/* Critical Preparedness Tips */}
                    {aiRecommendation.critical_tips && aiRecommendation.critical_tips.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-ash dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-steel dark:text-zinc-400 block">
                          Critical Shoot Preparedness Tips:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                          {aiRecommendation.critical_tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hardware Lock Checklist */}
              <div>
                <label className="block text-xs font-medium text-steel dark:text-zinc-400 mb-1.5">
                  Reserve Equipment ({newShoot.asset_ids.length} selected)
                </label>
                <div className="border border-ash dark:border-zinc-800 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-paper/50 dark:bg-zinc-900/50">
                  {availableAssets.length === 0 ? (
                    <span className="text-xs text-fog dark:text-zinc-500 italic">No equipment available</span>
                  ) : (
                    availableAssets.map(asset => (
                      <label
                        key={asset.id}
                        className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition ${
                          newShoot.asset_ids.includes(asset.id)
                            ? 'bg-white dark:bg-zinc-800 border border-ash dark:border-zinc-700 font-medium text-charcoal dark:text-zinc-100'
                            : 'text-steel dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newShoot.asset_ids.includes(asset.id)}
                            onChange={() => toggleAssetSelect(asset.id)}
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
                  Dispatch Crew ({newShoot.worker_ids.length} selected)
                </label>
                <div className="border border-ash dark:border-zinc-800 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-paper/50 dark:bg-zinc-900/50">
                  {availableWorkers.length === 0 ? (
                    <span className="text-xs text-fog dark:text-zinc-500 italic">No crew available</span>
                  ) : (
                    availableWorkers.map(worker => (
                      <label
                        key={worker.id}
                        className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition ${
                          newShoot.worker_ids.includes(worker.id)
                            ? 'bg-white dark:bg-zinc-800 border border-ash dark:border-zinc-700 font-medium text-charcoal dark:text-zinc-100'
                            : 'text-steel dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newShoot.worker_ids.includes(worker.id)}
                            onChange={() => toggleWorkerSelect(worker.id)}
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

      {/* In-Browser QR Scanner Modal */}
      <QrScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        inventory={availableAssets}
        onSelectAsset={(asset) => {
          // If the shoot booking modal is open, toggle the gear selection
          if (showAddModal) {
            setNewShoot(prev => {
              const exists = prev.asset_ids.includes(asset.id);
              return {
                ...prev,
                asset_ids: exists ? prev.asset_ids.filter(id => id !== asset.id) : [...prev.asset_ids, asset.id]
              };
            });
          } else {
            alert(`Scanned: ${asset.name} (${asset.code || 'SKU'})\nStatus: ${asset.status.toUpperCase()}\nCondition: ${asset.condition?.toUpperCase()}`);
          }
        }}
        title="Operations QR Scanner"
        subtitle="Verify asset status or scan to auto-add gear to shoot pack manifest"
      />
    </div>
  );
};
