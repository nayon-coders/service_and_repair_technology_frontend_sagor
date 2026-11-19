import React from 'react';
import { LucideIcon, Inbox, Plus, Filter, Search, Download } from 'lucide-react';

interface ModulePageLayoutProps {
  title: string;
  category: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  actionLabel?: string;
}

export const ModulePageLayout: React.FC<ModulePageLayoutProps> = ({
  title,
  category,
  description,
  icon: Icon,
  badge,
  actionLabel,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600">
                {category}
              </span>
              {badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {badge}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Button (Placeholder) */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            disabled
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-xs opacity-80 cursor-not-allowed"
            title="Action available in subsequent business phase"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{actionLabel || `New ${title}`}</span>
          </button>
        </div>
      </div>

      {/* Control Bar Placeholder: Search, Filter, Export */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            disabled
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400 placeholder-slate-400 cursor-not-allowed focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Clean Empty State (No Fake Records) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-200/60">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          No data available yet.
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
          There are currently no records for {title.toLowerCase()}. Business data models, forms, and workflows will be implemented in subsequent phases.
        </p>
        <div className="mt-5 inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
          <span>Route: active &bull; UI Placeholder</span>
        </div>
      </div>
    </div>
  );
};

