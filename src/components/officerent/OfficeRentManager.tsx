import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  CreditCard,
  Check,
  XCircle
} from 'lucide-react';
import { 
  DataTable, 
  Column, 
  RowAction, 
  Button, 
  StatusBadge, 
  SearchInput, 
  FilterDropdown, 
  ConfirmationModal 
} from '../common';
import { 
  OfficeRentRecord, 
  RentPaymentStatus, 
  CreateOfficeRentInput, 
  UpdateOfficeRentInput 
} from '../../types';
import { 
  fetchOfficeRents, 
  createOfficeRent, 
  updateOfficeRent, 
  deleteOfficeRent, 
  bulkDeleteOfficeRents, 
  downloadOfficeRentCsv 
} from '../../services/officeRentService';
import { OfficeRentFormModal } from './OfficeRentFormModal';

export const OfficeRentManager: React.FC = () => {
  const [rents, setRents] = useState<OfficeRentRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);
  const [totalUnpaidAmount, setTotalUnpaidAmount] = useState<number>(0);
  const [totalPaidCount, setTotalPaidCount] = useState<number>(0);
  const [totalUnpaidCount, setTotalUnpaidCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<RentPaymentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  const [activeRent, setActiveRent] = useState<OfficeRentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await fetchOfficeRents({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setRents(res.items);
      setTotalCount(res.total);
      setTotalAmount(res.totalAmount || 0);
      setTotalPaidAmount(res.totalPaidAmount || 0);
      setTotalUnpaidAmount(res.totalUnpaidAmount || 0);
      setTotalPaidCount(res.totalPaidCount || 0);
      setTotalUnpaidCount(res.totalUnpaidCount || 0);
    } catch (err: unknown) {
      const e = err as Error;
      setApiError(e.message || 'Failed to load office rent records');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Submit
  const handleFormSubmit = async (payload: CreateOfficeRentInput | UpdateOfficeRentInput) => {
    try {
      setIsSubmitting(true);
      if (activeRent) {
        await updateOfficeRent(activeRent.id, payload as UpdateOfficeRentInput);
      } else {
        await createOfficeRent(payload as CreateOfficeRentInput);
      }
      setIsFormModalOpen(false);
      setActiveRent(null);
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Operation failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Paid / Unpaid Status
  const handleToggleStatus = async (record: OfficeRentRecord) => {
    try {
      setIsLoading(true);
      const newStatus: RentPaymentStatus = record.status === 'PAID' ? 'UNPAID' : 'PAID';
      await updateOfficeRent(record.id, {
        status: newStatus,
        paymentDate: newStatus === 'PAID' ? new Date().toISOString().split('T')[0] : null,
      });
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Status update failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Single Delete
  const handleDeleteConfirm = async () => {
    if (!activeRent) return;
    try {
      setIsSubmitting(true);
      await deleteOfficeRent(activeRent.id);
      setIsDeleteModalOpen(false);
      setActiveRent(null);
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
      await bulkDeleteOfficeRents(selectedIds);
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
      await downloadOfficeRentCsv({
        status: statusFilter,
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
  const columns: Column<OfficeRentRecord>[] = [
    {
      id: 'month',
      header: 'Month',
      sortable: true,
      render: (_val, r) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">{r.month}</span>
            {r.receiptNo && (
              <span className="block text-[10.5px] font-mono text-slate-500 mt-0.5">
                Ref: {r.receiptNo}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'title',
      header: 'Title',
      sortable: true,
      render: (_val, r) => (
        <span className="text-xs font-semibold text-slate-800">
          {r.title}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Rent Amount',
      sortable: true,
      render: (_val, r) => (
        <div className="font-mono font-bold text-slate-900 text-sm">
          {formatCurrency(r.amount)}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (_val, r) => (
        <StatusBadge 
          label={r.status === 'PAID' ? 'Paid' : 'Unpaid (Due)'} 
          variant={r.status === 'PAID' ? 'success' : 'danger'} 
        />
      ),
    },
    {
      id: 'paymentDetails',
      header: 'Payment Info',
      render: (_val, r) => (
        <div className="text-xs">
          {r.status === 'PAID' ? (
            <div>
              <p className="font-medium text-slate-800 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                {r.paymentMethod || 'Settled'}
              </p>
              {r.paymentDate && (
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Paid on: {r.paymentDate}
                </p>
              )}
            </div>
          ) : (
            <span className="text-rose-600 font-medium text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Payment Pending
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'landlordName',
      header: 'Landlord / Premise',
      render: (_val, r) => (
        <div className="text-xs text-slate-700 max-w-[200px] truncate" title={r.landlordName || ''}>
          {r.landlordName || '—'}
        </div>
      ),
    },
    {
      id: 'note',
      header: 'Remarks',
      render: (_val, r) => (
        <div className="text-xs text-slate-500 max-w-[220px] truncate" title={r.note || ''}>
          {r.note || '—'}
        </div>
      ),
    },
  ];

  // Row Actions
  const actions: RowAction<OfficeRentRecord>[] = [
    {
      label: 'Toggle Paid / Unpaid',
      icon: Check,
      onClick: (r) => handleToggleStatus(r),
    },
    {
      label: 'Edit Record',
      icon: Edit,
      onClick: (r) => {
        setActiveRent(r);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (r) => {
        setActiveRent(r);
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
              Office Rent Management
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Management
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track monthly office premise rental payments, settlement statuses, and payment histories.
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
              setActiveRent(null);
              setIsFormModalOpen(true);
            }}
          >
            Add Office Rent
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rent Amount */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Rent Billed
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{totalCount} total months recorded</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Paid Amount */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Paid
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {formatCurrency(totalPaidAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{totalPaidCount} settled months</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Due / Unpaid Amount */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Due / Unpaid
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {formatCurrency(totalUnpaidAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{totalUnpaidCount} pending payment</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Settlement Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Settlement Rate
            </p>
            <p className="text-2xl font-black text-purple-600 mt-1">
              {totalCount > 0 ? Math.round((totalPaidCount / totalCount) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Rent compliance</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <DollarSign className="w-6 h-6" />
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
            placeholder="Search month, landlord, note, ref..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Status Filter */}
          <FilterDropdown
            label="Payment Status"
            value={statusFilter}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Paid', value: 'PAID' },
              { label: 'Unpaid (Due)', value: 'UNPAID' },
            ]}
            onChange={(val) => {
              setStatusFilter(val as RentPaymentStatus | 'ALL');
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

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable<OfficeRentRecord>
          columns={columns}
          data={rents}
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
          emptyTitle="No office rent records found"
          emptyDescription="Click 'Add Office Rent' to record a monthly premise rental payment."
        />
      </div>

      {/* Form Modal (Create / Edit) */}
      <OfficeRentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveRent(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={activeRent}
        isSubmitting={isSubmitting}
      />

      {/* Single Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveRent(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Office Rent Record"
        message={`Are you sure you want to delete the rent record for "${activeRent?.month}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Office Rent Records"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected office rent records?`}
        confirmLabel={`Delete (${selectedIds.length})`}
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

