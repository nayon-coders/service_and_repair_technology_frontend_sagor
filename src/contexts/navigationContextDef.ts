import { createContext } from 'react';
import { NavItem } from '../config/navigation';

export interface NavigationContextType {
  navItems: NavItem[];
  isLoading: boolean;
  error: string | null;
  refreshNavigation: () => Promise<void>;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

