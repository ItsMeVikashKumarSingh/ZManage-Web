import React, { useEffect } from 'react';
import { ArrowLeft, FileText, CheckCircle2, ShieldAlert, Cpu, Award } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface TermsOfServicePageProps {
  onBackToHome: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBackToHome }) => {
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
            <FileText className="w-3.5 h-3.5 text-tally" />
            Master Service Agreement & SLA
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight text-charcoal leading-tight">
            Terms of Service & Operational SLA
          </h1>
          <p className="text-sm font-mono text-steel">
            VERSION 2.4 · EFFECTIVE SEPTEMBER 2026 · GOVERNING PRODUCTION SUBSCRIBERS
          </p>
        </div>

        {/* Executive Guarantee Card */}
        <div className="paper-card p-6 space-y-3 bg-paper/60">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-charcoal tracking-wider">
            <Award className="w-4 h-4 text-tally" /> Service Guarantee & Platform Scope
          </div>
          <p className="text-sm text-steel leading-relaxed">
            ZManage is an enterprise-grade studio operations, equipment inventory, and resource dispatch platform operated by Zorvik Tech Inc. These terms govern the deployment of the Asset Vault, Operations Calendar, Crew Dispatch, and Payouts Ledger across your studio workspaces, production fleets, and contractor crews.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-steel leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tally" /> 1. Studio Workspace License
            </h2>
            <p>
              Upon account provisioning, Zorvik Tech grants your studio a commercial license to configure internal operations, catalog hardware gear, schedule shoots, and track freelance compensation. Studio administrators are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-steel font-mono">
              <li>Managing team access permissions (Admin vs Operations Coordinator).</li>
              <li>Maintaining accurate gear serial numbers and condition audit notes.</li>
              <li>Ensuring workspace login credentials remain secure.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-tally" /> 2. Hardware Custody & Condition Audits
            </h2>
            <p>
              ZManage provides the digital custody log (check-out timestamps, assigned kit bags, battery health percentages, and condition audit notes). However:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-steel font-mono">
              <li>Physical equipment insurance, custody agreements, and transit risk remain between your production house and individual crew members.</li>
              <li>ZManage is a software management platform, not an insurer or physical courier; audit logs serve as timestamped documentation for internal accounting and insurance claims.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <Cpu className="w-4 h-4 text-tally" /> 3. Contractor Compensation & Settlement Records
            </h2>
            <p>
              The <strong>Worker Payouts Ledger</strong> enables studio managers to calculate shoot compensation, log Bank UTR tracking numbers, and record settlement proofs. The production studio remains the sole legal payor of record. ZManage provides digital ledgering and status notifications, and does not hold or custody client fiat funds.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal">4. High-Velocity Platform SLA (99.9% Uptime)</h2>
            <p>
              Production call times wait for no one. Zorvik Tech commits to a <strong>99.9% Service Level Agreement</strong> across all core platform features (Shoot calendar conflict verification, Hardware Vault lookups, and Team dispatch). Scheduled maintenance is announced in advance outside of peak shoot hours.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal">5. Term, Data Export & Cancellation</h2>
            <p>
              Studios may cancel their subscription tier at any time. Upon termination, administrators are granted thirty (30) days of access to download complete archives of all equipment logs, shoot timelines, and financial compensation ledgers before permanent workspace closure.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal">6. Inquiries & Corporate Contact</h2>
            <div className="paper-card p-4 font-mono text-xs text-charcoal bg-paper">
              <div>Zorvik Tech Inc. · Corporate Legal Affairs</div>
              <div className="text-steel">Email: legal@zorviktech.com · ops@zorviktech.com</div>
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
