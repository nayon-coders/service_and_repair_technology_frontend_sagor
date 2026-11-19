import React, { useState, useEffect } from 'react';
import { UserCheck, DollarSign, Calculator, Mail, Phone, Building } from 'lucide-react';
import { Modal, Input, Select, Textarea, Button } from '../common';
import { 
  EmployeeRecord, 
  CreateEmployeeInput, 
  UpdateEmployeeInput, 
  EmployeeStatus 
} from '../../types';
import { fetchNextEmployeeId } from '../../services/employeeService';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeInput | UpdateEmployeeInput) => Promise<void>;
  initialData?: EmployeeRecord | null;
  isSubmitting?: boolean;
}

const DEPARTMENTS = [
  { value: 'Service & Maintenance', label: 'Service & Maintenance' },
  { value: 'Diagnostic Lab Operations', label: 'Diagnostic Lab Operations' },
  { value: 'Inventory & Logistics', label: 'Inventory & Logistics' },
  { value: 'Accounts & Administration', label: 'Accounts & Administration' },
  { value: 'Customer Support', label: 'Customer Support' },
  { value: 'Field Operations', label: 'Field Operations' },
  { value: 'Management', label: 'Management' },
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [department, setDepartment] = useState<string>('Service & Maintenance');
  const [basicSalary, setBasicSalary] = useState<number | string>(25000);
  const [allowance, setAllowance] = useState<number | string>(3000);
  const [joinDate, setJoinDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<EmployeeStatus>('ACTIVE');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setEmployeeId(initialData.employeeId);
        setName(initialData.name);
        setEmail(initialData.email);
        setPhone(initialData.phone || '');
        setDesignation(initialData.designation);
        setDepartment(initialData.department);
        setBasicSalary(initialData.basicSalary);
        setAllowance(initialData.allowance);
        setJoinDate(initialData.joinDate || new Date().toISOString().split('T')[0]);
        setStatus(initialData.status);
        setAddress(initialData.address || '');
        setNotes(initialData.notes || '');
      } else {
        fetchNextEmployeeId().then(setEmployeeId).catch(console.error);
        setName('');
        setEmail('');
        setPhone('');
        setDesignation('');
        setDepartment('Service & Maintenance');
        setBasicSalary(25000);
        setAllowance(3000);
        setJoinDate(new Date().toISOString().split('T')[0]);
        setStatus('ACTIVE');
        setAddress('');
        setNotes('');
      }
      setErrors({});
    }
  }, [initialData, isOpen]);

  const numBasic = Math.max(0, Number(basicSalary) || 0);
  const numAllow = Math.max(0, Number(allowance) || 0);
  const grossSalary = numBasic + numAllow;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!name.trim()) validationErrors.name = 'Full Name is required';
    if (!email.trim() || !email.includes('@')) validationErrors.email = 'Valid Email address is required';
    if (!designation.trim()) validationErrors.designation = 'Designation is required';
    if (!department.trim()) validationErrors.department = 'Department is required';
    if (numBasic < 0) validationErrors.basicSalary = 'Basic salary cannot be negative';
    if (numAllow < 0) validationErrors.allowance = 'Allowance cannot be negative';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateEmployeeInput = {
      employeeId: employeeId.trim() || undefined,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      designation: designation.trim(),
      department: department.trim(),
      basicSalary: numBasic,
      allowance: numAllow,
      joinDate: joinDate || null,
      status,
      address: address.trim() || null,
      notes: notes.trim() || null,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Employee Profile' : 'Add New Employee'}
      subtitle="Register employee profile, job designation, department, and salary package."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Employee ID & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employee ID <span className="text-rose-500">*</span>
            </label>
            <Input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="EMP-001"
              className="font-mono font-bold"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engr. Tanvir Ahmed"
              error={errors.name}
              required
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tanvir@oneservice.com"
              error={errors.email}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Mobile Phone
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1778-116244"
            />
          </div>
        </div>

        {/* Designation & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation / Role <span className="text-rose-500">*</span>
            </label>
            <Input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Biomedical Engineer"
              error={errors.designation}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Department <span className="text-rose-500">*</span>
            </label>
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={DEPARTMENTS}
              required
            />
          </div>
        </div>

        {/* Salary & Allowances Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Salary &amp; Compensation Setup
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Monthly Package (BDT)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Basic Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Basic Salary (BDT ৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  ৳
                </span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="25000"
                  error={errors.basicSalary}
                  className="pl-7 font-mono font-bold"
                  required
                />
              </div>
            </div>

            {/* Mobile & Other Allowance */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile &amp; Other Allowance (৳)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  ৳
                </span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={allowance}
                  onChange={(e) => setAllowance(e.target.value)}
                  placeholder="3000"
                  error={errors.allowance}
                  className="pl-7 font-mono font-bold"
                />
              </div>
            </div>

            {/* Total / Gross Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                Gross Salary (Auto)
              </label>
              <div className="h-10 px-3 bg-white border border-blue-200 rounded-lg flex items-center justify-between font-mono font-black text-blue-700 text-sm shadow-sm">
                <span className="text-xs text-slate-400">Total:</span>
                <span>৳ {grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Joining Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employment Status
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Active Staff
              </button>

              <button
                type="button"
                onClick={() => setStatus('INACTIVE')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                  status === 'INACTIVE'
                    ? 'bg-slate-100 text-slate-700 border-slate-300 ring-2 ring-slate-400/20 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === 'INACTIVE' ? 'bg-slate-500' : 'bg-slate-300'}`} />
                Inactive / Left
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Joining Date
            </label>
            <Input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
            />
          </div>
        </div>

        {/* Address & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Present Address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Middle Badda, Dhaka"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Special Skills
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Diagnostic equipment specialization..."
              rows={1}
            />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
            leftIcon={UserCheck}
          >
            {initialData ? 'Update Profile' : 'Save Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

