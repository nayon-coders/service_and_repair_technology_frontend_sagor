import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../navigation/Breadcrumbs';

interface TopNavbarProps {
  onOpenMobile: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Menu */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Right: Admin Profile & Dropdown */}
      <div className="flex items-center space-x-4">
        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            aria-expanded={dropdownOpen}
          >
            {/* User Avatar Initial */}
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {userInitial}
            </div>

            {/* User Meta (hidden on mobile) */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user?.role || 'ADMIN'}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Profile Header Info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                  {user?.email || 'admin@example.com'}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="py-1">
                <div className="px-4 py-2 text-[11px] text-slate-400 font-medium">
                  Authentication & Security
                </div>

                <div className="px-4 py-1.5 text-xs text-slate-600 flex items-center justify-between">
                  <span className="flex items-center">
                    <UserIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    Account Status
                  </span>
                  <span className="text-emerald-600 font-medium text-[11px]">Active</span>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-rose-600" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5 mr-2 text-rose-500" />
                  )}
                  <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

