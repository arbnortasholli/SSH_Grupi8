import apiClient from './apiClient';
import type { Booking, BookingRequest } from '../lib/types';
import { API_CONFIG } from '../config/api';
import { mockBookingService } from './mockBookingService';

export const bookingService = {
    // Create booking
    createBooking: async (bookingData: BookingRequest): Promise<Booking> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.createBooking(bookingData);
        }
        const response = await apiClient.post('/bookings', bookingData);
        return response.data;
    },

    // Get user's bookings
    getMyBookings: async (): Promise<Booking[]> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.getMyBookings();
        }
        const response = await apiClient.get('/bookings/my-bookings');
        return response.data;
    },

    // Get seller's bookings for their cars
    getSellerBookings: async (): Promise<Booking[]> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.getSellerBookings();
        }
        const response = await apiClient.get('/bookings/seller-bookings');
        return response.data;
    },

    // Get booking details
    getBookingById: async (id: string): Promise<Booking> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.getBookingById(id);
        }
        const response = await apiClient.get(`/bookings/${id}`);
        return response.data;
    },

    // Cancel booking
    cancelBooking: async (id: string): Promise<void> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.cancelBooking(id);
        }
        await apiClient.post(`/bookings/${id}/cancel`);
    },

    // Check availability
    checkAvailability: async (
        carId: string,
        startDate: string,
        endDate: string
    ): Promise<{ available: boolean }> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.checkAvailability(carId, startDate, endDate);
        }
        const response = await apiClient.post('/bookings/check-availability', {
            carId,
            startDate,
            endDate,
        });
        return response.data;
    },
};
