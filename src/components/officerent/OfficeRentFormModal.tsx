import React, { useState, useEffect } from 'react';
import { Building2, DollarSign } from 'lucide-react';
import { Modal, Input, Select, Textarea, Button } from '../common';
import { 
  OfficeRentRecord, 
  CreateOfficeRentInput, 
  UpdateOfficeRentInput, 
  RentPaymentStatus 
} from '../../types';

interface OfficeRentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOfficeRentInput | UpdateOfficeRentInput) => Promise<void>;
  initialData?: OfficeRentRecord | null;
  isSubmitting?: boolean;
}

export const OfficeRentFormModal: React.FC<OfficeRentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const getCurrentMonthName = () => {
    const d = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const [month, setMonth] = useState(getCurrentMonthName());
  const [title, setTitle] = useState('Office rent');
  const [amount, setAmount] = useState<number | string>(35000);
  const [status, setStatus] = useState<RentPaymentStatus>('UNPAID');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [landlordName, setLandlordName] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setMonth(initialData.month || getCurrentMonthName());
      setTitle(initialData.title || 'Office rent');
      setAmount(initialData.amount ?? 35000);
      setStatus(initialData.status || 'UNPAID');
      setPaymentDate(initialData.paymentDate || '');
      setPaymentMethod(initialData.paymentMethod || 'Bank Transfer');
      setLandlordName(initialData.landlordName || '');
      setReceiptNo(initialData.receiptNo || '');
      setNote(initialData.note || '');
    } else {
      setMonth(getCurrentMonthName());
      setTitle('Office rent');
      setAmount(35000);
      setStatus('UNPAID');
      setPaymentDate('');
      setPaymentMethod('Bank Transfer');
      setLandlordName('Al-Haj Abdul Latif (Premise Owner)');
      setReceiptNo('');
      setNote('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!month.trim()) {
      validationErrors.month = 'Month is required';
    }

    if (!title.trim()) {
      validationErrors.title = 'Title is required';
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      validationErrors.amount = 'Valid rent amount is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateOfficeRentInput = {
      month: month.trim(),
      title: title.trim(),
      amount: numAmount,
      status,
      paymentDate: status === 'PAID' && paymentDate ? paymentDate : null,
      paymentMethod: status === 'PAID' ? paymentMethod : null,
      landlordName: landlordName.trim() || null,
      receiptNo: receiptNo.trim() || null,
      note: note.trim() || null,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Office Rent Record' : 'Record Office Rent'}
      subtitle="Enter monthly office premises rental details, payment amount, and settlement status."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Month */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Month <span className="text-rose-500">*</span>
            </label>
            <Input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="e.g. June 2026"
              error={errors.month}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Example: May 2026, June 2026</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Office rent"
              error={errors.title}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: Office rent</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rent Amount (BDT ৳) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                ৳
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="35000"
                error={errors.amount}
                className="pl-8 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Paid / Unpaid Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setStatus('UNPAID')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                  status === 'UNPAID'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === 'UNPAID' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                Unpaid (Due)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('PAID');
                  if (!paymentDate) {
                    setPaymentDate(new Date().toISOString().split('T')[0]);
                  }
                }}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                  status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === 'PAID' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Paid (Settled)
              </button>
            </div>
          </div>
        </div>

        {/* If Paid, show Payment Date & Method */}
        {status === 'PAID' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Payment Date
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Payment Method
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'bKash', label: 'bKash' },
                  { value: 'Nagad', label: 'Nagad' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Landlord & Receipt No */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Landlord / Owner Name (Optional)
            </label>
            <Input
              value={landlordName}
              onChange={(e) => setLandlordName(e.target.value)}
              placeholder="e.g. Premise Owner Name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt / Slip No (Optional)
            </label>
            <Input
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              placeholder="e.g. REC-2026-06"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Remarks (Optional)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional details regarding office premises, floor, cheque numbers, or terms..."
            rows={2}
          />
        </div>

        {/* Actions */}
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
            leftIcon={initialData ? Building2 : DollarSign}
          >
            {initialData ? 'Update Record' : 'Save Rent Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
