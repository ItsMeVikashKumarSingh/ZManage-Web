import React, { useState } from 'react';
import { 
  Camera, Calendar, Users, DollarSign, Smartphone, Settings, 
  Layers, LogOut, ChevronDown, ChevronLeft, ChevronRight, Bell, Search, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { InventoryView } from './views/InventoryView';
import { ScheduleView } from './views/ScheduleView';
import { CrewView } from './views/CrewView';
import { PayoutsView } from './views/PayoutsView';
import { SettingsView } from './views/SettingsView';
import { MobileCrewPass } from './MobileCrewPass';

interface DashboardLayoutProps {
  clientName: string;
  projectName?: string;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ clientName, projectName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'schedule' | 'crew' | 'payouts' | 'mobile'>('inventory');
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('zmanage_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('zmanage_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems = [
    { id: 'inventory', label: 'Equipment Vault', icon: Camera },
    { id: 'schedule', label: 'Shoot Timeline', icon: Calendar },
    { id: 'crew', label: 'Crew & Onboarding', icon: Users },
    { id: 'payouts', label: 'Worker Payouts', icon: DollarSign },
    { id: 'mobile', label: 'Mobile Crew Pass', icon: Smartphone },
  ];

  const displayName = projectName || clientName || 'Aura Studios';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex">
      {/* Sidebar: Collapsible Dub App Shell */}
      <aside className={`border-r border-ash bg-white flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-300 ease-in-out relative ${
        collapsed ? 'w-16 p-2.5' : 'w-60 p-4'
      }`}>
        <div className="space-y-5">
          {/* Workspace Switcher & Collapse Header */}
          <div className="flex items-center justify-between gap-2">
            {!collapsed ? (
              <div 
                onClick={toggleCollapsed}
                className="flex-1 p-2 rounded-xl border border-ash bg-paper flex items-center justify-between hover:border-smoke transition cursor-pointer overflow-hidden"
                title="Click to collapse sidebar"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-charcoal text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {initial}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-charcoal truncate">{displayName}</div>
                    <div className="text-[10px] text-fog font-mono truncate">{projectName ? clientName : 'Pro Operations'}</div>
                  </div>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-fog shrink-0 hover:text-charcoal transition-colors" />
              </div>
            ) : (
              <button
                onClick={toggleCollapsed}
                className="w-full h-10 rounded-xl border border-ash bg-paper hover:bg-smoke/10 flex items-center justify-center transition cursor-pointer"
                title="Expand sidebar"
              >
                <div className="w-7 h-7 rounded-lg bg-charcoal text-white flex items-center justify-center font-bold text-xs">
                  {initial}
                </div>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] font-semibold uppercase tracking-wider text-fog px-2 mb-2">
                Resource Operations
              </div>
            )}
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-lg text-xs font-medium transition ${
                    collapsed ? 'justify-center p-2.5' : 'px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-paper text-charcoal font-semibold border border-ash'
                      : 'text-steel hover:text-charcoal hover:bg-paper/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-electric' : 'text-fog'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile, Collapse Button & Logout */}
        <div className="pt-3 border-t border-ash space-y-2">
          {!collapsed ? (
            <>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-vividGreen" />
                  <span className="text-[11px] font-mono text-steel">RMS Active</span>
                </div>
                <button
                  onClick={toggleCollapsed}
                  title="Collapse sidebar"
                  className="p-1 rounded hover:bg-paper text-fog hover:text-charcoal transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-paper text-xs text-steel hover:text-charcoal transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-paper border border-ash flex items-center justify-center text-[10px] font-semibold text-charcoal">
                    VI
                  </div>
                  <span className="font-medium">Sign Out</span>
                </div>
                <LogOut className="w-3.5 h-3.5 text-fog" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleCollapsed}
                title="Expand sidebar"
                className="w-full h-8 rounded-lg hover:bg-paper flex items-center justify-center text-fog hover:text-charcoal transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="w-full h-8 rounded-lg hover:bg-paper flex items-center justify-center text-steel hover:text-charcoal transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Header */}
        <header className="h-14 border-b border-ash bg-white px-6 flex items-center justify-between shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-steel font-medium">{displayName}</span>
            <span className="text-ash">/</span>
            <span className="text-charcoal font-semibold capitalize">{activeTab}</span>
          </div>

          {/* Quick Links & Status Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-ash bg-paper text-[11px] font-mono text-steel">
              <span className="w-1.5 h-1.5 rounded-full bg-vividGreen" />
              Live Operations
            </div>

            {/* Mobile Nav Select */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={e => setActiveTab(e.target.value as any)}
                className="dub-input text-xs py-1"
              >
                {navItems.map(n => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* View Surface */}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto overflow-y-auto">
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'crew' && <CrewView />}
          {activeTab === 'payouts' && <PayoutsView />}
          {activeTab === 'mobile' && <MobileCrewPass />}
        </main>
      </div>
    </div>
  );
};
