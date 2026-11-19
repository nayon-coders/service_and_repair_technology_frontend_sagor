import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  DollarSign, 
  Plus, 
  Phone, 
  Mail, 
  Building
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
  EmployeeRecord, 
  EmployeeStatus, 
  CreateEmployeeInput, 
  UpdateEmployeeInput 
} from '../../types';
import { 
  fetchEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  bulkDeleteEmployees, 
  downloadEmployeesCsv 
} from '../../services/employeeService';
import { EmployeeFormModal } from './EmployeeFormModal';

export const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalBasicSalary, setTotalBasicSalary] = useState<number>(0);
  const [totalPayroll, setTotalPayroll] = useState<number>(0);
  const [totalActive, setTotalActive] = useState<number>(0);
  const [totalInactive, setTotalInactive] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>('employeeId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  const [activeEmployee, setActiveEmployee] = useState<EmployeeRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await fetchEmployees({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      });

      setEmployees(res.items);
      setTotalCount(res.total);
      setTotalBasicSalary(res.totalBasicSalary || 0);
      setTotalPayroll(res.totalPayroll || 0);
      setTotalActive(res.totalActive || 0);
      setTotalInactive(res.totalInactive || 0);
    } catch (err: unknown) {
      const e = err as Error;
      setApiError(e.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Submit (Create / Edit)
  const handleFormSubmit = async (payload: CreateEmployeeInput | UpdateEmployeeInput) => {
    try {
      setIsSubmitting(true);
      if (activeEmployee) {
        await updateEmployee(activeEmployee.id, payload as UpdateEmployeeInput);
      } else {
        await createEmployee(payload as CreateEmployeeInput);
      }
      setIsFormModalOpen(false);
      setActiveEmployee(null);
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
    if (!activeEmployee) return;
    try {
      setIsSubmitting(true);
      await deleteEmployee(activeEmployee.id);
      setIsDeleteModalOpen(false);
      setActiveEmployee(null);
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
      await bulkDeleteEmployees(selectedIds);
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
      await downloadEmployeesCsv({
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
  const columns: Column<EmployeeRecord>[] = [
    {
      id: 'employeeId',
      header: 'Employee ID',
      sortable: true,
      render: (_val, r) => (
        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-300">
          {r.employeeId}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Employee Info',
      sortable: true,
      render: (_val, r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {r.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{r.name}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{r.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'designation',
      header: 'Role & Department',
      render: (_val, r) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{r.designation}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{r.department}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'basicSalary',
      header: 'Basic Salary',
      sortable: true,
      render: (_val, r) => (
        <div className="font-mono text-slate-700 text-xs font-semibold">
          {formatCurrency(r.basicSalary)}
        </div>
      ),
    },
    {
      id: 'allowance',
      header: 'Allowance',
      render: (_val, r) => (
        <div className="font-mono text-slate-600 text-xs">
          +{formatCurrency(r.allowance)}
        </div>
      ),
    },
    {
      id: 'grossSalary',
      header: 'Gross Salary',
      sortable: true,
      render: (_val, r) => (
        <div className="font-mono font-black text-slate-900 text-sm">
          {formatCurrency(r.grossSalary)}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (_val, r) => (
        <StatusBadge 
          label={r.status === 'ACTIVE' ? 'Active' : 'Inactive'} 
          variant={r.status === 'ACTIVE' ? 'success' : 'neutral'} 
        />
      ),
    },
    {
      id: 'contact',
      header: 'Contact / Joined',
      render: (_val, r) => (
        <div className="text-xs text-slate-600">
          {r.phone && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{r.phone}</span>
            </div>
          )}
          {r.joinDate && (
            <div className="text-[10.5px] text-slate-400 mt-0.5">
              Joined: {r.joinDate}
            </div>
          )}
        </div>
      ),
    },
  ];

  // Row Actions
  const actions: RowAction<EmployeeRecord>[] = [
    {
      label: 'Edit Profile',
      icon: Edit,
      onClick: (r) => {
        setActiveEmployee(r);
        setIsFormModalOpen(true);
      },
    },
    {
      label: 'Delete Employee',
      icon: Trash2,
      variant: 'danger',
      onClick: (r) => {
        setActiveEmployee(r);
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
              Employee Management
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Staff Directory
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Maintain staff profiles, designations, departments, basic salaries, and mobile/other allowance structures.
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
              setActiveEmployee(null);
              setIsFormModalOpen(true);
            }}
          >
            + Add Employee
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Staff
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {totalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">{totalActive} Active, {totalInactive} Inactive</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Employees
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {totalActive}
            </p>
            <p className="text-xs text-slate-500 mt-1">On active payroll</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Basic Salary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Basic Payroll
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(totalBasicSalary)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Base monthly liability</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Monthly Payroll (Gross) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Gross Payroll
            </p>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {formatCurrency(totalPayroll)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Including allowances</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
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
            placeholder="Search employee, ID, email, role..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Status Filter */}
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active Staff', value: 'ACTIVE' },
              { label: 'Inactive / Former', value: 'INACTIVE' },
            ]}
            onChange={(val) => {
              setStatusFilter(val as EmployeeStatus | 'ALL');
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
        <DataTable<EmployeeRecord>
          columns={columns}
          data={employees}
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
          emptyTitle="No employees found"
          emptyDescription="Click '+ Add Employee' to register staff into company database."
        />
      </div>

      {/* Form Modal (Create / Edit) */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setActiveEmployee(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={activeEmployee}
        isSubmitting={isSubmitting}
      />

      {/* Single Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveEmployee(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee Profile"
        message={`Are you sure you want to delete "${activeEmployee?.name}" (${activeEmployee?.employeeId})? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Employees"
        message={`Are you sure you want to delete ${selectedIds.length} selected employees? This action cannot be undone.`}
        confirmLabel={`Delete (${selectedIds.length})`}
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
