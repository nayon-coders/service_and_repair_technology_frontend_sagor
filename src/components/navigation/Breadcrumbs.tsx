import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const segmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  management: 'Management',
  income: 'Income',
  expense: 'Expense',
  salary: 'Salary',
  'office-rent': 'Office Rent',
  'ta-da': 'TA/DA',
  others: 'Others',
  service: 'Service',
  'lab-in': 'Lab In',
  'lab-out': 'Lab Out',
  customer: 'Customer',
  corporate: 'Corporate',
  'non-corporate': 'Non-Corporate',
  bill: 'Bill',
  requisition: 'Requisition',
  'gate-pass': 'Gate Pass',
  employees: 'Employee Management',
  'employee-management': 'Employee Management',
  settings: 'Settings',
  profile: 'Profile',
  'change-password': 'Change Password',
  system: 'System Settings',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="flex items-center text-slate-400 hover:text-slate-700 transition duration-150"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = segmentLabels[segment] || segment.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 font-semibold truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="text-slate-500 hover:text-slate-800 transition duration-150 truncate max-w-[150px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
