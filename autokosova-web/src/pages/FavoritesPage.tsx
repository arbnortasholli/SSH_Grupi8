import React, { useState, useEffect, useCallback } from 'react';
import type { Car } from '../lib/types';
import { carService } from '../services/carService';
import { CarCard } from '../components/CarCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getErrorMessage } from '../utils/helpers';

export const FavoritesPage: React.FC = () => {
    const [favorites, setFavorites] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFavorites = useCallback(async () => {
        await Promise.resolve();
        setIsLoading(true);
        try {
            const data = await carService.getFavorites();
            setFavorites(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load favorites'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            void loadFavorites();
        });
    }, [loadFavorites]);

    const handleFavoriteRemoved = (carId: string) => {
        setFavorites((currentFavorites) => currentFavorites.filter(car => car.id !== carId));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Favorites</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <LoadingSpinner />
            ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.map((car) => (
                        <CarCard
                            key={car.id}
                            car={car}
                            onFavoriteChange={handleFavoriteRemoved}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No favorites yet</p>
                    <a
                        href="/"
                        className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                    >
                        Browse Cars
                    </a>
                </div>
            )}
        </div>
    );
};
