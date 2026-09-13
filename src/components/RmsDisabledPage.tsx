import React from 'react';
import { ShieldAlert, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { ProjectRecord } from '../lib/api';

interface RmsDisabledPageProps {
  clientName?: string;
  projectName?: string;
  availableProjects?: ProjectRecord[];
  onSwitchProject?: (project: ProjectRecord) => void;
  onLogout?: () => void;
}

export const RmsDisabledPage: React.FC<RmsDisabledPageProps> = ({
  clientName = 'Client',
  projectName,
  availableProjects = [],
  onSwitchProject,
  onLogout
}) => {
  const handleReturnToClientPortal = () => {
    window.location.href = 'http://localhost:3000/dashboard';
  };

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex flex-col justify-center items-center p-6 relative">
      <div className="absolute inset-0 bg-dotted-grid opacity-50 pointer-events-none" />

      <div className="dub-card shadow-floating w-full max-w-md p-8 bg-white border border-ash text-center space-y-6 relative z-10">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-fog">
            Access Restricted
          </span>
          <h1 className="text-xl font-satoshi font-bold text-charcoal">
            Resource Management Not Enabled
          </h1>
          <p className="text-xs text-steel leading-relaxed">
            {projectName ? (
              <>
                The project <strong className="text-charcoal font-medium">"{projectName}"</strong> does not have Resource Management System (RMS / ZManage) enabled.
              </>
            ) : (
              <>
                None of your registered projects under <strong className="text-charcoal font-medium">{clientName}</strong> have Resource Management System enabled.
              </>
            )}
          </p>
          <p className="text-[11px] text-fog">
            Please contact Zorvik Tech to enable Resource Management System (RMS) for this project.
          </p>
        </div>

        {/* Alternate Available Projects Switcher */}
        {availableProjects.length > 0 && onSwitchProject && (
          <div className="text-left space-y-2 pt-2 border-t border-ash">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-fog block">
              Active RMS Workspaces ({availableProjects.length})
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {availableProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSwitchProject(p)}
                  className="p-2.5 rounded-xl border border-ash bg-paper hover:border-smoke hover:bg-white transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Layers className="w-4 h-4 text-electric shrink-0" />
                    <span className="text-xs font-medium text-charcoal truncate">{p.name}</span>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] font-semibold text-electric flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Switch <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={handleReturnToClientPortal}
            className="dub-btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Client Dashboard
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="dub-btn-outline w-full text-xs py-2 text-steel hover:text-charcoal"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-ash flex items-center justify-center gap-1.5 text-[11px] text-fog">
          <span>Powered by Zorvik Tech</span>
        </div>
      </div>
    </div>
  );
};
