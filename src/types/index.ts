export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

export interface HealthData {
  status: 'healthy' | 'unhealthy' | 'degraded';
}

export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType | string;
  isActive: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiNavigationMenuItem {
  id: string;
  title: string;
  key: string;
  path: string | null;
  icon: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  requiredPermission: string | null;
  children?: ApiNavigationMenuItem[];
}

export type PaymentStatus = 'PAID' | 'UNPAID';

export interface IncomeRecord {
  id: string;
  date: string;
  companyOrStoreName: string;
  amount: number;
  status: PaymentStatus;
  remarks?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  date: string;
  companyOrStoreName: string;
  amount: number;
  status?: PaymentStatus;
  remarks?: string;
}

export interface UpdateIncomeInput {
  date?: string;
  companyOrStoreName?: string;
  amount?: number;
  status?: PaymentStatus;
  remarks?: string;
}

export interface IncomeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IncomeListResponse {
  items: IncomeRecord[];
  total: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  companyOrStoreName: string;
  amount: number;
  status: PaymentStatus;
  category?: string | null;
  remarks?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  date: string;
  companyOrStoreName: string;
  amount: number;
  status?: PaymentStatus;
  category?: string;
  remarks?: string;
}

export interface UpdateExpenseInput {
  date?: string;
  companyOrStoreName?: string;
  amount?: number;
  status?: PaymentStatus;
  category?: string;
  remarks?: string;
}

export interface ExpenseFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus | 'ALL';
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseListResponse {
  items: ExpenseRecord[];
  total: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Bill Voucher Types
export type BillType = 'REPAIR' | 'SERVICE' | 'BOTH';
export type CustomerType = 'CORPORATE' | 'NON_CORPORATE';
export type VoucherPaymentStatus = 'PAID' | 'DUE' | 'PARTIAL';
export type VoucherPaymentMethod = 'CASH' | 'BANK' | 'BKASH' | 'OTHER';

export interface BillVoucherItemRecord {
  id?: string;
  voucherId?: string;
  sl: number;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  remarks?: string | null;
}

export interface BillVoucherRecord {
  id: string;
  voucherNo: string;
  date: string;
  customerType: CustomerType;
  billType: BillType;
  customerName: string;
  mobile?: string | null;
  address?: string | null;
  machineName?: string | null;
  brandModel?: string | null;
  serialNo?: string | null;
  department?: string | null;
  problemComplaint?: string | null;
  receivedDate?: string | null;
  partsTotal: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  amountInWords?: string | null;
  warrantyTerms?: string | null;
  paymentStatus: VoucherPaymentStatus;
  paymentMethod: VoucherPaymentMethod;
  paymentMethodOther?: string | null;
  preparedBy?: string | null;
  createdById?: string | null;
  items: BillVoucherItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillVoucherInput {
  voucherNo?: string;
  date: string;
  customerType: CustomerType;
  billType: BillType;
  customerName: string;
  mobile?: string;
  address?: string;
  machineName?: string;
  brandModel?: string;
  serialNo?: string;
  department?: string;
  problemComplaint?: string;
  receivedDate?: string;
  partsTotal?: number;
  serviceCharge?: number;
  discount?: number;
  paidAmount?: number;
  amountInWords?: string;
  warrantyTerms?: string;
  paymentStatus?: VoucherPaymentStatus;
  paymentMethod?: VoucherPaymentMethod;
  paymentMethodOther?: string;
  preparedBy?: string;
  items: BillVoucherItemRecord[];
}

export type UpdateBillVoucherInput = Partial<CreateBillVoucherInput>;

export interface BillVoucherFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: CustomerType;
  billType?: BillType;
  paymentStatus?: VoucherPaymentStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BillVoucherListResponse {
  items: BillVoucherRecord[];
  total: number;
  totalGrandAmount: number;
  totalPaidAmount: number;
  totalDueAmount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Requisition / Repair Cost Estimate Types
export type RequisitionItemCategory = 'SPARE_PARTS' | 'SERVICE_LABOUR';
export type RequisitionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface RequisitionItemRecord {
  id?: string;
  requisitionId?: string;
  category: RequisitionItemCategory;
  sl: number;
  description: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  remarks?: string | null;
}

export interface RequisitionRecord {
  id: string;
  estimateNo: string;
  date: string;
  validUpTo?: string | null;
  customerType: CustomerType;
  organizationName: string;
  departmentWard?: string | null;
  contactPerson?: string | null;
  contactNo?: string | null;
  equipmentName?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNo?: string | null;
  faultDescription?: string | null;
  sparePartsTotal: number;
  serviceLabourTotal: number;
  subTotal: number;
  discount: number;
  grandTotal: number;
  status: RequisitionStatus;
  preparedBy?: string | null;
  clientApprovalNote?: string | null;
  createdById?: string | null;
  items: RequisitionItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequisitionInput {
  estimateNo?: string;
  date: string;
  validUpTo?: string;
  customerType: CustomerType;
  organizationName: string;
  departmentWard?: string;
  contactPerson?: string;
  contactNo?: string;
  equipmentName?: string;
  brand?: string;
  model?: string;
  serialNo?: string;
  faultDescription?: string;
  discount?: number;
  status?: RequisitionStatus;
  preparedBy?: string;
  clientApprovalNote?: string;
  items: RequisitionItemRecord[];
}

export type UpdateRequisitionInput = Partial<CreateRequisitionInput>;

export interface RequisitionFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: CustomerType;
  status?: RequisitionStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RequisitionListResponse {
  items: RequisitionRecord[];
  total: number;
  totalGrandAmount: number;
  totalPendingCount: number;
  totalApprovedCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// GATE PASS (CHALLAN / DISPATCH)
// ==========================================
export type GatePassType = 'RETURNABLE' | 'NON_RETURNABLE';
export type ChallanKind = 'RECEIVING' | 'RETURN';
export type GatePassStatus = 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'COMPLETED';

export interface GatePassItemRecord {
  id?: string;
  gatePassId?: string;
  sl: number;
  description: string;
  qty: number;
  serialNo?: string | null;
  remarks?: string | null;
}

export interface GatePassRecord {
  id: string;
  passNo: string;
  date: string;
  customerType: CustomerType;
  passType: GatePassType;
  challanKind: ChallanKind;

  // Header & Common info
  referenceWorkOrderNo?: string | null;
  gatePassCategory?: string | null;

  // Organization / Client info
  organizationName: string;
  departmentWard?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  contactNo?: string | null;

  // Machine Details (for Receiving Challan)
  machineName?: string | null;
  quantity?: number;
  brandManufacturer?: string | null;
  modelNo?: string | null;
  serialNo?: string | null;
  assetIdNo?: string | null;
  accessoriesReceived?: string | null;
  machineCondition?: string | null;
  reportedProblem?: string | null;
  physicalDamageCondition?: string | null;

  // Logistics & Movement
  destination?: string | null;
  vehicleNo?: string | null;
  carrierName?: string | null;
  deliveredBy?: string | null;
  designationStaffId?: string | null;
  transportPurpose?: string | null;
  purpose?: string | null;
  expectedReturnDate?: string | null;

  // Return Specific Fields (for Return Challan)
  returnDate?: string | null;
  serviceReportNo?: string | null;
  returnCondition?: string | null;
  workDoneComments?: string | null;
  returnedAccessories?: string | null;
  pendingIssuesAdvice?: string | null;

  status: GatePassStatus;
  preparedBy?: string | null;
  authorizedBy?: string | null;
  receivedBy?: string | null;
  createdById?: string | null;
  items: GatePassItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGatePassInput {
  passNo?: string;
  date: string;
  customerType: CustomerType;
  passType?: GatePassType;
  challanKind: ChallanKind;

  referenceWorkOrderNo?: string;
  gatePassCategory?: string;

  organizationName: string;
  departmentWard?: string;
  address?: string;
  contactPerson?: string;
  contactNo?: string;

  machineName?: string;
  quantity?: number;
  brandManufacturer?: string;
  modelNo?: string;
  serialNo?: string;
  assetIdNo?: string;
  accessoriesReceived?: string;
  machineCondition?: string;
  reportedProblem?: string;
  physicalDamageCondition?: string;

  destination?: string;
  vehicleNo?: string;
  carrierName?: string;
  deliveredBy?: string;
  designationStaffId?: string;
  transportPurpose?: string;
  purpose?: string;
  expectedReturnDate?: string | null;

  returnDate?: string | null;
  serviceReportNo?: string;
  returnCondition?: string;
  workDoneComments?: string;
  returnedAccessories?: string;
  pendingIssuesAdvice?: string;

  status?: GatePassStatus;
  preparedBy?: string;
  authorizedBy?: string;
  receivedBy?: string;
  items?: GatePassItemRecord[];
}

export type UpdateGatePassInput = Partial<CreateGatePassInput>;

export interface GatePassFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: CustomerType;
  passType?: GatePassType | 'ALL';
  challanKind?: ChallanKind | 'ALL';
  status?: GatePassStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GatePassListResponse {
  items: GatePassRecord[];
  total: number;
  totalReceivingCount: number;
  totalReturnCount: number;
  totalPendingCount: number;
  totalDispatchedCount: number;
  totalCompletedCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// TA / DA MANAGEMENT (TRAVEL & DAILY ALLOWANCE)
// ==========================================
export type TaDaStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface TaDaItemRecord {
  id?: string;
  taDaBillId?: string;
  sl: number;
  date?: string | null;
  particular: string;
  vehicleName?: string | null;
  qty: number;
  unitTaka: number;
  totalTaka: number;
  checkedBy?: string | null;
}

export interface TaDaBillRecord {
  id: string;
  billNo: string;
  submissionDate: string;
  employeeName: string;
  designation?: string | null;
  employeeId?: string | null;
  department?: string | null;
  totalAmount: number;
  status: TaDaStatus;
  receivedBy?: string | null;
  checkedBy?: string | null;
  approvedBy?: string | null;
  remarks?: string | null;
  createdById?: string | null;
  items: TaDaItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaDaItemInput {
  sl?: number;
  date?: string;
  particular: string;
  vehicleName?: string;
  qty: number;
  unitTaka: number;
  totalTaka?: number;
  checkedBy?: string;
}

export interface CreateTaDaBillInput {
  billNo?: string;
  submissionDate: string;
  employeeName: string;
  designation?: string;
  employeeId?: string;
  department?: string;
  status?: TaDaStatus;
  receivedBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  remarks?: string;
  items: CreateTaDaItemInput[];
}

export type UpdateTaDaBillInput = Partial<CreateTaDaBillInput>;

export interface TaDaFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaDaStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaDaListResponse {
  items: TaDaBillRecord[];
  total: number;
  totalAmount: number;
  totalPendingCount: number;
  totalApprovedCount: number;
  totalPaidCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// OFFICE RENT TYPES
// ==========================================

export type RentPaymentStatus = 'PAID' | 'UNPAID';

export interface OfficeRentRecord {
  id: string;
  month: string;
  title: string;
  amount: number;
  status: RentPaymentStatus;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  landlordName?: string | null;
  receiptNo?: string | null;
  note?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfficeRentInput {
  month: string;
  title?: string;
  amount: number;
  status?: RentPaymentStatus;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  landlordName?: string | null;
  receiptNo?: string | null;
  note?: string | null;
}

export type UpdateOfficeRentInput = Partial<CreateOfficeRentInput>;

export interface OfficeRentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  month?: string;
  status?: RentPaymentStatus | 'ALL';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OfficeRentListResponse {
  items: OfficeRentRecord[];
  total: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  totalPaidCount: number;
  totalUnpaidCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// SERVICE MODULE: LAB IN & LAB OUT TYPES
// ==========================================

export interface LabPartRecord {
  id: string;
  name: string;
  partNumber?: string | null;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
  totalInQuantity: number;
  totalOutQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface LabInRecord {
  id: string;
  date: string;
  partId: string;
  partsName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier?: string | null;
  invoiceNo?: string | null;
  remarks?: string | null;
  createdById?: string | null;
  currentStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabInInput {
  date: string;
  partsName: string;
  quantity: number;
  unitPrice: number;
  supplier?: string | null;
  invoiceNo?: string | null;
  remarks?: string | null;
}

export type UpdateLabInInput = Partial<CreateLabInInput>;

export interface LabInFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LabInListResponse {
  items: LabInRecord[];
  total: number;
  totalQuantity: number;
  totalAmount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LabOutRecord {
  id: string;
  date: string;
  partId: string;
  partsName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dispatchedTo?: string | null;
  referenceNo?: string | null;
  remarks?: string | null;
  createdById?: string | null;
  currentStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabOutInput {
  date: string;
  partId: string;
  quantity: number;
  unitPrice?: number;
  dispatchedTo?: string | null;
  referenceNo?: string | null;
  remarks?: string | null;
}

export type UpdateLabOutInput = Partial<CreateLabOutInput>;

export interface LabOutFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LabOutListResponse {
  items: LabOutRecord[];
  total: number;
  totalQuantity: number;
  totalAmount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// EMPLOYEE MANAGEMENT TYPES
// ==========================================

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface EmployeeRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string | null;
  designation: string;
  department: string;
  basicSalary: number;
  allowance: number; // Mobile & other allowance
  grossSalary: number; // Basic + Allowance
  joinDate?: string | null;
  status: EmployeeStatus;
  address?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  employeeId?: string;
  name: string;
  email: string;
  phone?: string | null;
  designation: string;
  department: string;
  basicSalary: number;
  allowance?: number;
  joinDate?: string | null;
  status?: EmployeeStatus;
  address?: string | null;
  notes?: string | null;
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export interface EmployeeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: EmployeeStatus | 'ALL';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
  items: EmployeeRecord[];
  total: number;
  totalBasicSalary: number;
  totalAllowance: number;
  totalPayroll: number;
  totalActive: number;
  totalInactive: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// MANAGEMENT: SALARY & PAYROLL TYPES
// ==========================================

export type SalaryPaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export interface SalaryRecordData {
  id: string;
  month: string;
  employeeIdRef?: string | null;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  basicSalary: number;
  allowance: number; // Mobile & other allowance
  totalDays: number;
  presentDays: number;
  absentDays: number;
  totalEarnings: number;
  advanceLoan: number;
  previousDue: number;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: SalaryPaymentStatus;
  paymentMethod?: string | null;
  paymentDate?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalaryInput {
  month: string;
  employeeIdRef?: string | null;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  basicSalary: number;
  allowance?: number;
  totalDays?: number;
  presentDays?: number;
  advanceLoan?: number;
  previousDue?: number;
  paidAmount?: number;
  paymentMethod?: string | null;
  paymentDate?: string | null;
  notes?: string | null;
}

export type UpdateSalaryInput = Partial<CreateSalaryInput>;

export interface SalaryFilterParams {
  page?: number;
  limit?: number;
  month?: string;
  department?: string;
  status?: SalaryPaymentStatus | 'ALL';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SalaryListResponse {
  items: SalaryRecordData[];
  total: number;
  totalEarnings: number;
  totalNetPayable: number;
  totalPaid: number;
  totalDue: number;
  totalAdvanceLoan: number;
  totalEmployees: number;
  distinctMonths: string[];
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// SETTINGS & PROFILE TYPES
// ==========================================

export interface UpdateProfileInput {
  name: string;
  email: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==========================================
// DASHBOARD STATS TYPES
// ==========================================

export interface DashboardStats {
  financials: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    incomeCount: number;
    expenseCount: number;
  };
  salary: {
    totalPayroll: number;
    totalPaid: number;
    totalDue: number;
    recordsCount: number;
  };
  employees: {
    totalCount: number;
    activeCount: number;
    totalMonthlyPayroll: number;
  };
  officeRent: {
    totalBilled: number;
    totalPaid: number;
    totalUnpaid: number;
    recordsCount: number;
  };
  taDa: {
    totalBills: number;
    totalAmount: number;
    pendingCount: number;
    approvedCount: number;
  };
  labInventory: {
    totalParts: number;
    totalStockQuantity: number;
    lowStockCount: number;
    totalInCount: number;
    totalOutCount: number;
  };
  bills: {
    corporateCount: number;
    corporateAmount: number;
    nonCorporateCount: number;
    nonCorporateAmount: number;
    totalCount: number;
    totalAmount: number;
  };
  requisitions: {
    totalCount: number;
    totalEstimatedAmount: number;
  };
  gatePasses: {
    totalCount: number;
    receivingCount: number;
    returnCount: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'INCOME' | 'EXPENSE' | 'SALARY' | 'OFFICE_RENT' | 'BILL' | 'GATE_PASS';
    title: string;
    subtitle: string;
    amount?: number;
    status?: string;
    date: string;
  }>;
}





