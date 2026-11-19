import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { NavigationProvider } from '../contexts/NavigationProvider';

const SIDEBAR_STORAGE_KEY = 'business_sidebar_collapsed';

const DashboardLayoutContent: React.FC = () => {
  // Persist sidebar collapsed state in localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Expandable / Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <TopNavbar onOpenMobile={() => setMobileOpen(true)} />

        {/* Dynamic Main Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white">
          <span>Business Management Web Application &bull; Admin Portal</span>
          <span>Enterprise Management Platform &bull; v1.0.0</span>
        </footer>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  return (
    <NavigationProvider>
      <DashboardLayoutContent />
    </NavigationProvider>
  );
};
