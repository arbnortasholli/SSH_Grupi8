import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Car } from '../lib/types';
import { carService } from '../services/carService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency, getErrorMessage } from '../utils/helpers';

export const SellerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'cars' | 'bookings'>('cars');

    const loadSellerCars = useCallback(async () => {
        await Promise.resolve();
        setIsLoading(true);
        try {
            const data = await carService.getSellerCars();
            setCars(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load cars'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            void loadSellerCars();
        });
    }, [loadSellerCars]);

    const handleDeleteCar = async (carId: string) => {
        if (!window.confirm('Are you sure you want to delete this car?')) return;

        try {
            await carService.deleteCar(carId);
            setCars((currentCars) => currentCars.filter(car => car.id !== carId));
        } catch (err: unknown) {
            alert(getErrorMessage(err, 'Failed to delete car'));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
                <button
                    onClick={() => navigate('/seller/add-car')}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                >
                    + Add New Car
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-8">
                <button
                    onClick={() => setSelectedTab('cars')}
                    className={`px-4 py-2 font-medium transition ${selectedTab === 'cars'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    My Cars ({cars.length})
                </button>
                <button
                    onClick={() => setSelectedTab('bookings')}
                    className={`px-4 py-2 font-medium transition ${selectedTab === 'bookings'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    Bookings
                </button>
            </div>

            {/* Cars Tab */}
            {selectedTab === 'cars' && (
                <>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : cars.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white rounded-lg shadow-md">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Availability</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cars.map((car) => (
                                        <tr key={car.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {car.year} {car.brand} {car.model}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{car.type}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-800">
                                                    {formatCurrency(car.price)} / {car.priceType}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${car.isAvailable
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {car.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/seller/edit-car/${car.id}`)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCar(car.id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg mb-4">No cars listed yet</p>
                            <button
                                onClick={() => navigate('/seller/add-car')}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                            >
                                Add Your First Car
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Bookings Tab */}
            {selectedTab === 'bookings' && (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Bookings for your cars will appear here</p>
                </div>
            )}
        </div>
    );
};
