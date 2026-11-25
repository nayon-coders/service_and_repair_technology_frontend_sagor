import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Receipt, ClipboardList, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { Modal, Input, Select, Textarea, DatePicker, Button, PartAutocompleteInput } from '../common';
import { 
  BillVoucherRecord, 
  BillVoucherItemRecord, 
  CreateBillVoucherInput, 
  UpdateBillVoucherInput, 
  CustomerType, 
  BillType, 
  VoucherPaymentStatus, 
  VoucherPaymentMethod,
  RequisitionRecord,
  LabPartRecord 
} from '../../types';
import { fetchNextVoucherNo } from '../../services/voucherService';
import { fetchRequisitions } from '../../services/requisitionService';
import { fetchProblemTemplates } from '../../services/templateService';
import { fetchLabParts } from '../../services/labInventoryService';

interface BillVoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBillVoucherInput | UpdateBillVoucherInput) => Promise<void>;
  initialData?: BillVoucherRecord | null;
  defaultCustomerType?: CustomerType;
  initialRequisitionId?: string | null;
  isSubmitting?: boolean;
}

// English number to words helper for interactive client display
const clientNumberToWords = (amount: number): string => {
  const rounded = Math.round(Math.abs(amount));
  if (rounded === 0) return 'Zero Taka Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertThreeDigits = (num: number): string => {
    let out = '';
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    if (hundred > 0) out += `${units[hundred]} Hundred `;
    if (rest > 0) {
      if (rest < 10) out += units[rest];
      else if (rest < 20) out += teens[rest - 10];
      else {
        const tenDigit = Math.floor(rest / 10);
        const singleDigit = rest % 10;
        out += tens[tenDigit] + (singleDigit > 0 ? `-${units[singleDigit]}` : '');
      }
    }
    return out.trim();
  };

  let num = rounded;
  const parts: string[] = [];
  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    parts.push(`${convertThreeDigits(crores)} Crore`);
    num %= 10000000;
  }
  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    parts.push(`${convertThreeDigits(lakhs)} Lakh`);
    num %= 100000;
  }
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    parts.push(`${convertThreeDigits(thousands)} Thousand`);
    num %= 1000;
  }
  if (num > 0) {
    parts.push(convertThreeDigits(num));
  }

  return `${parts.join(' ')} Taka Only`;
};

export const BillVoucherFormModal: React.FC<BillVoucherFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultCustomerType = 'CORPORATE',
  initialRequisitionId = null,
  isSubmitting = false,
}) => {
  const [voucherNo, setVoucherNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerType, setCustomerType] = useState<CustomerType>(defaultCustomerType);
  const [billType, setBillType] = useState<BillType>('REPAIR');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  
  // Requisition auto-fill state
  const [requisitions, setRequisitions] = useState<RequisitionRecord[]>([]);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string>('');
  const [isLoadingRequisitions, setIsLoadingRequisitions] = useState<boolean>(false);
  const [autoFilledNote, setAutoFilledNote] = useState<string | null>(null);

  // Machine info
  const [machineName, setMachineName] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [department, setDepartment] = useState('');
  const [problemComplaint, setProblemComplaint] = useState('');
  const [problemTemplates, setProblemTemplates] = useState<string[]>([]);
  const [labParts, setLabParts] = useState<LabPartRecord[]>([]);
  const [receivedDate, setReceivedDate] = useState('');

  // Line Items
  const [items, setItems] = useState<BillVoucherItemRecord[]>([
    { sl: 1, description: '', qty: 1, unitPrice: 0, amount: 0, remarks: '' },
  ]);

  // Financials
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [warrantyTerms, setWarrantyTerms] = useState('1 year Panel Service Warranty');
  const [paymentStatus, setPaymentStatus] = useState<VoucherPaymentStatus>('DUE');
  const [paymentMethod, setPaymentMethod] = useState<VoucherPaymentMethod>('CASH');
  const [paymentMethodOther, setPaymentMethodOther] = useState('');
  const [preparedBy, setPreparedBy] = useState('Engr. Sagor Badsha');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculated fields
  const partsTotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const grandTotal = Math.max(0, partsTotal + (Number(serviceCharge) || 0) - (Number(discount) || 0));
  const dueAmount = Math.max(0, grandTotal - (Number(paidAmount) || 0));
  const amountInWords = clientNumberToWords(grandTotal);

  // Requisition selection handler
  const handleSelectRequisition = (id: string, reqList: RequisitionRecord[] = requisitions) => {
    setSelectedRequisitionId(id);
    if (!id) {
      setAutoFilledNote(null);
      return;
    }

    const req = reqList.find((r) => r.id === id);
    if (!req) return;

    setCustomerName(req.organizationName || '');
    setMobile(req.contactNo || '');
    setDepartment(req.departmentWard || '');
    setMachineName(req.equipmentName || '');
    setBrandModel([req.brand, req.model].filter(Boolean).join(' - '));
    setSerialNo(req.serialNo || '');
    setProblemComplaint(req.faultDescription || '');
    setServiceCharge(Number(req.serviceLabourTotal) || 0);
    setDiscount(Number(req.discount) || 0);

    if (req.items && req.items.length > 0) {
      setItems(
        req.items.map((it, idx) => ({
          sl: idx + 1,
          description: it.description || '',
          qty: Number(it.qty) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          amount: (Number(it.qty) || 1) * (Number(it.unitPrice) || 0),
          remarks: it.category === 'SERVICE_LABOUR' ? 'Service / Labour' : '',
        }))
      );
    }

    setAutoFilledNote(`রিকুইজিশন #${req.estimateNo} (${req.organizationName}) এর সমস্ত তথ্য সফলভাবে লোড হয়েছে।`);
  };

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setSelectedRequisitionId('');
      setAutoFilledNote(null);
      setVoucherNo(initialData.voucherNo);
      setDate(initialData.date);
      setCustomerType(initialData.customerType);
      setBillType(initialData.billType);
      setCustomerName(initialData.customerName);
      setMobile(initialData.mobile || '');
      setAddress(initialData.address || '');
      setMachineName(initialData.machineName || '');
      setBrandModel(initialData.brandModel || '');
      setSerialNo(initialData.serialNo || '');
      setDepartment(initialData.department || '');
      setProblemComplaint(initialData.problemComplaint || '');
      setReceivedDate(initialData.receivedDate || '');
      setServiceCharge(Number(initialData.serviceCharge) || 0);
      setDiscount(Number(initialData.discount) || 0);
      setPaidAmount(Number(initialData.paidAmount) || 0);
      setWarrantyTerms(initialData.warrantyTerms || '1 year Panel Service Warranty');
      setPaymentStatus(initialData.paymentStatus);
      setPaymentMethod(initialData.paymentMethod);
      setPaymentMethodOther(initialData.paymentMethodOther || '');
      setPreparedBy(initialData.preparedBy || 'Engr. Sagor Badsha');
      setItems(
        initialData.items && initialData.items.length > 0
          ? initialData.items
          : [{ sl: 1, description: '', qty: 1, unitPrice: 0, amount: 0, remarks: '' }]
      );
    } else {
      // Create mode
      setCustomerType(defaultCustomerType);
      setDate(new Date().toISOString().split('T')[0]);
      setBillType('REPAIR');
      setCustomerName('');
      setMobile('');
      setAddress('');
      setMachineName('');
      setBrandModel('');
      setSerialNo('');
      setDepartment('');
      setProblemComplaint('');
      setReceivedDate('');
      setServiceCharge(0);
      setDiscount(0);
      setPaidAmount(0);
      setWarrantyTerms('1 year Panel Service Warranty');
      setPaymentStatus('DUE');
      setPaymentMethod('CASH');
      setPaymentMethodOther('');
      setPreparedBy('Engr. Sagor Badsha');
      setItems([{ sl: 1, description: '', qty: 1, unitPrice: 0, amount: 0, remarks: '' }]);

      setSelectedRequisitionId('');
      setAutoFilledNote(null);

      // Fetch requisitions for auto-fill in this customer domain
      setIsLoadingRequisitions(true);
      fetchRequisitions({ customerType: defaultCustomerType, limit: 100 })
        .then((res) => {
          const list = res.items || [];
          setRequisitions(list);
          if (initialRequisitionId) {
            handleSelectRequisition(initialRequisitionId, list);
          }
        })
        .catch((err) => console.warn('Could not load requisitions for auto-fill:', err))
        .finally(() => setIsLoadingRequisitions(false));

      // Fetch next voucher number
      fetchNextVoucherNo()
        .then((no) => setVoucherNo(no))
        .catch(() => setVoucherNo(''));
    }
    setErrors({});
  }, [isOpen, initialData, defaultCustomerType, initialRequisitionId]);

  // Load problem templates and lab parts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProblemTemplates()
        .then((list) => setProblemTemplates(list))
        .catch((err) => console.warn('Could not load problem templates:', err));
      fetchLabParts()
        .then((parts) => setLabParts(parts))
        .catch((err) => console.warn('Could not load lab parts:', err));
    }
  }, [isOpen]);

  // Line items handlers
  const handleSelectLabPart = (index: number, part: LabPartRecord) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };
      current.description = part.name;
      const qty = Number(current.qty) > 0 ? Number(current.qty) : 1;
      const unitPrice = Number(part.unitPrice) || 0;
      current.qty = qty;
      current.unitPrice = unitPrice;
      current.amount = qty * unitPrice;
      updated[index] = current;
      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof BillVoucherItemRecord, value: unknown) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      
      // Auto calc amount when qty or unitPrice changes
      if (field === 'qty' || field === 'unitPrice') {
        const qty = field === 'qty' ? Number(value) || 0 : Number(current.qty) || 0;
        const unitPrice = field === 'unitPrice' ? Number(value) || 0 : Number(current.unitPrice) || 0;
        current.amount = qty * unitPrice;
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { sl: prev.length + 1, description: '', qty: 1, unitPrice: 0, amount: 0, remarks: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((it, idx) => ({ ...it, sl: idx + 1 }));
    });
  };

  // Auto adjust payment status if paid amount changes
  const handlePaidAmountChange = (val: number) => {
    setPaidAmount(val);
    if (val >= grandTotal && grandTotal > 0) {
      setPaymentStatus('PAID');
    } else if (val > 0) {
      setPaymentStatus('PARTIAL');
    } else {
      setPaymentStatus('DUE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer / Institution name is required';
    }

    if (!voucherNo.trim()) {
      newErrors.voucherNo = 'Voucher number is required';
    }

    // Filter out blank items
    const validItems = items.filter((it) => it.description.trim() !== '');
    if (validItems.length === 0) {
      newErrors.items = 'At least one item description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: CreateBillVoucherInput = {
      voucherNo: voucherNo.trim(),
      date,
      customerType,
      billType,
      customerName: customerName.trim(),
      mobile: mobile.trim() || undefined,
      address: address.trim() || undefined,
      machineName: machineName.trim() || undefined,
      brandModel: brandModel.trim() || undefined,
      serialNo: serialNo.trim() || undefined,
      department: department.trim() || undefined,
      problemComplaint: problemComplaint.trim() || undefined,
      receivedDate: receivedDate || undefined,
      partsTotal,
      serviceCharge: Number(serviceCharge) || 0,
      discount: Number(discount) || 0,
      paidAmount: Number(paidAmount) || 0,
      amountInWords,
      warrantyTerms: warrantyTerms.trim() || undefined,
      paymentStatus,
      paymentMethod,
      paymentMethodOther: paymentMethod === 'OTHER' ? paymentMethodOther.trim() : undefined,
      preparedBy: preparedBy.trim() || undefined,
      items: validItems.map((it, idx) => ({
        sl: idx + 1,
        description: it.description.trim(),
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        amount: Number(it.amount) || (Number(it.qty) || 1) * (Number(it.unitPrice) || 0),
        remarks: it.remarks?.trim() || undefined,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Bill Voucher: ${initialData.voucherNo}` : 'Create Machine Repair / Service Bill Voucher'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Requisition Auto-fill Card (Only in Create Mode) */}
        {!initialData && (
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-slate-50 border border-blue-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    রিকুইজিশন থেকে অটো-ফিল (Auto-Fill from Requisition)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    পূর্ববর্তী রিকুইজিশন নির্বাচন করলে কাস্টমার, মেশিন ও পার্টসের সমস্ত তথ্য স্বয়ংক্রিয়ভাবে বসে যাবে।
                  </p>
                </div>
              </div>
              {selectedRequisitionId && (
                <button
                  type="button"
                  onClick={() => handleSelectRequisition('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 self-start sm:self-auto px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ক্লিয়ার করুন</span>
                </button>
              )}
            </div>

            <div>
              <select
                value={selectedRequisitionId}
                onChange={(e) => handleSelectRequisition(e.target.value)}
                disabled={isLoadingRequisitions}
                className="w-full text-xs font-medium text-slate-800 bg-white border border-blue-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer disabled:bg-slate-100"
              >
                <option value="">
                  {isLoadingRequisitions
                    ? 'রিকুইজিশন তালিকা লোড হচ্ছে...'
                    : requisitions.length === 0
                    ? '-- এই কাস্টমার ক্যাটাগরিতে কোনো রিকুইজিশন পাওয়া যায়নি (ম্যানুয়ালি পূরণ করুন) --'
                    : '-- কোনো রিকুইজিশন নির্বাচন করুন (Select Requisition to Auto-Fill) --'}
                </option>
                {requisitions.map((req) => (
                  <option key={req.id} value={req.id}>
                    [{req.estimateNo}] {req.organizationName} — {req.equipmentName || 'যন্ত্রপাতি'} (৳{Number(req.grandTotal).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {autoFilledNote && (
              <div className="text-xs font-medium text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{autoFilledNote}</span>
              </div>
            )}
          </div>
        )}

        {/* Section 1: Customer & Voucher Meta */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-blue-600" />
            Voucher & Customer Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Voucher No."
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              placeholder="e.g. BV-2026-0001"
              required
              error={errors.voucherNo}
            />

            <DatePicker
              label="Voucher Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

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
            <div className="sm:col-span-2">
              <Input
                label="Customer / Institution Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Square Hospitals Ltd. / Medilife Lab"
                required
                error={errors.customerName}
              />
            </div>

            <Input
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 01712-345678"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="sm:col-span-2">
              <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Hospital/Clinic/Client address"
              />
            </div>

            <Select
              label="Bill Type"
              value={billType}
              onChange={(e) => setBillType(e.target.value as BillType)}
              options={[
                { value: 'REPAIR', label: 'Repair' },
                { value: 'SERVICE', label: 'Service' },
                { value: 'BOTH', label: 'Both (Repair & Service)' },
              ]}
              required
            />
          </div>
        </div>

        {/* Section 2: Machine Details */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Machine / Equipment Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Machine Name"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="e.g. Patient Monitor / Treadmill Commercial"
            />
            <Input
              label="Brand / Model"
              value={brandModel}
              onChange={(e) => setBrandModel(e.target.value)}
              placeholder="e.g. Mindray BeneView T5 / Shua SH-5918"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <Input
              label="Serial No."
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              placeholder="e.g. SN-99420-B"
            />
            <Input
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. ICU / Lab / Cardio"
            />
            <DatePicker
              label="Received Date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
            />
          </div>

          <div className="mt-3">
            <Textarea
              label="Problem / Complaint"
              value={problemComplaint}
              onChange={(e) => setProblemComplaint(e.target.value)}
              placeholder="Describe equipment malfunction or service complaints reported by client..."
              rows={2}
            />

            {problemTemplates.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    ক্লিক করে সমস্যা বসান (Quick Problem Templates):
                  </span>
                  <Link
                    to="/settings/problem-templates"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700 hover:underline text-[11px] font-medium"
                  >
                    + নতুন সমস্যা যুক্ত করুন (Settings)
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {problemTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProblemComplaint((prev) => {
                          const trimmed = prev.trim();
                          if (!trimmed) return tmpl;
                          if (trimmed.includes(tmpl)) return prev;
                          const sep = trimmed.endsWith('.') || trimmed.endsWith(';') ? ' ' : '; ';
                          return trimmed + sep + tmpl;
                        });
                      }}
                      className="text-left px-2 py-1 text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-400 rounded-md transition-all shadow-2xs cursor-pointer select-none"
                      title="ক্লিক করলে ইনপুটে বসে যাবে"
                    >
                      + {tmpl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Line Items (Parts & Work Description) */}
        <div className="bg-white p-4 rounded-lg border border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Repair / Service Details & Charges (Line Items)
            </h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={Plus}
              onClick={handleAddItem}
            >
              Add Item Row
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
                  <th className="p-2 text-left">Parts / Work Description</th>
                  <th className="p-2 w-16 text-center">Qty</th>
                  <th className="p-2 w-28 text-right">Unit Price (৳)</th>
                  <th className="p-2 w-28 text-right">Amount (৳)</th>
                  <th className="p-2 w-32 text-left">Remarks</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-1">
                      <PartAutocompleteInput
                        value={item.description}
                        parts={labParts}
                        placeholder="Search / enter part or work..."
                        onChange={(text) => handleItemChange(idx, 'description', text)}
                        onSelectPart={(part) => handleSelectLabPart(idx, part)}
                        required
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500 font-mono"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-right focus:ring-1 focus:ring-blue-500 font-mono"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-slate-900">
                      {Number(item.amount).toFixed(2)}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                        placeholder="Remarks"
                        value={item.remarks || ''}
                        onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)}
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => handleItemChange(idx, 'remarks', 'Repairable')}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded transition-colors cursor-pointer select-none"
                        >
                          Repairable
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange(idx, 'remarks', 'Un-Repairable')}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded transition-colors cursor-pointer select-none"
                        >
                          Un-Repairable
                        </button>
                      </div>
                    </td>
                    <td className="p-1 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove row"
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

        {/* Section 4: Totals & Financial Breakdown */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parts Total (Auto):
              </label>
              <div className="px-3 py-2 bg-slate-200/70 border border-slate-300 rounded text-sm font-bold font-mono text-slate-800">
                ৳ {partsTotal.toFixed(2)}
              </div>
            </div>

            <div>
              <Input
                label="Repair / Service Charge (৳)"
                type="number"
                min="0"
                step="any"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(Number(e.target.value) || 0)}
              />
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

          {/* Grand Total Card */}
          <div className="mt-4 p-3 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
                GRAND TOTAL:
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                ৳ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 block font-medium">In Words:</span>
              <span className="font-semibold text-slate-200 italic">{amountInWords}</span>
            </div>
          </div>

          {/* Settlement Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200">
            <div>
              <Input
                label="Paid Amount (৳)"
                type="number"
                min="0"
                step="any"
                value={paidAmount}
                onChange={(e) => handlePaidAmountChange(Number(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Amount:
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded text-sm font-bold font-mono text-rose-600">
                ৳ {dueAmount.toFixed(2)}
              </div>
            </div>

            <Select
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as VoucherPaymentStatus)}
              options={[
                { value: 'PAID', label: 'Paid in Full' },
                { value: 'DUE', label: 'Due' },
                { value: 'PARTIAL', label: 'Partially Paid' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as VoucherPaymentMethod)}
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'BANK', label: 'Bank Transfer' },
                { value: 'BKASH', label: 'bKash' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />

            {paymentMethod === 'OTHER' && (
              <Input
                label="Other Method Details"
                value={paymentMethodOther}
                onChange={(e) => setPaymentMethodOther(e.target.value)}
                placeholder="e.g. Nagad, Cheque"
              />
            )}

            <Input
              label="Prepared By"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="Engineer name"
            />
          </div>

          <div className="mt-3">
            <Input
              label="Service / Warranty Terms"
              value={warrantyTerms}
              onChange={(e) => setWarrantyTerms(e.target.value)}
              placeholder="e.g. 1 year Panel Service Warranty"
            />
          </div>
        </div>

        {/* Modal Buttons */}
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
            {initialData ? 'Update Bill Voucher' : 'Save & Generate Voucher'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};
