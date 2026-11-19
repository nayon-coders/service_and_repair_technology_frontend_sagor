import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowDownLeft, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Package, 
  DollarSign, 
  Plus, 
  Layers, 
  Calendar, 
  Truck
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
  LabInRecord, 
  CreateLabInInput, 
  UpdateLabInInput 
} from '../../types';
import { 
  fetchLabIns, 
  createLabIn, 
  updateLabIn, 
  deleteLabIn, 
  bulkDeleteLabIns, 
  downloadLabInsCsv 
} from '../../services/labInventoryService';
import { LabInFormModal } from './LabInFormModal';

export const LabInManager: React.FC = () => {
  const [items, setItems] = useState<LabInRecord[]>([]);
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

  const [activeItem, setActiveItem] = useState<LabInRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await fetchLabIns({
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
      setApiError(e.message || 'Failed to load Lab In records');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Submit
  const handleFormSubmit = async (payload: CreateLabInInput | UpdateLabInInput) => {
    try {
      setIsSubmitting(true);
      if (activeItem) {
        await updateLabIn(activeItem.id, payload as UpdateLabInInput);
      } else {
        await createLabIn(payload as CreateLabInInput);
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

  // Handle Single Delete
  const handleDeleteConfirm = async () => {
    if (!activeItem) return;
    try {
      setIsSubmitting(true);
      await deleteLabIn(activeItem.id);
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
      await bulkDeleteLabIns(selectedIds);
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
      await downloadLabInsCsv({
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
  const columns: Column<LabInRecord>[] = [
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
      header: 'Parts Name',
      sortable: true,
      render: (_val, r) => (
        <div>
          <span className="font-bold text-slate-900 text-sm">{r.partsName}</span>
          {r.invoiceNo && (
            <span className="block text-[10.5px] font-mono text-slate-500 mt-0.5">
              Inv: {r.invoiceNo}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'quantity',
      header: 'Qty In',
      sortable: true,
      render: (_val, r) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
          +{r.quantity}
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
      header: 'Total Price',
      sortable: true,
      render: (_val, r) => (
        <div className="font-mono font-bold text-slate-900 text-sm">
          {formatCurrency(r.totalPrice)}
        </div>
      ),
    },
    {
      id: 'currentStock',
      header: 'Current Stock',
      render: (_val, r) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          <Layers className="w-3 h-3" />
          {r.currentStock !== undefined ? `${r.currentStock} in stock` : 'Available'}
        </span>
      ),
    },
    {
      id: 'supplier',
      header: 'Supplier / Source',
      render: (_val, r) => (
        <div className="text-xs text-slate-700 flex items-center gap-1 max-w-[180px] truncate" title={r.supplier || ''}>
          {r.supplier ? (
            <>
              <Truck className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{r.supplier}</span>
            </>
          ) : (
            '—'
          )}
        </div>
      ),
    },
  ];

  // Row Actions
  const actions: RowAction<LabInRecord>[] = [
    {
      label: 'Edit Record',
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
              Service: Lab In
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Intake Inventory
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Record spare parts received into the service lab. Stock levels and unit prices update automatically.
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
            + Add Lab In
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quantity In */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Parts In
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              +{totalQuantity}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total items received</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Investment Amount */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Intake Value
            </p>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Cumulative parts value</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total In Records */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Intake Batches
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {totalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Recorded transactions</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Real-time sync note */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock Integration
            </p>
            <p className="text-2xl font-black text-purple-600 mt-1">
              Live Sync
            </p>
            <p className="text-xs text-slate-500 mt-1">Auto-syncs with Lab Out</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
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
            placeholder="Search parts, supplier, invoice, remarks..."
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
        <DataTable<LabInRecord>
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
          emptyTitle="No Lab In records found"
          emptyDescription="Click '+ Add Lab In' to record spare parts intake into service lab."
        />
      </div>

      {/* Form Modal (Create / Edit) */}
      <LabInFormModal
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
        title="Delete Lab In Record"
        message={`Are you sure you want to delete the intake of "${activeItem?.partsName}"? Its stock quantity will be deducted from lab inventory.`}
        confirmLabel="Delete & Deduct"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Lab In Records"
        message={`Are you sure you want to delete ${selectedIds.length} selected Lab In records? Associated stock will be deducted from lab inventory.`}
        confirmLabel={`Delete (${selectedIds.length})`}
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

