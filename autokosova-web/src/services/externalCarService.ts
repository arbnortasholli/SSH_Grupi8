import apiClient from './apiClient';
import type {
    ExternalCarListResponse,
    ExternalCarRequest,
    ExternalCarRequestPayload,
    ExternalCarSearchParams,
} from '../lib/types';

export const externalCarService = {
    getExternalCars: async (params: ExternalCarSearchParams = {}): Promise<ExternalCarListResponse> => {
        const response = await apiClient.get<ExternalCarListResponse>('/external-cars', {
            params: {
                page: params.page ?? 1,
                pageSize: params.pageSize ?? 20,
                availableOnly: params.availableOnly ?? false,
                brand: params.brand || undefined,
                model: params.model || undefined,
                yearFrom: params.yearFrom,
                yearTo: params.yearTo,
                priceFrom: params.priceFrom,
                priceTo: params.priceTo,
                mileageFrom: params.mileageFrom,
                mileageTo: params.mileageTo,
                orderBy: params.orderBy || undefined,
            },
        });

        return response.data;
    },

    createRequest: async (payload: ExternalCarRequestPayload): Promise<ExternalCarRequest> => {
        const response = await apiClient.post<ExternalCarRequest>('/external-car-requests', payload);
        return response.data;
    },

    getMyRequests: async (): Promise<ExternalCarRequest[]> => {
        const response = await apiClient.get<ExternalCarRequest[]>('/external-car-requests/my');
        return response.data;
    },

    updateMyDecision: async (id: number, decision: 'Interested' | 'Declined'): Promise<ExternalCarRequest> => {
        const response = await apiClient.put<ExternalCarRequest>(`/external-car-requests/my/${id}/decision`, {
            decision,
        });

        return response.data;
    },
};
