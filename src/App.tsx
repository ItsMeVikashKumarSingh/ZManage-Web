import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';

type AppScreen = 'landing' | 'auth' | 'dashboard';

interface SessionData {
  tenantId: string;
  projectId?: string;
  projectName?: string;
  clientName: string;
  token: string;
}

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    // 1. Check for URL parameters (Direct SSO handoff from Zorvik-Tech client portal)
    const urlParams = new URLSearchParams(window.location.search);
    const paramToken = urlParams.get('token');
    const paramTenant = urlParams.get('tenantId');
    const paramProject = urlParams.get('projectId');
    const paramProjectName = urlParams.get('projectName');
    const paramClient = urlParams.get('clientName');

    if (paramTenant || paramProject) {
      const incomingSession: SessionData = {
        token: paramToken || 'sso_direct',
        tenantId: paramTenant || paramProject || '',
        projectId: paramProject || undefined,
        projectName: paramProjectName || undefined,
        clientName: paramClient || 'Studio Client'
      };
      localStorage.setItem('zmanage_session', JSON.stringify(incomingSession));
      localStorage.setItem('zresource_session', JSON.stringify(incomingSession));
      setSession(incomingSession);
      setCurrentScreen('dashboard');

      // Clean up URL parameters cleanly
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // 2. Check for existing session in localStorage
    const stored = localStorage.getItem('zmanage_session') || localStorage.getItem('zresource_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token && (parsed?.tenantId || parsed?.projectId)) {
          setSession(parsed);
          setCurrentScreen('dashboard'); // Persist and stay inside dashboard across refreshes
        }
      } catch (e) {
        localStorage.removeItem('zmanage_session');
        localStorage.removeItem('zresource_session');
      }
    }
  }, []);

  const handleLoginSuccess = (sessionData: SessionData) => {
    setSession(sessionData);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('zmanage_session');
    localStorage.removeItem('zresource_session');
    setSession(null);
    setCurrentScreen('landing');
  };

  const handleEnterDemo = () => {
    const demoSession: SessionData = {
      tenantId: '26d6ac0b-964c-42d8-aa9a-84adb7698d4b',
      projectId: '26d6ac0b-964c-42d8-aa9a-84adb7698d4b',
      projectName: 'Zorvik Studio Demo',
      clientName: 'Zorvik Studio Operations',
      token: 'zm_demo_token_3e8634a41f761feec1245927a396acd9bd3fac'
    };
    localStorage.setItem('zmanage_session', JSON.stringify(demoSession));
    localStorage.setItem('zresource_session', JSON.stringify(demoSession));
    setSession(demoSession);
    setCurrentScreen('dashboard');
  };

  if (currentScreen === 'auth') {
    return (
      <AuthPage
        onSuccessLogin={handleLoginSuccess}
        onBackToHome={() => setCurrentScreen('landing')}
      />
    );
  }

  if (currentScreen === 'dashboard') {
    return (
      <DashboardLayout
        clientName={session?.clientName || 'Aura Creative Studios'}
        projectName={session?.projectName}
        onLogout={handleLogout}
      />
    );
  }

  // Default: Landing Page
  return (
    <LandingPage
      hasActiveSession={Boolean(session?.token)}
      onGoToDashboard={() => setCurrentScreen('dashboard')}
      onNavigateLogin={() => setCurrentScreen('auth')}
      onEnterDemo={handleEnterDemo}
    />
  );
};
