import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  CheckCircle,
  Clock,
  RefreshCw,
  FileSpreadsheet
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
  Modal, 
  ConfirmationModal,
  Input, 
  Select, 
  Textarea, 
  DatePicker,
  FileUpload
} from '../../components/common';
import { IncomeRecord, PaymentStatus } from '../../types';
import { 
  fetchIncomes, 
  createIncome, 
  updateIncome, 
  deleteIncome, 
  bulkDeleteIncomes, 
  importIncomesFile, 
  downloadIncomeCsv 
} from '../../services/incomeService';

export const IncomePage: React.FC = () => {
  // State management
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [unpaidAmount, setUnpaidAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  
  // Action targeting state
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<IncomeRecord | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    companyOrStoreName: '',
    amount: '',
    status: 'PAID' as PaymentStatus,
    remarks: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Incomes from Backend API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchIncomes({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        status: statusFilter,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setIncomes(data.items);
      setTotalCount(data.total);
      setTotalAmount(data.totalAmount);
      setPaidAmount(data.paidAmount);
      setUnpaidAmount(data.unpaidAmount);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load income records';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      companyOrStoreName: '',
      amount: '',
      status: 'PAID',
      remarks: '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (record: IncomeRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      companyOrStoreName: record.companyOrStoreName,
      amount: String(record.amount),
      status: record.status,
      remarks: record.remarks || '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Single Delete Modal
  const handleOpenDeleteModal = (record: IncomeRecord) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  // Validate Add/Edit Form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.companyOrStoreName.trim()) {
      errors.companyOrStoreName = 'Company or store name is required';
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid positive amount';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add or Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await updateIncome(editingRecord.id, {
          date: formData.date,
          companyOrStoreName: formData.companyOrStoreName.trim(),
          amount: parseFloat(formData.amount),
          status: formData.status,
          remarks: formData.remarks.trim() || undefined,
        });
      } else {
        await createIncome({
          date: formData.date,
          companyOrStoreName: formData.companyOrStoreName.trim(),
          amount: parseFloat(formData.amount),
          status: formData.status,
          remarks: formData.remarks.trim() || undefined,
        });
      }

      setIsFormModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save income record';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Single Delete
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteIncome(recordToDelete.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete record';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await bulkDeleteIncomes(selectedIds);
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete selected records';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Excel File Import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsSubmitting(true);
    try {
      const result = await importIncomesFile(importFile);
      setIsImportModalOpen(false);
      setImportFile(null);
      alert(`Successfully imported ${result.count} income records!`);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Export CSV
  const handleExportCsv = async (ids?: string[]) => {
    try {
      await downloadIncomeCsv(ids);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      alert(msg);
    }
  };

  // Table Columns Definition
  const columns: Column<IncomeRecord>[] = [
    {
      id: 'sn',
      header: 'SN',
      width: '60px',
      render: (_val, _row, index) => (
        <span className="font-mono text-xs font-semibold text-slate-500">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      sortable: true,
      width: '130px',
      render: (val: string) => (
        <span className="font-medium text-slate-800 text-xs">
          {val}
        </span>
      ),
    },
    {
      id: 'companyOrStoreName',
      header: 'Company or Store Name',
      sortable: true,
      render: (val: string, row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {val}
          </span>
          {row.remarks && (
            <span className="text-xs text-slate-400 truncate max-w-xs block mt-0.5">
              {row.remarks}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Total Income',
      align: 'right',
      sortable: true,
      render: (val: number) => (
        <span className="font-bold text-slate-900 text-sm">
          ৳ {val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      align: 'center',
      render: (val: PaymentStatus) => {
        const variant: BadgeVariant = val === 'PAID' ? 'success' : 'warning';
        return (
          <StatusBadge 
            label={val === 'PAID' ? 'Paid' : 'Unpaid'} 
            variant={variant} 
            dot 
            size="sm" 
          />
        );
      },
    },
  ];

  // Table Row Actions
  const rowActions: RowAction<IncomeRecord>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: handleOpenEditModal,
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: handleOpenDeleteModal,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                  Management Module
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Income Records
              </h1>
            </div>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track daily repair services, product sales, store billings, and payment settlements.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={RefreshCw}
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCsv()}
            leftIcon={Download}
          >
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={Upload}
          >
            Upload Excel (.xlsx)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={Plus}
          >
            Add Income
          </Button>
        </div>
      </div>

      {/* KPI Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Income (মোট ইনকাম)
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ৳ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Across all filtered records
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Paid Amount (পরিশোধিত)
            </span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              ৳ {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-600/70 mt-0.5 block">
              Settled transactions
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Unpaid Amount */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Unpaid / Due (বকেয়া)
            </span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              ৳ {unpaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-amber-600/70 mt-0.5 block">
              Pending collections
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Entries */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Entries (মোট রেকর্ড)
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Transactions logged
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Card with DataTable & Search/Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search company, store or remarks..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <FilterDropdown
              label="Payment Status"
              value={statusFilter}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Paid', value: 'PAID' },
                { label: 'Unpaid', value: 'UNPAID' },
              ]}
              onChange={(val) => {
                setStatusFilter(val as PaymentStatus | 'ALL');
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* API Error Alert if any */}
        {apiError && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{apiError}</span>
            <button 
              onClick={loadData}
              className="font-semibold underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Interactive Generic DataTable */}
        <DataTable
          columns={columns}
          data={incomes}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          actions={rowActions}
          serverSide
          page={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={(col: string, dir: 'asc' | 'desc') => {
            setSortColumn(col);
            setSortDirection(dir);
          }}
          emptyTitle="No income records found"
          emptyDescription="Start recording daily business revenue by adding a new income or importing an Excel sheet."
          emptyAction={
            <Button variant="primary" size="sm" onClick={handleOpenAddModal} leftIcon={Plus}>
              Add Income
            </Button>
          }
          selectionActions={(selectedIds, clearSelection) => (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCsv(selectedIds)}
                leftIcon={Download}
                className="bg-white text-slate-800"
              >
                Export Selected as CSV
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                leftIcon={Trash2}
              >
                Delete Selected ({selectedIds.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
            </div>
          )}
        />
      </div>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingRecord ? 'Edit Income Record' : 'Record New Income'}
        subtitle="Enter the transaction date, client/store details, and payment amount."
        size="md"
        footer={
          <div className="flex items-center justify-end space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              onClick={handleFormSubmit}
            >
              {editingRecord ? 'Save Changes' : 'Save Income'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePicker
              label="Transaction Date (তারিখ)"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formErrors.date}
            />

            <Select
              label="Payment Status"
              required
              value={formData.status}
              options={[
                { value: 'PAID', label: 'Paid (পরিশোধিত)' },
                { value: 'UNPAID', label: 'Unpaid / Due (বকেয়া)' },
              ]}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
            />
          </div>

          <Input
            label="Company or Store Name (কোম্পানি / স্টোরের নাম)"
            placeholder="e.g. ট্রেড মিল সার্ভিস, ওভেন, সি.সি.ক্যমেরা"
            required
            value={formData.companyOrStoreName}
            onChange={(e) => setFormData({ ...formData, companyOrStoreName: e.target.value })}
            error={formErrors.companyOrStoreName}
          />

          <Input
            label="Total Income Amount (টাকার পরিমাণ)"
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            error={formErrors.amount}
          />

          <Textarea
            label="Remarks / Notes (মন্তব্য)"
            placeholder="Additional notes about this service or transaction..."
            rows={2}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />
        </form>
      </Modal>

      {/* Upload Excel (.xlsx) Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Upload Excel Sheet (.xlsx / .csv)"
        subtitle="Import multiple income entries directly from your monthly Excel workbook."
        size="md"
        footer={
          <div className="flex items-center justify-end space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportFile(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!importFile}
              isLoading={isSubmitting}
              onClick={handleImportSubmit}
              leftIcon={Upload}
            >
              Upload & Import Data
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-900 leading-relaxed">
            <p className="font-semibold mb-1">Supported Excel Format:</p>
            <p>The importer automatically reads your monthly sheet with the following standard columns:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-indigo-800">
              <li><strong>SN</strong>: Serial Number</li>
              <li><strong>Date</strong>: Date (e.g. 28/04/2026 or Excel serial date)</li>
              <li><strong>Company or store name</strong>: Description/Client name</li>
              <li><strong>Total Income</strong>: Income amount</li>
            </ul>
          </div>

          <FileUpload
            label="Select Excel File"
            accept=".xlsx,.xls,.csv"
            maxSizeMB={15}
            onFileSelect={(file) => setImportFile(file)}
          />
        </div>
      </Modal>

      {/* Single Record Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Income Record"
        message={`Are you sure you want to permanently delete the income entry for "${recordToDelete?.companyOrStoreName}" (৳ ${recordToDelete?.amount.toLocaleString()})?`}
        confirmLabel="Yes, Delete Record"
        cancelLabel="Cancel"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Income Records"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected income records? This action cannot be reversed.`}
        confirmLabel={`Yes, Delete ${selectedIds.length} Records`}
        cancelLabel="Cancel"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
