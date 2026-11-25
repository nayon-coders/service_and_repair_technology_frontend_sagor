import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import { Modal, Input, Select, Textarea, DatePicker, Button } from '../common';
import { 
  RequisitionRecord, 
  RequisitionItemRecord, 
  CreateRequisitionInput, 
  UpdateRequisitionInput, 
  CustomerType, 
  RequisitionStatus,
  RequisitionItemCategory 
} from '../../types';
import { fetchNextEstimateNo } from '../../services/requisitionService';

interface RequisitionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRequisitionInput | UpdateRequisitionInput) => Promise<void>;
  initialData?: RequisitionRecord | null;
  defaultCustomerType?: CustomerType;
  isSubmitting?: boolean;
}

export const RequisitionFormModal: React.FC<RequisitionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultCustomerType = 'CORPORATE',
  isSubmitting = false,
}) => {
  const [estimateNo, setEstimateNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUpTo, setValidUpTo] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>(defaultCustomerType);
  const [organizationName, setOrganizationName] = useState('');
  const [departmentWard, setDepartmentWard] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNo, setContactNo] = useState('');

  // Equipment info
  const [equipmentName, setEquipmentName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [faultDescription, setFaultDescription] = useState('');

  // Line items (Spare parts & Service)
  const [spareParts, setSpareParts] = useState<RequisitionItemRecord[]>([
    { category: 'SPARE_PARTS', sl: 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0, remarks: 'Repairable' },
  ]);
  const [serviceItems, setServiceItems] = useState<RequisitionItemRecord[]>([
    { category: 'SERVICE_LABOUR', sl: 1, description: 'Labour Service', qty: 1, unitPrice: 0, totalPrice: 0, remarks: '' },
  ]);

  // Financials & Status
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<RequisitionStatus>('PENDING');
  const [preparedBy, setPreparedBy] = useState('1 Service & Repair Technology.');
  const [clientApprovalNote, setClientApprovalNote] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculated totals
  const sparePartsTotal = spareParts.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);
  const serviceLabourTotal = serviceItems.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);
  const subTotal = sparePartsTotal + serviceLabourTotal;
  const grandTotal = Math.max(0, subTotal - (Number(discount) || 0));

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setEstimateNo(initialData.estimateNo);
      setDate(initialData.date);
      setValidUpTo(initialData.validUpTo || '');
      setCustomerType(initialData.customerType);
      setOrganizationName(initialData.organizationName);
      setDepartmentWard(initialData.departmentWard || '');
      setContactPerson(initialData.contactPerson || '');
      setContactNo(initialData.contactNo || '');
      setEquipmentName(initialData.equipmentName || '');
      setBrand(initialData.brand || '');
      setModel(initialData.model || '');
      setSerialNo(initialData.serialNo || '');
      setFaultDescription(initialData.faultDescription || '');
      setDiscount(Number(initialData.discount) || 0);
      setStatus(initialData.status);
      setPreparedBy(initialData.preparedBy || '1 Service & Repair Technology.');
      setClientApprovalNote(initialData.clientApprovalNote || '');

      const sp = (initialData.items || []).filter((it) => it.category === 'SPARE_PARTS');
      const srv = (initialData.items || []).filter((it) => it.category === 'SERVICE_LABOUR');

      setSpareParts(sp.length > 0 ? sp : [{ category: 'SPARE_PARTS', sl: 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0, remarks: '' }]);
      setServiceItems(srv.length > 0 ? srv : [{ category: 'SERVICE_LABOUR', sl: 1, description: 'Labour Service', qty: 1, unitPrice: 0, totalPrice: 0, remarks: '' }]);
    } else {
      setCustomerType(defaultCustomerType);
      setDate(new Date().toISOString().split('T')[0]);
      setValidUpTo('');
      setOrganizationName('');
      setDepartmentWard('');
      setContactPerson('');
      setContactNo('');
      setEquipmentName('');
      setBrand('');
      setModel('');
      setSerialNo('');
      setFaultDescription('');
      setDiscount(0);
      setStatus('PENDING');
      setPreparedBy('1 Service & Repair Technology.');
      setClientApprovalNote('');
      setSpareParts([{ category: 'SPARE_PARTS', sl: 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0, remarks: 'Repairable' }]);
      setServiceItems([{ category: 'SERVICE_LABOUR', sl: 1, description: 'Labour Service', qty: 1, unitPrice: 0, totalPrice: 0, remarks: '' }]);

      fetchNextEstimateNo()
        .then((no) => setEstimateNo(no))
        .catch(() => setEstimateNo(''));
    }
    setErrors({});
  }, [isOpen, initialData, defaultCustomerType]);

  // Handler for item change
  const handleItemChange = (
    listType: 'SPARE_PARTS' | 'SERVICE_LABOUR',
    index: number,
    field: keyof RequisitionItemRecord,
    value: unknown
  ) => {
    const setter = listType === 'SPARE_PARTS' ? setSpareParts : setServiceItems;
    setter((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === 'qty' || field === 'unitPrice') {
        const qty = field === 'qty' ? Number(value) || 0 : Number(current.qty) || 0;
        const unitPrice = field === 'unitPrice' ? Number(value) || 0 : Number(current.unitPrice) || 0;
        current.totalPrice = qty * unitPrice;
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleAddItem = (category: RequisitionItemCategory) => {
    if (category === 'SPARE_PARTS') {
      setSpareParts((prev) => [
        ...prev,
        { category: 'SPARE_PARTS', sl: prev.length + 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0, remarks: '' },
      ]);
    } else {
      setServiceItems((prev) => [
        ...prev,
        { category: 'SERVICE_LABOUR', sl: prev.length + 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0, remarks: '' },
      ]);
    }
  };

  const handleRemoveItem = (category: RequisitionItemCategory, index: number) => {
    if (category === 'SPARE_PARTS') {
      if (spareParts.length <= 1) return;
      setSpareParts((prev) => prev.filter((_, i) => i !== index).map((it, idx) => ({ ...it, sl: idx + 1 })));
    } else {
      if (serviceItems.length <= 1) return;
      setServiceItems((prev) => prev.filter((_, i) => i !== index).map((it, idx) => ({ ...it, sl: idx + 1 })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!organizationName.trim()) {
      newErrors.organizationName = 'Organization / Customer name is required';
    }

    if (!estimateNo.trim()) {
      newErrors.estimateNo = 'Estimate number is required';
    }

    const validSpareParts = spareParts.filter((it) => it.description.trim() !== '');
    const validService = serviceItems.filter((it) => it.description.trim() !== '');

    if (validSpareParts.length === 0 && validService.length === 0) {
      newErrors.items = 'Please enter at least one spare part or service description';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const combinedItems: RequisitionItemRecord[] = [
      ...validSpareParts.map((it, idx) => ({
        category: 'SPARE_PARTS' as RequisitionItemCategory,
        sl: idx + 1,
        description: it.description.trim(),
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        totalPrice: Number(it.totalPrice) || (Number(it.qty) || 1) * (Number(it.unitPrice) || 0),
        remarks: it.remarks?.trim() || undefined,
      })),
      ...validService.map((it, idx) => ({
        category: 'SERVICE_LABOUR' as RequisitionItemCategory,
        sl: idx + 1,
        description: it.description.trim(),
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        totalPrice: Number(it.totalPrice) || (Number(it.qty) || 1) * (Number(it.unitPrice) || 0),
        remarks: it.remarks?.trim() || undefined,
      })),
    ];

    const payload: CreateRequisitionInput = {
      estimateNo: estimateNo.trim(),
      date,
      validUpTo: validUpTo || undefined,
      customerType,
      organizationName: organizationName.trim(),
      departmentWard: departmentWard.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      contactNo: contactNo.trim() || undefined,
      equipmentName: equipmentName.trim() || undefined,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      serialNo: serialNo.trim() || undefined,
      faultDescription: faultDescription.trim() || undefined,
      discount: Number(discount) || 0,
      status,
      preparedBy: preparedBy.trim() || undefined,
      clientApprovalNote: clientApprovalNote.trim() || undefined,
      items: combinedItems,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Estimate: ${initialData.estimateNo}` : 'Create Requisition / Repair Cost Estimate'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Customer & Estimate Meta */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002060] mb-3 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-[#002060]" />
            Estimate &amp; Customer Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Estimate No."
              value={estimateNo}
              onChange={(e) => setEstimateNo(e.target.value)}
              placeholder="e.g. RCE-2026-0001"
              required
              error={errors.estimateNo}
            />

            <DatePicker
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <DatePicker
              label="Valid Up To"
              value={validUpTo}
              onChange={(e) => setValidUpTo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="sm:col-span-2">
              <Input
                label="Organization / Customer Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Popular Diagnostic Center Ltd."
                required
                error={errors.organizationName}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Domain
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${customerType === 'CORPORATE' ? 'bg-blue-600' : 'bg-emerald-600'}`}></span>
                <span>{customerType === 'CORPORATE' ? 'Corporate Customer' : 'Non-Corporate Customer'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <Input
              label="Department / Ward"
              value={departmentWard}
              onChange={(e) => setDepartmentWard(e.target.value)}
              placeholder="e.g. ICU / Pathology Lab"
            />
            <Input
              label="Contact Person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Dr. Tariqul Islam"
            />
            <Input
              label="Contact No"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              placeholder="e.g. 01715-998811"
            />
          </div>
        </div>

        {/* Section 2: Equipment Details & Problem Description */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002060] mb-3">
            Equipment Details &amp; Problem
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Equipment Name"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              placeholder="e.g. Automated Chemistry Analyzer"
            />
            <Input
              label="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Mindray"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <Input
              label="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. BS-240"
            />
            <Input
              label="Serial No."
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              placeholder="e.g. SN-88390-D"
            />
          </div>

          <div className="mt-3">
            <Textarea
              label="Fault Description / Problem"
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              placeholder="Describe the malfunction, error codes, and inspection findings..."
              rows={2}
            />
          </div>
        </div>

        {/* Section 3: Cost Breakdown (A. Spare Parts) */}
        <div className="bg-white p-4 rounded-lg border border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002060] bg-sky-100 px-2 py-0.5 rounded">
              A. SPARE PARTS
            </h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={Plus}
              onClick={() => handleAddItem('SPARE_PARTS')}
            >
              Add Spare Part
            </Button>
          </div>

          {errors.items && (
            <p className="text-xs text-rose-600 font-medium mb-2">{errors.items}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 w-10 text-center">SL</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 w-16 text-center">Qty</th>
                  <th className="p-2 w-28 text-right">Unit Price (৳)</th>
                  <th className="p-2 w-28 text-right">Total Price (৳)</th>
                  <th className="p-2 w-32 text-left">Remarks</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {spareParts.map((item, idx) => (
                  <tr key={`sp-${idx}`} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                        placeholder="Spare part description"
                        value={item.description}
                        onChange={(e) => handleItemChange('SPARE_PARTS', idx, 'description', e.target.value)}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min="1"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center font-mono"
                        value={item.qty}
                        onChange={(e) => handleItemChange('SPARE_PARTS', idx, 'qty', Number(e.target.value))}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-right font-mono"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange('SPARE_PARTS', idx, 'unitPrice', Number(e.target.value))}
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-slate-900">
                      {Number(item.totalPrice).toFixed(2)}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                        placeholder="Remarks"
                        value={item.remarks || ''}
                        onChange={(e) => handleItemChange('SPARE_PARTS', idx, 'remarks', e.target.value)}
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => handleItemChange('SPARE_PARTS', idx, 'remarks', 'Repairable')}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded transition-colors cursor-pointer select-none"
                        >
                          Repairable
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('SPARE_PARTS', idx, 'remarks', 'Un-Repairable')}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded transition-colors cursor-pointer select-none"
                        >
                          Un-Repairable
                        </button>
                      </div>
                    </td>
                    <td className="p-1 text-center">
                      {spareParts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('SPARE_PARTS', idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Cost Breakdown (B. Service & Labour) */}
        <div className="bg-white p-4 rounded-lg border border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002060] bg-sky-100 px-2 py-0.5 rounded">
              B. SERVICE &amp; LABOUR
            </h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={Plus}
              onClick={() => handleAddItem('SERVICE_LABOUR')}
            >
              Add Labour Service
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 w-10 text-center">SL</th>
                  <th className="p-2 text-left">Service Description</th>
                  <th className="p-2 w-16 text-center">Qty</th>
                  <th className="p-2 w-28 text-right">Unit Price (৳)</th>
                  <th className="p-2 w-28 text-right">Total Price (৳)</th>
                  <th className="p-2 w-32 text-left">Remarks</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {serviceItems.map((item, idx) => (
                  <tr key={`srv-${idx}`} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                        placeholder="Service / labour description"
                        value={item.description}
                        onChange={(e) => handleItemChange('SERVICE_LABOUR', idx, 'description', e.target.value)}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min="1"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center font-mono"
                        value={item.qty}
                        onChange={(e) => handleItemChange('SERVICE_LABOUR', idx, 'qty', Number(e.target.value))}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-right font-mono"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange('SERVICE_LABOUR', idx, 'unitPrice', Number(e.target.value))}
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-slate-900">
                      {Number(item.totalPrice).toFixed(2)}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                        placeholder="Remarks"
                        value={item.remarks || ''}
                        onChange={(e) => handleItemChange('SERVICE_LABOUR', idx, 'remarks', e.target.value)}
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => handleItemChange('SERVICE_LABOUR', idx, 'remarks', 'Repairable')}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded transition-colors cursor-pointer select-none"
                        >
                          Repairable
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('SERVICE_LABOUR', idx, 'remarks', 'Un-Repairable')}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded transition-colors cursor-pointer select-none"
                        >
                          Un-Repairable
                        </button>
                      </div>
                    </td>
                    <td className="p-1 text-center">
                      {serviceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('SERVICE_LABOUR', idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Financial Summary */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Spare Parts Total:
              </label>
              <div className="px-3 py-2 bg-slate-200/70 border border-slate-300 rounded text-sm font-bold font-mono text-slate-800">
                ৳ {sparePartsTotal.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service &amp; Labour Total:
              </label>
              <div className="px-3 py-2 bg-slate-200/70 border border-slate-300 rounded text-sm font-bold font-mono text-slate-800">
                ৳ {serviceLabourTotal.toFixed(2)}
              </div>
            </div>

            <div>
              <Input
                label="Discount (৳)"
                type="number"
                min="0"
                step="any"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Grand Total Banner */}
          <div className="mt-4 p-3 bg-[#002060] text-white rounded-lg flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold">
              ESTIMATED GRAND TOTAL:
            </span>
            <span className="text-2xl font-black font-mono text-sky-300">
              ৳ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200">
            <Select
              label="Approval Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RequisitionStatus)}
              options={[
                { value: 'PENDING', label: 'Pending Approval' },
                { value: 'APPROVED', label: 'Approved by Client' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />

            <Input
              label="Prepared By"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="e.g. 1 Service & Repair Technology."
            />
          </div>

          <div className="mt-3">
            <Input
              label="Client Approval Note"
              value={clientApprovalNote}
              onChange={(e) => setClientApprovalNote(e.target.value)}
              placeholder="e.g. Approved by Dr. Tariqul Islam on 18/06/2026"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
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
            {initialData ? 'Update Estimate' : 'Save & Generate Estimate'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};

