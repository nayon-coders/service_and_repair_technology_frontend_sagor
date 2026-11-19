import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  User as UserIcon, 
  Lock, 
  Download, 
  Server, 
  Database, 
  Layers, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Laptop
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../../services/healthService';
import { ApiResponse, HealthData } from '../../types';
import { Button } from '../../components/common';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const SystemSettingsPage: React.FC = () => {
  const [healthData, setHealthData] = useState<ApiResponse<HealthData> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Desktop App Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Listen for PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if running in standalone mode (already installed desktop app)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Guide user if browser already manages install or has direct install icon
      alert('To install this web app as a Desktop Software:\n\n1. In Chrome/Edge: Click the Install icon in the top right address bar or press "..." Menu -> "Install 1Service ERP" / "Save and Share" -> "Install as app".\n2. In Safari (macOS): Click File -> "Add to Dock".\n\nIt will open in its own dedicated desktop window with desktop icon!');
    }
  };

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealthData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to backend API on port 5000');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-7 h-7 text-blue-600" />
              System Diagnostics &amp; Desktop App
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">
              System Environment
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            System architectural health, backend API diagnostics, and Desktop Software installation.
          </p>
        </div>

        {/* Setting Navigation Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/settings/profile"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            Profile
          </Link>
          <Link
            to="/settings/change-password"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Change Password
          </Link>
          <Link
            to="/settings/system"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs inline-flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            System &amp; Desktop App
          </Link>
        </div>
      </div>

      {/* SECTION 1: DOWNLOAD / INSTALL AS DESKTOP SOFTWARE */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Desktop Software Support (PWA Standalone)
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Install as a Standalone Desktop Application
          </h2>

          <p className="text-sm text-blue-100 leading-relaxed">
            You can install this entire management portal directly to your computer (Windows, macOS, Linux). It runs in an independent desktop window with its own taskbar/dock icon, offline caching, and lightning-fast responsiveness.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition transform active:scale-95"
            >
              <Download className="w-5 h-5 text-blue-600" />
              <span>{isAppInstalled ? 'Desktop App Installed (Ready)' : 'Download / Install Desktop App'}</span>
            </button>

            {isAppInstalled && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/30 text-emerald-100 text-xs font-bold border border-emerald-400/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Active in Desktop Mode
              </span>
            )}
          </div>

          {installSuccess && (
            <p className="text-xs text-emerald-200 font-semibold mt-2">
              🎉 Application successfully installed to your Desktop! You can now open it anytime from your Desktop or Applications folder.
            </p>
          )}
        </div>

        {/* Decorative background icons */}
        <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden lg:block">
          <Laptop className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Installation Guide Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="font-bold text-sm text-slate-900">Chrome &amp; Edge (Windows/Mac)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the <span className="font-bold text-slate-700">Install</span> icon in the browser address bar (top-right) or click the download button above.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="font-bold text-sm text-slate-900">Safari (macOS Sonoma / Ventura)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            In Safari menu, click <span className="font-bold text-slate-700">File &rarr; Add to Dock</span>. The app is instantly added to your Mac Dock as a native app.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="font-bold text-sm text-slate-900">Standalone Desktop Window</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Once installed, the app opens without any browser URL bar, tabs, or bookmarks—giving you a dedicated ERP software experience.
          </p>
        </div>
      </div>

      {/* SECTION 2: SYSTEM ENVIRONMENT & ARCHITECTURE DIAGNOSTICS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Cpu className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Development Environment &amp; System Architecture
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active architectural layers, database connectivity status, and service health diagnostics.
            </p>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start md:self-auto">
            <span className="w-2 h-2 mr-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Development Environment Active
          </span>
        </div>

        {/* 3 Core Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Frontend Layer */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                Operational
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">Frontend Presentation</h4>
            <p className="text-xs text-slate-500">
              React 18 SPA, Vite, TypeScript, Tailwind CSS, Lucide icons, PWA Manifest.
            </p>
            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Local Server</span>
                <span className="font-mono font-semibold text-slate-800">localhost:5173</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Build Mode</span>
                <span className="font-bold text-emerald-700">Vite Production Bundler</span>
              </div>
            </div>
          </div>

          {/* Backend Layer */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                <Server className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                Port 5000
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">REST API Application</h4>
            <p className="text-xs text-slate-500">
              Node.js, Express.js, TypeScript, JWT security, Bcrypt, Centralized Controllers.
            </p>
            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Route</span>
                <span className="font-mono font-semibold text-indigo-700">/api/v1</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Auth Protocol</span>
                <span className="font-bold text-slate-800">JWT HttpOnly + Bearer</span>
              </div>
            </div>
          </div>

          {/* Database Layer */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                MySQL 8.0+
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">Prisma ORM &amp; Database</h4>
            <p className="text-xs text-slate-500">
              Schema migrations, relational constraints, atomic transactions, 100% type-safe.
            </p>
            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Database</span>
                <span className="font-mono font-semibold text-amber-800">business_management</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Migration State</span>
                <span className="font-bold text-emerald-700">Synchronized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Backend Health Diagnostic */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Live API Health Diagnostic Test</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pinging <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-700">GET /api/v1/health</code>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchHealth}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Pinging...' : 'Ping API Health'}</span>
            </Button>
          </div>

          <div>
            {loading ? (
              <p className="text-xs text-slate-500 py-3 text-center">Testing connection to backend API...</p>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Error: {error}</span>
              </div>
            ) : healthData ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Backend API Responding (200 OK)
                  </span>
                  <span className="font-mono text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    Healthy
                  </span>
                </div>
                <pre className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-emerald-200 overflow-x-auto">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
