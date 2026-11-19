import React, { useState, useEffect, useCallback } from 'react';
import { 
  Printer, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Eye, 
  Plus, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import { 
  DataTable, 
  Column, 
  RowAction, 
  Button, 
  StatusBadge, 
  BadgeVariant, 
  SearchInput, 
  FilterDropdown, 
  ConfirmationModal 
} from '../common';
import { 
  TaDaBillRecord, 
  TaDaStatus, 
  CreateTaDaBillInput, 
  UpdateTaDaBillInput 
} from '../../types';
import { 
  fetchTaDaBills, 
  createTaDaBill, 
  updateTaDaBill, 
  deleteTaDaBill, 
  bulkDeleteTaDaBills, 
  downloadTaDaCsv 
} from '../../services/taDaService';
import { TaDaPrintModal } from './TaDaPrintModal';
import { TaDaFormModal } from './TaDaFormModal';

export const TaDaManager: React.FC = () => {
  const [bills, setBills] = useState<TaDaBillRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPendingCount, setTotalPendingCount] = useState<number>(0);
  const [totalApprovedCount, setTotalApprovedCount] = useState<number>(0);
  const [totalPaidCount, setTotalPaidCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TaDaStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('submissionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  const [activeBill, setActiveBill] = useState<TaDaBillRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await fetchTaDaBills({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setBills(res.items);
      setTotalCount(res.total);
      setTotalAmount(res.totalAmount || 0);
      setTotalPendingCount(res.totalPendingCount || 0);
      setTotalApprovedCount(res.totalApprovedCount || 0);
      setTotalPaidCount(res.totalPaidCount || 0);
    } catch (err: unknown) {
      const e = err as Error;
      setApiError(e.message || 'Failed to load TA/DA bills');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (payload: CreateTaDaBillInput | UpdateTaDaBillInput) => {
    try {
      setIsSubmitting(true);
      if (activeBill) {
        await updateTaDaBill(activeBill.id, payload as UpdateTaDaBillInput);
      } else {
        await createTaDaBill(payload as CreateTaDaBillInput);
      }
      setIsFormModalOpen(false);
      setActiveBill(null);
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
    if (!activeBill) return;
    try {
      setIsSubmitting(true);
      await deleteTaDaBill(activeBill.id);
      setIsDeleteModalOpen(false);
      setActiveBill(null);
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
      await bulkDeleteTaDaBills(selectedIds);
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
      await downloadTaDaCsv({
        status: statusFilter,
        search: searchQuery.trim() || undefined,
      });
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Export failed: ${e.message}`);
    }
  };

  const getStatusBadgeVariant = (st: TaDaStatus): BadgeVariant => {
    switch (st) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'info';
      case 'PAID':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const formatCurrency = (val: number) => {
    return `৳ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Table Columns
  const columns: Column<TaDaBillRecord>[] = [
    {
      id: 'billNo',
      header: 'Voucher No',
      sortable: true,
      render: (_val, r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveBill(r);
              setIsPrintModalOpen(true);
            }}
            className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1.5"
            title="Preview voucher"
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            {r.billNo}
          </button>
          <a
            href={`/management/ta-da/${r.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open printable voucher in new tab"
            className="text-slate-400 hover:text-slate-600"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
    {
      id: 'submissionDate',
      header: 'Date',
      sortable: true,
      render: (_val, r) => (
        <div className="text-xs text-slate-600 font-medium">
          {r.submissionDate}
        </div>
      ),
    },
    {
      id: 'employeeName',
      header: 'Employee Details',
      sortable: true,
      render: (_val, r) => (
        <div>
          <div className="font-semibold text-slate-800">
            {r.employeeName}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            {r.designation && <span>{r.designation}</span>}
            {r.employeeId && (
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                ID: {r.employeeId}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      sortable: true,
      render: (_val, r) => (
        <span className="text-xs text-slate-700 font-medium">
          {r.department || '—'}
        </span>
      ),
    },
    {
      id: 'items',
      header: 'Items',
      render: (_val, r) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
          {(r.items || []).length} trips/rows
        </span>
      ),
    },
    {
      id: 'totalAmount',
      header: 'Total Claim',
      sortable: true,
      render: (_val, r) => (
        <div className="font-mono font-bold text-slate-900">
          {formatCurrency(r.totalAmount)}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (_val, r) => (
        <StatusBadge 
          label={r.status} 
          variant={getStatusBadgeVariant(r.status)} 
        />
      ),
    },
  ];

  // Row Actions
  const actions: RowAction<TaDaBillRecord>[] = [
    {
      label: 'Preview Voucher',
      icon: Eye,
      onClick: (r) => {
        setActiveBill(r);
        setIsPrintModalOpen(true);
      },
    },
    {
      label: 'Print (New Tab)',
      icon: Printer,
      onClick: (r) => {
        window.open(`/management/ta-da/${r.id}/print`, '_blank');
      },
    },
    {
      label: 'Edit Claim',
      icon: Edit,
      onClick: (r) => {
        setActiveBill(r);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (r) => {
        setActiveBill(r);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              TA / DA Management
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Management
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Travel Allowance &amp; Daily Allowance claim vouchers with 30-row official layout, watermark, and PDF generation.
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
              setActiveBill(null);
              setIsFormModalOpen(true);
            }}
          >
            New TA/DA Claim
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Claims */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Claims
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {totalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Submitted vouchers</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Total BDT Amount */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Amount
            </p>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Claimed reimbursement</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Claims */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved / Paid
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {totalApprovedCount + totalPaidCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {totalPaidCount} Paid, {totalApprovedCount} Approved
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Claims */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Claims
            </p>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {totalPendingCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <Clock className="w-6 h-6" />
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
            placeholder="Search voucher, employee, ID..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Status Filter */}
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Paid', value: 'PAID' },
              { label: 'Rejected', value: 'REJECTED' },
            ]}
            onChange={(val) => {
              setStatusFilter(val as TaDaStatus | 'ALL');
              setCurrentPage(1);
            }}
          />

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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable<TaDaBillRecord>
          columns={columns}
          data={bills}
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
          emptyTitle="No TA/DA vouchers found"
          emptyDescription="Click 'New TA/DA Claim' to record a voucher."
        />
      </div>

      {/* Form Modal (Create / Edit) */}
      <TaDaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveBill(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={activeBill}
        isSubmitting={isSubmitting}
      />

      {/* Print / Preview Modal */}
      <TaDaPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setActiveBill(null);
        }}
        bill={activeBill}
      />

      {/* Single Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveBill(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete TA/DA Voucher"
        message={`Are you sure you want to permanently delete voucher ${activeBill?.billNo}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected TA/DA Vouchers"
        message={`Are you sure you want to delete ${selectedIds.length} selected TA/DA vouchers? This cannot be undone.`}
        confirmLabel={`Delete (${selectedIds.length})`}
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
