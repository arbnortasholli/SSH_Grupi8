import apiClient from './apiClient';
import { API_CONFIG } from '../config/api';
import type { Car, CarFilters, CarImage, PaginatedResponse } from '../lib/types';

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
    isForRent?: boolean;
    IsForRent?: boolean;
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
    mainImageUrl?: string | null;
    MainImageUrl?: string | null;
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

type ApiFavoriteCar = {
    carFavoriteID?: number;
    CarFavoriteID?: number;
    carID?: number;
    CarID?: number;
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
    isForSale?: boolean;
    IsForSale?: boolean;
    salePrice?: number | null;
    SalePrice?: number | null;
    isForRent?: boolean;
    IsForRent?: boolean;
    rentalDailyPrice?: number | null;
    RentalDailyPrice?: number | null;
    carStatus?: string;
    CarStatus?: string;
    carFavoriteCreationDate?: string;
    CarFavoriteCreationDate?: string;
};

const getApiOrigin = () => {
    const apiBaseUrl = API_CONFIG.API_BASE_URL.trim();

    if (!/^https?:\/\//i.test(apiBaseUrl)) {
        return '';
    }

    return apiBaseUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '');
};

const resolveImageUrl = (url?: string | null) => {
    if (!url) return '';
    const normalizedUrl = url.replace(/\\/g, '/').trim();
    if (/^https?:\/\//i.test(normalizedUrl)) return normalizedUrl;

    const apiOrigin = getApiOrigin();
    if (!apiOrigin) {
        return normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    }

    return `${apiOrigin}${normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`}`;
};

const normalizeApiImage = (image: ApiCarImage): CarImage => ({
    id: String(image.carImageID ?? image.CarImageID ?? image.carImageUrl ?? image.CarImageUrl ?? ''),
    carId: String(image.carID ?? image.CarID ?? ''),
    url: resolveImageUrl(image.carImageUrl ?? image.CarImageUrl),
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
    const mainImageUrl = resolveImageUrl(apiCar.mainImageUrl ?? apiCar.MainImageUrl);
    const imageUrls = imageRecords.length > 0
        ? imageRecords.map((image) => image.url).filter(Boolean)
        : mainImageUrl
            ? [mainImageUrl]
            : images;

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
        carStatus: apiCar.carStatus ?? apiCar.CarStatus ?? 'Available',
        sellerId: String(apiCar.createdByAccountID ?? apiCar.CreatedByAccountID ?? ''),
        sellerName: 'AutoKosova seller',
        createdAt: apiCar.carCreationDate ?? apiCar.CarCreationDate ?? new Date().toISOString(),
    };
};

const normalizeCarsResponse = (data: unknown): PaginatedResponse<Car> => {
    if (Array.isArray(data)) {
        const cars = data.map((car) => normalizeApiCar(car as ApiCar));
        return {
            data: cars,
            total: cars.length,
            page: 1,
            pageSize: cars.length,
        };
    }

    const response = data as {
        data?: ApiCar[];
        total?: number;
        totalRecords?: number;
        page?: number;
        pageNumber?: number;
        pageSize?: number;
    };
    const cars = (response.data ?? []).map((car) => normalizeApiCar(car));

    return {
        data: cars,
        total: response.total ?? response.totalRecords ?? cars.length,
        page: response.page ?? response.pageNumber ?? 1,
        pageSize: response.pageSize ?? cars.length,
    };
};

const normalizeFavoriteCar = (favorite: ApiFavoriteCar): Car => {
    const isForSale = favorite.isForSale ?? favorite.IsForSale ?? false;
    const price = Number(
        isForSale
            ? favorite.salePrice ?? favorite.SalePrice ?? 0
            : favorite.rentalDailyPrice ?? favorite.RentalDailyPrice ?? 0
    );

    return {
        id: String(favorite.carID ?? favorite.CarID ?? ''),
        brand: favorite.carBrand ?? favorite.CarBrand ?? 'Unknown',
        model: favorite.carModel ?? favorite.CarModel ?? 'Unknown',
        year: favorite.carYear ?? favorite.CarYear ?? new Date().getFullYear(),
        type: 'Sedan',
        price,
        priceType: isForSale ? 'sale' : 'daily',
        mileage: favorite.carMileage ?? favorite.CarMileage ?? 0,
        fuelType: 'Petrol',
        transmission: 'Manual',
        seats: 5,
        description: favorite.carTitle ?? favorite.CarTitle ?? '',
        images: [],
        isFavorite: true,
        isAvailable: (favorite.carStatus ?? favorite.CarStatus ?? 'Available').toLowerCase() === 'available',
        carStatus: favorite.carStatus ?? favorite.CarStatus ?? 'Available',
        sellerId: '',
        sellerName: 'AutoKosova seller',
        createdAt: favorite.carFavoriteCreationDate ?? favorite.CarFavoriteCreationDate ?? new Date().toISOString(),
    };
};

const buildSearchParams = (filters?: CarFilters, page = 1, pageSize = 12) => ({
    searchTerm: filters?.search,
    brand: filters?.brand,
    bodyType: filters?.type,
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    minYear: filters?.minYear,
    maxYear: filters?.maxYear,
    fuelType: filters?.fuelType,
    transmission: filters?.transmission,
    status: filters?.availability === true ? 'Available' : undefined,
    pageNumber: page,
    pageSize,
});

export const carService = {
    getCars: async (
        filters?: CarFilters,
        page = 1,
        pageSize = 12
    ): Promise<PaginatedResponse<Car>> => {
        const response = await apiClient.get('/cars/search', {
            params: buildSearchParams(filters, page, pageSize),
        });
        return normalizeCarsResponse(response.data);
    },

    getCarsForSale: async (): Promise<Car[]> => {
        const response = await apiClient.get('/cars/for-sale');
        return normalizeCarsResponse(response.data).data;
    },

    getCarsForRent: async (): Promise<Car[]> => {
        const response = await apiClient.get('/cars/for-rent');
        return normalizeCarsResponse(response.data).data;
    },

    getCarById: async (id: string): Promise<Car> => {
        const response = await apiClient.get<ApiCar>(`/cars/${id}`);
        const [imagesResponse, featuresResponse] = await Promise.allSettled([
            apiClient.get<ApiCarImage[]>(`/cars/${id}/images`),
            apiClient.get<ApiCarFeature[]>(`/cars/${id}/features`),
        ]);

        const images = imagesResponse.status === 'fulfilled'
            ? imagesResponse.value.data
                .map((image) => resolveImageUrl(image.carImageUrl ?? image.CarImageUrl))
                .filter(Boolean)
            : [];
        const features = featuresResponse.status === 'fulfilled' ? featuresResponse.value.data : [];

        return normalizeApiCar(response.data, images, features);
    },

    createCar: async (carData: Partial<Car> | FormData): Promise<Car> => {
        const response = await apiClient.post('/cars', carData);
        const carId = response.data.carID ?? response.data.CarID ?? response.data.carsID ?? response.data.CarsID;
        return carId ? carService.getCarById(String(carId)) : response.data;
    },

    updateCar: async (id: string, carData: Partial<Car>): Promise<Car> => {
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
            carStatus: carData.carStatus ?? (carData.isAvailable ? 'Available' : 'Inactive'),
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

    deleteCar: async (id: string): Promise<void> => {
        await apiClient.delete(`/cars/${id}`);
    },

    getSellerCars: async (accountId?: number): Promise<Car[]> => {
        const response = await apiClient.get<ApiCar[]>('/cars/my-cars', {
            params: { accountId },
        });
        return response.data.map((car) => normalizeApiCar(car));
    },

    addToFavorites: async (carId: string): Promise<void> => {
        await apiClient.post(`/cars/${carId}/favorite`);
    },

    removeFromFavorites: async (carId: string): Promise<void> => {
        await apiClient.delete(`/cars/${carId}/favorite`);
    },

    getFavorites: async (): Promise<Car[]> => {
        const response = await apiClient.get<ApiFavoriteCar[]>('/accounts/me/favorites');
        return response.data.map(normalizeFavoriteCar);
    },

    getAllFeatures: async (): Promise<{ id: string; name: string }[]> => {
        const response = await apiClient.get<ApiCarFeature[]>('/car-features');
        return response.data.map((f) => ({
            id: String(f.carFeatureID ?? f.CarFeatureID),
            name: f.carFeatureName ?? f.CarFeatureName ?? 'Unknown',
        }));
    },

    getCarFeatures: async (carId: string): Promise<{ id: string; name: string }[]> => {
        const response = await apiClient.get<ApiCarFeature[]>(`/cars/${carId}/features`);
        return response.data.map((f) => ({
            id: String(f.carFeatureID ?? f.CarFeatureID),
            name: f.carFeatureName ?? f.CarFeatureName ?? 'Unknown',
        }));
    },

    assignFeature: async (carId: string, featureId: string): Promise<void> => {
        await apiClient.post(`/cars/${carId}/features/${featureId}`);
    },

    removeFeature: async (carId: string, featureId: string): Promise<void> => {
        await apiClient.delete(`/cars/${carId}/features/${featureId}`);
    },
};
