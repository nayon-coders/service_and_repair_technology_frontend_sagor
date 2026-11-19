import { useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreVertical
} from 'lucide-react';
import { Pagination } from './Pagination';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export type SortDirection = 'asc' | 'desc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T, V = any> {
  id: string;
  header: string;
  accessor?: keyof T | ((row: T) => V);
  render?: (value: V, row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface RowAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;

  // Sorting
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (columnId: string, direction: SortDirection) => void;

  // Pagination
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  serverSide?: boolean;

  // Row Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  selectionActions?: (selectedIds: string[], clearSelection: () => void) => ReactNode;

  // Row Actions Dropdown
  actions?: RowAction<T>[];

  // Search filter query string (for client-side search)
  searchQuery?: string;
  searchFilterFields?: (keyof T)[];
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your criteria.',
  emptyAction,
  sortColumn: controlledSortCol,
  sortDirection: controlledSortDir,
  onSort: controlledOnSort,
  page: controlledPage = 1,
  pageSize: controlledPageSize = 10,
  totalCount: controlledTotal,
  onPageChange: controlledOnPageChange,
  onPageSizeChange: controlledOnPageSizeChange,
  serverSide = false,
  selectable = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  selectionActions,
  actions,
  searchQuery = '',
  searchFilterFields,
}: DataTableProps<T>) {
  // Local state for client-side sorting and pagination
  const [internalSortCol, setInternalSortCol] = useState<string | undefined>(undefined);
  const [internalSortDir, setInternalSortDir] = useState<SortDirection>('asc');
  const [internalPage, setInternalPage] = useState<number>(1);
  const [internalPageSize, setInternalPageSize] = useState<number>(10);
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<{
    rowKey: string;
    row: T;
    top: number;
    bottom: number;
    right: number;
    openUpwards: boolean;
  } | null>(null);

  // Close floating dropdown on scroll or resize
  useEffect(() => {
    if (!activeMenu) return;
    const handleClose = () => setActiveMenu(null);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenu]);

  const activeSortCol = controlledSortCol !== undefined ? controlledSortCol : internalSortCol;
  const activeSortDir = controlledSortDir !== undefined ? controlledSortDir : internalSortDir;
  const activePage = serverSide ? controlledPage : internalPage;
  const activePageSize = serverSide ? controlledPageSize : internalPageSize;

  const selectedIds = controlledSelectedIds !== undefined ? controlledSelectedIds : internalSelectedIds;

  // Client-side filtering & searching
  const filteredData = useMemo(() => {
    if (serverSide || !searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((row) => {
      if (searchFilterFields && searchFilterFields.length > 0) {
        return searchFilterFields.some((field) => {
          const val = row[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      }
      return Object.values(row as Record<string, unknown>).some((val) =>
        val !== undefined && val !== null && String(val).toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, searchFilterFields, serverSide]);

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (serverSide || !activeSortCol) return filteredData;
    const targetCol = columns.find((c) => c.id === activeSortCol);
    if (!targetCol) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal: unknown;
      let bVal: unknown;

      if (typeof targetCol.accessor === 'function') {
        aVal = targetCol.accessor(a);
        bVal = targetCol.accessor(b);
      } else if (targetCol.accessor) {
        aVal = a[targetCol.accessor];
        bVal = b[targetCol.accessor];
      } else {
        aVal = (a as Record<string, unknown>)[targetCol.id];
        bVal = (b as Record<string, unknown>)[targetCol.id];
      }

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return activeSortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return activeSortDir === 'asc'
        ? (aVal as number | string) > (bVal as number | string)
          ? 1
          : -1
        : (aVal as number | string) < (bVal as number | string)
          ? 1
          : -1;
    });
  }, [filteredData, activeSortCol, activeSortDir, columns, serverSide]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    if (serverSide) return sortedData;
    const start = (activePage - 1) * activePageSize;
    return sortedData.slice(start, start + activePageSize);
  }, [sortedData, activePage, activePageSize, serverSide]);

  const totalItems = serverSide ? (controlledTotal ?? data.length) : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / activePageSize));

  // Handle Sort Click
  const handleSort = (columnId: string) => {
    let nextDir: SortDirection = 'asc';
    if (activeSortCol === columnId) {
      nextDir = activeSortDir === 'asc' ? 'desc' : 'asc';
    }

    if (controlledOnSort) {
      controlledOnSort(columnId, nextDir);
    } else {
      setInternalSortCol(columnId);
      setInternalSortDir(nextDir);
    }
  };

  // Handle Row Selection
  const handleSelectAll = () => {
    const currentPageKeys = paginatedData.map(keyExtractor);
    const allSelected = currentPageKeys.every((key) => selectedIds.includes(key));

    const nextSelection = allSelected
      ? selectedIds.filter((key) => !currentPageKeys.includes(key))
      : Array.from(new Set([...selectedIds, ...currentPageKeys]));

    if (onSelectionChange) {
      onSelectionChange(nextSelection);
    } else {
      setInternalSelectedIds(nextSelection);
    }
  };

  const handleSelectRow = (rowKey: string) => {
    const nextSelection = selectedIds.includes(rowKey)
      ? selectedIds.filter((k) => k !== rowKey)
      : [...selectedIds, rowKey];

    if (onSelectionChange) {
      onSelectionChange(nextSelection);
    } else {
      setInternalSelectedIds(nextSelection);
    }
  };

  const clearSelection = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    } else {
      setInternalSelectedIds([]);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (controlledOnPageChange) {
      controlledOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (controlledOnPageSizeChange) {
      controlledOnPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const isAllPageSelected =
    paginatedData.length > 0 && paginatedData.every((row) => selectedIds.includes(keyExtractor(row)));
  const isSomePageSelected =
    paginatedData.some((row) => selectedIds.includes(keyExtractor(row))) && !isAllPageSelected;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Selected Items Batch Actions Bar */}
      {selectable && selectedIds.length > 0 && (
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 flex items-center justify-between text-xs text-indigo-900 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {selectedIds.length}
            </span>
            <span className="font-semibold">{selectedIds.length} items selected</span>
          </div>
          <div className="flex items-center space-x-2">
            {selectionActions && selectionActions(selectedIds, clearSelection)}
            <button
              type="button"
              onClick={clearSelection}
              className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-100/60 transition"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Main Table Responsive Wrapper */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
              {/* Select All Checkbox */}
              {selectable && (
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomePageSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}

              {/* Data Columns */}
              {columns.map((col) => {
                const isSorted = activeSortCol === col.id;
                const alignClass =
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                return (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    className={`py-3 px-4 ${alignClass} ${col.className || ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className={`inline-flex items-center space-x-1 hover:text-slate-900 transition focus:outline-none ${
                          isSorted ? 'text-indigo-600 font-bold' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          activeSortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}

              {/* Actions Column Header */}
              {actions && actions.length > 0 && (
                <th className="py-3 px-4 w-16 text-right">
                  <span>Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                  <LoadingSkeleton variant="tableRow" count={5} />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="py-12"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowKey = keyExtractor(row);
                const isSelected = selectedIds.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    className={`transition-colors duration-100 hover:bg-slate-50/75 ${
                      isSelected ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    {/* Row Select Checkbox */}
                    {selectable && (
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowKey)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          aria-label={`Select row ${rowKey}`}
                        />
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map((col) => {
                      let cellValue: unknown;
                      if (typeof col.accessor === 'function') {
                        cellValue = col.accessor(row);
                      } else if (col.accessor) {
                        cellValue = row[col.accessor];
                      } else {
                        cellValue = (row as Record<string, unknown>)[col.id];
                      }

                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                            ? 'text-center'
                            : 'text-left';

                      return (
                        <td key={col.id} className={`py-3.5 px-4 ${alignClass} ${col.className || ''}`}>
                          {col.render ? col.render(cellValue, row, index) : ((cellValue as ReactNode) ?? '—')}
                        </td>
                      );
                    })}

                    {/* Row Actions Dropdown */}
                    {actions && actions.length > 0 && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenu?.rowKey === rowKey) {
                              setActiveMenu(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const openUpwards = window.innerHeight - rect.bottom < 190;
                              setActiveMenu({
                                rowKey,
                                row,
                                top: rect.bottom + 4,
                                bottom: window.innerHeight - rect.top + 4,
                                right: window.innerWidth - rect.right,
                                openUpwards,
                              });
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition inline-flex items-center justify-center border border-transparent hover:border-slate-200"
                          aria-label="Row options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && paginatedData.length > 0 && (
        <Pagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={activePageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Floating Action Menu (Fixed in Viewport - Escapes table overflow clipping) */}
      {activeMenu && actions && actions.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/5"
            onClick={() => setActiveMenu(null)}
          />
          <div
            className="fixed z-50 min-w-[170px] bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: activeMenu.openUpwards ? undefined : `${activeMenu.top}px`,
              bottom: activeMenu.openUpwards ? `${activeMenu.bottom}px` : undefined,
              right: `${activeMenu.right}px`,
            }}
          >
            {actions.map((act, i) => {
              const IconComponent = act.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetRow = activeMenu.row;
                    setActiveMenu(null);
                    act.onClick(targetRow);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-left transition ${
                    act.variant === 'danger'
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {IconComponent && <IconComponent className="w-4 h-4 shrink-0" />}
                  <span className="whitespace-nowrap">{act.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
