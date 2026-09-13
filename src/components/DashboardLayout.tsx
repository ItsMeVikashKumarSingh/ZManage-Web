import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BarChart3, Package, Calendar, Users, DollarSign, 
  LogOut, ChevronDown, ChevronLeft, ChevronRight, Bell, Search, 
  ExternalLink, ShieldCheck, Check, FolderKanban, Ticket,
  Layers, Boxes, Building2, Sparkles
} from 'lucide-react';
import { InventoryView } from './views/InventoryView';
import { ScheduleView } from './views/ScheduleView';
import { CrewView } from './views/CrewView';
import { PayoutsView } from './views/PayoutsView';
import { AnalyticsView } from './views/AnalyticsView';
import { BookingsView } from './views/BookingsView';
import { LogsView } from './views/LogsView';
import { ZorvikAiView } from './views/ZorvikAiView';
import { RmsDisabledPage } from './RmsDisabledPage';
import { ThemeToggle } from './ThemeToggle';
import { StudioAiCopilotModal } from './StudioAiCopilotModal';
import { api, ProjectRecord } from '../lib/api';

interface DashboardLayoutProps {
  clientName: string;
  projectName?: string;
  projectId?: string;
  onLogout: () => void;
  onSwitchProject?: (project: ProjectRecord) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  clientName, 
  projectName, 
  projectId,
  onLogout,
  onSwitchProject 
}) => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const validTabs = [
    'ai', 'analytics', 'bookings', 'schedule', 
    'inventory', 'kits', 'consumables', 'vaults', 
    'crew', 'payouts', 'logs'
  ] as const;
  type TabType = typeof validTabs[number];

  const activeTab: TabType = (tab && (validTabs as readonly string[]).includes(tab))
    ? (tab as TabType)
    : 'analytics';

  const handleTabChange = (nextTab: string) => {
    navigate(`/dashboard/${nextTab}`);
  };
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('zmanage_sidebar_collapsed') === 'true';
  });

  // Dynamic Multi-Tenant Projects Dropdown
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [showProjectMenu, setShowProjectMenu] = useState<boolean>(false);
  const [currentProjectId, setCurrentProjectId] = useState<string>(projectId || '');
  const [currentProjectName, setCurrentProjectName] = useState<string>(projectName || '');
  const [isVerifyingAccess, setIsVerifyingAccess] = useState<boolean>(true);
  const [isRmsDisabled, setIsRmsDisabled] = useState<boolean>(false);
  const [showAiCopilot, setShowAiCopilot] = useState<boolean>(false);

  useEffect(() => {
    const targetProjId = projectId || currentProjectId;

    Promise.all([
      api.verifyAccess(targetProjId),
      api.getClientProjects()
    ])
      .then(([accessRes, projs]) => {
        const available = (projs && projs.length > 0) ? projs : (accessRes.availableProjects || []);
        setProjects(available);

        if (!accessRes.hasAccess || !accessRes.rmsEnabled) {
          setIsRmsDisabled(true);
        } else {
          setIsRmsDisabled(false);
          if (accessRes.projectId) {
            setCurrentProjectId(accessRes.projectId);
          }
          if (accessRes.projectName) {
            setCurrentProjectName(accessRes.projectName);
          }
        }
      })
      .catch(() => {
        setIsRmsDisabled(true);
      })
      .finally(() => {
        setIsVerifyingAccess(false);
      });
  }, [projectId]);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('zmanage_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleSelectProject = (p: ProjectRecord) => {
    setCurrentProjectId(p.id);
    setCurrentProjectName(p.name);
    setShowProjectMenu(false);
    setIsRmsDisabled(false);

    // Update active session in localStorage
    const stored = localStorage.getItem('zmanage_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.projectId = p.id;
        parsed.tenantId = p.id;
        parsed.projectName = p.name;
        localStorage.setItem('zmanage_session', JSON.stringify(parsed));
      } catch {}
    }

    if (onSwitchProject) {
      onSwitchProject(p);
    }
  };

  const navSections = [
    {
      group: 'Intelligence',
      items: [
        { id: 'ai', label: 'Zorvik AI', icon: Sparkles },
      ]
    },
    {
      group: 'Operations',
      items: [
        { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
        { id: 'bookings', label: 'Client Bookings', icon: Ticket },
        { id: 'schedule', label: 'Operations Timeline', icon: Calendar },
      ]
    },
    {
      group: 'Inventory & Logistics',
      items: [
        { id: 'inventory', label: 'Hardware Assets', icon: Package },
        { id: 'kits', label: 'Equipment Kits & Bundles', icon: Layers },
        { id: 'consumables', label: 'Consumables Stock', icon: Boxes },
        { id: 'vaults', label: 'Storage Vaults & Hubs', icon: Building2 },
      ]
    },
    {
      group: 'Workforce & Finance',
      items: [
        { id: 'crew', label: 'Workforce & Team', icon: Users },
        { id: 'payouts', label: 'Compensation Ledger', icon: DollarSign },
      ]
    },
    {
      group: 'Security',
      items: [
        { id: 'logs', label: 'Security & Audit Logs', icon: ShieldCheck },
      ]
    }
  ];

  const navItems = navSections.flatMap(s => s.items);

  const displayName = currentProjectName || projectName || clientName || 'Enterprise Operations';
  const initial = displayName.charAt(0).toUpperCase();

  // Verification loading state
  if (isVerifyingAccess) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-charcoal animate-pulse flex items-center justify-center text-white font-bold text-xs">
            Z
          </div>
          <span className="text-xs text-steel font-mono">Verifying operational access...</span>
        </div>
      </div>
    );
  }

  // If RMS is not enabled for this project, show the dedicated access restriction page
  if (isRmsDisabled || (projects.length === 0 && !currentProjectId)) {
    return (
      <RmsDisabledPage
        clientName={clientName}
        projectName={currentProjectName || projectName}
        availableProjects={projects}
        onSwitchProject={(p) => {
          setIsRmsDisabled(false);
          handleSelectProject(p);
        }}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-[#09090b] text-charcoal dark:text-zinc-100 flex">
      {/* Sidebar: Dedicated, Fixed-Height, Visually Separated Navigation Rail */}
      <aside className={`h-screen sticky top-0 self-start z-30 border-r border-ash dark:border-zinc-800 bg-white dark:bg-[#0e0e12] flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-300 ease-in-out shadow-[1px_0_4px_-1px_rgba(0,0,0,0.04)] ${
        collapsed ? 'w-16 p-2.5' : 'w-60 p-4'
      }`}>
        <div className="space-y-5 overflow-y-auto">
          {/* Workspace Switcher & Collapse Header */}
          <div className="relative">
            {!collapsed ? (
              <div className="flex items-center gap-1.5">
                <div 
                  onClick={() => setShowProjectMenu(!showProjectMenu)}
                  className="flex-1 min-w-0 p-2 rounded-xl border border-ash dark:border-zinc-800 bg-paper dark:bg-zinc-900/80 flex items-center justify-between hover:border-smoke dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer overflow-hidden shadow-xs"
                  title="Switch Workspace / Project"
                >
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-charcoal dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {initial}
                    </div>
                    <div className="truncate text-left min-w-0">
                      <div className="text-xs font-semibold text-charcoal dark:text-zinc-100 truncate">{displayName}</div>
                      <div className="text-[10px] text-fog dark:text-zinc-400 font-mono truncate">{clientName || 'Operations Workspace'}</div>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-fog dark:text-zinc-400 shrink-0 ml-1 hover:text-charcoal dark:hover:text-zinc-100 transition-colors" />
                </div>
                <button
                  onClick={toggleCollapsed}
                  title="Collapse sidebar"
                  className="p-2 rounded-xl border border-transparent hover:border-ash dark:hover:border-zinc-700 hover:bg-paper dark:hover:bg-zinc-800 text-fog hover:text-charcoal dark:hover:text-zinc-100 transition cursor-pointer shrink-0"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={toggleCollapsed}
                  title="Expand sidebar"
                  className="w-full h-8 rounded-xl border border-transparent hover:border-ash dark:hover:border-zinc-700 hover:bg-paper dark:hover:bg-zinc-800 flex items-center justify-center text-fog hover:text-charcoal dark:hover:text-zinc-100 transition cursor-pointer"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setCollapsed(false);
                    setShowProjectMenu(true);
                  }}
                  className="w-full h-10 rounded-xl border border-ash dark:border-zinc-800 bg-paper dark:bg-zinc-900 hover:bg-smoke/10 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
                  title="Switch project"
                >
                  <div className="w-7 h-7 rounded-lg bg-charcoal dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xs">
                    {initial}
                  </div>
                </button>
              </div>
            )}

            {/* Dropdown Menu for Switching Workspaces */}
            {showProjectMenu && !collapsed && (
              <div className="absolute top-12 left-0 right-0 z-50 bg-white dark:bg-[#121215] border border-ash dark:border-zinc-800 shadow-floating rounded-xl p-2 space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-fog dark:text-zinc-400 px-2 py-1">
                  RMS Projects ({projects.length})
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-ash dark:divide-zinc-800">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                        p.id === currentProjectId
                          ? 'bg-paper dark:bg-zinc-800 font-semibold text-charcoal dark:text-zinc-100'
                          : 'hover:bg-paper/60 dark:hover:bg-zinc-850 text-steel dark:text-zinc-400'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-xs font-medium text-charcoal dark:text-zinc-100 truncate">{p.name}</div>
                        <div className="text-[10px] text-fog dark:text-zinc-500 font-mono uppercase">{p.category || p.websiteType || 'Managed'}</div>
                      </div>
                      {p.id === currentProjectId && (
                        <Check className="w-3.5 h-3.5 text-vividGreen shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items Grouped by Operational Area */}
          <nav className="space-y-3">
            {navSections.map((section, idx) => (
              <div key={section.group} className="space-y-1">
                {!collapsed && (
                  <div className={`text-[10px] font-semibold uppercase tracking-wider text-fog dark:text-zinc-500 px-2 ${idx > 0 ? 'mt-2.5' : ''} mb-1`}>
                    {section.group}
                  </div>
                )}
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        collapsed ? 'justify-center p-2.5' : 'px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-paper dark:bg-zinc-800 text-charcoal dark:text-zinc-100 font-semibold border border-ash dark:border-zinc-700 shadow-2xs'
                          : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100 hover:bg-paper/60 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-electric dark:text-blue-400' : 'text-fog dark:text-zinc-500'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="pt-3 border-t border-ash dark:border-zinc-800 space-y-2">
          {!collapsed ? (
            <>
              {/* Theme Toggle (Expanded) */}
              <ThemeToggle variant="expanded" />

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 text-xs text-steel dark:text-zinc-300 hover:text-charcoal dark:hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-paper dark:bg-zinc-800 border border-ash dark:border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-charcoal dark:text-zinc-100">
                    {clientName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">Sign Out</span>
                </div>
                <LogOut className="w-3.5 h-3.5 text-fog dark:text-zinc-400" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle variant="compact" />
              <button
                onClick={onLogout}
                title="Sign Out"
                className="w-full h-8 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 flex items-center justify-center text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-white transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Operational Bar */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0c0c0f]/95 backdrop-blur-md border-b border-ash dark:border-zinc-800/80 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg border border-ash dark:border-zinc-800 hover:bg-paper dark:hover:bg-zinc-800 text-steel dark:text-zinc-300 transition"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <h1 className="text-sm font-semibold font-satoshi capitalize text-charcoal dark:text-zinc-100">
              {navItems.find(i => i.id === activeTab)?.label || 'Operations'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiCopilot(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium transition cursor-pointer shadow-xs"
              title="Open Zorvik-AI Studio Director Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
              <span className="hidden sm:inline">Ask AI Copilot</span>
            </button>

            <ThemeToggle variant="compact" />

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-ash dark:border-zinc-800 bg-paper dark:bg-zinc-900 text-[11px] font-mono text-steel dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-vividGreen" />
              Live Operations
            </div>

            {/* Mobile Nav Select */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={e => handleTabChange(e.target.value)}
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
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'ai' && (
            <ZorvikAiView projectName={currentProjectName} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsView 
              projectName={currentProjectName}
              onNavigateTab={tab => handleTabChange(tab)} 
            />
          )}
          {activeTab === 'bookings' && <BookingsView />}
          {(activeTab === 'inventory' || activeTab === 'kits' || activeTab === 'consumables' || activeTab === 'vaults') && (
            <InventoryView 
              initialSubTab={
                activeTab === 'kits' ? 'kits' :
                activeTab === 'consumables' ? 'consumables' :
                activeTab === 'vaults' ? 'vaults' : 'assets'
              }
              onSubTabChange={(sub) => {
                const map: Record<string, string> = {
                  assets: 'inventory',
                  kits: 'kits',
                  consumables: 'consumables',
                  vaults: 'vaults'
                };
                handleTabChange(map[sub] || 'inventory');
              }}
            />
          )}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'crew' && <CrewView />}
          {activeTab === 'payouts' && <PayoutsView />}
          {activeTab === 'logs' && <LogsView />}
        </main>
      </div>

      {/* Global Zorvik-AI Studio Director Copilot Modal */}
      <StudioAiCopilotModal
        isOpen={showAiCopilot}
        onClose={() => setShowAiCopilot(false)}
        projectName={currentProjectName}
      />
    </div>
  );
};
