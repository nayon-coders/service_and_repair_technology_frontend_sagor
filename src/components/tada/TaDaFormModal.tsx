import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Compass, DollarSign } from 'lucide-react';
import { Modal, Input, Select, Textarea, DatePicker, Button } from '../common';
import { 
  TaDaBillRecord, 
  CreateTaDaBillInput, 
  UpdateTaDaBillInput, 
  TaDaStatus,
  CreateTaDaItemInput
} from '../../types';
import { fetchNextTaDaBillNo } from '../../services/taDaService';

interface TaDaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaDaBillInput | UpdateTaDaBillInput) => Promise<void>;
  initialData?: TaDaBillRecord | null;
  isSubmitting?: boolean;
}

export const TaDaFormModal: React.FC<TaDaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [billNo, setBillNo] = useState('');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeName, setEmployeeName] = useState('');
  const [designation, setDesignation] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Service & Maintenance');
  const [status, setStatus] = useState<TaDaStatus>('PENDING');

  // Signatures
  const [receivedBy, setReceivedBy] = useState('1 Service & Repair Technology');
  const [checkedBy, setCheckedBy] = useState('Md. Al-Amin (Accounts)');
  const [approvedBy, setApprovedBy] = useState('Engr. Sagor Badsha (Chief Engineer)');
  const [remarks, setRemarks] = useState('');

  // Items
  const [items, setItems] = useState<CreateTaDaItemInput[]>([
    {
      sl: 1,
      date: new Date().toISOString().split('T')[0],
      particular: '',
      vehicleName: 'CNG Auto',
      qty: 1,
      unitTaka: 0,
      totalTaka: 0,
      checkedBy: 'Admin',
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setBillNo(initialData.billNo || '');
      setSubmissionDate(initialData.submissionDate ? initialData.submissionDate.split('T')[0] : '');
      setEmployeeName(initialData.employeeName || '');
      setDesignation(initialData.designation || '');
      setEmployeeId(initialData.employeeId || '');
      setDepartment(initialData.department || 'Service & Maintenance');
      setStatus(initialData.status || 'PENDING');
      setReceivedBy(initialData.receivedBy || '1 Service & Repair Technology');
      setCheckedBy(initialData.checkedBy || 'Md. Al-Amin (Accounts)');
      setApprovedBy(initialData.approvedBy || 'Engr. Sagor Badsha (Chief Engineer)');
      setRemarks(initialData.remarks || '');
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it, idx) => ({
            sl: it.sl || idx + 1,
            date: it.date ? it.date.split('T')[0] : '',
            particular: it.particular || '',
            vehicleName: it.vehicleName || '',
            qty: Number(it.qty) || 1,
            unitTaka: Number(it.unitTaka) || 0,
            totalTaka: Number(it.totalTaka) || 0,
            checkedBy: it.checkedBy || 'Admin',
          }))
        );
      } else {
        setItems([
          {
            sl: 1,
            date: new Date().toISOString().split('T')[0],
            particular: '',
            vehicleName: 'CNG Auto',
            qty: 1,
            unitTaka: 0,
            totalTaka: 0,
            checkedBy: 'Admin',
          },
        ]);
      }
    } else {
      // Create new
      setSubmissionDate(new Date().toISOString().split('T')[0]);
      setEmployeeName('');
      setDesignation('');
      setEmployeeId('');
      setDepartment('Service & Maintenance');
      setStatus('PENDING');
      setReceivedBy('1 Service & Repair Technology');
      setCheckedBy('Md. Al-Amin (Accounts)');
      setApprovedBy('Engr. Sagor Badsha (Chief Engineer)');
      setRemarks('');
      setItems([
        {
          sl: 1,
          date: new Date().toISOString().split('T')[0],
          particular: '',
          vehicleName: 'CNG Auto',
          qty: 1,
          unitTaka: 0,
          totalTaka: 0,
          checkedBy: 'Admin',
        },
      ]);

      fetchNextTaDaBillNo()
        .then((no) => setBillNo(no))
        .catch(() => {
          const year = new Date().getFullYear();
          setBillNo(`TADA-${year}-0001`);
        });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleItemChange = (index: number, field: keyof CreateTaDaItemInput, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === 'qty' || field === 'unitTaka') {
        const qty = field === 'qty' ? Number(value) || 0 : Number(current.qty) || 0;
        const unitTaka = field === 'unitTaka' ? Number(value) || 0 : Number(current.unitTaka) || 0;
        current.totalTaka = qty * unitTaka;
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        sl: prev.length + 1,
        date: submissionDate,
        particular: '',
        vehicleName: 'CNG Auto',
        qty: 1,
        unitTaka: 0,
        totalTaka: 0,
        checkedBy: 'Admin',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index).map((it, idx) => ({ ...it, sl: idx + 1 })));
  };

  const grandTotal = items.reduce((sum, it) => sum + (Number(it.totalTaka) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!employeeName.trim()) {
      newErrors.employeeName = 'Employee name is required';
    }

    if (!billNo.trim()) {
      newErrors.billNo = 'Bill number is required';
    }

    const validItems = items.filter((it) => it.particular.trim().length > 0);
    if (validItems.length === 0) {
      newErrors.items = 'At least one line item with particular / travel details is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: CreateTaDaBillInput = {
      billNo,
      submissionDate,
      employeeName: employeeName.trim(),
      designation: designation.trim() || undefined,
      employeeId: employeeId.trim() || undefined,
      department: department.trim() || undefined,
      status,
      receivedBy: receivedBy.trim() || undefined,
      checkedBy: checkedBy.trim() || undefined,
      approvedBy: approvedBy.trim() || undefined,
      remarks: remarks.trim() || undefined,
      items: validItems.map((it, idx) => ({
        sl: idx + 1,
        date: it.date || undefined,
        particular: it.particular.trim(),
        vehicleName: it.vehicleName?.trim() || undefined,
        qty: Number(it.qty) || 1,
        unitTaka: Number(it.unitTaka) || 0,
        totalTaka: (Number(it.qty) || 1) * (Number(it.unitTaka) || 0),
        checkedBy: it.checkedBy?.trim() || undefined,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit TA/DA Claim: ${initialData.billNo}` : 'Submit New TA/DA Claim Bill'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Bill Header & Employee Info */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002060] mb-3 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#002060]" />
            Employee &amp; Bill Submission Info
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Bill No."
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              placeholder="e.g. TADA-2026-0001"
              required
              error={errors.billNo}
            />

            <DatePicker
              label="Bill Submission Date"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
              required
            />

            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaDaStatus)}
              options={[
                { value: 'PENDING', label: 'PENDING' },
                { value: 'APPROVED', label: 'APPROVED' },
                { value: 'PAID', label: 'PAID' },
                { value: 'REJECTED', label: 'REJECTED' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <Input
              label="Name of Employee"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="e.g. Engr. Tanvir Ahmed"
              required
              error={errors.employeeName}
            />

            <Input
              label="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Service Engineer"
            />

            <Input
              label="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-102"
            />
          </div>
        </div>

        {/* Section 2: Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                TA/DA Claim Particulars &amp; Travel Expenses
              </h4>
              <p className="text-[11px] text-slate-500">Add dates, destinations, transport vehicles, and amounts</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={handleAddItem}
            >
              Add Expense Row
            </Button>
          </div>

          {errors.items && (
            <p className="text-xs text-rose-500 mb-2 font-medium">{errors.items}</p>
          )}

          <div className="space-y-2 border border-slate-200 p-3 rounded-lg bg-slate-50/50">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 bg-white p-2.5 rounded border border-slate-200">
                <div className="w-6 pt-2 text-center text-xs font-bold text-slate-500">
                  {idx + 1}
                </div>
                
                <div className="w-36">
                  <DatePicker
                    value={item.date || ''}
                    onChange={(e) => handleItemChange(idx, 'date', e.target.value)}
                  />
                </div>

                <div className="flex-1">
                  <Input
                    placeholder="Particular / Journey Details (e.g. Badda to Popular Hospital)"
                    value={item.particular}
                    onChange={(e) => handleItemChange(idx, 'particular', e.target.value)}
                    required
                  />
                </div>

                <div className="w-32">
                  <Input
                    placeholder="Vehicle Name"
                    value={item.vehicleName || ''}
                    onChange={(e) => handleItemChange(idx, 'vehicleName', e.target.value)}
                  />
                </div>

                <div className="w-16">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                    required
                  />
                </div>

                <div className="w-24">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Unit Tk"
                    value={item.unitTaka}
                    onChange={(e) => handleItemChange(idx, 'unitTaka', e.target.value)}
                    required
                  />
                </div>

                <div className="w-24 pt-2 text-right font-mono font-bold text-xs text-[#002060]">
                  ৳ {((Number(item.qty) || 1) * (Number(item.unitTaka) || 0)).toLocaleString('en-IN')}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  disabled={items.length <= 1}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors self-center sm:self-auto"
                  title="Remove row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Grand Total Summary Box */}
          <div className="mt-3 flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-300">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Total Claim Amount:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-base font-black text-[#002060]">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>৳ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Signatures & Verification */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Signatures &amp; Verification
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Received By"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="e.g. 1 Service & Repair Technology"
            />
            <Input
              label="Checked By"
              value={checkedBy}
              onChange={(e) => setCheckedBy(e.target.value)}
              placeholder="e.g. Md. Al-Amin (Accounts)"
            />
            <Input
              label="Approved By"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              placeholder="e.g. Engr. Sagor Badsha"
            />
          </div>

          <div className="mt-3">
            <Textarea
              label="Remarks / Note"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Approved for field maintenance journey reimbursement."
              rows={2}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Update Claim' : 'Save & Submit Claim'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

