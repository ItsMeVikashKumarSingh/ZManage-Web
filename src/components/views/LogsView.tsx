import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, Search, Download, RefreshCw, Loader2, 
  Camera, Users, Clock, Banknote, Calendar, Eye, 
  Copy, Check, X, Terminal, Filter, Code, Layers, 
  FileText, Shield, Tag, MapPin, Hash, Sparkles
} from 'lucide-react';
import { api, AuditLogRecord, AuditLogMetrics } from '../../lib/api';
import { exportToCsv } from '../../lib/exportUtils';

type EntityFilter = 'all' | 'ASSET' | 'ALLOCATION' | 'WORKER' | 'PAYOUT' | 'BOOKING' | 'AUTH';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [metrics, setMetrics] = useState<AuditLogMetrics>({
    totalEvents: 0,
    gearOperations: 0,
    timelineDispatches: 0,
    payoutSettlements: 0,
    crewOperations: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [selectedEntity, setSelectedEntity] = useState<EntityFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected JSON inspect modal
  const [inspectRecord, setInspectRecord] = useState<AuditLogRecord | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [inspectViewMode, setInspectViewMode] = useState<'friendly' | 'raw'>('friendly');

  const fetchLogs = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const res = await api.getAuditLogs({
        entity: selectedEntity !== 'all' ? selectedEntity : undefined,
        search: searchQuery.trim() || undefined,
        limit: 100
      });

      if (res.success) {
        setLogs(res.logs || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve audit log records from ZManage-APIs');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedEntity, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Format relative timestamp
  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // Humanize action badge
  const getActionBadgeStyle = (action: string) => {
    const upper = action.toUpperCase();
    if (upper.includes('CREATED') || upper.includes('ONBOARDED') || upper.includes('INIT')) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (upper.includes('CHECKIN')) {
      return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    }
    if (upper.includes('CHECKOUT') || upper.includes('ALLOCATED') || upper.includes('SYNC')) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (upper.includes('UPDATED')) {
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    if (upper.includes('PAYOUT') || upper.includes('SETTLED')) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    if (upper.includes('DELETED') || upper.includes('CANCELLED') || upper.includes('REMOVED')) {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    return 'bg-paper dark:bg-zinc-800 text-charcoal dark:text-zinc-300 border-ash dark:border-zinc-700';
  };

  // Summarize metadata for quick inline scanning
  const renderMetadataSummary = (log: AuditLogRecord) => {
    const m = log.metadata || {};

    if (log.action === 'ASSET_CHECKIN') {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-charcoal dark:text-zinc-200">{m.name || 'Hardware Asset'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-100/70 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 uppercase">
              Condition: {m.return_condition || 'Good'}
            </span>
          </div>
          {m.return_notes && (
            <p className="text-[11px] text-steel dark:text-zinc-400 italic">
              Note: "{m.return_notes}"
            </p>
          )}
        </div>
      );
    }

    if (log.action === 'ASSET_CHECKOUT') {
      return (
        <div className="text-xs text-charcoal dark:text-zinc-200">
          Dispatched <strong>{m.name || 'Hardware'}</strong> to Shoot Allocation
        </div>
      );
    }

    if (log.action === 'SHOOT_ALLOCATED') {
      return (
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-charcoal dark:text-zinc-100">{m.title || 'Production Shoot'}</div>
          <div className="text-[11px] text-steel dark:text-zinc-400 flex items-center gap-2">
            <span>Gear: {m.locked_gear_count ?? 0}</span>
            <span>·</span>
            <span>Crew: {m.crew_count ?? 0}</span>
            {m.venue && (
              <>
                <span>·</span>
                <span className="truncate max-w-xs">{m.venue}</span>
              </>
            )}
          </div>
        </div>
      );
    }

    if (log.action === 'PAYOUT_SETTLED') {
      return (
        <div className="text-xs text-charcoal dark:text-zinc-200">
          Settled ₹{Number(m.total_amount || 0).toLocaleString('en-IN')} via {m.payment_mode || 'Bank'} 
          {m.reference_number && <span className="ml-1 font-mono text-[11px] text-electric">(UTR: {m.reference_number})</span>}
        </div>
      );
    }

    if (log.action === 'WORKER_ONBOARDED') {
      return (
        <div className="text-xs text-charcoal dark:text-zinc-200">
          Onboarded <strong>{m.name}</strong> as <span className="text-electric">{m.primary_role}</span>
        </div>
      );
    }

    if (log.action === 'OFFLINE_BOOKING_CREATED') {
      return (
        <div className="text-xs text-charcoal dark:text-zinc-200">
          Offline Order for <strong>{m.client_name}</strong> ({m.package_name}) · ₹{Number(m.amount || 0).toLocaleString('en-IN')}
        </div>
      );
    }

    // Default JSON keys preview
    const keys = Object.keys(m);
    if (keys.length === 0) return <span className="text-xs text-fog dark:text-zinc-500 italic">No additional metadata</span>;

    return (
      <div className="text-xs text-steel dark:text-zinc-300 truncate max-w-md font-mono">
        {keys.slice(0, 3).map(k => `${k}: ${typeof m[k] === 'object' ? '...' : m[k]}`).join(' · ')}
      </div>
    );
  };

  const handleExportLogs = () => {
    exportToCsv('security_audit_logs', logs, [
      { header: 'Event ID', accessor: l => l.id },
      { header: 'Action', accessor: l => l.action },
      { header: 'Entity', accessor: l => l.entity },
      { header: 'Timestamp', accessor: l => l.created_at },
      { header: 'Actor IP', accessor: l => l.ip_address || '' },
      { header: 'User Agent', accessor: l => l.user_agent || '' },
      { header: 'Metadata JSON', accessor: l => JSON.stringify(l.metadata || {}) }
    ]);
  };

  const handleCopyJson = (data: any) => {
    const safeData = { ...(data || {}) };
    delete safeData.client_id;
    delete safeData.tal_client_id;
    if (safeData.metadata && typeof safeData.metadata === 'object') {
      const safeMeta = { ...safeData.metadata };
      delete safeMeta.client_id;
      delete safeMeta.tal_client_id;
      delete safeMeta.tenant_id;
      safeData.metadata = safeMeta;
    }
    navigator.clipboard.writeText(JSON.stringify(safeData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (selectedEntity !== 'all' && log.entity !== selectedEntity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchEntity = log.entity.toLowerCase().includes(q);
        const matchIp = (log.ip_address || '').toLowerCase().includes(q);
        const matchMeta = JSON.stringify(log.metadata || {}).toLowerCase().includes(q);
        if (!matchAction && !matchEntity && !matchIp && !matchMeta) return false;
      }
      return true;
    });
  }, [logs, selectedEntity, searchQuery]);

  return (
    <div className="space-y-3.5">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-electric" /> Security & Activity Audit Logs
          </h1>
          <p className="text-xs text-steel dark:text-zinc-400 max-w-xl">
            Immutable operational and security audit records per Rule 3.1, capturing gear returns, call sheet dispatches, and financial settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          <button
            onClick={() => fetchLogs(true)}
            disabled={loading || isRefreshing}
            className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer text-steel hover:text-charcoal dark:text-zinc-300 dark:hover:text-white"
            title="Refresh logs from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-electric' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* 2. Aggregate Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Total Events</div>
            <div className="text-base font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              {metrics.totalEvents}
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-electric opacity-70" />
        </div>

        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Gear Ops</div>
            <div className="text-base font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              {metrics.gearOperations}
            </div>
          </div>
          <Camera className="w-4 h-4 text-cyan-500 opacity-70" />
        </div>

        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Dispatches</div>
            <div className="text-base font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              {metrics.timelineDispatches}
            </div>
          </div>
          <Clock className="w-4 h-4 text-blue-500 opacity-70" />
        </div>

        <div className="dub-card px-3.5 py-2 bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-steel dark:text-zinc-400 uppercase tracking-wider">Settlements</div>
            <div className="text-base font-bold font-satoshi text-charcoal dark:text-zinc-100 mt-0.5">
              {metrics.payoutSettlements}
            </div>
          </div>
          <Banknote className="w-4 h-4 text-amber-500 opacity-70" />
        </div>
      </div>

      {/* 3. Filters & Export Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-3.5 h-3.5 text-fog dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, entity, IP or note..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="dub-input text-xs pl-10 py-1.5 w-full bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Category Pills & Export */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          <div className="flex items-center gap-1 bg-paper dark:bg-zinc-900 p-1 rounded-xl border border-ash dark:border-zinc-800 overflow-x-auto shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'ASSET', label: 'Gear' },
                { id: 'ALLOCATION', label: 'Shoots' },
                { id: 'WORKER', label: 'Crew' },
                { id: 'PAYOUT', label: 'Payouts' },
                { id: 'BOOKING', label: 'Bookings' },
                { id: 'AUTH', label: 'Auth' }
              ] as Array<{ id: EntityFilter; label: string }>
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedEntity(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  selectedEntity === tab.id
                    ? 'bg-white dark:bg-zinc-100 text-charcoal dark:text-zinc-950 shadow-xs font-semibold'
                    : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportLogs}
            className="dub-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 text-charcoal dark:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            title="Export audit logs to CSV"
          >
            <Download className="w-3.5 h-3.5 text-electric" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => fetchLogs()} className="underline cursor-pointer ml-2">Retry</button>
        </div>
      )}

      {/* 4. Audit Logs Table */}
      <div className="dub-card bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-electric animate-spin" />
            <span className="text-xs text-steel dark:text-zinc-400 font-mono">Querying immutable audit logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-2">
            <ShieldCheck className="w-8 h-8 text-fog dark:text-zinc-600" />
            <span className="text-sm font-semibold text-charcoal dark:text-zinc-200">No Audit Events Found</span>
            <p className="text-xs text-steel dark:text-zinc-400 max-w-sm">
              Mutations will appear here in real time as actions are performed across inventory, roster, schedule, and payouts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-ash dark:border-zinc-800 bg-paper/50 dark:bg-zinc-900/50 text-[11px] font-mono text-steel dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details & Notes</th>
                  <th className="py-3 px-4">Network Origin</th>
                  <th className="py-3 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ash dark:divide-zinc-800">
                {filteredLogs.map(log => (
                  <tr 
                    key={log.id}
                    className="hover:bg-paper/40 dark:hover:bg-zinc-900/40 transition"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-charcoal dark:text-zinc-200">
                        {formatTimeAgo(log.created_at)}
                      </div>
                      <div className="text-[10px] text-steel dark:text-zinc-400 font-mono">
                        {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold border ${getActionBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-paper dark:bg-zinc-800 border border-ash dark:border-zinc-700 text-charcoal dark:text-zinc-200 font-semibold">
                        {log.entity}
                      </span>
                    </td>

                    {/* Details & Notes */}
                    <td className="py-3 px-4">
                      {renderMetadataSummary(log)}
                    </td>

                    {/* Origin IP & UA */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      <div className="text-charcoal dark:text-zinc-300 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-steel dark:text-zinc-500" />
                        <span>{log.ip_address || '127.0.0.1'}</span>
                      </div>
                      <div className="text-[10px] text-fog dark:text-zinc-500 truncate max-w-[140px]" title={log.user_agent || ''}>
                        {log.user_agent ? log.user_agent.split(' ')[0] : 'Browser'}
                      </div>
                    </td>

                    {/* Inspect Payload Button */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectRecord(log)}
                        className="p-1.5 rounded-lg border border-ash dark:border-zinc-800 bg-white dark:bg-zinc-900 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:border-smoke dark:hover:border-zinc-700 transition cursor-pointer shadow-xs"
                        title="Inspect structured JSON payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Inspect JSON Payload Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 bg-charcoal/50 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="dub-card bg-white dark:bg-[#0e0e12] border border-ash dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-ash dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-electric" />
                <div>
                  <h3 className="text-sm font-semibold font-satoshi text-charcoal dark:text-zinc-100">
                    Audit Log Payload #{inspectRecord.id.substring(0, 8)}
                  </h3>
                  <p className="text-[11px] font-mono text-steel dark:text-zinc-400">
                    {inspectRecord.action} · {inspectRecord.entity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyJson(inspectRecord)}
                  className="dub-btn-outline text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                  title="Copy full JSON"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setInspectRecord(null)}
                  className="p-1 rounded-lg text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-4 max-h-[70vh]">
              {/* Telemetry Context Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-paper dark:bg-zinc-900/60 p-3 rounded-xl border border-ash dark:border-zinc-800">
                <div>
                  <span className="text-steel dark:text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">Recorded At</span>
                  <span className="text-charcoal dark:text-zinc-200 font-mono text-[11px]">
                    {new Date(inspectRecord.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {new Date(inspectRecord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-steel dark:text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">Performed By</span>
                  <span className="text-charcoal dark:text-zinc-200 font-mono text-[11px]" title={inspectRecord.admin_id || 'System'}>
                    {inspectRecord.admin_id ? `#${inspectRecord.admin_id.substring(0, 8)}` : 'System'}
                  </span>
                </div>
                <div>
                  <span className="text-steel dark:text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">Origin IP</span>
                  <span className="text-charcoal dark:text-zinc-200 font-mono text-[11px]">{inspectRecord.ip_address || '127.0.0.1'}</span>
                </div>
                <div>
                  <span className="text-steel dark:text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">Event Target</span>
                  <span className="text-charcoal dark:text-zinc-200 font-mono text-[11px] truncate block">{inspectRecord.entity}</span>
                </div>
              </div>

              {/* Dynamic Metadata Section Header & Mode Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-ash dark:border-zinc-800">
                  <span className="text-xs font-semibold font-satoshi text-charcoal dark:text-zinc-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-electric" /> Structured Event Metadata
                  </span>
                  <div className="flex items-center bg-paper dark:bg-zinc-800/80 p-0.5 rounded-lg border border-ash dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setInspectViewMode('friendly')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition flex items-center gap-1 cursor-pointer ${
                        inspectViewMode === 'friendly'
                          ? 'bg-white dark:bg-zinc-900 text-charcoal dark:text-zinc-100 shadow-xs'
                          : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-electric" /> Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectViewMode('raw')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition flex items-center gap-1 cursor-pointer ${
                        inspectViewMode === 'raw'
                          ? 'bg-white dark:bg-zinc-900 text-charcoal dark:text-zinc-100 shadow-xs'
                          : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200'
                      }`}
                    >
                      <Code className="w-3 h-3 text-steel" /> Raw JSON
                    </button>
                  </div>
                </div>

                {inspectViewMode === 'friendly' ? (
                  /* Dynamic User-Friendly View */
                  (() => {
                    const metadata = inspectRecord.metadata || {};
                    const noteText = metadata.note || metadata.return_notes || metadata.maintenance_notes || metadata.notes;
                    const condition = metadata.condition || metadata.return_condition;
                    const status = metadata.status;
                    const updatedFields: string[] = Array.isArray(metadata.updated_fields) ? metadata.updated_fields : [];
                    const omittedKeys = new Set([
                      'note', 'return_notes', 'maintenance_notes', 'notes', 
                      'condition', 'return_condition', 'status', 'updated_fields',
                      'client_id', 'tal_client_id', 'tenant_id', 'admin_id', 'tal_admin_id'
                    ]);
                    const propertyEntries = Object.entries(metadata).filter(([k]) => !omittedKeys.has(k));

                    if (Object.keys(metadata).length === 0) {
                      return (
                        <div className="p-6 rounded-xl bg-paper/60 dark:bg-zinc-800/40 border border-dashed border-ash dark:border-zinc-700 text-center">
                          <p className="text-xs text-steel dark:text-zinc-400">No structured metadata recorded for this event.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3 font-sans text-xs">
                        {/* Inspection / Return Note Banner */}
                        {noteText && (
                          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                Inspection / Return Note
                              </span>
                              {condition && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${
                                  condition === 'excellent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                                  condition === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                                  condition === 'fair' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                }`}>
                                  <Shield className="w-3 h-3" /> Condition: {String(condition).replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-charcoal dark:text-zinc-100 italic bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 leading-relaxed">
                              "{noteText}"
                            </p>
                          </div>
                        )}

                        {/* Condition & Status Row (when no note banner is active) */}
                        {(!noteText && (condition || status)) && (
                          <div className="grid grid-cols-2 gap-2">
                            {condition && (
                              <div className="p-2.5 rounded-xl bg-paper dark:bg-zinc-900/60 border border-ash dark:border-zinc-800 space-y-1">
                                <span className="text-[10px] font-medium text-steel dark:text-zinc-500 uppercase tracking-wider block">Condition</span>
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                                  condition === 'excellent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                                  condition === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                                  condition === 'fair' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                }`}>
                                  <Shield className="w-3 h-3" /> {String(condition).replace('_', ' ')}
                                </span>
                              </div>
                            )}
                            {status && (
                              <div className="p-2.5 rounded-xl bg-paper dark:bg-zinc-900/60 border border-ash dark:border-zinc-800 space-y-1">
                                <span className="text-[10px] font-medium text-steel dark:text-zinc-500 uppercase tracking-wider block">Status</span>
                                <div className="text-xs font-semibold capitalize text-charcoal dark:text-zinc-200 flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${
                                    status === 'available' || status === 'confirmed' || status === 'paid' ? 'bg-vividGreen' :
                                    status === 'on_shoot' || status === 'active' ? 'bg-electric' : 'bg-tangerine'
                                  }`} />
                                  {String(status).replace('_', ' ')}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Modified Attributes Chips */}
                        {updatedFields.length > 0 && (
                          <div className="p-3 rounded-xl bg-paper dark:bg-zinc-900/60 border border-ash dark:border-zinc-800 space-y-1.5">
                            <span className="text-[10px] font-bold text-steel dark:text-zinc-500 uppercase tracking-wider block">
                              Attributes Modified
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {updatedFields.map((field, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-electric text-[11px] font-mono">
                                  {field.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dynamic Property Entries Grid */}
                        {propertyEntries.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {propertyEntries.map(([key, val]) => {
                              const friendlyKey = key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, l => l.toUpperCase());

                              let renderedVal: React.ReactNode = String(val ?? 'N/A');
                              if (typeof val === 'boolean') {
                                renderedVal = (
                                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                    val ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                  }`}>
                                    {val ? 'Yes' : 'No'}
                                  </span>
                                );
                              } else if (Array.isArray(val)) {
                                renderedVal = (
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {val.map((item, i) => (
                                      <span key={i} className="px-1.5 py-0.5 bg-paper dark:bg-zinc-800 text-[10px] rounded border border-ash dark:border-zinc-700 font-mono">
                                        {String(item)}
                                      </span>
                                    ))}
                                  </div>
                                );
                              } else if (typeof val === 'number') {
                                if (key.includes('cost') || key.includes('amount') || key.includes('rate') || key.includes('price')) {
                                  renderedVal = <span className="font-mono font-semibold">₹{Number(val).toLocaleString()}</span>;
                                } else {
                                  renderedVal = <span className="font-mono font-semibold">{val}</span>;
                                }
                              } else if (typeof val === 'object' && val !== null) {
                                renderedVal = (
                                  <pre className="text-[10px] bg-paper dark:bg-zinc-800 p-1.5 rounded border border-ash dark:border-zinc-700 font-mono overflow-x-auto">
                                    {JSON.stringify(val, null, 2)}
                                  </pre>
                                );
                              } else if (key.endsWith('_id') || key === 'id') {
                                renderedVal = <span className="font-mono text-steel dark:text-zinc-400 text-[11px] truncate block">{String(val)}</span>;
                              } else if (key === 'code') {
                                renderedVal = <span className="dub-badge-blue text-[10px] font-mono">{String(val)}</span>;
                              }

                              return (
                                <div key={key} className="p-2.5 rounded-xl bg-paper dark:bg-zinc-900/60 border border-ash dark:border-zinc-800 space-y-0.5">
                                  <span className="text-[10px] font-medium text-steel dark:text-zinc-500 uppercase tracking-wider block">
                                    {friendlyKey}
                                  </span>
                                  <div className="text-xs font-semibold text-charcoal dark:text-zinc-200 break-words">
                                    {renderedVal}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* Raw Developer JSON View */
                  <pre className="p-3.5 bg-zinc-950 text-emerald-400 rounded-xl border border-zinc-800 overflow-x-auto text-[11px] font-mono leading-relaxed">
                    {(() => {
                      const safeMeta = { ...(inspectRecord.metadata || {}) };
                      delete safeMeta.client_id;
                      delete safeMeta.tal_client_id;
                      delete safeMeta.tenant_id;
                      return JSON.stringify(safeMeta, null, 2);
                    })()}
                  </pre>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-ash dark:border-zinc-800 bg-paper/30 dark:bg-zinc-900/30 flex justify-end">
              <button
                onClick={() => setInspectRecord(null)}
                className="dub-btn-secondary text-xs px-3 py-1.5 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
