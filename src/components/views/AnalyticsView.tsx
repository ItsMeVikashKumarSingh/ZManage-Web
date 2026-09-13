import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, Users, Package, Calendar, 
  DollarSign, ArrowUpRight, Loader2, Zap, ArrowRight,
  UserPlus, PlusCircle, CreditCard
} from 'lucide-react';
import { api, AnalyticsOverview } from '../../lib/api';

interface AnalyticsViewProps {
  projectName?: string;
  onNavigateTab: (tab: 'bookings' | 'inventory' | 'schedule' | 'crew' | 'payouts' | 'logs') => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projectName, onNavigateTab }) => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getAnalyticsOverview();
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load executive analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [projectName]);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-electric animate-spin" />
        <span className="text-xs text-steel font-medium">Aggregating workspace analytics...</span>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
        <span>{errorMsg || 'Unable to load analytics metrics.'}</span>
        <button onClick={loadAnalytics} className="underline ml-2">Retry</button>
      </div>
    );
  }

  const categoryEntries = Object.entries(data.category_breakdown || {});

  return (
    <div className="space-y-6">
      {/* Header & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-satoshi font-semibold text-charcoal flex items-center gap-2">
            <Activity className="w-5 h-5 text-electric" /> Operational Insights & Analytics
          </h1>
          <p className="text-xs text-steel">
            Real-time fleet utilization, team deployment workload, and financial settlement performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full border border-ash bg-paper text-[11px] font-mono text-steel flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-vividGreen" />
            Live Summary
          </div>
          <button
            onClick={loadAnalytics}
            className="dub-btn-outline text-xs px-3 py-1 hover:bg-paper"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Utilization Tile */}
        <div className="dub-card p-5 bg-white space-y-2 border border-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-steel">Fleet / Product Utilization</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-electric">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-satoshi text-charcoal">
              {data.utilization_rate}%
            </div>
            <span className="text-[11px] text-fog font-mono">
              {data.in_use_assets} / {data.total_assets} active
            </span>
          </div>
          <div className="w-full h-1.5 bg-paper rounded-full overflow-hidden">
            <div 
              className="h-full bg-electric rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, data.utilization_rate))}%` }}
            />
          </div>
        </div>

        {/* Total Assets / Products */}
        <div className="dub-card p-5 bg-white space-y-2 border border-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-steel">Managed Items & Products</span>
            <span className="p-1.5 rounded-lg bg-paper text-charcoal">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-satoshi text-charcoal">
            {data.total_assets}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-vividGreen">{data.available_assets} available</span>
            <span className="text-fog">•</span>
            <span className="text-tangerine">{data.maintenance_assets} repair</span>
          </div>
        </div>

        {/* Workforce */}
        <div className="dub-card p-5 bg-white space-y-2 border border-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-steel">Team & Contractors</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-vividGreen">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-satoshi text-charcoal">
            {data.total_workers}
          </div>
          <div className="text-[11px] text-fog">
            {data.active_workers} active on roster
          </div>
        </div>

        {/* Financials */}
        <div className="dub-card p-5 bg-white space-y-2 border border-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-steel">Settled vs Pending Pay</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-tangerine">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-satoshi text-charcoal">
            ₹{Number(data.paid_payouts).toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-tangerine">
            ₹{Number(data.pending_payouts).toLocaleString()} pending UTR
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Operational Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="lg:col-span-2 dub-card p-6 bg-white border border-ash space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ash">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Category & Department Inventory</h3>
              <p className="text-xs text-steel">Distribution of physical items registered under this workspace.</p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-electric hover:underline flex items-center gap-1 font-medium"
            >
              Open Vault <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-steel">
              No equipment or products added to this workspace yet.
            </div>
          ) : (
            <div className="space-y-3">
              {categoryEntries.map(([category, count]) => {
                const pct = data.total_assets > 0 ? Math.round((count / data.total_assets) * 100) : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-charcoal capitalize flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-electric" />
                        {category}
                      </span>
                      <span className="font-mono text-steel">
                        {count} items ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-paper rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-charcoal rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions Console */}
        <div className="dub-card p-6 bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ash dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Quick Actions
              </h3>
              <p className="text-xs text-steel dark:text-zinc-400">
                Fast-path operational triggers across studio workspaces.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-paper dark:bg-zinc-800 border border-ash dark:border-zinc-700 text-steel dark:text-zinc-400">
              5 Triggers
            </span>
          </div>

          <div className="space-y-2">
            {[
              {
                title: 'Schedule Shoot & Dispatch',
                subtitle: 'Allocate gear & assign crew roster',
                tab: 'schedule' as const,
                icon: Calendar,
                badgeClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
                iconColor: 'text-electric'
              },
              {
                title: 'New Offline Booking',
                subtitle: 'Record walk-in or bespoke contract',
                tab: 'bookings' as const,
                icon: PlusCircle,
                badgeClass: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60',
                iconColor: 'text-purple-600 dark:text-purple-400'
              },
              {
                title: 'Register Equipment / Gear',
                subtitle: 'Add cameras, lenses & vault assets',
                tab: 'inventory' as const,
                icon: Package,
                badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
                iconColor: 'text-vividGreen'
              },
              {
                title: 'Onboard Team Member',
                subtitle: 'Add contractor or 1-tap workforce sync',
                tab: 'crew' as const,
                icon: UserPlus,
                badgeClass: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60',
                iconColor: 'text-sky-600 dark:text-sky-400'
              },
              {
                title: 'Settle Shift Payouts',
                subtitle: 'Reconcile ledger & record bank UTR',
                tab: 'payouts' as const,
                icon: CreditCard,
                badgeClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
                iconColor: 'text-tangerine'
              }
            ].map(action => (
              <button
                key={action.title}
                onClick={() => onNavigateTab(action.tab)}
                className="w-full group p-2.5 rounded-xl bg-paper/50 hover:bg-paper dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 border border-ash/80 hover:border-charcoal/20 dark:border-zinc-800 dark:hover:border-zinc-700 transition flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${action.badgeClass}`}>
                    <action.icon className={`w-4 h-4 ${action.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-charcoal dark:text-zinc-100 group-hover:text-electric transition truncate">
                      {action.title}
                    </div>
                    <div className="text-[11px] text-steel dark:text-zinc-400 truncate">
                      {action.subtitle}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-fog group-hover:text-charcoal dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
