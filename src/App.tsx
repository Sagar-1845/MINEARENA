import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { Navbar } from '@/components/Navbar';

// Code-split all routes so 3D chunks load ONLY on "/"
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const GatewayDemoPage = lazy(() => import('@/pages/GatewayDemoPage'));
const AuditLogPage = lazy(() => import('@/pages/AuditLogPage'));
const MetricsPage = lazy(() => import('@/pages/MetricsPage'));
const DatasetPage = lazy(() => import('@/pages/DatasetPage'));

// Route loading fallback with smooth skeleton/pulse
const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-[#06080d]">
    <div className="w-10 h-10 rounded-full border-2 border-neon border-t-transparent animate-spin mb-4" />
    <span className="text-xs font-mono text-muted-foreground animate-pulse tracking-widest uppercase">
      ZEROLEAK AI // INITIALIZING PERIMETER...
    </span>
  </div>
);

// Single stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC<{
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}> = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#050a1c] text-[#d5ddfd] transition-colors duration-300 font-sans selection:bg-[#37d3fc]/20 selection:text-[#37d3fc]">
      {/* Sonner Toast Notification Center */}
      <Toaster position="top-right" richColors closeButton theme={theme} />

      {/* Render top Navbar on internal operational pages (/demo, /audit, /metrics, /dataset) */}
      {!isHome && <Navbar theme={theme} onToggleTheme={onToggleTheme} />}

      <main className="relative">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Route 1: Landing Page (Hubtown-Grade ZeroLeak Experience) */}
            <Route path="/" element={<LandingPage />} />

            {/* Route 2: Gateway Demo Page */}
            <Route path="/demo" element={<GatewayDemoPage />} />

            {/* Route 3: Audit Log Page */}
            <Route path="/audit" element={<AuditLogPage />} />

            {/* Route 4: Metrics Page */}
            <Route path="/metrics" element={<MetricsPage />} />

            {/* Route 5: Synthetic Dataset Page */}
            <Route path="/dataset" element={<DatasetPage />} />

            {/* Catch-all redirect to Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('zeroleak-theme') ||
      localStorage.getItem('privaguard-theme')) as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('zeroleak-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent theme={theme} onToggleTheme={handleToggleTheme} />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
