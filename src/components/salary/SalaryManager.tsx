import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DollarSign, 
  UserCheck, 
  Calendar, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileSpreadsheet
} from 'lucide-react';
import { 
  DataTable, 
  Column, 
  RowAction, 
  Button, 
  SearchInput, 
  FilterDropdown, 
  ConfirmationModal 
} from '../common';
import { 
  SalaryRecordData, 
  SalaryPaymentStatus, 
  CreateSalaryInput, 
  UpdateSalaryInput 
} from '../../types';
import { 
  fetchSalaryRecords, 
  createSalaryRecord, 
  updateSalaryRecord, 
  deleteSalaryRecord, 
  bulkDeleteSalaryRecords, 
  downloadSalaryCsv 
} from '../../services/salaryService';
import { SalaryFormModal } from './SalaryFormModal';

export const SalaryManager: React.FC = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecordData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalNetPayable, setTotalNetPayable] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [totalDue, setTotalDue] = useState<number>(0);
  const [distinctMonths, setDistinctMonths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<SalaryPaymentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  const [activeRecord, setActiveRecord] = useState<SalaryRecordData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await fetchSalaryRecords({
        page: currentPage,
        limit: pageSize,
        month: selectedMonth === 'ALL' ? undefined : selectedMonth,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setSalaryRecords(res.items);
      setTotalCount(res.total);
      setTotalEarnings(res.totalEarnings || 0);
      setTotalNetPayable(res.totalNetPayable || 0);
      setTotalPaid(res.totalPaid || 0);
      setTotalDue(res.totalDue || 0);
      setDistinctMonths(res.distinctMonths || []);
    } catch (err: unknown) {
      const e = err as Error;
      setApiError(e.message || 'Failed to load salary records');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedMonth, statusFilter, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Submit
  const handleFormSubmit = async (data: CreateSalaryInput | UpdateSalaryInput) => {
    try {
      setIsSubmitting(true);
      if (activeRecord) {
        await updateSalaryRecord(activeRecord.id, data);
      } else {
        await createSalaryRecord(data as CreateSalaryInput);
      }
      setIsFormModalOpen(false);
      setActiveRecord(null);
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error saving salary record: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Single Delete
  const handleDeleteConfirm = async () => {
    if (!activeRecord) return;
    try {
      setIsSubmitting(true);
      await deleteSalaryRecord(activeRecord.id);
      setIsDeleteModalOpen(false);
      setActiveRecord(null);
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error deleting record: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSubmitting(true);
      await bulkDeleteSalaryRecords(selectedIds);
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error during bulk deletion: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      await downloadSalaryCsv({
        month: selectedMonth === 'ALL' ? undefined : selectedMonth,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
      });
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Failed to export CSV: ${e.message}`);
    }
  };

  // Month filter options
  const monthFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Months' }];
    distinctMonths.forEach((m) => {
      list.push({ value: m, label: m });
    });
    return list;
  }, [distinctMonths]);

  // Status badge renderer with high contrast
  const renderStatusBadge = (status: SalaryPaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            PAID
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-700" />
            PARTIAL
          </span>
        );
      case 'UNPAID':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-700" />
            UNPAID
          </span>
        );
    }
  };

  // Table Columns matching the authentic user Excel sheet:
  // SL No | Employee Name | Month | Designation & Dept | Basic Salary | Allowance | Present Days | Absent Days | Total Earnings | Advance loan | Previous Due | Net Payable | Paid Amount | Due Amount | Status
  const columns: Column<SalaryRecordData>[] = useMemo(() => [
    {
      id: 'sl',
      header: 'SL',
      sortable: false,
      render: (_val, _row, index) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {(currentPage - 1) * pageSize + (index ?? 0) + 1}
        </span>
      ),
    },
    {
      id: 'employeeName',
      header: 'Employee Name',
      sortable: true,
      render: (_val, row) => (
        <div>
          <span className="font-bold text-slate-900 text-sm block">
            {row.employeeName}
          </span>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
            ID: {row.employeeCode}
          </span>
        </div>
      ),
    },
    {
      id: 'month',
      header: 'Month',
      sortable: true,
      render: (_val, row) => (
        <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {row.month}
        </span>
      ),
    },
    {
      id: 'designation',
      header: 'Designation & Dept',
      sortable: true,
      render: (_val, row) => (
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            {row.designation}
          </span>
          <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
            {row.department}
          </span>
        </div>
      ),
    },
    {
      id: 'basicSalary',
      header: 'Basic Salary',
      sortable: true,
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          ৳{row.basicSalary.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'allowance',
      header: 'Allowance',
      sortable: true,
      render: (_val, row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          ৳{row.allowance.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'presentDays',
      header: 'Present / Absent',
      sortable: true,
      render: (_val, row) => (
        <div className="text-xs font-medium text-slate-800">
          <span className="font-extrabold text-emerald-700">{row.presentDays}</span>
          <span className="text-slate-400 mx-1">/</span>
          <span className="font-extrabold text-rose-600">{row.absentDays}</span>
          <span className="text-[10px] text-slate-500 ml-1">days</span>
        </div>
      ),
    },
    {
      id: 'totalEarnings',
      header: 'Total Earnings',
      sortable: true,
      render: (_val, row) => (
        <span className="font-mono text-xs font-black text-blue-700">
          ৳{row.totalEarnings.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'advanceLoan',
      header: 'Advance Loan',
      sortable: true,
      render: (_val, row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          ৳{row.advanceLoan.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'previousDue',
      header: 'Prev Due',
      sortable: true,
      render: (_val, row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          ৳{row.previousDue.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'netPayable',
      header: 'Net Payable',
      sortable: true,
      render: (_val, row) => (
        <span className="font-mono text-xs font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          ৳{row.netPayable.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'paidAmount',
      header: 'Paid Amount',
      sortable: true,
      render: (_val, row) => (
        <span className="font-mono text-xs font-extrabold text-emerald-700">
          ৳{row.paidAmount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'dueAmount',
      header: 'Due Amount',
      sortable: true,
      render: (_val, row) => (
        <span className={`font-mono text-xs font-black ${row.dueAmount > 0 ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200' : 'text-slate-500'}`}>
          ৳{row.dueAmount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'paymentStatus',
      header: 'Status & Method',
      sortable: true,
      render: (_val, row) => (
        <div className="space-y-1">
          {renderStatusBadge(row.paymentStatus)}
          {row.paymentMethod && (
            <span className="text-[11px] font-semibold text-slate-600 block">
              {row.paymentMethod}
            </span>
          )}
        </div>
      ),
    },
  ], [currentPage, pageSize]);

  // Row Actions (Edit, Delete)
  const actions: RowAction<SalaryRecordData>[] = useMemo(() => [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => {
        setActiveRecord(row);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (row) => {
        setActiveRecord(row);
        setIsDeleteModalOpen(true);
      },
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-emerald-600" />
              Salary &amp; Payroll Management
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
              Payroll Sheet
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Automated monthly salary calculation sheet with attendance, advance loan, previous due, and dynamic payment statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setActiveRecord(null);
              setIsFormModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Process Salary
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards (Clear white cards with high contrast text) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Payable Payroll */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Payable Payroll
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ৳{totalNetPayable.toLocaleString()}
            </p>
            <p className="text-xs text-blue-700 font-semibold mt-1">
              Gross Earnings: ৳{totalEarnings.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Disbursed (Paid) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Disbursed (Paid)
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              ৳{totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Successfully paid out
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Outstanding Due */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Outstanding Due
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              ৳{totalDue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Includes prior carried debt
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Processed Records */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Processed Records
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {totalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Salary sheets generated
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Clean white background) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by Employee name, code, designation..."
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Month Filter */}
            <div className="w-44">
              <FilterDropdown
                label="Month"
                value={selectedMonth}
                onChange={(val) => {
                  setSelectedMonth(val);
                  setCurrentPage(1);
                }}
                options={monthFilterOptions}
              />
            </div>

            {/* Status Filter */}
            <div className="w-36">
              <FilterDropdown
                label="Status"
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val as SalaryPaymentStatus | 'ALL');
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'PARTIAL', label: 'Partial' },
                  { value: 'UNPAID', label: 'Unpaid' },
                ]}
              />
            </div>

            {/* Bulk Delete Trigger */}
            {selectedIds.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{apiError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            Try Again
          </Button>
        </div>
      )}

      {/* Main Salary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={salaryRecords}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          actions={actions}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={(col, dir) => {
            setSortColumn(col);
            setSortDirection(dir);
          }}
          serverSide={true}
          page={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size: number) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          emptyTitle="No salary records found"
          emptyDescription="No salary records match the selected month and status filters."
        />
      </div>

      {/* Add / Edit Salary Modal */}
      <SalaryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveRecord(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={activeRecord}
        isSubmitting={isSubmitting}
      />

      {/* Single Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveRecord(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Salary Record"
        message={`Are you sure you want to delete the salary record for "${activeRecord?.employeeName}" (${activeRecord?.month})? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Salary Records"
        message={`Are you sure you want to delete ${selectedIds.length} selected salary records? This action cannot be undone.`}
        confirmLabel="Delete All"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
