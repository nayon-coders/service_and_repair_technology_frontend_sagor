import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, RotateCcw, ArrowDownLeft } from 'lucide-react';
import { Modal, Input, Select, Textarea, DatePicker, Button } from '../common';
import { 
  GatePassRecord, 
  CreateGatePassInput, 
  UpdateGatePassInput, 
  CustomerType, 
  GatePassStatus,
  GatePassType,
  ChallanKind
} from '../../types';
import { fetchNextGatePassNo } from '../../services/gatePassService';

interface GatePassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGatePassInput | UpdateGatePassInput) => Promise<void>;
  initialData?: GatePassRecord | null;
  defaultCustomerType?: CustomerType;
  defaultChallanKind?: ChallanKind;
  isSubmitting?: boolean;
}

export const GatePassFormModal: React.FC<GatePassFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultCustomerType = 'CORPORATE',
  defaultChallanKind = 'RECEIVING',
  isSubmitting = false,
}) => {
  // Challan Kind
  const [challanKind, setChallanKind] = useState<ChallanKind>(defaultChallanKind);
  const [passNo, setPassNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerType, setCustomerType] = useState<CustomerType>(defaultCustomerType);
  const [passType, setPassType] = useState<GatePassType>('RETURNABLE');
  const [referenceWorkOrderNo, setReferenceWorkOrderNo] = useState('');
  const [gatePassCategory, setGatePassCategory] = useState('মেরামতের জন্য মেশিন গ্রহণ');

  // Organization Info
  const [organizationName, setOrganizationName] = useState('');
  const [departmentWard, setDepartmentWard] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNo, setContactNo] = useState('');

  // Machine Info (Receiving)
  const [machineName, setMachineName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [brandManufacturer, setBrandManufacturer] = useState('');
  const [modelNo, setModelNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [assetIdNo, setAssetIdNo] = useState('');
  const [accessoriesReceived, setAccessoriesReceived] = useState('');
  const [machineCondition, setMachineCondition] = useState('অচল');
  const [reportedProblem, setReportedProblem] = useState('');
  const [physicalDamageCondition, setPhysicalDamageCondition] = useState('');

  // Transport & Movement
  const [destination, setDestination] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [designationStaffId, setDesignationStaffId] = useState('');
  const [transportPurpose, setTransportPurpose] = useState('সার্ভিসিং');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // Return Challan Specific
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceReportNo, setServiceReportNo] = useState('');
  const [returnCondition, setReturnCondition] = useState('মেরামত ও পরীক্ষা সম্পন্ন');
  const [workDoneComments, setWorkDoneComments] = useState('');
  const [returnedAccessories, setReturnedAccessories] = useState('');
  const [pendingIssuesAdvice, setPendingIssuesAdvice] = useState('');

  // Signatures & Status
  const [status, setStatus] = useState<GatePassStatus>('PENDING');
  const [preparedBy, setPreparedBy] = useState('1 Service & Repair Technology.');
  const [authorizedBy, setAuthorizedBy] = useState('Engr. Sagor Badsha (Chief Engineer)');
  const [receivedBy, setReceivedBy] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setChallanKind(initialData.challanKind || defaultChallanKind);
      setPassNo(initialData.passNo || '');
      setDate(initialData.date ? initialData.date.split('T')[0] : '');
      setCustomerType(initialData.customerType || defaultCustomerType);
      setPassType(initialData.passType || 'RETURNABLE');
      setReferenceWorkOrderNo(initialData.referenceWorkOrderNo || '');
      setGatePassCategory(initialData.gatePassCategory || 'মেরামতের জন্য মেশিন গ্রহণ');

      setOrganizationName(initialData.organizationName || '');
      setDepartmentWard(initialData.departmentWard || '');
      setAddress(initialData.address || '');
      setContactPerson(initialData.contactPerson || '');
      setContactNo(initialData.contactNo || '');

      setMachineName(initialData.machineName || initialData.items?.[0]?.description || '');
      setQuantity(initialData.quantity || 1);
      setBrandManufacturer(initialData.brandManufacturer || '');
      setModelNo(initialData.modelNo || '');
      setSerialNo(initialData.serialNo || initialData.items?.[0]?.serialNo || '');
      setAssetIdNo(initialData.assetIdNo || '');
      setAccessoriesReceived(initialData.accessoriesReceived || '');
      setMachineCondition(initialData.machineCondition || 'অচল');
      setReportedProblem(initialData.reportedProblem || initialData.purpose || '');
      setPhysicalDamageCondition(initialData.physicalDamageCondition || '');

      setDestination(initialData.destination || '');
      setVehicleNo(initialData.vehicleNo || '');
      setCarrierName(initialData.carrierName || '');
      setDeliveredBy(initialData.deliveredBy || '');
      setDesignationStaffId(initialData.designationStaffId || '');
      setTransportPurpose(initialData.transportPurpose || 'সার্ভিসিং');
      setExpectedReturnDate(initialData.expectedReturnDate ? initialData.expectedReturnDate.split('T')[0] : '');

      setReturnDate(initialData.returnDate ? initialData.returnDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setServiceReportNo(initialData.serviceReportNo || '');
      setReturnCondition(initialData.returnCondition || 'মেরামত ও পরীক্ষা সম্পন্ন');
      setWorkDoneComments(initialData.workDoneComments || '');
      setReturnedAccessories(initialData.returnedAccessories || '');
      setPendingIssuesAdvice(initialData.pendingIssuesAdvice || '');

      setStatus(initialData.status || 'PENDING');
      setPreparedBy(initialData.preparedBy || '1 Service & Repair Technology.');
      setAuthorizedBy(initialData.authorizedBy || 'Engr. Sagor Badsha (Chief Engineer)');
      setReceivedBy(initialData.receivedBy || '');
    } else {
      // Create fresh
      setChallanKind(defaultChallanKind);
      setCustomerType(defaultCustomerType);
      setPassType('RETURNABLE');
      setDate(new Date().toISOString().split('T')[0]);
      setReferenceWorkOrderNo('');
      setGatePassCategory('মেরামতের জন্য মেশিন গ্রহণ');

      setOrganizationName('');
      setDepartmentWard('');
      setAddress('');
      setContactPerson('');
      setContactNo('');

      setMachineName('');
      setQuantity(1);
      setBrandManufacturer('');
      setModelNo('');
      setSerialNo('');
      setAssetIdNo('');
      setAccessoriesReceived('');
      setMachineCondition('অচল');
      setReportedProblem('');
      setPhysicalDamageCondition('');

      setDestination('');
      setVehicleNo('');
      setCarrierName('');
      setDeliveredBy('');
      setDesignationStaffId('');
      setTransportPurpose('সার্ভিসিং');
      setExpectedReturnDate('');

      setReturnDate(new Date().toISOString().split('T')[0]);
      setServiceReportNo('');
      setReturnCondition('মেরামত ও পরীক্ষা সম্পন্ন');
      setWorkDoneComments('');
      setReturnedAccessories('');
      setPendingIssuesAdvice('');

      setStatus('PENDING');
      setPreparedBy('1 Service & Repair Technology.');
      setAuthorizedBy('Engr. Sagor Badsha (Chief Engineer)');
      setReceivedBy('');

      fetchNextGatePassNo()
        .then((no) => setPassNo(no))
        .catch(() => {
          const year = new Date().getFullYear();
          setPassNo(`OSRT/GP/${year}-0001`);
        });
    }
    setErrors({});
  }, [initialData, defaultCustomerType, defaultChallanKind, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!organizationName.trim()) {
      newErrors.organizationName = 'প্রতিষ্ঠান / সংস্থার নাম আবশ্যক';
    }

    if (!passNo.trim()) {
      newErrors.passNo = 'গেটপাস নম্বর আবশ্যক';
    }

    if (challanKind === 'RECEIVING' && !machineName.trim()) {
      newErrors.machineName = 'মেশিনের নাম আবশ্যক';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: CreateGatePassInput = {
      passNo,
      date,
      customerType,
      passType,
      challanKind,

      referenceWorkOrderNo: referenceWorkOrderNo.trim() || undefined,
      gatePassCategory: gatePassCategory.trim() || undefined,

      organizationName: organizationName.trim(),
      departmentWard: departmentWard.trim() || undefined,
      address: address.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      contactNo: contactNo.trim() || undefined,

      machineName: machineName.trim() || undefined,
      quantity: Number(quantity) || 1,
      brandManufacturer: brandManufacturer.trim() || undefined,
      modelNo: modelNo.trim() || undefined,
      serialNo: serialNo.trim() || undefined,
      assetIdNo: assetIdNo.trim() || undefined,
      accessoriesReceived: accessoriesReceived.trim() || undefined,
      machineCondition: machineCondition.trim() || undefined,
      reportedProblem: reportedProblem.trim() || undefined,
      physicalDamageCondition: physicalDamageCondition.trim() || undefined,

      destination: destination.trim() || address.trim() || undefined,
      vehicleNo: vehicleNo.trim() || undefined,
      carrierName: carrierName.trim() || deliveredBy.trim() || undefined,
      deliveredBy: deliveredBy.trim() || undefined,
      designationStaffId: designationStaffId.trim() || undefined,
      transportPurpose: transportPurpose.trim() || undefined,
      purpose: reportedProblem.trim() || undefined,
      expectedReturnDate: expectedReturnDate ? expectedReturnDate : null,

      returnDate: challanKind === 'RETURN' && returnDate ? returnDate : null,
      serviceReportNo: serviceReportNo.trim() || undefined,
      returnCondition: returnCondition.trim() || undefined,
      workDoneComments: workDoneComments.trim() || undefined,
      returnedAccessories: returnedAccessories.trim() || undefined,
      pendingIssuesAdvice: pendingIssuesAdvice.trim() || undefined,

      status,
      preparedBy: preparedBy.trim() || undefined,
      authorizedBy: authorizedBy.trim() || undefined,
      receivedBy: receivedBy.trim() || undefined,
      items: [
        {
          sl: 1,
          description: machineName.trim() || 'Medical Equipment',
          qty: Number(quantity) || 1,
          serialNo: serialNo.trim() || null,
          remarks: accessoriesReceived.trim() || null,
        },
      ],
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData 
          ? `Edit Gate Pass: ${initialData.passNo}` 
          : challanKind === 'RECEIVING' 
            ? 'নতুন গেটপাস তৈরি: মেশিন গ্রহণ চালান' 
            : 'নতুন গেটপাস তৈরি: মেশিন ফেরত চালান'
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Challan Type Selection */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              চালানের ধরন নির্বাচন করুন:
            </span>
            <span className="text-[11px] text-slate-500">মেশিন গ্রহণ অথবা ফেরত চালানের জন্য আলাদা ফরম্যাট</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChallanKind('RECEIVING')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                challanKind === 'RECEIVING'
                  ? 'bg-[#002060] text-white shadow-sm ring-2 ring-[#002060]/30'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              মেশিন গ্রহণ চালান
            </button>

            <button
              type="button"
              onClick={() => setChallanKind('RETURN')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                challanKind === 'RETURN'
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              মেশিন ফেরত চালান
            </button>
          </div>
        </div>

        {/* Section: Header & Customer Context */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002060] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#002060]" />
              {challanKind === 'RECEIVING' ? 'মেশিন গ্রহণ চালান — বেসিক তথ্য' : 'মেশিন ফেরত চালান — বেসিক তথ্য'}
            </h4>

            {/* Locked Customer Account Domain */}
            <div className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className={`w-2 h-2 rounded-full ${customerType === 'CORPORATE' ? 'bg-blue-600' : 'bg-emerald-600'}`}></span>
              <span>{customerType === 'CORPORATE' ? 'Corporate Customer' : 'Non-Corporate Customer'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="গেটপাস নম্বর"
              value={passNo}
              onChange={(e) => setPassNo(e.target.value)}
              placeholder="e.g. OSRT/GP/2026-0001"
              required
              error={errors.passNo}
            />

            <DatePicker
              label={challanKind === 'RECEIVING' ? 'তারিখ' : 'ফেরত দেওয়ার তারিখ'}
              value={challanKind === 'RECEIVING' ? date : returnDate}
              onChange={(e) => {
                if (challanKind === 'RECEIVING') setDate(e.target.value);
                else setReturnDate(e.target.value);
              }}
              required
            />

            <Input
              label={challanKind === 'RECEIVING' ? 'রেফারেন্স / কাজের অর্ডার নম্বর' : 'সার্ভিস রিপোর্ট / চালান নম্বর'}
              value={challanKind === 'RECEIVING' ? referenceWorkOrderNo : serviceReportNo}
              onChange={(e) => {
                if (challanKind === 'RECEIVING') setReferenceWorkOrderNo(e.target.value);
                else setServiceReportNo(e.target.value);
              }}
              placeholder="e.g. REF-2026-9901"
            />
          </div>

          {challanKind === 'RECEIVING' && (
            <div className="mt-3">
              <Select
                label="গেটপাসের ধরন"
                value={gatePassCategory}
                onChange={(e) => setGatePassCategory(e.target.value)}
                options={[
                  { value: 'মেরামতের জন্য মেশিন গ্রহণ', label: 'মেরামতের জন্য মেশিন গ্রহণ' },
                  { value: 'মেরামত শেষে মেশিন ফেরত', label: 'মেরামত শেষে মেশিন ফেরত' },
                  { value: 'পরীক্ষা-নিরীক্ষার জন্য', label: 'পরীক্ষা-নিরীক্ষার জন্য' },
                  { value: 'অন্যান্য', label: 'অন্যান্য' },
                ]}
              />
            </div>
          )}
        </div>

        {/* Section 1: প্রতিষ্ঠান / সংস্থার তথ্য */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            ১. প্রতিষ্ঠান / সংস্থার তথ্য
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="প্রতিষ্ঠান / সংস্থার নাম"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="e.g. Popular Diagnostic Center Ltd."
              required
              error={errors.organizationName}
            />
            <Input
              label="বিভাগ / ইউনিট"
              value={departmentWard}
              onChange={(e) => setDepartmentWard(e.target.value)}
              placeholder="e.g. Biochemistry Lab / ICU"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="sm:col-span-2">
              <Input
                label="প্রতিষ্ঠানের ঠিকানা"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setDestination(e.target.value);
                }}
                placeholder="e.g. Plot 12, Road 5, Shantinagar, Dhaka"
              />
            </div>
            <Input
              label="যোগাযোগকারী ব্যক্তি ও মোবাইল"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Dr. Anwarul Haque (01715-998811)"
            />
          </div>
        </div>

        {/* IF RECEIVING CHALLAN: Section 2 & 3 */}
        {challanKind === 'RECEIVING' && (
          <>
            {/* ২. মেশিনের বিবরণ */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                ২. মেশিনের বিবরণ
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="মেশিনের নাম"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    placeholder="e.g. Fully Automated Chemistry Analyzer"
                    required
                    error={errors.machineName}
                  />
                </div>
                <Input
                  type="number"
                  min="1"
                  label="পরিমাণ"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                <Input
                  label="ব্র্যান্ড / প্রস্তুতকারক"
                  value={brandManufacturer}
                  onChange={(e) => setBrandManufacturer(e.target.value)}
                  placeholder="e.g. Mindray / Philips"
                />
                <Input
                  label="মডেল নম্বর"
                  value={modelNo}
                  onChange={(e) => setModelNo(e.target.value)}
                  placeholder="e.g. BS-240"
                />
                <Input
                  label="সিরিয়াল নম্বর"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                  placeholder="e.g. BS-88390-D"
                />
                <Input
                  label="অ্যাসেট / আইডি নম্বর"
                  value={assetIdNo}
                  onChange={(e) => setAssetIdNo(e.target.value)}
                  placeholder="e.g. AST-091"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="sm:col-span-2">
                  <Input
                    label="সঙ্গে প্রাপ্ত অ্যাক্সেসরিজ"
                    value={accessoriesReceived}
                    onChange={(e) => setAccessoriesReceived(e.target.value)}
                    placeholder="e.g. Power Cable, Sample Probe, Data Cable"
                  />
                </div>
                <Select
                  label="মেশিনের অবস্থা"
                  value={machineCondition}
                  onChange={(e) => setMachineCondition(e.target.value)}
                  options={[
                    { value: 'অচল', label: 'অচল (Non-functional)' },
                    { value: 'সচল', label: 'সচল (Functional)' },
                    { value: 'ক্ষতিগ্রস্ত', label: 'ক্ষতিগ্রস্ত (Damaged)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Textarea
                  label="জানানো সমস্যা"
                  value={reportedProblem}
                  onChange={(e) => setReportedProblem(e.target.value)}
                  placeholder="e.g. Photometer optical sensor error, peristaltic pump pressure failure"
                  rows={2}
                />
                <Textarea
                  label="মেশিনের অবস্থা / দৃশ্যমান ক্ষতির বিবরণ"
                  value={physicalDamageCondition}
                  onChange={(e) => setPhysicalDamageCondition(e.target.value)}
                  placeholder="e.g. External body intact, no visible physical breakage"
                  rows={2}
                />
              </div>
            </div>

            {/* ৩. পরিবহন / হস্তান্তরের তথ্য */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-700" />
                ৩. পরিবহন / হস্তান্তরের তথ্য
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="মেশিন সংগ্রহ / পৌঁছে দিয়েছেন"
                  value={deliveredBy}
                  onChange={(e) => setDeliveredBy(e.target.value)}
                  placeholder="e.g. Md. Rafiqul Islam"
                />
                <Input
                  label="পদবি / কর্মী আইডি"
                  value={designationStaffId}
                  onChange={(e) => setDesignationStaffId(e.target.value)}
                  placeholder="e.g. Senior Dispatcher (EMP-104)"
                />
                <Input
                  label="গাড়ির নম্বর"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. Dhaka Metro-GA 11-4022"
                />
              </div>

              <div className="mt-3">
                <Select
                  label="উদ্দেশ্য"
                  value={transportPurpose}
                  onChange={(e) => setTransportPurpose(e.target.value)}
                  options={[
                    { value: 'সার্ভিসিং', label: 'সার্ভিসিং' },
                    { value: 'মেরামত', label: 'মেরামত' },
                    { value: 'পরীক্ষা', label: 'পরীক্ষা' },
                    { value: 'ফেরত', label: 'ফেরত' },
                    { value: 'অন্যান্য', label: 'অন্যান্য' },
                  ]}
                />
              </div>
            </div>
          </>
        )}

        {/* IF RETURN CHALLAN: Machine Return Details */}
        {challanKind === 'RETURN' && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-700" />
              মেশিন ফেরতের তথ্য ও সার্ভিস রেকর্ড
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="মেশিনের নাম ও মডেল"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="e.g. Mindray BS-240 Analyzer"
              />
              <Select
                label="মেশিন ফেরতের অবস্থা"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                options={[
                  { value: 'মেরামত ও পরীক্ষা সম্পন্ন', label: 'মেরামত ও পরীক্ষা সম্পন্ন' },
                  { value: 'আংশিক মেরামত', label: 'আংশিক মেরামত' },
                  { value: 'মেরামত ছাড়াই ফেরত', label: 'মেরামত ছাড়াই ফেরত' },
                  { value: 'আরও মেরামত প্রয়োজন', label: 'আরও মেরামত প্রয়োজন' },
                ]}
              />
            </div>

            <Textarea
              label="সম্পন্ন কাজ / মন্তব্য"
              value={workDoneComments}
              onChange={(e) => setWorkDoneComments(e.target.value)}
              placeholder="e.g. Optical sensor replacement and flow calibration completed successfully."
              rows={2}
            />

            <Textarea
              label="ফেরত দেওয়া অ্যাক্সেসরিজ"
              value={returnedAccessories}
              onChange={(e) => setReturnedAccessories(e.target.value)}
              placeholder="e.g. Original power cord, sensor unit, user manual."
              rows={2}
            />

            <Textarea
              label="বাকি সমস্যা / পরামর্শ"
              value={pendingIssuesAdvice}
              onChange={(e) => setPendingIssuesAdvice(e.target.value)}
              placeholder="e.g. Operate with clean voltage regulator."
              rows={2}
            />
          </div>
        )}

        {/* Section: Status & Signatures */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            অনুমোদন ও স্বাক্ষর
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Select
              label="স্ট্যাটাস"
              value={status}
              onChange={(e) => setStatus(e.target.value as GatePassStatus)}
              options={[
                { value: 'PENDING', label: 'PENDING' },
                { value: 'APPROVED', label: 'APPROVED' },
                { value: 'DISPATCHED', label: 'DISPATCHED' },
                { value: 'COMPLETED', label: 'COMPLETED' },
              ]}
            />
            <Input
              label="হস্তান্তরকারী / প্রস্তুতকারক"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="1 Service & Repair Technology."
            />
            <Input
              label="অনুমোদনকারী"
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              placeholder="Engr. Sagor Badsha"
            />
            <Input
              label="গ্রহণকারী (সংশ্লিষ্ট প্রতিষ্ঠান)"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="Store / Lab In-Charge"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            বাতিল
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'আপডেট গেটপাস' : 'গেটপাস সংরক্ষণ করুন'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
