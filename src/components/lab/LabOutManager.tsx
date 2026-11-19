import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowUpRight, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  PackageCheck, 
  DollarSign, 
  Plus, 
  Layers, 
  Calendar, 
  Building
} from 'lucide-react';
import { 
  DataTable, 
  Column, 
  RowAction, 
  Button, 
  SearchInput, 
  ConfirmationModal 
} from '../common';
import { 
  LabOutRecord, 
  CreateLabOutInput, 
  UpdateLabOutInput 
} from '../../types';
import { 
  fetchLabOuts, 
  createLabOut, 
  updateLabOut, 
  deleteLabOut, 
  bulkDeleteLabOuts, 
  downloadLabOutsCsv 
} from '../../services/labInventoryService';
import { LabOutFormModal } from './LabOutFormModal';

export const LabOutManager: React.FC = () => {
  const [items, setItems] = useState<LabOutRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  const [activeItem, setActiveItem] = useState<LabOutRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await fetchLabOuts({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setItems(res.items);
      setTotalCount(res.total);
      setTotalQuantity(res.totalQuantity || 0);
      setTotalAmount(res.totalAmount || 0);
    } catch (err: unknown) {
      const e = err as Error;
      setApiError(e.message || 'Failed to load Lab Out records');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Submit
  const handleFormSubmit = async (payload: CreateLabOutInput | UpdateLabOutInput) => {
    try {
      setIsSubmitting(true);
      if (activeItem) {
        await updateLabOut(activeItem.id, payload as UpdateLabOutInput);
      } else {
        await createLabOut(payload as CreateLabOutInput);
      }
      setIsFormModalOpen(false);
      setActiveItem(null);
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Operation failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Single Delete (Restores stock!)
  const handleDeleteConfirm = async () => {
    if (!activeItem) return;
    try {
      setIsSubmitting(true);
      await deleteLabOut(activeItem.id);
      setIsDeleteModalOpen(false);
      setActiveItem(null);
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Delete failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSubmitting(true);
      await bulkDeleteLabOuts(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Bulk delete failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      await downloadLabOutsCsv({
        search: searchQuery.trim() || undefined,
      });
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Export failed: ${e.message}`);
    }
  };

  const formatCurrency = (val: number) => {
    return `৳ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Table Columns
  const columns: Column<LabOutRecord>[] = [
    {
      id: 'date',
      header: 'Date',
      sortable: true,
      render: (_val, r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{r.date}</span>
        </div>
      ),
    },
    {
      id: 'partsName',
      header: 'Parts Dispatched',
      sortable: true,
      render: (_val, r) => (
        <div>
          <span className="font-bold text-slate-900 text-sm">{r.partsName}</span>
          {r.referenceNo && (
            <span className="block text-[10.5px] font-mono text-slate-500 mt-0.5">
              Ref: {r.referenceNo}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'quantity',
      header: 'Qty Out',
      sortable: true,
      render: (_val, r) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-xs">
          -{r.quantity}
        </span>
      ),
    },
    {
      id: 'unitPrice',
      header: 'Per Parts Price',
      sortable: true,
      render: (_val, r) => (
        <div className="font-mono text-slate-700 text-xs">
          {formatCurrency(r.unitPrice)}
        </div>
      ),
    },
    {
      id: 'totalPrice',
      header: 'Total Value',
      sortable: true,
      render: (_val, r) => (
        <div className="font-mono font-bold text-slate-900 text-sm">
          {formatCurrency(r.totalPrice)}
        </div>
      ),
    },
    {
      id: 'currentStock',
      header: 'Remaining Stock',
      render: (_val, r) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
          <Layers className="w-3 h-3" />
          {r.currentStock !== undefined ? `${r.currentStock} left` : 'Live'}
        </span>
      ),
    },
    {
      id: 'dispatchedTo',
      header: 'Dispatched To / Destination',
      render: (_val, r) => (
        <div className="text-xs text-slate-700 flex items-center gap-1 max-w-[200px] truncate" title={r.dispatchedTo || ''}>
          {r.dispatchedTo ? (
            <>
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{r.dispatchedTo}</span>
            </>
          ) : (
            '—'
          )}
        </div>
      ),
    },
  ];

  // Row Actions
  const actions: RowAction<LabOutRecord>[] = [
    {
      label: 'Edit Dispatch',
      icon: Edit,
      onClick: (r) => {
        setActiveItem(r);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (r) => {
        setActiveItem(r);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Service: Lab Out
            </h1>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Outtake Dispatch
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch parts from lab inventory to repair jobs and clients. Automatically deducts quantity from live stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            leftIcon={Download}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            leftIcon={Plus}
            onClick={() => {
              setActiveItem(null);
              setIsFormModalOpen(true);
            }}
          >
            + Create Lab Out
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quantity Out */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Parts Out
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              -{totalQuantity}
            </p>
            <p className="text-xs text-slate-500 mt-1">Dispatched from lab</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Out Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Dispatched Value
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Used in service &amp; repairs</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Out Records */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dispatch Orders
            </p>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {totalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Completed dispatches</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Live Auto Update Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inventory Balance
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              Auto Deducted
            </p>
            <p className="text-xs text-slate-500 mt-1">In - Out = Live Stock</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search parts, client, machine, ref..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <Button
            variant="ghost"
            leftIcon={RefreshCw}
            onClick={() => loadData()}
            title="Refresh data"
          >
            Refresh
          </Button>

          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              leftIcon={Trash2}
              onClick={() => setIsBulkDeleteModalOpen(true)}
            >
              Delete ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {apiError}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable<LabOutRecord>
          columns={columns}
          data={items}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          actions={actions}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          serverSide
          page={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size: number) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={(col: string, dir: 'asc' | 'desc') => {
            setSortColumn(col);
            setSortDirection(dir);
          }}
          emptyTitle="No Lab Out records found"
          emptyDescription="Click '+ Create Lab Out' to dispatch parts and auto-deduct stock."
        />
      </div>

      {/* Form Modal (Create / Edit) */}
      <LabOutFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveItem(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={activeItem}
        isSubmitting={isSubmitting}
      />

      {/* Single Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Lab Out Dispatch"
        message={`Are you sure you want to delete the dispatch of "${activeItem?.partsName}"? Its quantity (${activeItem?.quantity}) will be restored back to available lab stock.`}
        confirmLabel="Delete & Restore Stock"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Lab Out Dispatches"
        message={`Are you sure you want to delete ${selectedIds.length} selected dispatch records? Quantities will be restored back to available lab stock.`}
        confirmLabel={`Delete (${selectedIds.length})`}
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

