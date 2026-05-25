import apiClient from './apiClient';
import type {
    Car,
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

    createAutoKosovaBuyRequest: async (car: Car, customer: {
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        message?: string;
    }): Promise<ExternalCarRequest> => {
        return externalCarService.createRequest({
            externalCarID: car.id,
            source: 'AutoKosova',
            carName: `${car.year} ${car.brand} ${car.model}`,
            brand: car.brand,
            model: car.model,
            year: car.year,
            price: car.price,
            currency: 'EUR',
            mileage: car.mileage,
            imageUrl: car.images[0] ?? null,
            detailUrl: `${window.location.origin}/cars/${car.id}`,
            customerName: customer.customerName,
            customerEmail: customer.customerEmail,
            customerPhone: customer.customerPhone,
            message: customer.message,
        });
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
