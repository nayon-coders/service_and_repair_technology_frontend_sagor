import React, { useState, useEffect, useCallback } from 'react';
import { 
  Printer,
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Truck, 
  Clock, 
  ExternalLink,
  Eye,
  RotateCcw,
  ArrowDownLeft,
  PackageCheck
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
  GatePassRecord, 
  CustomerType, 
  GatePassStatus, 
  ChallanKind,
  CreateGatePassInput, 
  UpdateGatePassInput 
} from '../../types';
import { 
  fetchGatePasses, 
  createGatePass, 
  updateGatePass, 
  deleteGatePass, 
  bulkDeleteGatePasses, 
  downloadGatePassCsv 
} from '../../services/gatePassService';
import { GatePassPrintModal } from './GatePassPrintModal';
import { GatePassFormModal } from './GatePassFormModal';

interface GatePassManagerProps {
  customerType: CustomerType;
  title: string;
  subtitle: string;
}

export const GatePassManager: React.FC<GatePassManagerProps> = ({
  customerType,
  title,
  subtitle,
}) => {
  const [gatePasses, setGatePasses] = useState<GatePassRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalReceivingCount, setTotalReceivingCount] = useState<number>(0);
  const [totalReturnCount, setTotalReturnCount] = useState<number>(0);
  const [totalDispatchedCount, setTotalDispatchedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [challanKindFilter, setChallanKindFilter] = useState<ChallanKind | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<GatePassStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [modalDefaultChallanKind, setModalDefaultChallanKind] = useState<ChallanKind>('RECEIVING');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  const [activeGatePass, setActiveGatePass] = useState<GatePassRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await fetchGatePasses({
        page: currentPage,
        limit: pageSize,
        customerType,
        challanKind: challanKindFilter,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setGatePasses(res.items);
      setTotalCount(res.total);
      setTotalReceivingCount(res.totalReceivingCount || 0);
      setTotalReturnCount(res.totalReturnCount || 0);
      setTotalDispatchedCount(res.totalDispatchedCount || 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to fetch gate passes');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, customerType, challanKindFilter, statusFilter, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = async () => {
    try {
      await downloadGatePassCsv({
        customerType,
        challanKind: challanKindFilter,
        status: statusFilter,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  const handleFormSubmit = async (data: CreateGatePassInput | UpdateGatePassInput) => {
    try {
      setIsSubmitting(true);
      if (activeGatePass) {
        await updateGatePass(activeGatePass.id, data);
      } else {
        await createGatePass(data as CreateGatePassInput);
      }
      setIsFormModalOpen(false);
      setActiveGatePass(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save gate pass');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeGatePass) return;
    try {
      setIsSubmitting(true);
      await deleteGatePass(activeGatePass.id);
      setIsDeleteModalOpen(false);
      setActiveGatePass(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete gate pass');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSubmitting(true);
      await bulkDeleteGatePasses(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to bulk delete gate passes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<GatePassRecord>[] = [
    {
      id: 'passNo',
      header: 'গেটপাস নং',
      sortable: true,
      render: (_val, r) => (
        <div 
          onClick={() => window.open(`/billing/gate-passes/${r.id}/print`, '_blank')}
          className="font-mono text-xs font-bold text-[#002060] hover:underline cursor-pointer flex items-center gap-1"
          title="Print Challan in New Tab"
        >
          <span>{r.passNo}</span>
          <ExternalLink className="w-3 h-3 text-slate-400 opacity-60" />
        </div>
      ),
    },
    {
      id: 'date',
      header: 'তারিখ',
      sortable: true,
      render: (_val, r) => (
        <span className="text-xs text-slate-700 whitespace-nowrap">
          {r.challanKind === 'RETURN' ? (r.returnDate || r.date) : r.date}
        </span>
      ),
    },
    {
      id: 'challanKind',
      header: 'চালানের ধরন',
      render: (_val, r) => {
        const isReceiving = r.challanKind === 'RECEIVING';
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
            isReceiving 
              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {isReceiving ? <ArrowDownLeft className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
            {isReceiving ? 'মেশিন গ্রহণ চালান' : 'মেশিন ফেরত চালান'}
          </span>
        );
      },
    },
    {
      id: 'organizationName',
      header: 'প্রতিষ্ঠান / সংস্থা',
      sortable: true,
      render: (_val, r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900">{r.organizationName}</p>
          {r.departmentWard && (
            <p className="text-[11px] text-slate-500 truncate max-w-xs">{r.departmentWard}</p>
          )}
        </div>
      ),
    },
    {
      id: 'machineName',
      header: 'মেশিনের বিবরণ',
      render: (_val, r) => {
        const name = r.machineName || r.items?.[0]?.description || '—';
        const serial = r.serialNo || r.items?.[0]?.serialNo;
        return (
          <div className="text-xs">
            <p className="font-medium text-slate-800">{name}</p>
            {serial && (
              <p className="text-[11px] font-mono text-slate-500">S/N: {serial}</p>
            )}
          </div>
        );
      },
    },
    {
      id: 'carrierName',
      header: 'পরিবহন / কর্মী',
      render: (_val, r) => {
        const person = r.deliveredBy || r.carrierName || '—';
        return (
          <div className="text-xs">
            <p className="font-medium text-slate-800">{person}</p>
            {r.vehicleNo && (
              <p className="text-[11px] font-mono text-slate-500">{r.vehicleNo}</p>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'স্ট্যাটাস',
      sortable: true,
      render: (_val, r) => {
        let variant: BadgeVariant = 'neutral';
        if (r.status === 'COMPLETED') variant = 'success';
        else if (r.status === 'APPROVED') variant = 'info';
        else if (r.status === 'DISPATCHED') variant = 'warning';
        else if (r.status === 'PENDING') variant = 'neutral';

        return <StatusBadge label={r.status} variant={variant} />;
      },
    },
  ];

  const rowActions: RowAction<GatePassRecord>[] = [
    {
      label: 'প্রিন্ট চালান (নতুন ট্যাব)',
      icon: Printer,
      onClick: (r) => {
        window.open(`/billing/gate-passes/${r.id}/print`, '_blank');
      },
    },
    {
      label: 'প্রিভিউ মডাল',
      icon: Eye,
      onClick: (r) => {
        setActiveGatePass(r);
        setIsPrintModalOpen(true);
      },
    },
    {
      label: 'সম্পাদনা (Edit)',
      icon: Edit,
      onClick: (r) => {
        setActiveGatePass(r);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'মুছে ফেলুন',
      icon: Trash2,
      variant: 'danger',
      onClick: (r) => {
        setActiveGatePass(r);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  const openCreateModal = (kind: ChallanKind) => {
    setActiveGatePass(null);
    setModalDefaultChallanKind(kind);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Download}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => loadData()}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            leftIcon={ArrowDownLeft}
            onClick={() => openCreateModal('RECEIVING')}
          >
            + মেশিন গ্রহণ চালান
          </Button>

          <Button
            variant="success"
            size="sm"
            leftIcon={RotateCcw}
            onClick={() => openCreateModal('RETURN')}
          >
            + মেশিন ফেরত চালান
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">মোট গেটপাস</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">মেশিন গ্রহণ চালান</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{totalReceivingCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">মেশিন ফেরত চালান</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{totalReturnCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">ডিসপ্যাচড / ইন-ট্রানজিট</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">{totalDispatchedCount}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center justify-between">
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
            placeholder="Search pass #, organization, machine, serial no, person..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="চালানের ধরন"
            value={challanKindFilter}
            onChange={(val) => {
              setChallanKindFilter(val as ChallanKind | 'ALL');
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'সব চালান (All)' },
              { value: 'RECEIVING', label: 'মেশিন গ্রহণ চালান' },
              { value: 'RETURN', label: 'মেশিন ফেরত চালান' },
            ]}
          />

          <FilterDropdown
            label="স্ট্যাটাস"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as GatePassStatus | 'ALL');
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'DISPATCHED', label: 'Dispatched' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable<GatePassRecord>
          columns={columns}
          data={gatePasses}
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
          emptyTitle="কোনো গেটপাস রেকর্ড পাওয়া যায়নি"
          emptyDescription="নতুন মেশিন গ্রহণ চালান অথবা মেশিন ফেরত চালান তৈরি করতে উপরের বোতাম ব্যবহার করুন।"
        />
      </div>

      {/* Form Modal */}
      <GatePassFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveGatePass(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={activeGatePass}
        defaultCustomerType={customerType}
        defaultChallanKind={modalDefaultChallanKind}
        isSubmitting={isSubmitting}
      />

      {/* Print Preview Modal */}
      <GatePassPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setActiveGatePass(null);
        }}
        gatePass={activeGatePass}
      />

      {/* Confirmation Modal Single Delete */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveGatePass(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Gate Pass"
        message={`Are you sure you want to delete gate pass "${activeGatePass?.passNo}"? This action cannot be undone.`}
        confirmLabel="Delete Gate Pass"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Confirmation Modal Bulk Delete */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Bulk Delete Gate Passes"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected gate passes?`}
        confirmLabel="Delete Selected"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
