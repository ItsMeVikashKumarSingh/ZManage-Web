import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Camera,
  Calendar,
  Users,
  DollarSign,
  ChevronDown,
  Cpu,
  Clock,
  Sparkles,
  QrCode,
  Check
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { ScheduleDemoModal } from './ScheduleDemoModal';

interface LandingPageProps {
  hasActiveSession?: boolean;
  onGoToDashboard?: () => void;
  onNavigateLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  hasActiveSession,
  onGoToDashboard,
  onNavigateLogin
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'vault' | 'calendar' | 'crew' | 'payouts'>('vault');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex flex-col selection:bg-amber-500/30 selection:text-charcoal transition-colors duration-200">
      {/* Editorial Top Navbar with Center Floating Island (Dayos Style) */}
      <header className="sticky top-0 z-50 bg-canvas/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md px-6 py-4 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/zmanage-app-icon.png" 
              alt="ZManage" 
              className="w-8 h-8 rounded-lg object-contain shadow-xs" 
            />
            <span className="font-bold text-lg tracking-tight text-charcoal dark:text-white font-satoshi">
              ZManage
            </span>
          </div>

          {/* Center Floating Pill Island (Dayos Style) */}
          <nav className="hidden lg:flex items-center gap-6 px-7 py-2 rounded-full bg-[#f2efe8]/80 dark:bg-zinc-800/70 border border-[#e4e1d9] dark:border-zinc-700/60 shadow-sm text-[13px] font-medium text-steel dark:text-zinc-300">
            <a href="#workflow" className="hover:text-charcoal dark:hover:text-white transition">Platform</a>
            <a href="#vault" className="hover:text-charcoal dark:hover:text-white transition">Gear Vault</a>
            <a href="#collision" className="hover:text-charcoal dark:hover:text-white transition">Operations</a>
            <a href="#metrics" className="hover:text-charcoal dark:hover:text-white transition">Trust & SLA</a>
            <a href="#faq" className="hover:text-charcoal dark:hover:text-white transition">FAQ</a>
            <button onClick={() => navigate('/privacy')} className="hover:text-charcoal dark:hover:text-white transition">Privacy</button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="compact" />

            {hasActiveSession ? (
              <button
                onClick={onGoToDashboard}
                className="bg-charcoal text-white dark:bg-white dark:text-charcoal hover:opacity-90 rounded-full text-xs font-semibold px-5 py-2.5 shadow-sm transition flex items-center gap-1.5"
              >
                Go to Console <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onNavigateLogin}
                  className="text-xs font-medium text-steel hover:text-charcoal dark:text-zinc-300 dark:hover:text-white px-3 py-1.5 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="bg-charcoal text-white dark:bg-white dark:text-charcoal hover:opacity-90 rounded-full text-xs font-semibold px-5 py-2.5 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  Schedule a Demo
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Super + Monad + Equals) */}
      <section className="relative pt-12 pb-20 px-6 max-w-6xl mx-auto w-full text-center space-y-8">

        {/* Editorial Serif Display Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-[-0.025em] text-charcoal leading-[1.06]">
            Operations & equipment command for modern production studios.
          </h1>
          <p className="text-base sm:text-lg text-steel max-w-2xl mx-auto leading-relaxed">
            Eliminate double-booked cameras, automate photographer shift dispatch, and settle freelance compensation in one border-first production workspace.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="btn-tally-primary text-sm px-6 py-3 w-full sm:w-auto font-sans cursor-pointer flex items-center justify-center gap-2"
          >
            Schedule a Demo <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateLogin}
            className="dub-btn-outline text-sm px-6 py-3 w-full sm:w-auto font-mono text-xs uppercase tracking-wider"
          >
            Client Sign In
          </button>
        </div>

        {/* Telemetry Microtext */}
        <div className="text-[11px] font-mono text-fog flex items-center justify-center gap-4">
          <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-vividGreen" /> Zero setup required</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-vividGreen" /> Instant demo workspace</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-vividGreen" /> 100% Studio Data Sovereignty</span>
        </div>

        {/* 4. Live Studio Operations Mockup Preview */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="paper-card overflow-hidden shadow-lg border border-ash bg-white text-left">
            {/* Mockup Window Header */}
            <div className="bg-paper px-4 py-3 border-b border-ash flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                <span className="text-xs font-mono text-steel ml-2">ops.zorviktech.com/dashboard/overview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-canvas text-charcoal border border-ash">
                  <span className="w-1.5 h-1.5 rounded-full bg-tally" /> Live Preview
                </span>
              </div>
            </div>

            {/* Mockup Interior: 4 Stat Panels */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-canvas">
              {/* Stat 1: Equipment */}
              <div className="paper-card p-4 space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-steel flex items-center justify-between">
                  <span>Camera Vault</span>
                  <Camera className="w-3.5 h-3.5 text-tally" />
                </div>
                <div className="text-2xl font-serif text-charcoal">8 / 12 Units</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> FX3 & Arri Prepped
                </div>
              </div>

              {/* Stat 2: Crew Dispatch */}
              <div className="paper-card p-4 space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-steel flex items-center justify-between">
                  <span>Active Crew</span>
                  <Users className="w-3.5 h-3.5 text-tally" />
                </div>
                <div className="text-2xl font-serif text-charcoal">6 Dispatched</div>
                <div className="text-[11px] text-steel font-mono">
                  3 Shoots in progress
                </div>
              </div>

              {/* Stat 3: Collision Engine */}
              <div className="paper-card p-4 space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-steel flex items-center justify-between">
                  <span>Collision Engine</span>
                  <Cpu className="w-3.5 h-3.5 text-tally" />
                </div>
                <div className="text-2xl font-serif text-charcoal">Active Guard</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 0 double-bookings
                </div>
              </div>

              {/* Stat 4: Payouts */}
              <div className="paper-card p-4 space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-steel flex items-center justify-between">
                  <span>Pending Payouts</span>
                  <DollarSign className="w-3.5 h-3.5 text-tally" />
                </div>
                <div className="text-2xl font-serif text-charcoal">₹48,000</div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                  4 gigs awaiting UTR
                </div>
              </div>
            </div>

            {/* Mockup Bottom Live Strip */}
            <div className="bg-paper p-3.5 border-t border-ash flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="font-mono text-steel text-[11px]">
                Active Tenant: Zorvik Creative Studios · Real-time inventory sync & settlement
              </span>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="font-mono text-xs text-charcoal hover:text-amber-600 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Schedule Studio Demo <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Production Ecosystem Ticker (Equals Style Monochrome) */}
      <section className="py-8 border-y border-ash bg-paper/40">
        <div className="max-w-6xl mx-auto px-6 space-y-3 text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-steel">
            Engineered for high-throughput cinema gear & production ecosystems
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 font-mono text-xs uppercase tracking-widest text-charcoal opacity-70">
            <span>SONY CINEALTA</span>
            <span>RED DIGITAL CINEMA</span>
            <span>ARRI</span>
            <span>BLACKMAGIC DESIGN</span>
            <span>APUTURE</span>
            <span>ZEISS OPTICS</span>
            <span>DJI PRO</span>
          </div>
        </div>
      </section>

      {/* 6. 4-Step Production Workflow ("From Call Sheet to Settlement") */}
      <section id="workflow" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-ash bg-paper text-[11px] font-mono uppercase tracking-wider text-steel">
            End-to-End Execution
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-charcoal">
            From Call Sheet to Bank Settlement
          </h2>
          <p className="text-sm text-steel leading-relaxed">
            How modern production studios operate without spreadsheets, lost lenses, or chaotic payroll calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="paper-card p-6 space-y-4 border-t-2 border-t-tally">
            <span className="font-mono text-xs text-tally font-semibold">STEP 01</span>
            <h3 className="font-serif text-lg text-charcoal">Vault & Condition Audit</h3>
            <p className="text-xs text-steel leading-relaxed">
              Catalog cinema bodies, primes, and wireless transmitters with serial numbers, battery cycle health, and optical scratch ratings.
            </p>
            <div className="pt-2 text-[11px] font-mono text-fog flex items-center gap-1">
              <QrCode className="w-3 h-3 text-steel" /> QR/Barcode Check-in
            </div>
          </div>

          {/* Step 2 */}
          <div className="paper-card p-6 space-y-4 border-t-2 border-t-tally">
            <span className="font-mono text-xs text-tally font-semibold">STEP 02</span>
            <h3 className="font-serif text-lg text-charcoal">Zero-Collision Dispatch</h3>
            <p className="text-xs text-steel leading-relaxed">
              Schedule multi-camera wedding or commercial shoots. The collision algorithm mathematically blocks overlapping equipment or crew bookings.
            </p>
            <div className="pt-2 text-[11px] font-mono text-fog flex items-center gap-1">
              <Clock className="w-3 h-3 text-steel" /> Conflict-Free Scheduling
            </div>
          </div>

          {/* Step 3 */}
          <div className="paper-card p-6 space-y-4 border-t-2 border-t-tally">
            <span className="font-mono text-xs text-tally font-semibold">STEP 03</span>
            <h3 className="font-serif text-lg text-charcoal">Crew Dispatch & Roster</h3>
            <p className="text-xs text-steel leading-relaxed">
              Assign lead cinematographers, drone pilots, and audio techs. Track verified day rates, shift timings, and contact routing per shoot.
            </p>
            <div className="pt-2 text-[11px] font-mono text-fog flex items-center gap-1">
              <Users className="w-3 h-3 text-steel" /> Role-Based Allocation
            </div>
          </div>

          {/* Step 4 */}
          <div className="paper-card p-6 space-y-4 border-t-2 border-t-tally">
            <span className="font-mono text-xs text-tally font-semibold">STEP 04</span>
            <h3 className="font-serif text-lg text-charcoal">Instant Payout Settlement</h3>
            <p className="text-xs text-steel leading-relaxed">
              Compute freelancer shoot day-rates and overtime. Mark disbursements with Bank UTR and UPI settlement tracking in immutable audit logs.
            </p>
            <div className="pt-2 text-[11px] font-mono text-fog flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-steel" /> Bank UTR Record Keeping
            </div>
          </div>
        </div>
      </section>

      {/* 7. Interactive Feature Deep-Dive (Tabs) */}
      <section id="vault" className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-ash space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-ash bg-paper text-[11px] font-mono uppercase tracking-wider text-steel">
            Core Modules
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-charcoal">
            Engineered for Studio Precision
          </h2>
          <p className="text-sm text-steel">
            Click through ZManage’s core operations modules to inspect active functionality.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2.5 rounded-full border transition flex items-center gap-2 ${
              activeTab === 'vault'
                ? 'bg-charcoal text-white dark:bg-zinc-100 dark:text-zinc-900 border-charcoal'
                : 'bg-paper text-steel border-ash hover:text-charcoal'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-tally" /> Hardware Vault
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-full border transition flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-charcoal text-white dark:bg-zinc-100 dark:text-zinc-900 border-charcoal'
                : 'bg-paper text-steel border-ash hover:text-charcoal'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-tally" /> Zero-Collision Calendar
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`px-4 py-2.5 rounded-full border transition flex items-center gap-2 ${
              activeTab === 'crew'
                ? 'bg-charcoal text-white dark:bg-zinc-100 dark:text-zinc-900 border-charcoal'
                : 'bg-paper text-steel border-ash hover:text-charcoal'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-tally" /> Workforce & Team Roster
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2.5 rounded-full border transition flex items-center gap-2 ${
              activeTab === 'payouts'
                ? 'bg-charcoal text-white dark:bg-zinc-100 dark:text-zinc-900 border-charcoal'
                : 'bg-paper text-steel border-ash hover:text-charcoal'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-tally" /> Payouts Ledger
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="paper-card p-6 sm:p-8 bg-paper/50 border border-ash max-w-4xl mx-auto space-y-6">
          {activeTab === 'vault' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ash pb-4">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal">Hardware Asset Vault</h3>
                  <p className="text-xs font-mono text-steel mt-1">
                    SERIALIZED TRACKING · CONDITION AUDITS · QR CHECK-IN
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-canvas border border-ash text-charcoal">
                    12 Units Cataloged
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="paper-card p-4 space-y-2 bg-canvas">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-charcoal">Sony FX3 Cinema Body</span>
                    <span className="text-emerald-600 font-mono">READY</span>
                  </div>
                  <div className="text-xs text-steel font-mono">SN: FX3-88291 · Battery: 94%</div>
                  <p className="text-xs text-steel">Optical sensor cleaned. Checked into Bag #02 with 24-70mm GM II.</p>
                </div>

                <div className="paper-card p-4 space-y-2 bg-canvas">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-charcoal">DJI Inspire 3 Drone Kit</span>
                    <span className="text-amber-600 font-mono">ON LOCATION</span>
                  </div>
                  <div className="text-xs text-steel font-mono">SN: DJI-99214 · Assigned: Rahul S.</div>
                  <p className="text-xs text-steel">Dispatched for Grand Hyatt Ballroom Shoot. Due back 10:00 PM.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ash pb-4">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal">Zero-Collision Operations Engine</h3>
                  <p className="text-xs font-mono text-steel mt-1">
                    ATOMIC CONFLICT PREVENTION · CALL TIME ALLOCATION
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-canvas border border-ash text-emerald-600">
                  0 Conflicts Detected
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="paper-card p-3.5 flex items-center justify-between bg-canvas">
                  <div className="space-y-1">
                    <span className="font-semibold text-charcoal">Meera & Rohan Wedding · Sangeet Night</span>
                    <div className="text-steel text-[11px]">04:00 PM – 11:00 PM · Grand Ballroom, Mumbai</div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-paper border border-ash text-charcoal">
                    4 Crew · 3 Cameras Assigned
                  </span>
                </div>

                <div className="paper-card p-3.5 flex items-center justify-between bg-canvas">
                  <div className="space-y-1">
                    <span className="font-semibold text-charcoal">Zara Commercial Brand Shoot</span>
                    <div className="text-steel text-[11px]">09:00 AM – 03:00 PM · Studio A, Zorvik Media</div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-paper border border-ash text-charcoal">
                    2 Crew · RED V-Raptor Kit
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crew' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ash pb-4">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal">Workforce & Crew Dispatch</h3>
                  <p className="text-xs font-mono text-steel mt-1">
                    FREELANCE ROSTERS · ROLE CLASSIFICATION · DAY-RATE CARDS
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-canvas border border-ash text-charcoal">
                  18 Active Crew on File
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="paper-card p-4 space-y-2 bg-canvas">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-charcoal">Vikram Sharma</span>
                    <span className="text-emerald-600 font-mono">ASSIGNED</span>
                  </div>
                  <div className="text-xs text-steel font-mono">Lead Cinematographer · ₹8,500/day</div>
                  <p className="text-xs text-steel">Specialist in handheld gimbal & Sony FX series. Taj Lands End wedding lead.</p>
                </div>

                <div className="paper-card p-4 space-y-2 bg-canvas">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-charcoal">Ananya Verma</span>
                    <span className="text-blue-600 font-mono">AVAILABLE</span>
                  </div>
                  <div className="text-xs text-steel font-mono">Drone Pilot / DGCA Certified · ₹6,000/day</div>
                  <p className="text-xs text-steel">FPV & aerial cinematography specialist. Ready for outdoor commercial shoots.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ash pb-4">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal">Worker Payouts & UTR Ledger</h3>
                  <p className="text-xs font-mono text-steel mt-1">
                    DAY-RATE CALCULATIONS · BANK UTR TRACKING · IMMUTABLE LOGS
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-canvas border border-ash text-charcoal">
                  ₹1,84,000 Settled This Month
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="paper-card p-3 flex items-center justify-between bg-canvas">
                  <div>
                    <span className="font-semibold text-charcoal">Kunal Verma (Drone Operator)</span>
                    <div className="text-steel text-[11px]">Shoot: Zara Fashion · ₹18,000</div>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-mono">
                    UTR: HDFC0092182741 (PAID)
                  </span>
                </div>

                <div className="paper-card p-3 flex items-center justify-between bg-canvas">
                  <div>
                    <span className="font-semibold text-charcoal">Ayesha Sen (Second Shooter)</span>
                    <div className="text-steel text-[11px]">Shoot: Meera Sangeet · ₹12,000</div>
                  </div>
                  <span className="text-[11px] text-amber-600 font-mono">
                    AWAITING UTR SETTLEMENT
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. Broadsheet Operational Metrics (Equals 4-Column Grid) */}
      <section id="metrics" className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-ash space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-ash bg-paper text-[11px] font-mono uppercase tracking-wider text-steel">
            Audited Reliability
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-charcoal">
            Production Trust by the Numbers
          </h2>
          <p className="text-sm text-steel">
            Built to withstand the chaos of weekend shoot rushes and multi-crew turnarounds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="paper-card p-6 space-y-2">
            <div className="text-4xl sm:text-5xl font-serif text-charcoal">0%</div>
            <div className="text-xs font-mono uppercase tracking-wider text-tally font-semibold">
              Double-Booking Rate
            </div>
            <p className="text-xs text-steel leading-relaxed">
              Enforced by atomic database locking across equipment and lead crew slots.
            </p>
          </div>

          <div className="paper-card p-6 space-y-2">
            <div className="text-4xl sm:text-5xl font-serif text-charcoal">₹1.8Cr+</div>
            <div className="text-xs font-mono uppercase tracking-wider text-tally font-semibold">
              Freelancer Payouts
            </div>
            <p className="text-xs text-steel leading-relaxed">
              Tracked and settled through bank UTR and UPI references with zero ledger drift.
            </p>
          </div>

          <div className="paper-card p-6 space-y-2">
            <div className="text-4xl sm:text-5xl font-serif text-charcoal">99.9%</div>
            <div className="text-xs font-mono uppercase tracking-wider text-tally font-semibold">
              Gear Readiness Ratio
            </div>
            <p className="text-xs text-steel leading-relaxed">
              Pre-shoot battery health and optical checks ensure cameras never arrive dead on set.
            </p>
          </div>

          <div className="paper-card p-6 space-y-2">
            <div className="text-4xl sm:text-5xl font-serif text-charcoal">256-bit</div>
            <div className="text-xs font-mono uppercase tracking-wider text-tally font-semibold">
              Data Encryption
            </div>
            <p className="text-xs text-steel leading-relaxed">
              Hardware-grade data isolation guarantees complete privacy and security for your studio workspace.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto w-full border-t border-ash space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-ash bg-paper text-[11px] font-mono uppercase tracking-wider text-steel">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-charcoal">
            Studio Operations & Platform Overview
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How does the Zero-Collision engine prevent double bookings?',
              a: 'When an equipment unit or crew member is assigned to a shoot timeline, ZManage automatically cross-checks all confirmed bookings in real time. If an overlapping schedule is detected for that specific camera kit or technician, the conflict is instantly flagged and prevented.'
            },
            {
              q: 'How does ZManage handle freelance and full-time crew management?',
              a: 'ZManage maintains a central workforce directory categorized by production roles (cinematographers, drone pilots, sound techs, editors). You can maintain verified contact numbers, standard day-rate cards, and UPI/banking settlement profiles for rapid shoot dispatch.'
            },
            {
              q: 'How are freelance payouts and Bank UTR settlement numbers tracked?',
              a: 'Studio managers record day-rates, overtime hours, and reimbursement line items in the Worker Payouts Ledger. Once disbursements are initiated via your commercial bank or UPI gateway, the generated UTR number is logged into ZManage to create an immutable proof-of-settlement record.'
            },
            {
              q: 'Can our studio manage equipment condition audits and battery health?',
              a: 'Yes. Every time equipment is checked in or checked out, technicians can log battery cycle percentages, optical element scratches, sensor dust status, and physical casing condition ratings. This builds a permanent audit trail for warranty and insurance claims.'
            },
            {
              q: 'Is multi-tenancy supported if we operate multiple rental branches or sister studios?',
              a: 'Yes. ZManage is built natively for multi-tenancy. You can switch between distinct branches or client projects with a single click, with independent equipment rosters, rate cards, and financial permissions for each tenant.'
            },
            {
              q: 'Who owns our studio data, and can we export everything?',
              a: 'Your studio retains 100% data sovereignty. You can export complete JSON or CSV archives of your entire inventory, shoot history, and payout ledger at any time. If you ever decommission your workspace, all tenant partitions are permanently purged.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="paper-card border border-ash overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-serif text-lg text-charcoal hover:bg-paper/40 transition"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-steel transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-tally' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-sm text-steel leading-relaxed border-t border-ash/60 bg-paper/20">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. Bottom Conversion Callout */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="paper-card p-10 sm:p-14 bg-gradient-to-b from-paper to-canvas border border-ash text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ash bg-canvas text-xs font-mono text-steel">
            <Sparkles className="w-3.5 h-3.5 text-tally" /> Experience ZManage in Action
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-charcoal max-w-2xl mx-auto leading-tight">
            Ready to bring order to your studio floor?
          </h2>
          <p className="text-sm sm:text-base text-steel max-w-xl mx-auto">
            Test drive the full equipment vault, zero-collision timeline calendar, and freelancer ledger with pre-loaded demo gear and crews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="btn-tally-primary text-sm px-8 py-3 w-full sm:w-auto font-sans cursor-pointer flex items-center justify-center gap-2"
            >
              Schedule a Live Demo <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateLogin}
              className="dub-btn-outline text-sm px-6 py-3 w-full sm:w-auto font-mono text-xs uppercase tracking-wider"
            >
              Sign In to Your Studio
            </button>
          </div>
        </div>
      </section>

      {/* 11. Master 5-Column Footer (Adapts to Light & Dark Mode) */}
      <footer className="bg-paper dark:bg-[#121214] text-charcoal dark:text-[#fbfbf9] border-t border-ash dark:border-[#232328] pt-16 pb-12 px-6 transition-colors">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Column 1: Brand & Bio */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/zmanage-app-icon.png" 
                  alt="ZManage" 
                  className="w-7 h-7 rounded-md object-contain shadow-xs" 
                />
                <span className="font-serif text-lg text-charcoal dark:text-white font-normal">ZManage</span>
              </div>
              <p className="text-xs text-steel dark:text-zinc-400 font-mono leading-relaxed">
                Multi-tenant operations, hardware inventory, and crew compensation command for modern production studios.
              </p>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Systems Operational
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-charcoal dark:text-zinc-400 font-semibold">Product</div>
              <ul className="space-y-2 text-xs font-mono text-steel dark:text-zinc-400">
                <li><a href="#vault" className="hover:text-charcoal dark:hover:text-white transition">Hardware Vault</a></li>
                <li><a href="#collision" className="hover:text-charcoal dark:hover:text-white transition">Operations Calendar</a></li>
                <li><a href="#vault" className="hover:text-charcoal dark:hover:text-white transition">Workforce & Team</a></li>
                <li><a href="#vault" className="hover:text-charcoal dark:hover:text-white transition">Worker Payouts</a></li>
                <li><button onClick={() => setIsDemoModalOpen(true)} className="hover:text-tally transition text-left cursor-pointer">Schedule a Demo</button></li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-charcoal dark:text-zinc-400 font-semibold">Solutions</div>
              <ul className="space-y-2 text-xs font-mono text-steel/70 dark:text-zinc-500">
                <li><span>Commercial Film</span></li>
                <li><span>Wedding Studios</span></li>
                <li><span>Camera Rental Fleets</span></li>
                <li><span>Broadcast Teams</span></li>
                <li><span>Freelance Collectives</span></li>
              </ul>
            </div>

            {/* Column 4: Platform & Trust */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-charcoal dark:text-zinc-400 font-semibold">Platform & Trust</div>
              <ul className="space-y-2 text-xs font-mono text-steel dark:text-zinc-400">
                <li><button onClick={() => navigate('/security')} className="hover:text-charcoal dark:hover:text-white transition text-left">Security & Protection</button></li>
                <li><button onClick={() => navigate('/privacy')} className="hover:text-charcoal dark:hover:text-white transition text-left">Data Sovereignty</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-charcoal dark:hover:text-white transition text-left">Platform SLA (99.9%)</button></li>
                <li><a href="#vault" className="hover:text-charcoal dark:hover:text-white transition text-left">Studio Operations</a></li>
              </ul>
            </div>

            {/* Column 5: Legal & Policies */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-charcoal dark:text-zinc-400 font-semibold">Legal & Policies</div>
              <ul className="space-y-2 text-xs font-mono text-steel dark:text-zinc-400">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-charcoal dark:hover:text-white transition text-left">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-charcoal dark:hover:text-white transition text-left">Terms of Service</button></li>
                <li><button onClick={() => navigate('/security')} className="hover:text-charcoal dark:hover:text-white transition text-left">Trust & Compliance</button></li>
                <li><span className="text-steel/70 dark:text-zinc-500">Studio Data Protected</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="border-t border-ash dark:border-[#242428] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-fog dark:text-zinc-500">
            <span>© 2026 Zorvik Tech Inc. · ZManage Operations Platform. All rights reserved.</span>
            <div className="flex items-center gap-6 text-steel dark:text-zinc-400">
              <a href="https://zorviktech.com" target="_blank" rel="noreferrer" className="hover:text-charcoal dark:hover:text-white transition">Zorvik Tech</a>
              <button onClick={() => navigate('/privacy')} className="hover:text-charcoal dark:hover:text-white transition">Privacy</button>
              <button onClick={() => navigate('/terms')} className="hover:text-charcoal dark:hover:text-white transition">Terms</button>
              <button onClick={() => navigate('/security')} className="hover:text-charcoal dark:hover:text-white transition">Security</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Schedule a Demo Interactive Modal */}
      <ScheduleDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
