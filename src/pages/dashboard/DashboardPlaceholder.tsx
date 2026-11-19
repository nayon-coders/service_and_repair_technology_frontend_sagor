import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  User as UserIcon, 
  Mail, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Layers, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPlaceholder: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900/60 border-b border-slate-800 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">Business Management System</h1>
              <span className="text-xs text-slate-400">Authenticated Admin Session</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white">{user?.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-indigo-400 font-mono font-medium">{user?.role}</span>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center space-x-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-800/60 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition duration-150 disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full p-6 py-12 flex-1 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phase 2: Authentication System Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Administrator'}
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              You are securely authenticated. Your identity and permissions have been verified via JWT and HttpOnly session cookies.
            </p>
          </div>
        </div>

        {/* Admin Identity Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold">
                <UserIcon className="w-4 h-4" />
                <span>Admin Profile Metadata</span>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {user?.role}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">User ID</span>
                <span className="text-slate-200 font-mono">{user?.id}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                <span className="text-slate-400">Full Name</span>
                <span className="text-white font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                <span className="text-slate-400">Email Address</span>
                <span className="text-slate-200 font-mono flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-slate-500 inline mr-1" />
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                <span className="text-slate-400">Account Status</span>
                <span className="inline-flex items-center text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Security & Token Diagnostics */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
                <KeyRound className="w-4 h-4" />
                <span>Security & Session Status</span>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Authenticated
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Session Type</span>
                <span className="text-slate-200 font-mono">HttpOnly Cookie + JWT Bearer</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                <span className="text-slate-400">Password Hashing</span>
                <span className="text-slate-200 font-mono">bcrypt (12 rounds)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                <span className="text-slate-400">Route Guard</span>
                <span className="text-emerald-400 font-medium">ProtectedRoute Active</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                <span className="text-slate-400">Token Expiry</span>
                <span className="text-slate-200 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500 inline mr-1" />
                  1 Day (Rolling Session)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Restriction Notice */}
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2">
          <h3 className="text-sm font-bold text-slate-300">
            Phase 2 Scope Complete: Authentication Infrastructure
          </h3>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            The full Admin Dashboard layout, analytics widgets, navigation sidebars, and domain modules (Management, Service, Customers) will be implemented in subsequent phases according to architectural guidelines.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>Business Management Web Application &bull; Admin Portal</div>
        <div>Strict Phase 2 Boundary Enforced</div>
      </footer>
    </div>
  );
};

