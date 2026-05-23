import apiClient from './apiClient';
import type { Booking, BookingCheckoutResponse, BookingRequest, PaymentStatusResponse } from '../lib/types';
import { API_CONFIG } from '../config/api';
import { mockBookingService } from './mockBookingService';

const normalizeBooking = (booking: Record<string, unknown>): Booking => ({
    id: String(booking.rentalBookingID ?? booking.RentalBookingID ?? booking.id ?? ''),
    carId: String(booking.carID ?? booking.CarID ?? booking.carId ?? ''),
    userId: String(booking.customerAccountID ?? booking.CustomerAccountID ?? booking.userId ?? ''),
    startDate: String(booking.rentalBookingStartDate ?? booking.RentalBookingStartDate ?? booking.startDate ?? ''),
    endDate: String(booking.rentalBookingEndDate ?? booking.RentalBookingEndDate ?? booking.endDate ?? ''),
    totalPrice: Number(booking.rentalBookingTotalPrice ?? booking.RentalBookingTotalPrice ?? booking.totalPrice ?? 0),
    status: String(booking.rentalBookingStatus ?? booking.RentalBookingStatus ?? booking.status ?? 'PendingPayment') as Booking['status'],
    createdAt: String(booking.rentalBookingCreationDate ?? booking.RentalBookingCreationDate ?? booking.createdAt ?? ''),
});

export const bookingService = {
    createBooking: async (bookingData: BookingRequest): Promise<BookingCheckoutResponse> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            const booking = await mockBookingService.createBooking(bookingData);
            return {
                message: 'Rental booking created. Continue to payment.',
                rentalBookingID: Number(booking.id),
                paymentOrderID: 0,
                totalDays: 0,
                totalPrice: booking.totalPrice,
                rentalBookingStatus: booking.status,
                paymentStatus: 'Pending',
                checkoutUrl: '/',
            };
        }
        const response = await apiClient.post('/rental-bookings', {
            carID: Number(bookingData.carId),
            rentalBookingStartDate: bookingData.startDate,
            rentalBookingEndDate: bookingData.endDate,
        });
        return response.data;
    },

    // Get user's bookings
    getMyBookings: async (): Promise<Booking[]> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.getMyBookings();
        }
        const response = await apiClient.get('/accounts/me/bookings');
        return response.data.map((booking: Record<string, unknown>) => normalizeBooking(booking));
    },

    // Get seller's bookings for their cars
    getSellerBookings: async (): Promise<Booking[]> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.getSellerBookings();
        }
        const response = await apiClient.get('/rental-bookings');
        return response.data.map((booking: Record<string, unknown>) => normalizeBooking(booking));
    },

    // Get booking details
    getBookingById: async (id: string): Promise<Booking> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.getBookingById(id);
        }
        const response = await apiClient.get(`/rental-bookings/${id}`);
        return normalizeBooking(response.data);
    },

    // Cancel booking
    cancelBooking: async (id: string): Promise<void> => {
        if (API_CONFIG.USE_MOCK_DATA) {
            return mockBookingService.cancelBooking(id);
        }
        await apiClient.delete(`/rental-bookings/${id}`);
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
        const response = await apiClient.get(`/cars/${carId}/availability`, {
            params: { startDate, endDate },
        });
        return {
            available: Boolean(response.data.isAvailable ?? response.data.IsAvailable),
        };
    },

    createCheckoutSession: async (rentalBookingID: number): Promise<{ checkoutUrl: string; paymentOrderID: number }> => {
        const response = await apiClient.post('/payments/checkout-session', { rentalBookingID });
        return response.data;
    },

    getPaymentStatus: async (paymentOrderID: number): Promise<PaymentStatusResponse> => {
        const response = await apiClient.get(`/payments/${paymentOrderID}/status`);
        return response.data;
    },

    getPaymentStatusByBooking: async (rentalBookingID: number): Promise<PaymentStatusResponse> => {
        const response = await apiClient.get(`/rental-bookings/${rentalBookingID}/payment-status`);
        return response.data;
    },
};
