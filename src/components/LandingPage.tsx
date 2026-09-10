import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Sparkles, Layers, Camera, Calendar, Users, DollarSign } from 'lucide-react';

interface LandingPageProps {
  hasActiveSession?: boolean;
  onGoToDashboard?: () => void;
  onNavigateLogin: () => void;
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  hasActiveSession,
  onGoToDashboard,
  onNavigateLogin,
  onEnterDemo
}) => {
  return (
    <div className="min-h-screen bg-canvas text-charcoal flex flex-col relative selection:bg-electric selection:text-white">
      {/* Dub Subtle Dotted Grid Background */}
      <div className="absolute inset-0 bg-dotted-grid opacity-60 pointer-events-none" />

      {/* Top Editorial Navbar */}
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-ash px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center text-white">
              <Layers className="w-4 h-4 text-canvas" />
            </div>
            <span className="font-semibold text-base tracking-tight text-charcoal font-satoshi">
              ZManage
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-steel">
            <a href="#features" className="hover:text-charcoal transition">Features</a>
            <a href="#inventory" className="hover:text-charcoal transition">Equipment Vault</a>
            <a href="#collision" className="hover:text-charcoal transition">Zero-Collision</a>
            <a href="#payouts" className="hover:text-charcoal transition">Payouts</a>
          </nav>

          <div className="flex items-center gap-3">
            {hasActiveSession ? (
              <button
                onClick={onGoToDashboard}
                className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                Go to Console <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onNavigateLogin}
                  className="dub-btn-outline text-xs px-4 py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={onEnterDemo}
                  className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  Live Demo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto w-full text-center space-y-8">
        {/* Signature Dub Floating Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <div className="dub-pill shadow-subtle hover:border-smoke transition">
            <span className="w-2 h-2 rounded-full bg-tangerine" />
            <span className="text-xs font-medium text-charcoal">Equipment Vault</span>
          </div>
          <div className="dub-pill shadow-subtle hover:border-smoke transition">
            <span className="w-2 h-2 rounded-full bg-vividGreen" />
            <span className="text-xs font-medium text-charcoal">Zero-Collision Guard</span>
          </div>
          <div className="dub-pill shadow-subtle hover:border-smoke transition">
            <span className="w-2 h-2 rounded-full bg-lavender" />
            <span className="text-xs font-medium text-charcoal">1-Tap Team Onboarding</span>
          </div>
        </div>

        {/* Hero Satoshi Display Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-satoshi font-medium tracking-tight text-charcoal leading-[1.08]">
            Operations & Equipment Command for Modern Studios.
          </h1>
          <p className="text-lg text-steel max-w-2xl mx-auto leading-relaxed">
            Eliminate double-booked cameras, automate photographer shift dispatch, and manage freelancer compensation in one border-first workspace.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterDemo}
            className="dub-btn-primary text-sm px-6 py-3 rounded-full flex items-center gap-2"
          >
            Launch Studio Console <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateLogin}
            className="dub-btn-outline text-sm px-6 py-3 rounded-full"
          >
            Client Sign In
          </button>
        </div>

        {/* Dub Signature Floating Dashboard Mockup Container */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="dub-card shadow-floating overflow-hidden border border-ash bg-white text-left p-1">
            {/* Mockup Window Controls */}
            <div className="bg-paper px-4 py-3 border-b border-ash flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-ash inline-block" />
                <span className="w-3 h-3 rounded-full bg-ash inline-block" />
                <span className="w-3 h-3 rounded-full bg-ash inline-block" />
                <span className="text-xs font-mono text-fog ml-2">ops.zorvik.tech/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-charcoal border border-ash">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Mockup Workspace Interior */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-canvas">
              {/* Stat 1 */}
              <div className="dub-card p-4 space-y-1">
                <div className="text-xs text-steel font-medium">Available Cameras</div>
                <div className="text-2xl font-bold font-satoshi text-charcoal">8 / 12 Units</div>
                <div className="text-[11px] text-vividGreen font-medium flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for shoot
                </div>
              </div>

              {/* Stat 2 */}
              <div className="dub-card p-4 space-y-1">
                <div className="text-xs text-steel font-medium">Dispatched Crew</div>
                <div className="text-2xl font-bold font-satoshi text-charcoal">6 Photographers</div>
                <div className="text-[11px] text-electric font-medium">3 Shoots today</div>
              </div>

              {/* Stat 3 */}
              <div className="dub-card p-4 space-y-1">
                <div className="text-xs text-steel font-medium">Collision Engine</div>
                <div className="text-2xl font-bold font-satoshi text-charcoal">Active Guard</div>
                <div className="text-[11px] text-steel font-mono">0 double-bookings</div>
              </div>

              {/* Stat 4 */}
              <div className="dub-card p-4 space-y-1">
                <div className="text-xs text-steel font-medium">Pending Payouts</div>
                <div className="text-2xl font-bold font-satoshi text-charcoal">₹48,000</div>
                <div className="text-[11px] text-tangerine font-medium">4 gigs awaiting settlement</div>
              </div>
            </div>

            {/* Quick Demo Launch Strip */}
            <div className="bg-paper p-4 border-t border-ash flex items-center justify-between">
              <span className="text-xs text-steel">Full access to equipment check-out, timeline calendar, and worker payouts.</span>
              <button
                onClick={onEnterDemo}
                className="text-xs font-semibold text-electric hover:underline flex items-center gap-1"
              >
                Open Interactive Console <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto w-full border-t border-ash space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-satoshi font-medium text-charcoal">
            Built for High-Velocity Production Studios
          </h2>
          <p className="text-sm text-steel">
            Every screen is built around 1px borders, dense data scannability, and lightning-fast serverless execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dub-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-paper border border-ash flex items-center justify-center text-charcoal">
              <Camera className="w-5 h-5 text-electric" />
            </div>
            <h3 className="text-base font-semibold text-charcoal font-satoshi">Hardware Asset Vault</h3>
            <p className="text-sm text-steel leading-relaxed">
              Track camera bodies, lenses, and drones by manufacturer serial number, battery count, and physical condition ratings.
            </p>
          </div>

          <div className="dub-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-paper border border-ash flex items-center justify-center text-charcoal">
              <Calendar className="w-5 h-5 text-vividGreen" />
            </div>
            <h3 className="text-base font-semibold text-charcoal font-satoshi">Mathematical Collision Guard</h3>
            <p className="text-sm text-steel leading-relaxed">
              Atomic PostgreSQL stored procedures prevent the same camera or lead photographer from being booked on overlapping wedding events.
            </p>
          </div>

          <div className="dub-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-paper border border-ash flex items-center justify-center text-charcoal">
              <DollarSign className="w-5 h-5 text-tangerine" />
            </div>
            <h3 className="text-base font-semibold text-charcoal font-satoshi">Freelancer Payout Ledger</h3>
            <p className="text-sm text-steel leading-relaxed">
              Auto-calculate shoot day-rates and overtime fees. Settle contractor dues directly with bank UTR and UPI tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ash py-8 px-6 text-center text-xs text-fog bg-paper">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Zorvik Tech Inc. ZManage Operations Platform.</span>
          <div className="flex items-center gap-4 text-steel">
            <a href="https://zorvik.tech" target="_blank" rel="noreferrer" className="hover:text-charcoal">Zorvik Tech</a>
            <a href="https://docs.zorvik.tech" target="_blank" rel="noreferrer" className="hover:text-charcoal">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
