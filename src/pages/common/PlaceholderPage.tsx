import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, ArrowLeft, Clock } from 'lucide-react';

interface PlaceholderPageProps {
  title?: string;
  phase?: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  phase = 'Phase 4 & 5',
  description,
}) => {
  const location = useLocation();
  const pathSegment = location.pathname.split('/').pop() || '';
  const displayTitle = title || pathSegment.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
        <Layers className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
        <Clock className="w-3.5 h-3.5" />
        <span>Planned for {phase}</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        {displayTitle} Module
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
        {description ||
          `This navigation route is established in the centralized hierarchy. Full business operations, entities, and UI components for ${displayTitle} will be implemented in subsequent phases.`}
      </p>

      <div className="mt-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

