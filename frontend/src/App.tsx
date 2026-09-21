import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';
import { api } from './services/api';
import { useEditorStore } from './store/useEditorStore';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'dashboard' | 'editor'>('landing');
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const { setCurrentUser } = useEditorStore();

  // Handle Google OAuth 2.0 redirect callback & restore session
  useEffect(() => {
    try {
      const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(rawHash);

      const token = hashParams.get('auth_token') || searchParams.get('auth_token');
      const userId = hashParams.get('user_id') || searchParams.get('user_id');
      const userName = hashParams.get('user_name') || searchParams.get('user_name');
      const userEmail = hashParams.get('user_email') || searchParams.get('user_email');
      const userAvatar = hashParams.get('user_avatar') || searchParams.get('user_avatar');
      const authError = hashParams.get('auth_error') || searchParams.get('auth_error');

      if (token && userId && userEmail) {
        localStorage.setItem('gbest_token', token);
        const userObj = {
          id: userId,
          name: userName || 'Google Creator',
          email: userEmail,
          avatar: userAvatar || undefined,
        };
        setCurrentUser(userObj);

        // Clean query/hash parameters from address bar
        const cleanPath = window.location.pathname;
        window.history.replaceState(null, '', cleanPath);
      } else if (authError) {
        console.warn('Google OAuth redirected with error:', authError);
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        // Refresh existing session from backend if token or user saved
        const savedUser = localStorage.getItem('gbest_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            api.getMe(parsed.id).then((res) => {
              if (res?.user) {
                setCurrentUser(res.user);
              }
            }).catch(() => {});
          } catch {}
        }
      }
    } catch (e) {
      console.error('Error handling auth state:', e);
    }
  }, [setCurrentUser]);

  // Synchronize with URL path on initial load and back/forward
  useEffect(() => {
    const syncRouteFromPath = async () => {
      const path = window.location.pathname;

      if (path.startsWith('/editor')) {
        const parts = path.split('/');
        const id = parts[2];
        if (id) {
          setActiveProjectId(id);
          setCurrentRoute('editor');
        } else {
          // Create or retrieve default project
          try {
            const projects = await api.getProjects();
            if (projects.length > 0) {
              setActiveProjectId(projects[0].id);
              window.history.replaceState(null, '', `/editor/${projects[0].id}`);
            } else {
              const created = await api.createProject('Demo Project', '9:16');
              setActiveProjectId(created.id);
              window.history.replaceState(null, '', `/editor/${created.id}`);
            }
          } catch {
            setActiveProjectId('demo_project');
          }
          setCurrentRoute('editor');
        }
      } else if (path === '/dashboard') {
        setCurrentRoute('dashboard');
      } else {
        setCurrentRoute('landing');
      }
    };

    syncRouteFromPath();

    const handlePopState = () => {
      syncRouteFromPath();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('PWA Service Worker registration skipped:', err);
      });
    }
  }, []);

  const navigateTo = (route: 'landing' | 'dashboard' | 'editor', projectId?: string) => {
    setCurrentRoute(route);
    if (route === 'editor') {
      const id = projectId || activeProjectId || 'demo';
      setActiveProjectId(id);
      window.history.pushState(null, '', `/editor/${id}`);
    } else if (route === 'dashboard') {
      window.history.pushState(null, '', '/dashboard');
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  const handleStartEditingFromLanding = async () => {
    try {
      const projects = await api.getProjects();
      if (projects.length > 0) {
        navigateTo('editor', projects[0].id);
      } else {
        const created = await api.createProject('My First Video', '9:16');
        navigateTo('editor', created.id);
      }
    } catch {
      // Fallback offline demo
      navigateTo('editor', 'demo');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#111111]">
      {currentRoute === 'landing' && (
        <LandingPage
          onStartEditing={handleStartEditingFromLanding}
          onGoToDashboard={() => navigateTo('dashboard')}
        />
      )}

      {currentRoute === 'dashboard' && (
        <DashboardPage
          onOpenProject={(id) => navigateTo('editor', id)}
          onNavigateHome={() => navigateTo('landing')}
        />
      )}

      {currentRoute === 'editor' && (
        <EditorPage
          projectId={activeProjectId}
          onNavigateHome={() => navigateTo('landing')}
          onNavigateDashboard={() => navigateTo('dashboard')}
        />
      )}
    </div>
  );
};

export default App;
