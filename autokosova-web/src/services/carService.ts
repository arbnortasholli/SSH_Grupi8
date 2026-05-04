import apiClient from './apiClient';
import type { Car, CarFilters, PaginatedResponse } from '../lib/types';
import { API_CONFIG } from '../config/api';
import { mockCarService } from './mockCarService';

export const carService = {
    // Get all cars with filters and pagination
    getCars: async (
        filters?: CarFilters,
        page = 1,
        pageSize = 12
    ): Promise<PaginatedResponse<Car>> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.getCars(filters, page, pageSize);
        }
        const params = {
            ...filters,
            page,
            pageSize,
        };
        const response = await apiClient.get('/cars', { params });
        return response.data;
    },

    // Get single car details
    getCarById: async (id: string): Promise<Car> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.getCarById(id);
        }
        const response = await apiClient.get(`/cars/${id}`);
        return response.data;
    },

    // Create new car (Seller)
    createCar: async (carData: Partial<Car>): Promise<Car> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.createCar(carData);
        }
        const response = await apiClient.post('/cars', carData);
        return response.data;
    },

    // Update car (Seller)
    updateCar: async (id: string, carData: Partial<Car>): Promise<Car> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.updateCar(id, carData);
        }
        const response = await apiClient.put(`/cars/${id}`, carData);
        return response.data;
    },

    // Delete car (Seller)
    deleteCar: async (id: string): Promise<void> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.deleteCar(id);
        }
        await apiClient.delete(`/cars/${id}`);
    },

    // Get seller's cars
    getSellerCars: async (): Promise<Car[]> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.getSellerCars();
        }
        const response = await apiClient.get('/cars/seller/my-cars');
        return response.data;
    },

    // Add to favorites
    addToFavorites: async (carId: string): Promise<void> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.addToFavorites(carId);
        }
        await apiClient.post(`/cars/${carId}/favorite`);
    },

    // Remove from favorites
    removeFromFavorites: async (carId: string): Promise<void> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.removeFromFavorites(carId);
        }
        await apiClient.delete(`/cars/${carId}/favorite`);
    },

    // Get user favorites
    getFavorites: async (): Promise<Car[]> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.getFavorites();
        }
        const response = await apiClient.get('/cars/favorites');
        return response.data;
    },
};
