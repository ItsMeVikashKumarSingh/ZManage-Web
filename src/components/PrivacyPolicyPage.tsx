import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Server } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome }) => {
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
            Legal & Privacy Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight text-charcoal leading-tight">
            Privacy Policy & Data Sovereignty
          </h1>
          <p className="text-sm font-mono text-steel">
            LAST REVISED: SEPTEMBER 12, 2026 · APPLICABLE TO ZMANAGE PLATFORM
          </p>
        </div>

        {/* Executive Summary Card */}
        <div className="paper-card p-6 space-y-3 bg-paper/60">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-charcoal tracking-wider">
            <Lock className="w-4 h-4 text-tally" /> Executive Privacy Commitment
          </div>
          <p className="text-sm text-steel leading-relaxed">
            ZManage is an internal operations and resource management platform for creative film, photography, and production studios. Your studio retains 100% ownership and control over all hardware equipment catalogs, shoot schedules, crew rosters, and freelancer settlement records. We never sell, share, or monetize your studio&rsquo;s private operational data.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-steel leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <Database className="w-4 h-4 text-tally" /> 1. Studio Workspace & Data Isolation
            </h2>
            <p>
              Each production studio utilizing ZManage operates within a strictly isolated workspace partition. Data belonging to your studio (equipment serials, crew rates, shoot call-sheets, venue locations) is completely private and accessible only to your authorized studio team members.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-steel font-mono">
              <li>Hardware equipment records and optical condition audits are private to your studio admin team.</li>
              <li>Freelancer payment records and account credentials are encrypted with industry-standard 256-bit encryption.</li>
              <li>Team authentication tokens expire automatically based on your studio security preferences.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <Eye className="w-4 h-4 text-tally" /> 2. Workforce Directory & Roster Data
            </h2>
            <p>
              When studio administrators maintain contractor and crew records in the <strong>Workforce & Team Roster</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-steel font-mono">
              <li><strong>Contact & Identity Details:</strong> Phone numbers, email addresses, and production role classifications are stored solely for operational dispatch and shoot assignment.</li>
              <li><strong>Zero Location Tracking:</strong> ZManage does not monitor or request background location data from production crew or technicians.</li>
              <li><strong>Equipment Custody Records:</strong> Gear assignments during shoot scheduling are logged for internal studio inventory tracking and operational accountability.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal flex items-center gap-2">
              <Server className="w-4 h-4 text-tally" /> 3. Freelancer Compensation & Settlement Records
            </h2>
            <p>
              Freelancer payment data recorded in the <strong>Worker Payouts Ledger</strong> (including Bank UTR numbers, payment dates, and day-rate calculations) is securely logged to support your studio&rsquo;s internal bookkeeping and accounting reconciliations.
            </p>
            <p>
              Technicians and contractors can access their own settlement slips and payment histories directly through their studio point of contact.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal">4. Data Export & Retention</h2>
            <p>
              Your studio owns its data. Studio administrators may at any point download complete data exports of equipment inventory, schedule history, and financial payout ledgers. If your studio ever closes its account, all private workspace records are permanently purged across our systems.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-charcoal">5. Privacy Governance & Contact</h2>
            <p>
              For inquiries regarding data privacy or policy terms, please reach out to our privacy desk:
            </p>
            <div className="paper-card p-4 font-mono text-xs text-charcoal bg-paper">
              <div>Zorvik Tech Privacy Desk</div>
              <div className="text-steel">Email: privacy@zorviktech.com · security@zorviktech.com</div>
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
