import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  Loader2
} from 'lucide-react';
import { SidebarItem } from '../navigation/SidebarItem';
import { useNavigation } from '../../hooks/useNavigation';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { navItems, isLoading } = useNavigation();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static ${
          /* Mobile slide-in positioning */
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop collapsed vs expanded width */
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-slate-200/80 p-0.5">
              <img src="/logo.png" alt="1 Service & Repair Technology" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 tracking-tight leading-tight truncate">
                  1 Service & Repair
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Technology Admin</span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Close mobile sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
          {isLoading && navItems.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              {!collapsed && <span className="text-[11px]">Loading navigation...</span>}
            </div>
          ) : (
            navItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                onNavigate={onCloseMobile}
              />
            ))
          )}
        </div>

        {/* Collapsed Expand Toggle Button at Bottom */}
        {collapsed && (
          <div className="hidden lg:flex p-3 border-t border-slate-100 justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
