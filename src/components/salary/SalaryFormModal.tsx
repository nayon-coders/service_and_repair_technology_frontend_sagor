import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  Clock
} from 'lucide-react';
import { Modal, Input, Select, Textarea, Button } from '../common';
import { 
  SalaryRecordData, 
  CreateSalaryInput, 
  UpdateSalaryInput, 
  SalaryPaymentStatus,
  EmployeeRecord 
} from '../../types';
import { fetchEmployees } from '../../services/employeeService';

interface SalaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalaryInput | UpdateSalaryInput) => Promise<void>;
  initialData?: SalaryRecordData | null;
  isSubmitting?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'bKash', label: 'bKash' },
  { value: 'Nagad', label: 'Nagad' },
  { value: 'Cheque', label: 'Cheque' },
];

export const SalaryFormModal: React.FC<SalaryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  // Available employees for select
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);

  // Form states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [month, setMonth] = useState<string>('Jun 2026');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [department, setDepartment] = useState<string>('Biomedical');
  const [basicSalary, setBasicSalary] = useState<number | string>(20000);
  const [allowance, setAllowance] = useState<number | string>(0);
  const [totalDays, setTotalDays] = useState<number | string>(30);
  const [presentDays, setPresentDays] = useState<number | string>(30);
  const [advanceLoan, setAdvanceLoan] = useState<number | string>(0);
  const [previousDue, setPreviousDue] = useState<number | string>(0);
  const [paidAmount, setPaidAmount] = useState<number | string>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch employees when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadEmployees = async () => {
        setLoadingEmployees(true);
        try {
          const res = await fetchEmployees({ limit: 100 });
          setEmployees(res.items || []);
        } catch (err) {
          console.error('Failed to load employees for salary form', err);
        } finally {
          setLoadingEmployees(false);
        }
      };
      loadEmployees();
    }
  }, [isOpen]);

  // Set initial or default data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedEmployeeId(initialData.employeeIdRef || '');
        setMonth(initialData.month || 'Jun 2026');
        setEmployeeName(initialData.employeeName || '');
        setEmployeeCode(initialData.employeeCode || '');
        setDesignation(initialData.designation || '');
        setDepartment(initialData.department || 'Biomedical');
        setBasicSalary(initialData.basicSalary ?? 0);
        setAllowance(initialData.allowance ?? 0);
        setTotalDays(initialData.totalDays ?? 30);
        setPresentDays(initialData.presentDays ?? 30);
        setAdvanceLoan(initialData.advanceLoan ?? 0);
        setPreviousDue(initialData.previousDue ?? 0);
        setPaidAmount(initialData.paidAmount ?? 0);
        setPaymentMethod(initialData.paymentMethod || 'Cash');
        setPaymentDate(initialData.paymentDate ? initialData.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]);
        setNotes(initialData.notes || '');
      } else {
        // Defaults for new entry
        const d = new Date();
        const defaultMonth = d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear();
        setMonth(defaultMonth);
        setSelectedEmployeeId('');
        setEmployeeName('');
        setEmployeeCode('');
        setDesignation('');
        setDepartment('Biomedical');
        setBasicSalary(0);
        setAllowance(0);
        setTotalDays(30);
        setPresentDays(30);
        setAdvanceLoan(0);
        setPreviousDue(0);
        setPaidAmount(0);
        setPaymentMethod('Cash');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Handle employee selection to auto-fill details
  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    if (!empId) return;

    const matched = employees.find(e => e.id === empId || e.employeeId === empId);
    if (matched) {
      setEmployeeName(matched.name);
      setEmployeeCode(matched.employeeId);
      setDesignation(matched.designation);
      setDepartment(matched.department);
      setBasicSalary(matched.basicSalary);
      setAllowance(matched.allowance);
      // clear any related validation error
      setErrors(prev => {
        const next = { ...prev };
        delete next.employeeName;
        delete next.employeeCode;
        return next;
      });
    }
  };

  // Real-time calculated values
  const calculations = useMemo(() => {
    const numBasic = Number(basicSalary) || 0;
    const numAllowance = Number(allowance) || 0;
    const numTotalDays = Number(totalDays) > 0 ? Number(totalDays) : 30;
    const numPresentDays = Math.min(Math.max(Number(presentDays) || 0, 0), numTotalDays);
    const numAbsentDays = Math.max(0, numTotalDays - numPresentDays);

    // Prorated formula: (Basic / TotalDays * PresentDays) + Allowance
    const totalEarnings = Math.round((numBasic / numTotalDays) * numPresentDays) + numAllowance;

    const numAdvance = Math.max(0, Number(advanceLoan) || 0);
    const numPrevDue = Math.max(0, Number(previousDue) || 0);

    const netPayable = Math.max(0, totalEarnings - numAdvance);
    const totalOwed = netPayable + numPrevDue;
    const numPaid = Math.max(0, Number(paidAmount) || 0);
    const dueAmount = Math.max(0, totalOwed - numPaid);

    let status: SalaryPaymentStatus = 'UNPAID';
    if (numPaid > 0 && dueAmount <= 0) {
      status = 'PAID';
    } else if (numPaid > 0 && dueAmount > 0) {
      status = 'PARTIAL';
    } else {
      status = 'UNPAID';
    }

    return {
      absentDays: numAbsentDays,
      totalEarnings,
      netPayable,
      totalOwed,
      dueAmount,
      status,
    };
  }, [basicSalary, allowance, totalDays, presentDays, advanceLoan, previousDue, paidAmount]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!month.trim()) newErrors.month = 'Month is required (e.g. Jun 2026)';
    if (!employeeName.trim()) newErrors.employeeName = 'Employee Name is required';
    if (!employeeCode.trim()) newErrors.employeeCode = 'Employee ID is required';
    if (Number(basicSalary) < 0) newErrors.basicSalary = 'Basic salary cannot be negative';
    if (Number(presentDays) < 0) newErrors.presentDays = 'Present days cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateSalaryInput = {
      month: month.trim(),
      employeeIdRef: selectedEmployeeId || undefined,
      employeeName: employeeName.trim(),
      employeeCode: employeeCode.trim(),
      designation: designation.trim(),
      department: department.trim(),
      basicSalary: Number(basicSalary) || 0,
      allowance: Number(allowance) || 0,
      totalDays: Number(totalDays) || 30,
      presentDays: Number(presentDays) || 0,
      advanceLoan: Number(advanceLoan) || 0,
      previousDue: Number(previousDue) || 0,
      paidAmount: Number(paidAmount) || 0,
      paymentMethod: paymentMethod || 'Cash',
      paymentDate: paymentDate || undefined,
      notes: notes.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Salary Record: ${initialData.employeeName}` : 'Process Employee Salary'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header selection card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Select Employee (Auto-fills info)
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                disabled={loadingEmployees}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
              >
                <option value="">-- Choose from existing employees --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId}) — {emp.designation} [{emp.department}]
                  </option>
                ))}
              </select>
              {loadingEmployees && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 animate-spin text-blue-500" /> Loading employee directory...
                </p>
              )}
            </div>

            <div>
              <Input
                label="Salary Month (e.g., Jun 2026)"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="Jun 2026"
                error={errors.month}
                leftIcon={Calendar}
                required
              />
            </div>
          </div>
        </div>

        {/* Employee Profile Information (Auto-filled & adjustable) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-600" />
            1. Employee Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Employee Name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="e.g. Sagar Badsha"
              error={errors.employeeName}
              required
            />
            <Input
              label="Employee ID / Code"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="e.g. 7141"
              error={errors.employeeCode}
              required
            />
            <Input
              label="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Lead Engineer"
            />
            <Input
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Biomedical"
            />
          </div>
        </div>

        {/* Salary & Attendance Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            2. Basic Salary, Allowance &amp; Attendance
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Basic Salary (৳)"
              type="number"
              min="0"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              placeholder="20000"
              error={errors.basicSalary}
              required
            />
            <Input
              label="Mobile & Other Allowance (৳)"
              type="number"
              min="0"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              placeholder="500"
            />
            <Input
              label="Total Month Days"
              type="number"
              min="1"
              max="31"
              value={totalDays}
              onChange={(e) => setTotalDays(e.target.value)}
              placeholder="30"
            />
            <Input
              label="Present Days"
              type="number"
              min="0"
              max={Number(totalDays) || 31}
              value={presentDays}
              onChange={(e) => setPresentDays(e.target.value)}
              placeholder="28"
              error={errors.presentDays}
              required
            />
          </div>
        </div>

        {/* Deductions & Balance Adjustments */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            3. Deductions &amp; Previous Month Due
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Advance Loan (৳)"
              type="number"
              min="0"
              value={advanceLoan}
              onChange={(e) => setAdvanceLoan(e.target.value)}
              placeholder="0"
              helperText="Deducted directly from Total Earnings"
            />
            <Input
              label="Previous Month Due Amount (৳)"
              type="number"
              min="0"
              value={previousDue}
              onChange={(e) => setPreviousDue(e.target.value)}
              placeholder="0"
              helperText="Carried over from prior unpaid month"
            />
            <Input
              label="Paid Amount (৳)"
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="0"
              helperText="Amount disbursed in this payout"
            />
          </div>
        </div>

        {/* DYNAMIC CALCULATION SUMMARY CARD */}
        <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/90 p-5 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-blue-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                Dynamic Salary Calculation Preview
              </span>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Formula: ((Basic / {Number(totalDays) || 30}) × {Number(presentDays) || 0}) + Allowance − Advance
              </p>
            </div>
            {/* Dynamic Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Status:</span>
              {calculations.status === 'PAID' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● PAID
                </span>
              )}
              {calculations.status === 'PARTIAL' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  ◐ PARTIAL PAID
                </span>
              )}
              {calculations.status === 'UNPAID' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  ○ UNPAID
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-center">
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Absent Days</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{calculations.absentDays} Days</span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-blue-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase block">Total Earnings</span>
              <span className="text-base font-black text-blue-700 mt-0.5 block">৳{calculations.totalEarnings.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-indigo-200 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-700 uppercase block">Net Payable</span>
              <span className="text-base font-black text-indigo-800 mt-0.5 block">৳{calculations.netPayable.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-purple-200 shadow-xs">
              <span className="text-[11px] font-bold text-purple-700 uppercase block">Total Owed</span>
              <span className="text-base font-black text-purple-800 mt-0.5 block">৳{calculations.totalOwed.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">Paid Amount</span>
              <span className="text-base font-black text-emerald-700 mt-0.5 block">৳{Number(paidAmount || 0).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-rose-200 shadow-xs">
              <span className="text-[11px] font-bold text-rose-600 uppercase block">Due Amount</span>
              <span className="text-base font-black text-rose-700 mt-0.5 block">৳{calculations.dueAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment & Audit Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={PAYMENT_METHODS}
          />
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            leftIcon={Calendar}
          />
        </div>

        <Textarea
          label="Notes / Remarks"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Disbursed via Bank, partial paid, rest due next month."
          rows={2}
        />

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {initialData ? 'Update Salary Record' : 'Save Salary Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
