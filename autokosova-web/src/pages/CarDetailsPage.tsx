import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Car, Booking } from '../lib/types';
import { carService } from '../services/carService';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency, formatDate, daysBetween, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

export const CarDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [car, setCar] = useState<Car | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Booking state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadCar = useCallback(async () => {
        if (!id) return;
        await Promise.resolve();
        setIsLoading(true);
        try {
            const carData = await carService.getCarById(id);
            setCar(carData);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load car'));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        queueMicrotask(() => {
            void loadCar();
        });
    }, [loadCar]);

    const handleCheckAvailability = async () => {
        if (!startDate || !endDate || !id) {
            alert('Please select both dates');
            return;
        }

        setIsCheckingAvailability(true);
        try {
            const result = await bookingService.checkAvailability(id, startDate, endDate);
            setIsAvailable(result.available);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to check availability'));
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!startDate || !endDate || !id || !isAvailable) {
            alert('Please check availability first');
            return;
        }

        setIsBooking(true);
        try {
            const booking: Booking = await bookingService.createBooking({
                carId: id,
                startDate,
                endDate,
            });
            alert(`Booking confirmed! Your booking ID is: ${booking.id}`);
            navigate('/dashboard');
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to create booking'));
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !car) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-600 mb-4">{error || 'Car not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Cars
                    </button>
                </div>
            </div>
        );
    }

    const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
    const totalPrice = days > 0 ? car.price * days : 0;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Images */}
                <div className="lg:col-span-2">
                    <div className="mb-6">
                        <div className="bg-gray-200 rounded-lg overflow-hidden h-96">
                            {car.images && car.images.length > 0 ? (
                                <img
                                    src={car.images[currentImageIndex]}
                                    alt={`${car.brand} ${car.model}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No images
                                </div>
                            )}
                        </div>

                        {car.images && car.images.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto">
                                {car.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${currentImageIndex === idx ? 'border-primary' : 'border-gray-300'
                                            }`}
                                    >
                                        <img src={img} alt={`Car ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {car.year} {car.brand} {car.model}
                        </h1>
                        <p className="text-gray-600 mb-6">{car.type}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div>
                                <p className="text-gray-500 text-sm">Fuel Type</p>
                                <p className="text-lg font-semibold">{car.fuelType}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Transmission</p>
                                <p className="text-lg font-semibold">{car.transmission}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Seats</p>
                                <p className="text-lg font-semibold">{car.seats}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Mileage</p>
                                <p className="text-lg font-semibold">{car.mileage.toLocaleString()} km</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">{car.description}</p>

                        <p className="text-sm text-gray-500">
                            Listed by {car.sellerName} on {formatDate(car.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Booking Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                        <div className="mb-6">
                            <p className="text-gray-500 text-sm mb-2">Price</p>
                            <p className="text-4xl font-bold text-primary">
                                {formatCurrency(car.price)}
                            </p>
                            <p className="text-gray-600 text-sm">per {car.priceType}</p>
                        </div>

                        {!car.isAvailable && (
                            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                This car is currently unavailable
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={!car.isAvailable}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={!car.isAvailable}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <button
                                onClick={handleCheckAvailability}
                                disabled={!car.isAvailable || isCheckingAvailability}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
                            </button>
                        </div>

                        {startDate && endDate && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">
                                    {days} day{days !== 1 ? 's' : ''}
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {formatCurrency(totalPrice)}
                                </p>
                            </div>
                        )}

                        {isAvailable && startDate && endDate && (
                            <p className="text-sm text-green-600 mb-4">✓ Available</p>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={!isAvailable || !startDate || !endDate || isBooking}
                            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                        >
                            {isBooking ? 'Booking...' : 'Book Now'}
                        </button>

                        {!isAuthenticated && (
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-primary hover:underline"
                                >
                                    Sign in
                                </button>
                                {' '}to book this car
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
