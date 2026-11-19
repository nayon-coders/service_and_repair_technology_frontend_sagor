import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Printer, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  ClipboardList, 
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
  RequisitionRecord, 
  CustomerType, 
  RequisitionStatus, 
  CreateRequisitionInput, 
  UpdateRequisitionInput 
} from '../../types';
import { 
  fetchRequisitions, 
  createRequisition, 
  updateRequisition, 
  deleteRequisition, 
  bulkDeleteRequisitions, 
  downloadRequisitionCsv 
} from '../../services/requisitionService';
import { RequisitionPrintModal } from './RequisitionPrintModal';
import { RequisitionFormModal } from './RequisitionFormModal';

interface RequisitionManagerProps {
  customerType: CustomerType;
  title: string;
  subtitle: string;
}

export const RequisitionManager: React.FC<RequisitionManagerProps> = ({
  customerType,
  title,
  subtitle,
}) => {
  const [requisitions, setRequisitions] = useState<RequisitionRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalGrandAmount, setTotalGrandAmount] = useState<number>(0);
  const [totalPendingCount, setTotalPendingCount] = useState<number>(0);
  const [totalApprovedCount, setTotalApprovedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  const [activeRequisition, setActiveRequisition] = useState<RequisitionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchRequisitions({
        page: currentPage,
        limit: pageSize,
        customerType,
        search: searchQuery.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setRequisitions(data.items);
      setTotalCount(data.total);
      setTotalGrandAmount(data.totalGrandAmount);
      setTotalPendingCount(data.totalPendingCount);
      setTotalApprovedCount(data.totalApprovedCount);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error fetching requisitions');
    } finally {
      setIsLoading(false);
    }
  }, [customerType, currentPage, pageSize, searchQuery, statusFilter, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (val: number) => {
    return `৳ ${Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'APPROVED':
        return <StatusBadge label="Approved" variant="success" />;
      case 'PENDING':
        return <StatusBadge label="Pending" variant="warning" />;
      case 'REJECTED':
        return <StatusBadge label="Rejected" variant="danger" />;
      case 'COMPLETED':
        return <StatusBadge label="Completed" variant="info" />;
      default:
        return <StatusBadge label={status} variant="neutral" />;
    }
  };

  const handleFormSubmit = async (data: CreateRequisitionInput | UpdateRequisitionInput) => {
    setIsSubmitting(true);
    try {
      if (activeRequisition) {
        await updateRequisition(activeRequisition.id, data);
      } else {
        await createRequisition(data as CreateRequisitionInput);
      }
      setIsFormModalOpen(false);
      setActiveRequisition(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeRequisition) return;
    setIsSubmitting(true);
    try {
      await deleteRequisition(activeRequisition.id);
      setIsDeleteModalOpen(false);
      setActiveRequisition(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await bulkDeleteRequisitions(selectedIds);
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete requisitions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      await downloadRequisitionCsv({
        customerType,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  const columns: Column<RequisitionRecord>[] = [
    {
      id: 'estimateNo',
      header: 'Estimate No',
      sortable: true,
      render: (_val, r) => (
        <button
          onClick={() => {
            window.open(`/billing/requisitions/${r.id}/print`, '_blank');
          }}
          className="font-mono font-bold text-[#002060] hover:text-blue-800 hover:underline inline-flex items-center gap-1.5"
          title="Click to print estimate in new tab"
        >
          <span>{r.estimateNo}</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      sortable: true,
      render: (_val, r) => <span className="text-slate-600 font-medium">{r.date}</span>,
    },
    {
      id: 'organizationName',
      header: 'Organization / Customer',
      sortable: true,
      render: (_val, r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.organizationName}</p>
          {r.contactPerson && <p className="text-xs text-slate-500">{r.contactPerson} {r.contactNo ? `(${r.contactNo})` : ''}</p>}
        </div>
      ),
    },
    {
      id: 'equipmentName',
      header: 'Equipment / Model',
      render: (_val, r) => (
        <div>
          <p className="font-medium text-slate-800">{r.equipmentName || '—'}</p>
          {(r.brand || r.model) && <p className="text-xs text-slate-500">{[r.brand, r.model].filter(Boolean).join(' - ')}</p>}
        </div>
      ),
    },
    {
      id: 'sparePartsTotal',
      header: 'Spare Parts (৳)',
      align: 'right',
      render: (_val, r) => (
        <span className="font-mono text-slate-700">{formatCurrency(r.sparePartsTotal)}</span>
      ),
    },
    {
      id: 'serviceLabourTotal',
      header: 'Labour (৳)',
      align: 'right',
      render: (_val, r) => (
        <span className="font-mono text-slate-700">{formatCurrency(r.serviceLabourTotal)}</span>
      ),
    },
    {
      id: 'grandTotal',
      header: 'Grand Total',
      align: 'right',
      sortable: true,
      render: (_val, r) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(r.grandTotal)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      align: 'center',
      render: (_val, r) => getStatusBadge(r.status),
    },
  ];

  const rowActions: RowAction<RequisitionRecord>[] = [
    {
      label: 'Print Estimate (New Tab)',
      icon: Printer,
      onClick: (r) => {
        window.open(`/billing/requisitions/${r.id}/print`, '_blank');
      },
    },
    {
      label: 'Preview Modal',
      icon: Eye,
      onClick: (r) => {
        setActiveRequisition(r);
        setIsPrintModalOpen(true);
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (r) => {
        setActiveRequisition(r);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (r) => {
        setActiveRequisition(r);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
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
              setActiveRequisition(null);
              setIsFormModalOpen(true);
            }}
          >
            New Requisition Estimate
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Total Estimates</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002060] rounded-lg">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Estimated Value</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalGrandAmount)}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Approved by Client</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{totalApprovedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Pending Approval</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{totalPendingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center justify-between">
          <span>{apiError}</span>
          <Button variant="outline" size="sm" onClick={() => loadData()}>
            Retry
          </Button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search estimate #, client, equipment, serial no..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as RequisitionStatus | 'ALL');
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending Approval' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable<RequisitionRecord>
          columns={columns}
          data={requisitions}
          keyExtractor={(r) => r.id}
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
          emptyTitle="No requisitions found"
          emptyDescription="Create a new repair cost estimate / requisition using the button above."
        />
      </div>

      {/* Form Modal */}
      <RequisitionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveRequisition(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={activeRequisition}
        defaultCustomerType={customerType}
        isSubmitting={isSubmitting}
      />

      {/* Print Preview Modal */}
      <RequisitionPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setActiveRequisition(null);
        }}
        requisition={activeRequisition}
      />

      {/* Confirmation Modal Single Delete */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveRequisition(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Requisition"
        message={`Are you sure you want to delete estimate "${activeRequisition?.estimateNo}"? This action cannot be undone.`}
        confirmLabel="Delete Estimate"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Confirmation Modal Bulk Delete */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Bulk Delete Requisitions"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected requisition estimates?`}
        confirmLabel="Delete Selected"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

    </div>
  );
};

