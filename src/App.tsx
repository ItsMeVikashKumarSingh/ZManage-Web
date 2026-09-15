import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { SecurityPage } from './components/SecurityPage';
import { ProjectRecord } from './lib/api';

export interface SessionData {
  tenantId: string;
  projectId?: string;
  projectName?: string;
  clientName: string;
  token: string;
  roleTier?: string;
  allowedTabs?: string[];
}

const LandingRoute: React.FC<{
  session: SessionData | null;
}> = ({ session }) => {
  const navigate = useNavigate();

  return (
    <LandingPage
      hasActiveSession={Boolean(session?.token)}
      onGoToDashboard={() => navigate('/dashboard')}
      onNavigateLogin={() => navigate('/login')}
    />
  );
};

const LoginRoute: React.FC<{
  session: SessionData | null;
  onLoginSuccess: (sessionData: SessionData) => void;
}> = ({ session, onLoginSuccess }) => {
  const navigate = useNavigate();

  if (session?.token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthPage
      onSuccessLogin={(data) => {
        onLoginSuccess(data);
        navigate('/dashboard');
      }}
      onBackToHome={() => navigate('/')}
    />
  );
};

const DashboardRoute: React.FC<{
  session: SessionData | null;
  onLogout: () => void;
  onSwitchProject: (p: ProjectRecord) => void;
}> = ({ session, onLogout, onSwitchProject }) => {
  const navigate = useNavigate();

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout
      clientName={session?.clientName || 'Aura Creative Studios'}
      projectName={session?.projectName}
      projectId={session?.projectId || session?.tenantId}
      roleTier={session?.roleTier}
      allowedTabs={session?.allowedTabs}
      onLogout={() => {
        onLogout();
        navigate('/login');
      }}
      onSwitchProject={onSwitchProject}
    />
  );
};

const PrivacyRoute: React.FC = () => {
  const navigate = useNavigate();
  return <PrivacyPolicyPage onBackToHome={() => navigate('/')} />;
};

const TermsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <TermsOfServicePage onBackToHome={() => navigate('/')} />;
};

const SecurityRoute: React.FC = () => {
  const navigate = useNavigate();
  return <SecurityPage onBackToHome={() => navigate('/')} />;
};

export const App: React.FC = () => {
  const [session, setSession] = useState<SessionData | null>(() => {
    const stored = localStorage.getItem('zmanage_session') || localStorage.getItem('zresource_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token && (parsed?.tenantId || parsed?.projectId)) {
          return parsed;
        }
      } catch {
        localStorage.removeItem('zmanage_session');
        localStorage.removeItem('zresource_session');
      }
    }
    return null;
  });

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

      // Clean up URL search parameters cleanly and route to /dashboard
      const targetPath = window.location.pathname.startsWith('/dashboard')
        ? window.location.pathname
        : '/dashboard';
      window.history.replaceState({}, document.title, targetPath);
    }
  }, []);

  const handleLoginSuccess = (sessionData: SessionData) => {
    setSession(sessionData);
  };

  const handleLogout = () => {
    localStorage.removeItem('zmanage_session');
    localStorage.removeItem('zresource_session');
    setSession(null);
  };

  const handleSwitchProject = (p: ProjectRecord) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        projectId: p.id,
        tenantId: p.id,
        projectName: p.name
      };
      localStorage.setItem('zmanage_session', JSON.stringify(updated));
      localStorage.setItem('zresource_session', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingRoute session={session} />}
        />
        <Route
          path="/login"
          element={<LoginRoute session={session} onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <DashboardRoute
              session={session}
              onLogout={handleLogout}
              onSwitchProject={handleSwitchProject}
            />
          }
        />
        <Route
          path="/dashboard/:tab"
          element={
            <DashboardRoute
              session={session}
              onLogout={handleLogout}
              onSwitchProject={handleSwitchProject}
            />
          }
        />
        <Route
          path="/privacy"
          element={<PrivacyRoute />}
        />
        <Route
          path="/terms"
          element={<TermsRoute />}
        />
        <Route
          path="/security"
          element={<SecurityRoute />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
