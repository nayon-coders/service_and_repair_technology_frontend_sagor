import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { NavItem, navigationConfig } from '../config/navigation';
import { NavigationContext } from './navigationContextDef';
import { fetchUserNavigation } from '../services/navigationService';
import { ApiNavigationMenuItem } from '../types';
import { getNavigationIcon } from '../utils/iconMap';
import { useAuth } from '../hooks/useAuth';

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [navItems, setNavItems] = useState<NavItem[]>(() => navigationConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Transform recursive API items to NavItem format with Lucide icons
  const transformApiMenu = useCallback((items: ApiNavigationMenuItem[]): NavItem[] => {
    return items.map((item) => ({
      id: item.key,
      title: item.title,
      href: item.path || undefined,
      icon: getNavigationIcon(item.icon),
      children: item.children && item.children.length > 0 ? transformApiMenu(item.children) : undefined,
    }));
  }, []);

  // Merge static navigationConfig into dynamic items so newly added pages are always displayed
  const mergeMenus = (dynamicItems: NavItem[], staticItems: NavItem[]): NavItem[] => {
    const result = [...dynamicItems];
    for (const staticItem of staticItems) {
      const matchIndex = result.findIndex((d) => d.id === staticItem.id);
      if (matchIndex === -1) {
        result.push(staticItem);
      } else if (staticItem.children && staticItem.children.length > 0) {
        result[matchIndex] = {
          ...result[matchIndex],
          children: mergeMenus(result[matchIndex].children || [], staticItem.children),
        };
      }
    }
    return result;
  };

  const loadNavigation = useCallback(async () => {
    if (!isAuthenticated) {
      setNavItems(navigationConfig);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const apiItems = await fetchUserNavigation();
      if (apiItems && apiItems.length > 0) {
        const transformed = transformApiMenu(apiItems);
        const merged = mergeMenus(transformed, navigationConfig);
        setNavItems(merged);
      } else {
        setNavItems(navigationConfig);
      }
    } catch (err: unknown) {
      // Graceful fallback to static configuration on network hiccup
      console.warn('Could not load dynamic navigation from backend, using baseline fallback:', err);
      setNavItems(navigationConfig);
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, transformApiMenu]);

  useEffect(() => {
    loadNavigation();
  }, [loadNavigation]);

  return (
    <NavigationContext.Provider
      value={{
        navItems,
        isLoading,
        error,
        refreshNavigation: loadNavigation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

