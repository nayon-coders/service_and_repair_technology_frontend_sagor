import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Calculator, Layers } from 'lucide-react';
import { Modal, Input, Select, Textarea, Button } from '../common';
import { 
  LabOutRecord, 
  CreateLabOutInput, 
  UpdateLabOutInput, 
  LabPartRecord 
} from '../../types';
import { fetchLabParts } from '../../services/labInventoryService';

interface LabOutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLabOutInput | UpdateLabOutInput) => Promise<void>;
  initialData?: LabOutRecord | null;
  isSubmitting?: boolean;
}

export const LabOutFormModal: React.FC<LabOutFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [partId, setPartId] = useState<string>('');
  const [partsName, setPartsName] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unitPrice, setUnitPrice] = useState<number | string>(0);
  const [dispatchedTo, setDispatchedTo] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [partsCatalog, setPartsCatalog] = useState<LabPartRecord[]>([]);
  const [selectedPart, setSelectedPart] = useState<LabPartRecord | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchLabParts().then((parts) => {
        setPartsCatalog(parts);
        if (initialData) {
          const match = parts.find((p) => p.id === initialData.partId);
          if (match) setSelectedPart(match);
        }
      }).catch(console.error);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setPartId(initialData.partId || '');
      setPartsName(initialData.partsName || '');
      setQuantity(initialData.quantity || 1);
      setUnitPrice(initialData.unitPrice || 0);
      setDispatchedTo(initialData.dispatchedTo || '');
      setReferenceNo(initialData.referenceNo || '');
      setRemarks(initialData.remarks || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setPartId('');
      setPartsName('');
      setQuantity(1);
      setUnitPrice(0);
      setDispatchedTo('');
      setReferenceNo('');
      setRemarks('');
      setSelectedPart(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // When user selects a part from the dropdown
  const handlePartChange = (selectedId: string) => {
    setPartId(selectedId);
    const found = partsCatalog.find((p) => p.id === selectedId);
    if (found) {
      setSelectedPart(found);
      setPartsName(found.name);
      setUnitPrice(found.unitPrice);
      // Auto adjust quantity to 1 or max stock if 0
      setQuantity(Math.min(1, Math.max(1, found.stockQuantity)));
    } else {
      setSelectedPart(null);
      setPartsName('');
      setUnitPrice(0);
    }
  };

  const numQty = Math.max(0, Number(quantity) || 0);
  const numPrice = Math.max(0, Number(unitPrice) || 0);
  const autoTotal = numQty * numPrice;
  const availableStock = selectedPart ? selectedPart.stockQuantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!date) validationErrors.date = 'Date is required';
    if (!partId) validationErrors.partId = 'Please select a part from the lab inventory';
    if (numQty <= 0) validationErrors.quantity = 'Quantity must be greater than 0';

    if (selectedPart && numQty > availableStock + (initialData ? initialData.quantity : 0)) {
      validationErrors.quantity = `Insufficient stock! Only ${availableStock} ${selectedPart.unit} available in lab.`;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateLabOutInput = {
      date,
      partId,
      quantity: numQty,
      unitPrice: numPrice,
      dispatchedTo: dispatchedTo.trim() || null,
      referenceNo: referenceNo.trim() || null,
      remarks: remarks.trim() || null,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Lab Out Record' : 'Record Lab Out (Stock Dispatch)'}
      subtitle="Select a part to automatically fill details, calculate totals, and adjust available stock."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Part Selector */}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Select Part From Lab <span className="text-rose-500">*</span></span>
              {selectedPart && (
                <span className={`text-[11px] font-bold px-2 py-0.2 rounded ${
                  selectedPart.stockQuantity > 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  Stock Available: {selectedPart.stockQuantity} {selectedPart.unit}
                </span>
              )}
            </label>
            <Select
              value={partId}
              onChange={(e) => handlePartChange(e.target.value)}
              options={[
                { value: '', label: '-- Select a spare part from lab --' },
                ...partsCatalog.map((p) => ({
                  value: p.id,
                  label: `${p.name} (Stock: ${p.stockQuantity} ${p.unit} | ৳${p.unitPrice})`,
                })),
              ]}
              error={errors.partId}
              required
            />
          </div>
        </div>

        {/* Auto-filled Parts Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Parts Name (Auto-filled)
          </label>
          <Input
            value={partsName}
            readOnly
            placeholder="Select a part above to auto-fill"
            className="bg-slate-50 font-medium text-slate-800 cursor-not-allowed"
          />
        </div>

        {/* Selected Part Confirmation Banner */}
        {selectedPart && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>
                Selected: <strong>{selectedPart.name}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span>Unit Price: <strong>৳{selectedPart.unitPrice.toLocaleString('en-IN')}</strong></span>
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                Available: {selectedPart.stockQuantity} {selectedPart.unit}
              </span>
            </div>
          </div>
        )}

        {/* Quantity, Per Parts Price, Auto Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to Dispatch <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              max={selectedPart ? selectedPart.stockQuantity + (initialData ? initialData.quantity : 0) : undefined}
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="5"
              error={errors.quantity}
              className="font-mono font-bold"
              required
            />
            {selectedPart && (
              <p className="text-[10px] text-slate-500 mt-1">
                Max available: {selectedPart.stockQuantity} {selectedPart.unit}
              </p>
            )}
          </div>

          {/* Per Parts Price (Auto-filled, editable if discounted) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Per Parts Price (Auto-filled) <span className="text-rose-500">*</span>
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
            <p className="text-[10px] text-slate-500 mt-1">Fetched from lab catalog</p>
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

        {/* Remaining Stock Preview */}
        {selectedPart && (
          <div className="flex items-center justify-between text-xs px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
            <span>Stock Calculation:</span>
            <span>
              Initial: <strong>{selectedPart.stockQuantity}</strong> − Dispatch: <strong>{numQty}</strong> = Remaining:{' '}
              <strong className={selectedPart.stockQuantity - numQty < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {selectedPart.stockQuantity - numQty} {selectedPart.unit}
              </strong>
            </span>
          </div>
        )}

        {/* Dispatched To & Reference No */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatched To / Destination (Optional)
            </label>
            <Input
              value={dispatchedTo}
              onChange={(e) => setDispatchedTo(e.target.value)}
              placeholder="e.g. Popular Diagnostic Center / Technician Tanvir"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job / Service Ref No (Optional)
            </label>
            <Input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. RCE-2026-0001 / SRV-0034"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Remarks / Installation Notes (Optional)
          </label>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Installed in photometer optical path, fully tested and calibrated..."
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
            leftIcon={ArrowUpRight}
            disabled={selectedPart ? selectedPart.stockQuantity <= 0 : false}
          >
            {initialData ? 'Update Lab Out' : 'Confirm Dispatch & Deduct Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
