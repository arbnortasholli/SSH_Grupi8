import apiClient from './apiClient';
import type { Car, CarFilters, CarImage, PaginatedResponse } from '../lib/types';
import { API_CONFIG } from '../config/api';
import { mockCarService } from './mockCarService';
import { saleCars, type SaleCar } from '../data/carsDummyData';

type ApiCar = {
    carsID?: number;
    CarsID?: number;
    tenantID?: number | null;
    TenantID?: number | null;
    carTitle?: string;
    CarTitle?: string;
    carBrand?: string;
    CarBrand?: string;
    carModel?: string;
    CarModel?: string;
    carYear?: number;
    CarYear?: number;
    carMileage?: number;
    CarMileage?: number;
    carFuelType?: string | null;
    CarFuelType?: string | null;
    carTransmission?: string | null;
    CarTransmission?: string | null;
    carBodyType?: string | null;
    CarBodyType?: string | null;
    carColor?: string | null;
    CarColor?: string | null;
    carDescription?: string | null;
    CarDescription?: string | null;
    isForSale?: boolean;
    IsForSale?: boolean;
    salePrice?: number | null;
    SalePrice?: number | null;
    rentalDailyPrice?: number | null;
    RentalDailyPrice?: number | null;
    carStatus?: string;
    CarStatus?: string;
    carCreationDate?: string;
    CarCreationDate?: string;
    createdByAccountID?: number;
    CreatedByAccountID?: number;
    images?: ApiCarImage[];
    Images?: ApiCarImage[];
};

type ApiCarImage = {
    carImageID?: number;
    CarImageID?: number;
    carID?: number;
    CarID?: number;
    carImageUrl?: string;
    CarImageUrl?: string;
    carImageOriginalFileName?: string | null;
    CarImageOriginalFileName?: string | null;
    carImageContentType?: string | null;
    CarImageContentType?: string | null;
    carImageSizeBytes?: number | null;
    CarImageSizeBytes?: number | null;
    carImageIsMain?: boolean;
    CarImageIsMain?: boolean;
    carImageOrderNumber?: number;
    CarImageOrderNumber?: number;
    carImageCreationDate?: string;
    CarImageCreationDate?: string;
};

type ApiCarFeature = {
    carFeatureID?: number;
    CarFeatureID?: number;
    carFeatureName?: string;
    CarFeatureName?: string;
    carFeatureDescription?: string | null;
    CarFeatureDescription?: string | null;
};

const saleCarFeatures: Record<string, string[]> = {
    'sale-1': ['M Sport package', 'Parking sensors', 'Leather seats', 'Navigation system', 'Heated seats', 'LED headlights'],
    'sale-2': ['Premium interior', 'Rear camera', 'Cruise control', 'Blind spot assist', 'Heated seats', 'Digital dashboard'],
    'sale-3': ['Apple CarPlay', 'Adaptive cruise control', 'Lane assist', 'LED headlights', 'Keyless start'],
    'sale-4': ['Quattro AWD', 'Panoramic roof', 'Virtual cockpit', 'Parking camera', 'Leather seats'],
    'sale-5': ['Hybrid drivetrain', 'Rear camera', 'Lane assist', 'Bluetooth', 'Dual-zone climate'],
    'sale-6': ['Electric drivetrain', 'Autopilot', 'Glass roof', 'Fast charging', 'Premium audio'],
};

const toFeatureObjects = (carId: string, features: string[] = []) =>
    features.map((name, index) => ({
        id: `${carId}-feature-${index + 1}`,
        name,
    }));

const mapSaleCarToCar = (saleCar: SaleCar): Car => ({
    id: saleCar.id,
    brand: saleCar.brand,
    model: saleCar.model,
    year: saleCar.year,
    type: saleCar.bodyType,
    price: saleCar.price,
    priceType: 'sale',
    mileage: saleCar.mileage,
    fuelType: saleCar.fuelType,
    transmission: saleCar.transmission,
    seats: saleCar.bodyType === 'Coupe' ? 4 : 5,
    bodyType: saleCar.bodyType,
    city: saleCar.city,
    sellerType: saleCar.sellerType,
    features: toFeatureObjects(saleCar.id, saleCarFeatures[saleCar.id]),
    description: `${saleCar.year} ${saleCar.brand} ${saleCar.model} for sale in ${saleCar.city}. Clean listing with clear market details, mileage, fuel type, transmission, and body style.`,
    images: [saleCar.image],
    isFavorite: saleCar.isFavorite,
    isAvailable: true,
    sellerId: saleCar.id,
    sellerName: saleCar.sellerType,
    createdAt: new Date().toISOString(),
});

const normalizeApiImage = (image: ApiCarImage): CarImage => ({
    id: String(image.carImageID ?? image.CarImageID ?? image.carImageUrl ?? image.CarImageUrl ?? ''),
    carId: String(image.carID ?? image.CarID ?? ''),
    url: image.carImageUrl ?? image.CarImageUrl ?? '',
    originalFileName: image.carImageOriginalFileName ?? image.CarImageOriginalFileName ?? null,
    contentType: image.carImageContentType ?? image.CarImageContentType ?? null,
    sizeBytes: image.carImageSizeBytes ?? image.CarImageSizeBytes ?? null,
    isMain: image.carImageIsMain ?? image.CarImageIsMain ?? false,
    orderNumber: image.carImageOrderNumber ?? image.CarImageOrderNumber ?? 0,
    createdAt: image.carImageCreationDate ?? image.CarImageCreationDate ?? new Date().toISOString(),
});

const normalizeApiCar = (apiCar: ApiCar, images: string[] = [], features: ApiCarFeature[] = []): Car => {
    const id = String(apiCar.carsID ?? apiCar.CarsID ?? '');
    const isForSale = apiCar.isForSale ?? apiCar.IsForSale ?? false;
    const price = Number(
        isForSale
            ? apiCar.salePrice ?? apiCar.SalePrice ?? 0
            : apiCar.rentalDailyPrice ?? apiCar.RentalDailyPrice ?? 0
    );
    const bodyType = apiCar.carBodyType ?? apiCar.CarBodyType ?? 'Sedan';
    const imageRecords = (apiCar.images ?? apiCar.Images ?? []).map(normalizeApiImage);
    const imageUrls = imageRecords.length > 0 ? imageRecords.map((image) => image.url).filter(Boolean) : images;

    return {
        id,
        tenantID: apiCar.tenantID ?? apiCar.TenantID ?? null,
        brand: apiCar.carBrand ?? apiCar.CarBrand ?? 'Unknown',
        model: apiCar.carModel ?? apiCar.CarModel ?? 'Unknown',
        year: apiCar.carYear ?? apiCar.CarYear ?? new Date().getFullYear(),
        type: bodyType as Car['type'],
        price,
        priceType: isForSale ? 'sale' : 'daily',
        mileage: apiCar.carMileage ?? apiCar.CarMileage ?? 0,
        fuelType: (apiCar.carFuelType ?? apiCar.CarFuelType ?? 'Petrol') as Car['fuelType'],
        transmission: (apiCar.carTransmission ?? apiCar.CarTransmission ?? 'Manual') as Car['transmission'],
        seats: 5,
        bodyType,
        color: apiCar.carColor ?? apiCar.CarColor ?? undefined,
        features: features.map((feature) => ({
            id: String(feature.carFeatureID ?? feature.CarFeatureID ?? feature.carFeatureName ?? feature.CarFeatureName),
            name: feature.carFeatureName ?? feature.CarFeatureName ?? 'Feature',
            description: feature.carFeatureDescription ?? feature.CarFeatureDescription ?? null,
        })),
        description: apiCar.carDescription ?? apiCar.CarDescription ?? apiCar.carTitle ?? apiCar.CarTitle ?? '',
        images: imageUrls,
        imageRecords,
        isAvailable: (apiCar.carStatus ?? apiCar.CarStatus ?? 'Available').toLowerCase() === 'available',
        sellerId: String(apiCar.createdByAccountID ?? apiCar.CreatedByAccountID ?? ''),
        sellerName: 'AutoKosova seller',
        createdAt: apiCar.carCreationDate ?? apiCar.CarCreationDate ?? new Date().toISOString(),
    };
};

const getSaleCarById = (id: string) => {
    const saleCar = saleCars.find((car) => car.id === id);
    return saleCar ? mapSaleCarToCar(saleCar) : null;
};

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
            const saleCar = getSaleCarById(id);
            return saleCar ?? mockCarService.getCarById(id);
        }

        const saleCar = getSaleCarById(id);
        if (saleCar) {
            return saleCar;
        }

        const response = await apiClient.get<ApiCar>(`/cars/${id}`);
        const [imagesResponse, featuresResponse] = await Promise.allSettled([
            apiClient.get<ApiCarImage[]>(`/cars/${id}/images`),
            apiClient.get<ApiCarFeature[]>(`/cars/${id}/features`),
        ]);

        const images = imagesResponse.status === 'fulfilled'
            ? imagesResponse.value.data.map((image) => image.carImageUrl ?? image.CarImageUrl ?? '').filter(Boolean)
            : [];
        const features = featuresResponse.status === 'fulfilled' ? featuresResponse.value.data : [];

        return normalizeApiCar(response.data, images, features);
    },

    // Create new car (Seller)
    createCar: async (carData: Partial<Car> | FormData): Promise<Car> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            if (carData instanceof FormData) {
                return mockCarService.createCar({});
            }
            return mockCarService.createCar(carData);
        }
        const response = await apiClient.post('/cars', carData);
        const carId = response.data.carID ?? response.data.CarID ?? response.data.carsID ?? response.data.CarsID;
        return carId ? carService.getCarById(String(carId)) : response.data;
    },

    // Update car (Seller)
    updateCar: async (id: string, carData: Partial<Car>): Promise<Car> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.updateCar(id, carData);
        }
        const isForSale = carData.priceType === 'sale';
        const payload = {
            carTitle: `${carData.year ?? ''} ${carData.brand ?? ''} ${carData.model ?? ''}`.trim(),
            carBrand: carData.brand,
            carModel: carData.model,
            carYear: carData.year,
            carMileage: carData.mileage,
            carFuelType: carData.fuelType,
            carTransmission: carData.transmission,
            carBodyType: carData.bodyType ?? carData.type,
            carColor: carData.color,
            carDescription: carData.description,
            tenantID: carData.tenantID,
            isForSale,
            salePrice: isForSale ? carData.price : null,
            isForRent: !isForSale,
            rentalDailyPrice: !isForSale ? carData.price : null,
            carStatus: carData.isAvailable ? 'Available' : 'Inactive',
        };
        await apiClient.put(`/cars/${id}`, payload);
        return carService.getCarById(id);
    },

    uploadCarImages: async (id: string, files: File[], mainImageIndex?: number): Promise<CarImage[]> => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        if (mainImageIndex !== undefined) {
            formData.append('mainImageIndex', String(mainImageIndex));
        }

        const response = await apiClient.post<{ images?: ApiCarImage[]; Images?: ApiCarImage[] }>(`/cars/${id}/images`, formData);
        return (response.data.images ?? response.data.Images ?? []).map(normalizeApiImage);
    },

    deleteCarImage: async (carId: string, imageId: string): Promise<void> => {
        await apiClient.delete(`/cars/${carId}/images/${imageId}`);
    },

    setMainCarImage: async (carId: string, imageId: string): Promise<void> => {
        await apiClient.put(`/cars/${carId}/images/${imageId}/set-main`);
    },

    reorderCarImages: async (carId: string, images: Pick<CarImage, 'id' | 'orderNumber'>[]): Promise<CarImage[]> => {
        const response = await apiClient.put<ApiCarImage[]>(`/cars/${carId}/images/reorder`, {
            images: images.map((image) => ({
                carImageID: Number(image.id),
                carImageOrderNumber: image.orderNumber,
            })),
        });
        return response.data.map(normalizeApiImage);
    },

    // Delete car (Seller)
    deleteCar: async (id: string): Promise<void> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.deleteCar(id);
        }
        await apiClient.delete(`/cars/${id}`);
    },

    // Get seller's cars
    getSellerCars: async (accountId?: number): Promise<Car[]> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockCarService.getSellerCars();
        }
        const response = await apiClient.get<ApiCar[]>('/cars/my-cars', {
            params: { accountId },
        });
        return response.data.map((car) => normalizeApiCar(car));
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
