import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { NavItem } from '../../config/navigation';

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
  onNavigate?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  collapsed,
  depth = 0,
  onNavigate,
}) => {
  const location = useLocation();
  const hasChildren = Boolean(item.children && item.children.length > 0);

  // Check if current item itself is active
  const isSelfActive = item.href ? location.pathname === item.href : false;

  // Check if any descendant is active (recursive)
  const isDescendantActive = (children?: NavItem[]): boolean => {
    if (!children) return false;
    return children.some(
      (child) =>
        (child.href && location.pathname === child.href) ||
        isDescendantActive(child.children)
    );
  };

  const hasActiveDescendant = isDescendantActive(item.children);
  const isActive = isSelfActive || hasActiveDescendant;

  // Auto-expand parent if any child is active, or toggle manually
  const [isOpen, setIsOpen] = useState<boolean>(() => isActive);

  useEffect(() => {
    if (hasActiveDescendant) {
      setIsOpen(true);
    }
  }, [hasActiveDescendant, location.pathname]);

  const Icon: LucideIcon = item.icon;

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (onNavigate) {
      onNavigate();
    }
  };

  // Determine active visual styles based on hierarchy level
  const activeClass = isSelfActive
    ? 'bg-indigo-50 text-indigo-600 font-semibold border-r-2 border-indigo-600'
    : hasActiveDescendant
      ? 'text-indigo-600 bg-indigo-50/50 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium';

  // Indentation per depth level
  const indentPadding =
    depth === 0 ? 'px-3' : depth === 1 ? 'pl-8 pr-3' : depth === 2 ? 'pl-11 pr-3' : 'pl-14 pr-3';

  const content = (
    <div
      onClick={handleToggle}
      className={`group relative flex items-center h-9 w-full cursor-pointer rounded-lg text-xs transition-colors duration-150 select-none ${activeClass} ${indentPadding}`}
    >
      {/* Icon */}
      <span className="flex items-center justify-center shrink-0">
        <Icon
          className={`transition-colors ${
            depth === 0 ? 'w-4 h-4' : 'w-3.5 h-3.5'
          } ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`}
        />
      </span>

      {/* Label (hidden when sidebar is collapsed) */}
      {!collapsed && (
        <span className="ml-3 truncate flex-1 text-left">
          {item.title}
        </span>
      )}

      {/* Expand/Collapse Chevron for parents */}
      {!collapsed && hasChildren && (
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 ml-auto transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      )}

      {/* Hover Tooltip when sidebar is collapsed */}
      {collapsed && depth === 0 && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50">
          <div className="font-medium">{item.title}</div>
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {item.href && !hasChildren ? (
        <Link to={item.href} onClick={onNavigate} className="block w-full">
          {content}
        </Link>
      ) : (
        content
      )}

      {/* Recursive Children Rendering */}
      {hasChildren && !collapsed && isOpen && (
        <div className="mt-0.5 space-y-0.5 transition-all duration-200">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              collapsed={collapsed}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
