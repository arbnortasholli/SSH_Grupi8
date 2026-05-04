import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Car } from '../lib/types';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { carService } from '../services/carService';

interface CarCardProps {
    car: Car;
    onFavoriteChange?: (carId: string, isFavorite: boolean) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onFavoriteChange }) => {
    const { isAuthenticated } = useAuth();
    const [isFavorite, setIsFavorite] = useState(car.isFavorite ?? false);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('Please login to add favorites');
            return;
        }

        setIsLoadingFavorite(true);
        try {
            if (isFavorite) {
                await carService.removeFromFavorites(car.id);
                setIsFavorite(false);
                onFavoriteChange?.(car.id, false);
            } else {
                await carService.addToFavorites(car.id);
                setIsFavorite(true);
                onFavoriteChange?.(car.id, true);
            }
        } catch (error) {
            console.error('Failed to update favorite:', error);
        } finally {
            setIsLoadingFavorite(false);
        }
    };

    return (
        <Link to={`/cars/${car.id}`} className="block h-full">
            <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative h-48 overflow-hidden bg-gray-900">
                    {car.images.length > 0 && !imageFailed ? (
                        <img
                            src={car.images[0]}
                            alt={`${car.brand} ${car.model}`}
                            className="h-full w-full object-cover"
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-800 px-6 text-center text-white">
                            <span className="text-3xl font-bold">{car.brand}</span>
                            <span className="mt-1 text-sm text-gray-300">{car.model}</span>
                        </div>
                    )}

                    <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm ${
                            car.isAvailable ? 'bg-green-600' : 'bg-red-500'
                        }`}
                    >
                        {car.isAvailable ? 'Available' : 'Unavailable'}
                    </span>

                    <button
                        type="button"
                        onClick={handleFavoriteClick}
                        disabled={isLoadingFavorite}
                        className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <span className={isFavorite ? 'text-red-500' : 'text-gray-400'}>
                            {isFavorite ? '♥' : '♡'}
                        </span>
                    </button>
                </div>

                <div className="p-4">
                    <h3 className="mb-1 text-lg font-bold text-gray-900">
                        {car.year} {car.brand} {car.model}
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">{car.type}</p>

                    <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            <span>{car.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                            <span>{car.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span>{car.seats} seats</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="h-2 w-2 rounded-full bg-yellow-500" />
                            <span>{car.mileage.toLocaleString()} km</span>
                        </div>
                    </div>

                    <p className="mb-3 text-xs text-gray-500">By {car.sellerName}</p>

                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-2xl font-bold text-primary">
                                {formatCurrency(car.price)}
                            </p>
                            <p className="text-xs text-gray-500">per {car.priceType}</p>
                        </div>
                        <span className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                            View
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
};
