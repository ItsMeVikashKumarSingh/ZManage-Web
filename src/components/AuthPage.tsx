import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getZorvikCentralAuthUrl } from '../lib/urls';
import { API_BASE_URL } from '../lib/api';
import { ScheduleDemoModal } from './ScheduleDemoModal';

interface AuthPageProps {
  onSuccessLogin: (sessionData: { tenantId: string; clientName: string; token: string }) => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccessLogin, onBackToHome }) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Primary: Central Zorvik-Tech Client Login API
      // Fallback: Local API
      const primaryUrl = getZorvikCentralAuthUrl();
      const fallbackUrl = `${API_BASE_URL}/auth/login`;

      let res: Response;
      try {
        res = await fetch(primaryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      } catch {
        // Fallback to local auth route if central server isn't reachable
        res = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data?.message || data?.error || 'Authentication failed. Please verify credentials.');
      }

      const session = {
        tenantId: data.tenantId || data.project?.id || data.client?.id,
        clientName: data.client?.name || data.clientName || 'Studio Client',
        token: data.token
      };

      localStorage.setItem('zmanage_session', JSON.stringify(session));
      localStorage.setItem('zresource_session', JSON.stringify(session)); // backward compatibility
      onSuccessLogin(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const primaryUrl = getZorvikCentralAuthUrl().replace('/login', '/forgot-password');
      const fallbackUrl = `${API_BASE_URL}/auth/forgot-password`;
      const redirectTo = `${window.location.origin}/reset-password`;

      let res: Response;
      try {
        res = await fetch(primaryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectTo })
        });
      } catch {
        res = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectTo })
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data?.error || data?.message || 'Failed to send recovery email. Please try again.');
      }

      setForgotSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send recovery email. Please check your email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex flex-col justify-center items-center p-6 relative">
      <div className="absolute inset-0 bg-dotted-grid opacity-60 pointer-events-none" />

      {/* Top Brand Mark */}
      <div className="mb-8 text-center space-y-2">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 p-2 rounded-xl hover:bg-paper transition"
        >
          <img 
            src="/zmanage-app-icon.png" 
            alt="ZManage" 
            className="w-9 h-9 rounded-lg object-contain shadow-xs" 
          />
          <span className="font-satoshi font-semibold text-lg tracking-tight text-charcoal">
            ZManage
          </span>
        </button>
        <h1 className="text-2xl font-satoshi font-medium text-charcoal">
          {mode === 'login' ? 'Sign in to your Studio Console' : 'Reset Account Password'}
        </h1>
        <p className="text-xs text-steel">
          {mode === 'login'
            ? 'Manage your inventory, workforce allocations, and payouts with your Zorvik account.'
            : 'Enter your verified work email address to receive password recovery instructions.'}
        </p>
      </div>

      {/* Auth Card (Dub Border-First Card) */}
      <div className="dub-card shadow-subtle w-full max-w-sm p-8 bg-white border border-ash space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {mode === 'forgot' && forgotSuccess ? (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-satoshi font-semibold text-sm text-charcoal">Recovery Email Sent</h3>
            <p className="text-xs text-steel font-mono leading-relaxed">
              We have sent password reset instructions to <strong className="text-charcoal font-semibold">{email}</strong> if it matches an active studio account.
            </p>
            <button
              onClick={() => {
                setMode('login');
                setForgotSuccess(false);
                setErrorMessage('');
              }}
              className="dub-btn-primary w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Back to Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1.5">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@zorviktech.com"
                className="dub-input w-full text-xs"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="dub-btn-primary w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" /> Send Reset Link
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="text-xs text-steel hover:text-charcoal transition cursor-pointer"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1.5">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@zorviktech.com"
                className="dub-input w-full text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-charcoal">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage('');
                  }}
                  className="text-[11px] text-electric hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="dub-input w-full text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-charcoal transition p-0.5 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="dub-btn-primary w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {mode === 'login' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ash" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-fog text-[11px]">OR</span>
              </div>
            </div>

            {/* Schedule a Demo Button (Replacing 1-click login) */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="dub-btn-outline w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 text-charcoal hover:bg-paper cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-electric" /> Schedule for Demo
            </button>

            <div className="pt-2 text-center">
              <button
                onClick={onBackToHome}
                className="text-xs text-steel hover:text-charcoal transition cursor-pointer"
              >
                ← Return to Overview
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-xs text-fog flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-vividGreen" /> Verified by Zorvik Tech Identity & Access Plane
      </div>

      {/* Schedule Demo Interactive Modal */}
      <ScheduleDemoModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  );
};
