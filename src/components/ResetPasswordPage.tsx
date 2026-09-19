import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getZorvikCentralAuthUrl } from '../lib/urls';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // 1. Check hash params (Supabase default recovery format: #access_token=...&type=recovery)
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const hashToken = hashParams.get('access_token');

    // 2. Check query params (custom redirect: ?token=... or ?code=...)
    const queryParams = new URLSearchParams(window.location.search);
    const queryToken = queryParams.get('token') || queryParams.get('code') || queryParams.get('access_token');

    const resolvedToken = hashToken || queryToken;
    if (resolvedToken) {
      setToken(resolvedToken);
    } else {
      setErrorMessage('No password recovery token found. Please request a new reset link.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Recovery token is missing or expired. Please request a new reset link.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    try {
      setIsLoading(true);

      // Central Zorvik-Tech Auth API endpoint for password reset
      const resetUrl = getZorvikCentralAuthUrl().replace('/login', '/reset-password');

      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data?.error || data?.message || 'Failed to update password. The link may have expired.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex flex-col justify-center items-center p-6 relative">
      <div className="absolute inset-0 bg-dotted-grid opacity-60 pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center space-y-2">
        <button
          onClick={() => navigate('/')}
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
        <h1 className="text-2xl font-satoshi font-medium text-charcoal">Set New Password</h1>
        <p className="text-xs text-steel">Create a secure, strong password for your studio account.</p>
      </div>

      {/* Main Card */}
      <div className="dub-card shadow-subtle w-full max-w-sm p-8 bg-white border border-ash space-y-6">
        {isSuccess ? (
          <div className="space-y-4 text-center py-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-satoshi font-semibold text-base text-charcoal">Password Updated</h3>
            <p className="text-xs text-steel font-mono">
              Your password has been successfully reset. Redirecting you to sign in...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="dub-btn-primary w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Sign In Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="dub-input w-full text-xs pr-10"
                    disabled={!token || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-charcoal transition p-0.5 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="dub-input w-full text-xs pr-10"
                    disabled={!token || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-charcoal transition p-0.5 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!token || isLoading}
                className="dub-btn-primary w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" /> Update Password
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-steel hover:text-charcoal transition cursor-pointer"
              >
                ← Return to Sign In
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-xs text-fog flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-vividGreen" /> Verified by Zorvik Tech Identity & Access Plane
      </div>
    </div>
  );
};
