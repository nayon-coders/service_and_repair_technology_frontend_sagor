import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, Calculator } from 'lucide-react';
import { Modal, Input, Textarea, Button } from '../common';
import { 
  LabInRecord, 
  CreateLabInInput, 
  UpdateLabInInput, 
  LabPartRecord 
} from '../../types';
import { fetchLabParts } from '../../services/labInventoryService';

interface LabInFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLabInInput | UpdateLabInInput) => Promise<void>;
  initialData?: LabInRecord | null;
  isSubmitting?: boolean;
}

export const LabInFormModal: React.FC<LabInFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [partsName, setPartsName] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unitPrice, setUnitPrice] = useState<number | string>(0);
  const [supplier, setSupplier] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [availableParts, setAvailableParts] = useState<LabPartRecord[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchLabParts().then(setAvailableParts).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setPartsName(initialData.partsName || '');
      setQuantity(initialData.quantity || 1);
      setUnitPrice(initialData.unitPrice || 0);
      setSupplier(initialData.supplier || '');
      setInvoiceNo(initialData.invoiceNo || '');
      setRemarks(initialData.remarks || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setPartsName('');
      setQuantity(1);
      setUnitPrice(0);
      setSupplier('');
      setInvoiceNo('');
      setRemarks('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Auto calculate total
  const numQty = Math.max(0, Number(quantity) || 0);
  const numPrice = Math.max(0, Number(unitPrice) || 0);
  const autoTotal = numQty * numPrice;

  const handleSelectExistingPart = (part: LabPartRecord) => {
    setPartsName(part.name);
    setUnitPrice(part.unitPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!date) validationErrors.date = 'Date is required';
    if (!partsName.trim()) validationErrors.partsName = 'Parts Name is required';
    if (numQty <= 0) validationErrors.quantity = 'Quantity must be greater than 0';
    if (numPrice < 0) validationErrors.unitPrice = 'Per parts price cannot be negative';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateLabInInput = {
      date,
      partsName: partsName.trim(),
      quantity: numQty,
      unitPrice: numPrice,
      supplier: supplier.trim() || null,
      invoiceNo: invoiceNo.trim() || null,
      remarks: remarks.trim() || null,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Lab In Record' : 'Record New Lab In (Stock Intake)'}
      subtitle="Register incoming spare parts into service lab inventory with auto-calculated total."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Parts Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parts Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={partsName}
              onChange={(e) => setPartsName(e.target.value)}
              placeholder="e.g. Halogen Lamp 12V 20W"
              error={errors.partsName}
              required
            />

            {/* Existing parts suggestions */}
            {!initialData && availableParts.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] text-slate-500">Quick select:</span>
                {availableParts.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectExistingPart(p)}
                    className="text-[10.5px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quantity, Per Parts Price, Auto Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              error={errors.quantity}
              className="font-mono font-bold"
              required
            />
          </div>

          {/* Per Parts Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Per Parts Price (BDT ৳) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                ৳
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="5000"
                error={errors.unitPrice}
                className="pl-7 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Auto Calculated Total */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              Total Price (Auto)
            </label>
            <div className="h-10 px-3 bg-white border border-blue-200 rounded-lg flex items-center justify-between font-mono font-black text-blue-700 text-sm shadow-sm">
              <span className="text-xs text-slate-400">Total:</span>
              <span>৳ {autoTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">({numQty} × ৳{numPrice})</p>
          </div>
        </div>

        {/* Supplier & Invoice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier / Source (Optional)
            </label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. MedTech Optical Importers Ltd."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice / Challan No (Optional)
            </label>
            <Input
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="e.g. PINV-2026-081"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Remarks / Storage Location (Optional)
          </label>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Shelf #2, compatible with Mindray BS-240 chemistry analyzer..."
            rows={2}
          />
        </div>

        {/* Action Buttons */}
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
            leftIcon={ArrowDownLeft}
          >
            {initialData ? 'Update Lab In' : 'Save & Stock In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

