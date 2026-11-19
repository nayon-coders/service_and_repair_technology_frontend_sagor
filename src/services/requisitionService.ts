import { apiClient } from './api';
import { 
  ApiResponse, 
  RequisitionFilterParams, 
  RequisitionListResponse, 
  RequisitionRecord, 
  CreateRequisitionInput, 
  UpdateRequisitionInput 
} from '../types';

export const fetchRequisitions = async (params: RequisitionFilterParams = {}): Promise<RequisitionListResponse> => {
  const response = await apiClient.get<ApiResponse<RequisitionListResponse>>('/billing/requisitions', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve requisitions');
  }

  return response.data.data;
};

export const fetchNextEstimateNo = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<{ estimateNo: string }>>('/billing/requisitions/next-number');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to generate next estimate number');
  }
  return response.data.data.estimateNo;
};

export const fetchRequisitionById = async (id: string): Promise<RequisitionRecord> => {
  const response = await apiClient.get<ApiResponse<RequisitionRecord>>(`/billing/requisitions/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve requisition details');
  }
  return response.data.data;
};

export const createRequisition = async (data: CreateRequisitionInput): Promise<RequisitionRecord> => {
  const response = await apiClient.post<ApiResponse<RequisitionRecord>>('/billing/requisitions', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create requisition');
  }
  return response.data.data;
};

export const updateRequisition = async (id: string, data: UpdateRequisitionInput): Promise<RequisitionRecord> => {
  const response = await apiClient.put<ApiResponse<RequisitionRecord>>(`/billing/requisitions/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update requisition');
  }
  return response.data.data;
};

export const deleteRequisition = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/billing/requisitions/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete requisition');
  }
};

export const bulkDeleteRequisitions = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/billing/requisitions/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete requisitions');
  }
  return response.data.data.count;
};

export const downloadRequisitionCsv = async (params: RequisitionFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/billing/requisitions/export/csv', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `requisitions-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

