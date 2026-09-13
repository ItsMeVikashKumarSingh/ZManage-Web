import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Lock, Users, Clock, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SecurityPageProps {
  onBackToHome: () => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ onBackToHome }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex flex-col selection:bg-amber-500/30 selection:text-charcoal">
      {/* Editorial Navigation */}
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-ash px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-steel hover:text-charcoal transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to ZManage
          </button>

          <div className="flex items-center gap-2">
            <img 
              src="/zmanage-app-icon.png" 
              alt="ZManage" 
              className="w-7 h-7 rounded-md object-contain shadow-xs" 
            />
            <span className="font-semibold text-sm tracking-tight text-charcoal font-serif">
              ZManage
            </span>
          </div>

          <ThemeToggle variant="compact" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        {/* Title Header */}
        <div className="space-y-3 border-b border-ash pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-ash bg-paper text-[11px] font-mono uppercase tracking-wider text-steel">
            <ShieldCheck className="w-3.5 h-3.5 text-tally" />
            Platform Trust & Security
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight text-charcoal leading-tight">
            Security, Privacy & Studio Trust
          </h1>
          <p className="text-sm font-mono text-steel">
            ENTERPRISE PROTECTION · DATA SOVEREIGNTY · 99.9% OPERATIONAL SLA
          </p>
        </div>

        {/* Highlight Trust Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="paper-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-paper border border-ash flex items-center justify-center text-tally">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="font-serif font-medium text-base text-charcoal">Studio Tenant Isolation</div>
            <p className="text-xs text-steel font-mono leading-relaxed">
              Every production studio operates within its own private workspace with strict data separation guarantees.
            </p>
          </div>

          <div className="paper-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-paper border border-ash flex items-center justify-center text-tally">
              <Lock className="w-4 h-4" />
            </div>
            <div className="font-serif font-medium text-base text-charcoal">Bank-Grade Encryption</div>
            <p className="text-xs text-steel font-mono leading-relaxed">
              All financial settlement records, contractor verification details, and studio assets are protected with 256-bit encryption.
            </p>
          </div>

          <div className="paper-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-paper border border-ash flex items-center justify-center text-tally">
              <Clock className="w-4 h-4" />
            </div>
            <div className="font-serif font-medium text-base text-charcoal">Activity Audit Trails</div>
            <p className="text-xs text-steel font-mono leading-relaxed">
              Complete chronological records log equipment custody transfers, condition updates, and compensation status transitions.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-steel leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <Users className="w-4 h-4 text-tally" /> 1. Granular Role-Based Permissions
            </h2>
            <p>
              ZManage provides four intuitive access tiers to keep studio operations organized and confidential:
            </p>
            <div className="paper-card p-4 space-y-2 bg-paper/60 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-ash pb-1.5">
                <span className="font-semibold text-charcoal">Studio Owner / Executive</span>
                <span className="text-tally">Full Platform Control & Financial Settlement</span>
              </div>
              <div className="flex items-center justify-between border-b border-ash pb-1.5">
                <span className="font-semibold text-charcoal">Operations Coordinator</span>
                <span className="text-steel">Timeline Scheduling, Gear Check-out, Crew Roster</span>
              </div>
              <div className="flex items-center justify-between border-b border-ash pb-1.5">
                <span className="font-semibold text-charcoal">Lead Equipment Technician</span>
                <span className="text-steel">Condition Audits, Battery Health Logging, Barcode Scans</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal">Studio Production Staff</span>
                <span className="text-steel">Shoot Bookings, Client Inquiries, Schedule Visibility</span>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tally" /> 2. Automated Conflict Prevention Guard
            </h2>
            <p>
              ZManage&rsquo;s scheduling engine cross-checks all active assignments in real time. When assigning camera packages or team leads to a shoot, the platform automatically ensures that no overlapping booking conflicts exist, eliminating double-booked gear on shoot day.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tally" /> 3. Security Support & Inquiries
            </h2>
            <p>
              For security questions, privacy inquiries, or enterprise compliance requests, our security team is available to assist:
            </p>
            <div className="paper-card p-4 font-mono text-xs text-charcoal bg-paper">
              <div>Zorvik Tech Security & Trust Desk</div>
              <div className="text-steel">Email: security@zorviktech.com · privacy@zorviktech.com</div>
              <div className="text-steel">Main Website: https://zorviktech.com</div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ash py-6 px-6 text-center text-xs font-mono text-fog bg-paper">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Zorvik Tech Inc. · ZManage Operations Platform</span>
          <button onClick={onBackToHome} className="text-charcoal hover:underline">
            Return to ZManage Homepage
          </button>
        </div>
      </footer>
    </div>
  );
};
