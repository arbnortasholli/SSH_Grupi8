import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Booking } from '../lib/types';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'bookings' | 'profile'>('bookings');

    const loadBookings = useCallback(async () => {
        await Promise.resolve();
        setIsLoading(true);
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load bookings'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            void loadBookings();
        });
    }, [loadBookings]);

    const handleCancelBooking = async (bookingId: string) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await bookingService.cancelBooking(bookingId);
            setBookings(bookings.filter(b => b.id !== bookingId));
        } catch (err: unknown) {
            alert(getErrorMessage(err, 'Failed to cancel booking'));
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome, {user?.firstName} {user?.lastName}!</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-8">
                <button
                    onClick={() => setSelectedTab('bookings')}
                    className={`px-4 py-2 font-medium transition ${selectedTab === 'bookings'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    My Bookings
                </button>
                <button
                    onClick={() => setSelectedTab('profile')}
                    className={`px-4 py-2 font-medium transition ${selectedTab === 'profile'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    Profile
                </button>
            </div>

            {/* Bookings Tab */}
            {selectedTab === 'bookings' && (
                <div>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : bookings.length > 0 ? (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {booking.car?.brand} {booking.car?.model}
                                            </h3>
                                            <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'Confirmed'
                                                ? 'bg-green-100 text-green-800'
                                                : booking.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : booking.status === 'Cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-gray-500 text-sm">Start Date</p>
                                            <p className="font-semibold">{formatDate(booking.startDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">End Date</p>
                                            <p className="font-semibold">{formatDate(booking.endDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Total Price</p>
                                            <p className="font-semibold">{formatCurrency(booking.totalPrice)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Booked On</p>
                                            <p className="font-semibold">{formatDate(booking.createdAt)}</p>
                                        </div>
                                    </div>

                                    {booking.status === 'Pending' && (
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No bookings yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* Profile Tab */}
            {selectedTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <p className="text-gray-800">{user?.email}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <p className="text-gray-800">{user?.firstName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <p className="text-gray-800">{user?.lastName}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <p className="text-gray-800">{user?.role}</p>
                        </div>
                    </div>

                    <button className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition">
                        Edit Profile
                    </button>
                </div>
            )}
        </div>
    );
};
