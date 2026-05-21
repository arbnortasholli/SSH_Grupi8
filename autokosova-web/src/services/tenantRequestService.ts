import apiClient from './apiClient';

export interface TenantRequestCreate {
  businessName: string;
  businessNumber?: string;
  businessEmail?: string;
  businessPhoneNumber?: string;
  businessCity?: string;
  businessAddress?: string;
  message?: string;
}

export interface TenantRequestResponse extends TenantRequestCreate {
  tenantRequestID: number;
  accountID: number;
  accountUsername: string;
  accountEmail: string;
  reviewedByAccountID?: number | null;
  reviewedByUsername?: string | null;
  createdTenantID?: number | null;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  adminComment?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export const tenantRequestService = {
  async create(data: TenantRequestCreate): Promise<TenantRequestResponse> {
    const response = await apiClient.post<TenantRequestResponse>('/tenant-requests', data);
    return response.data;
  },

  async getMine(): Promise<TenantRequestResponse[]> {
    const response = await apiClient.get<TenantRequestResponse[] | { data?: TenantRequestResponse[] }>('/tenant-requests/my');

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.data || [];
  },
};
