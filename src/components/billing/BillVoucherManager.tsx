import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Printer, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Receipt, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Eye
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
  BillVoucherRecord, 
  CustomerType, 
  BillType, 
  VoucherPaymentStatus, 
  CreateBillVoucherInput, 
  UpdateBillVoucherInput 
} from '../../types';
import { 
  fetchVouchers, 
  createVoucher, 
  updateVoucher, 
  deleteVoucher, 
  bulkDeleteVouchers, 
  downloadVoucherCsv 
} from '../../services/voucherService';
import { BillVoucherPrintModal } from './BillVoucherPrintModal';
import { BillVoucherFormModal } from './BillVoucherFormModal';

interface BillVoucherManagerProps {
  customerType: CustomerType;
  title: string;
  subtitle: string;
}

export const BillVoucherManager: React.FC<BillVoucherManagerProps> = ({
  customerType,
  title,
  subtitle,
}) => {
  const [vouchers, setVouchers] = useState<BillVoucherRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalGrandAmount, setTotalGrandAmount] = useState<number>(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);
  const [totalDueAmount, setTotalDueAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // URL Query Params (e.g. ?requisitionId=...)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRequisitionId = searchParams.get('requisitionId');

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<VoucherPaymentStatus | 'ALL'>('ALL');
  const [billTypeFilter, setBillTypeFilter] = useState<BillType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  // Active targets
  const [activeVoucher, setActiveVoucher] = useState<BillVoucherRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch vouchers
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchVouchers({
        page: currentPage,
        limit: pageSize,
        customerType,
        search: searchQuery.trim() || undefined,
        paymentStatus: statusFilter === 'ALL' ? undefined : statusFilter,
        billType: billTypeFilter === 'ALL' ? undefined : billTypeFilter,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setVouchers(data.items);
      setTotalCount(data.total);
      setTotalGrandAmount(data.totalGrandAmount);
      setTotalPaidAmount(data.totalPaidAmount);
      setTotalDueAmount(data.totalDueAmount);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error fetching bill vouchers');
    } finally {
      setIsLoading(false);
    }
  }, [customerType, currentPage, pageSize, searchQuery, statusFilter, billTypeFilter, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open modal if requisitionId is present in URL
  useEffect(() => {
    if (urlRequisitionId) {
      setActiveVoucher(null);
      setIsFormModalOpen(true);
    }
  }, [urlRequisitionId]);

  // Currency format helper
  const formatCurrency = (val: number) => {
    return `৳ ${Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Status badge helper
  const getStatusBadge = (status: VoucherPaymentStatus) => {
    switch (status) {
      case 'PAID':
        return <StatusBadge label="Paid" variant="success" />;
      case 'DUE':
        return <StatusBadge label="Due" variant="danger" />;
      case 'PARTIAL':
        return <StatusBadge label="Partial" variant="warning" />;
      default:
        return <StatusBadge label={status} variant="neutral" />;
    }
  };

  // Bill Type badge helper
  const getBillTypeBadge = (bType: BillType) => {
    switch (bType) {
      case 'REPAIR':
        return <StatusBadge label="Repair" variant="info" />;
      case 'SERVICE':
        return <StatusBadge label="Service" variant="primary" />;
      case 'BOTH':
        return <StatusBadge label="Both" variant="success" />;
      default:
        return <StatusBadge label={bType} variant="neutral" />;
    }
  };

  // Form submit handler
  const handleFormSubmit = async (data: CreateBillVoucherInput | UpdateBillVoucherInput) => {
    setIsSubmitting(true);
    try {
      if (activeVoucher) {
        await updateVoucher(activeVoucher.id, data);
      } else {
        await createVoucher(data as CreateBillVoucherInput);
      }
      setIsFormModalOpen(false);
      setActiveVoucher(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete single voucher
  const handleDeleteConfirm = async () => {
    if (!activeVoucher) return;
    setIsSubmitting(true);
    try {
      await deleteVoucher(activeVoucher.id);
      setIsDeleteModalOpen(false);
      setActiveVoucher(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk delete vouchers
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await bulkDeleteVouchers(selectedIds);
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete vouchers');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV handler
  const handleExportCsv = async () => {
    try {
      await downloadVoucherCsv({
        customerType,
        paymentStatus: statusFilter === 'ALL' ? undefined : statusFilter,
        billType: billTypeFilter === 'ALL' ? undefined : billTypeFilter,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  // Columns definition matching DataTable Column interface
  const columns: Column<BillVoucherRecord>[] = [
    {
      id: 'voucherNo',
      header: 'Voucher No',
      sortable: true,
      render: (_val, v) => (
        <button
          onClick={() => {
            window.open(`/billing/vouchers/${v.id}/print`, '_blank');
          }}
          className="font-mono font-bold text-[#166534] hover:text-[#14532d] hover:underline inline-flex items-center gap-1.5"
          title="Click to print invoice in new tab"
        >
          <span>{v.voucherNo}</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      sortable: true,
      render: (_val, v) => <span className="text-slate-600 font-medium">{v.date}</span>,
    },
    {
      id: 'customerName',
      header: 'Customer / Institution',
      sortable: true,
      render: (_val, v) => (
        <div>
          <p className="font-semibold text-slate-800">{v.customerName}</p>
          {v.mobile && <p className="text-xs text-slate-500">{v.mobile}</p>}
        </div>
      ),
    },
    {
      id: 'machineName',
      header: 'Machine / Model',
      render: (_val, v) => (
        <div>
          <p className="font-medium text-slate-800">{v.machineName || '—'}</p>
          {v.brandModel && <p className="text-xs text-slate-500">{v.brandModel}</p>}
        </div>
      ),
    },
    {
      id: 'billType',
      header: 'Bill Type',
      align: 'center',
      render: (_val, v) => getBillTypeBadge(v.billType),
    },
    {
      id: 'grandTotal',
      header: 'Grand Total',
      align: 'right',
      sortable: true,
      render: (_val, v) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(v.grandTotal)}
        </span>
      ),
    },
    {
      id: 'paidAmount',
      header: 'Paid / Due',
      align: 'right',
      render: (_val, v) => (
        <div className="font-mono text-xs">
          <p className="text-emerald-600 font-semibold">P: {formatCurrency(v.paidAmount)}</p>
          {v.dueAmount > 0 && <p className="text-rose-600 font-semibold">D: {formatCurrency(v.dueAmount)}</p>}
        </div>
      ),
    },
    {
      id: 'paymentStatus',
      header: 'Status',
      align: 'center',
      render: (_val, v) => getStatusBadge(v.paymentStatus),
    },
  ];

  // Row Actions
  const rowActions: RowAction<BillVoucherRecord>[] = [
    {
      label: 'Print Invoice (New Tab)',
      icon: Printer,
      onClick: (v) => {
        window.open(`/billing/vouchers/${v.id}/print`, '_blank');
      },
    },
    {
      label: 'Preview Modal',
      icon: Eye,
      onClick: (v) => {
        setActiveVoucher(v);
        setIsPrintModalOpen(true);
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (v) => {
        setActiveVoucher(v);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (v) => {
        setActiveVoucher(v);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              {customerType === 'CORPORATE' ? 'Corporate' : 'Non-Corporate'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => loadData()}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={Download}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => {
              setActiveVoucher(null);
              setIsFormModalOpen(true);
            }}
          >
            New Bill Voucher
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Total Vouchers</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Grand Total Billed</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalGrandAmount)}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Collected / Paid</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalPaidAmount)}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Outstanding Due</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(totalDueAmount)}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center justify-between">
          <span>{apiError}</span>
          <Button variant="outline" size="sm" onClick={() => loadData()}>
            Retry
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search voucher #, customer, mobile, machine..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Bill Type"
            value={billTypeFilter}
            onChange={(val) => {
              setBillTypeFilter(val as BillType | 'ALL');
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Bill Types' },
              { value: 'REPAIR', label: 'Repair' },
              { value: 'SERVICE', label: 'Service' },
              { value: 'BOTH', label: 'Both' },
            ]}
          />

          <FilterDropdown
            label="Payment Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as VoucherPaymentStatus | 'ALL');
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PAID', label: 'Paid' },
              { value: 'DUE', label: 'Due' },
              { value: 'PARTIAL', label: 'Partial' },
            ]}
          />
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable<BillVoucherRecord>
          columns={columns}
          data={vouchers}
          keyExtractor={(v) => v.id}
          isLoading={isLoading}
          totalCount={totalCount}
          page={currentPage}
          pageSize={pageSize}
          serverSide
          selectable
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          actions={rowActions}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={(col, dir) => {
            setSortColumn(col);
            setSortDirection(dir);
          }}
          selectionActions={(selected, clear) => (
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                Delete Selected ({selected.length})
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                Clear
              </Button>
            </div>
          )}
          emptyTitle="No bill vouchers found"
          emptyDescription="Create a new machine repair or service bill voucher using the button above."
        />
      </div>

      {/* Bill Voucher Form Modal (Add / Edit) */}
      <BillVoucherFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveVoucher(null);
          if (urlRequisitionId) {
            searchParams.delete('requisitionId');
            setSearchParams(searchParams, { replace: true });
          }
        }}
        onSubmit={handleFormSubmit}
        initialData={activeVoucher}
        defaultCustomerType={customerType}
        initialRequisitionId={urlRequisitionId}
        isSubmitting={isSubmitting}
      />

      {/* Exact Same-To-Same Bill Voucher Print View / PDF Modal */}
      <BillVoucherPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setActiveVoucher(null);
        }}
        voucher={activeVoucher}
      />

      {/* Confirmation Modal for Single Delete */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveVoucher(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Bill Voucher"
        message={`Are you sure you want to permanently delete voucher "${activeVoucher?.voucherNo}"? This action cannot be undone.`}
        confirmLabel="Delete Voucher"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Confirmation Modal for Bulk Delete */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Bulk Delete Vouchers"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected vouchers?`}
        confirmLabel="Delete Selected"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

    </div>
  );
};
