import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { getZorvikCentralAuthUrl } from '../lib/urls';
import { API_BASE_URL } from '../lib/api';

interface AuthPageProps {
  onSuccessLogin: (sessionData: { tenantId: string; clientName: string; token: string }) => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccessLogin, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
      } catch (centralErr) {
        // Fallback to local auth route if central server isn't reachable
        res = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      }

      const data = await res.json();

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

  const handleQuickDemo = () => {
    const session = {
      tenantId: import.meta.env.VITE_DEMO_TENANT_ID || '',
      clientName: 'Zorvik Studio Operations',
      token: 'zm_demo_token_3e8634a41f761feec1245927a396acd9bd3fac'
    };
    localStorage.setItem('zmanage_session', JSON.stringify(session));
    localStorage.setItem('zresource_session', JSON.stringify(session));
    onSuccessLogin(session);
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
        <h1 className="text-2xl font-satoshi font-medium text-charcoal">Sign in to your Studio Console</h1>
        <p className="text-xs text-steel">Manage your inventory, workforce allocations, and payouts with your Zorvik account.</p>
      </div>

      {/* Auth Card (Dub Border-First Card) */}
      <div className="dub-card shadow-subtle w-full max-w-sm p-8 bg-white border border-ash space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1.5">Email Address</label>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@zorviktech.com"
                className="dub-input w-full text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-charcoal">Password</label>
              <a href="#forgot" className="text-[11px] text-electric hover:underline">Forgot?</a>
            </div>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="dub-input w-full text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="dub-btn-primary w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ash" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-fog text-[11px]">OR</span>
          </div>
        </div>

        {/* 1-Click Studio Demo Login */}
        <button
          onClick={handleQuickDemo}
          className="dub-btn-outline w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 text-charcoal hover:bg-paper"
        >
          <Sparkles className="w-3.5 h-3.5 text-electric" /> Instant 1-Click Demo Login
        </button>

        <div className="pt-2 text-center">
          <button
            onClick={onBackToHome}
            className="text-xs text-steel hover:text-charcoal transition"
          >
            ← Return to Overview
          </button>
        </div>
      </div>

      <div className="mt-8 text-xs text-fog flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-vividGreen" /> Verified by Zorvik Tech Identity & Access Plane
      </div>
    </div>
  );
};
