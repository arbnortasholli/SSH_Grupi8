import type { Car, CarFilters, PaginatedResponse } from '../lib/types';
import { mockCars } from './mockData';

// Mock implementation of car service
export const mockCarService = {
    getCars: async (
        filters?: CarFilters,
        page = 1,
        pageSize = 12
    ): Promise<PaginatedResponse<Car>> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...mockCars];

        // Apply filters
        if (filters?.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(
                car =>
                    car.brand.toLowerCase().includes(search) ||
                    car.model.toLowerCase().includes(search)
            );
        }

        if (filters?.brand) {
            filtered = filtered.filter(car => car.brand === filters.brand);
        }

        if (filters?.type) {
            filtered = filtered.filter(car => car.type === filters.type);
        }

        if (filters?.minPrice !== undefined) {
            filtered = filtered.filter(car => car.price >= filters.minPrice!);
        }

        if (filters?.maxPrice !== undefined) {
            filtered = filtered.filter(car => car.price <= filters.maxPrice!);
        }

        if (filters?.fuelType) {
            filtered = filtered.filter(car => car.fuelType === filters.fuelType);
        }

        if (filters?.transmission) {
            filtered = filtered.filter(car => car.transmission === filters.transmission);
        }

        if (filters?.availability) {
            filtered = filtered.filter(car => car.isAvailable === true);
        }

        // Pagination
        const total = filtered.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

        return {
            data: paginatedData,
            total,
            page,
            pageSize,
        };
    },

    getCarById: async (id: string): Promise<Car> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const car = mockCars.find(c => c.id === id);
        if (!car) {
            throw new Error('Car not found');
        }
        return car;
    },

    createCar: async (carData: Partial<Car>): Promise<Car> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newCar: Car = {
            id: String(Date.now()),
            brand: carData.brand || 'Unknown',
            model: carData.model || 'Unknown',
            year: carData.year || new Date().getFullYear(),
            type: carData.type || 'Sedan',
            price: carData.price || 0,
            priceType: carData.priceType || 'daily',
            mileage: carData.mileage || 0,
            fuelType: carData.fuelType || 'Petrol',
            transmission: carData.transmission || 'Manual',
            seats: carData.seats || 5,
            description: carData.description || '',
            images: carData.images || [],
            isFavorite: false,
            isAvailable: carData.isAvailable ?? true,
            sellerId: carData.sellerId || 'seller-1',
            sellerName: carData.sellerName || 'Seller',
            createdAt: new Date().toISOString(),
        };

        mockCars.push(newCar);
        return newCar;
    },

    updateCar: async (id: string, carData: Partial<Car>): Promise<Car> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const car = mockCars.find(c => c.id === id);
        if (!car) {
            throw new Error('Car not found');
        }

        Object.assign(car, carData);
        return car;
    },

    deleteCar: async (id: string): Promise<void> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const index = mockCars.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Car not found');
        }

        mockCars.splice(index, 1);
    },

    getSellerCars: async (): Promise<Car[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Return all cars for demo (in real app, would filter by seller)
        return mockCars;
    },

    addToFavorites: async (carId: string): Promise<void> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const car = mockCars.find(c => c.id === carId);
        if (car) {
            car.isFavorite = true;
        }
    },

    removeFromFavorites: async (carId: string): Promise<void> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const car = mockCars.find(c => c.id === carId);
        if (car) {
            car.isFavorite = false;
        }
    },

    getFavorites: async (): Promise<Car[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return mockCars.filter(car => car.isFavorite);
    },
};
