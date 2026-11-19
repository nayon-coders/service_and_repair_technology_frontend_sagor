import { apiClient } from './api';
import { 
  ApiResponse, 
  BillVoucherFilterParams, 
  BillVoucherListResponse, 
  BillVoucherRecord, 
  CreateBillVoucherInput, 
  UpdateBillVoucherInput 
} from '../types';

export const fetchVouchers = async (params: BillVoucherFilterParams = {}): Promise<BillVoucherListResponse> => {
  const response = await apiClient.get<ApiResponse<BillVoucherListResponse>>('/billing/vouchers', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve bill vouchers');
  }

  return response.data.data;
};

export const fetchNextVoucherNo = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<{ voucherNo: string }>>('/billing/vouchers/next-number');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to generate next voucher number');
  }
  return response.data.data.voucherNo;
};

export const fetchVoucherById = async (id: string): Promise<BillVoucherRecord> => {
  const response = await apiClient.get<ApiResponse<BillVoucherRecord>>(`/billing/vouchers/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve voucher details');
  }
  return response.data.data;
};

export const createVoucher = async (data: CreateBillVoucherInput): Promise<BillVoucherRecord> => {
  const response = await apiClient.post<ApiResponse<BillVoucherRecord>>('/billing/vouchers', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create bill voucher');
  }
  return response.data.data;
};

export const updateVoucher = async (id: string, data: UpdateBillVoucherInput): Promise<BillVoucherRecord> => {
  const response = await apiClient.put<ApiResponse<BillVoucherRecord>>(`/billing/vouchers/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update bill voucher');
  }
  return response.data.data;
};

export const deleteVoucher = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/billing/vouchers/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete bill voucher');
  }
};

export const bulkDeleteVouchers = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/billing/vouchers/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete vouchers');
  }
  return response.data.data.count;
};

export const downloadVoucherCsv = async (params: BillVoucherFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/billing/vouchers/export/csv', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `bill-vouchers-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

