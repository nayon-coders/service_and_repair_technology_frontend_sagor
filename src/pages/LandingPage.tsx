import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Server, 
  Database, 
  Layers, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { checkHealth } from '../services/healthService';
import { ApiResponse, HealthData } from '../types';

export const LandingPage: React.FC = () => {
  const [healthData, setHealthData] = useState<ApiResponse<HealthData> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        setError('Failed to connect to backend API');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-8 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Business Management System</h1>
            <p className="text-xs text-slate-400">Phase 1: Project Initialization & System Architecture</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
          >
            <span>Admin Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <span className="w-2 h-2 mr-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Environment Ready
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture Baseline Established</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Development Environment Active
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Frontend, Backend REST API, and Prisma ORM with MySQL are configured and ready for subsequent feature phases.
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Frontend Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm backdrop-blur-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                Operational
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Frontend Core</h3>
            <p className="text-sm text-slate-400 mb-4">
              Vite, React 18, TypeScript, Tailwind CSS, React Router, and Axios initialized.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>React + Vite</span>
                <span className="text-emerald-400 font-mono">v18.3 / v5.4</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>Tailwind CSS</span>
                <span className="text-emerald-400 font-mono">Configured</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>TypeScript</span>
                <span className="text-emerald-400 font-mono">Strict Mode</span>
              </div>
            </div>
          </div>

          {/* Backend Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm backdrop-blur-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Server className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800">
                Port 5000
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Backend REST API</h3>
            <p className="text-sm text-slate-400 mb-4">
              Node.js, Express, TypeScript, Centralized Middleware & Standardized Responses.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>Base Route</span>
                <span className="text-blue-400 font-mono">/api/v1</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>Logging & CORS</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>Error Handling</span>
                <span className="text-emerald-400 font-mono">Centralized</span>
              </div>
            </div>
          </div>

          {/* Database Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm backdrop-blur-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-800">
                MySQL 8.0+
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Prisma ORM</h3>
            <p className="text-sm text-slate-400 mb-4">
              Schema configured, environment-based credentials, database connection prepared.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>Datasource</span>
                <span className="text-amber-400 font-mono">MySQL</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>Client Generator</span>
                <span className="text-emerald-400 font-mono">Prisma Client</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800">
                <span>Database</span>
                <span className="text-amber-400 font-mono">business_management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Backend Health Check Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold mb-1">
                <Activity className="w-4 h-4" />
                <span>Live API Health Diagnostic</span>
              </div>
              <p className="text-xs text-slate-400">
                Calling <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono">GET /api/v1/health</code> via Axios
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition duration-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="py-6 text-center text-sm text-slate-400">
                Pinging Backend API...
              </div>
            ) : error ? (
              <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-4 flex items-start space-x-3 text-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Health Check Failed</div>
                  <div className="text-xs mt-1 text-rose-400/90">{error}</div>
                  <div className="text-xs mt-2 text-slate-400">
                    Ensure the backend server is running on port 5000 (<code className="font-mono text-slate-300">npm run dev</code> in backend).
                  </div>
                </div>
              </div>
            ) : healthData ? (
              <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4 flex items-start space-x-3 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">API Response Received Successfully</span>
                    <span className="text-xs font-mono bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">
                      200 OK
                    </span>
                  </div>
                  <div className="mt-3 bg-slate-950/90 rounded-lg p-3 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
                    <pre>{JSON.stringify(healthData, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>Business Management Web Application Architecture &bull; Phase 1</div>
        <div>Strict Phase Separation Enabled &bull; Ready for Phase 2</div>
      </footer>
    </div>
  );
};

