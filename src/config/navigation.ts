import { 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Compass, 
  MoreHorizontal, 
  Wrench, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Building, 
  User, 
  Receipt, 
  ClipboardList, 
  KeyRound, 
  FileText, 
  CreditCard, 
  Ticket, 
  Settings, 
  UserCheck, 
  Lock, 
  Sliders, 
  AlertCircle,
  LucideIcon 
} from 'lucide-react';

export interface NavItem {
  id: string;
  title: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'management',
    title: 'Management',
    icon: Briefcase,
    children: [
      {
        id: 'management-income',
        title: 'Income',
        href: '/management/income',
        icon: TrendingUp,
      },
      {
        id: 'management-expense',
        title: 'Expense',
        href: '/management/expense',
        icon: TrendingDown,
      },
      {
        id: 'management-salary',
        title: 'Salary',
        href: '/management/salary',
        icon: DollarSign,
      },
      {
        id: 'management-office-rent',
        title: 'Office Rent',
        href: '/management/office-rent',
        icon: Building2,
      },
      {
        id: 'management-ta-da',
        title: 'TA/DA',
        href: '/management/ta-da',
        icon: Compass,
      },
      {
        id: 'management-others',
        title: 'Others',
        href: '/management/others',
        icon: MoreHorizontal,
      },
    ],
  },
  {
    id: 'service',
    title: 'Service',
    icon: Wrench,
    children: [
      {
        id: 'service-lab-in',
        title: 'Lab In',
        href: '/service/lab-in',
        icon: ArrowDownLeft,
      },
      {
        id: 'service-lab-out',
        title: 'Lab Out',
        href: '/service/lab-out',
        icon: ArrowUpRight,
      },
    ],
  },
  {
    id: 'customer',
    title: 'Customer',
    icon: Users,
    children: [
      {
        id: 'customer-corporate',
        title: 'Corporate',
        icon: Building,
        children: [
          {
            id: 'customer-corporate-bill',
            title: 'Bill',
            href: '/customer/corporate/bill',
            icon: Receipt,
          },
          {
            id: 'customer-corporate-requisition',
            title: 'Requisition',
            href: '/customer/corporate/requisition',
            icon: ClipboardList,
          },
          {
            id: 'customer-corporate-gate-pass',
            title: 'Gate Pass',
            href: '/customer/corporate/gate-pass',
            icon: KeyRound,
          },
        ],
      },
      {
        id: 'customer-non-corporate',
        title: 'Non-Corporate',
        icon: User,
        children: [
          {
            id: 'customer-non-corporate-bill',
            title: 'Bill',
            href: '/customer/non-corporate/bill',
            icon: CreditCard,
          },
          {
            id: 'customer-non-corporate-requisition',
            title: 'Requisition',
            href: '/customer/non-corporate/requisition',
            icon: FileText,
          },
          {
            id: 'customer-non-corporate-gate-pass',
            title: 'Gate Pass',
            href: '/customer/non-corporate/gate-pass',
            icon: Ticket,
          },
        ],
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    children: [
      {
        id: 'settings-profile',
        title: 'Profile',
        href: '/settings/profile',
        icon: UserCheck,
      },
      {
        id: 'settings-change-password',
        title: 'Change Password',
        href: '/settings/change-password',
        icon: Lock,
      },
      {
        id: 'settings-system',
        title: 'System Settings',
        href: '/settings/system',
        icon: Sliders,
      },
      {
        id: 'settings-problem-templates',
        title: 'Problem Templates',
        href: '/settings/problem-templates',
        icon: AlertCircle,
      },
    ],
  },
];
