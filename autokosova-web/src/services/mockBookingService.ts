import type { Booking, BookingRequest } from '../lib/types';
import { mockBookings, mockCars } from './mockData';

const bookings = [...mockBookings];

export const mockBookingService = {
    createBooking: async (bookingData: BookingRequest): Promise<Booking> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const car = mockCars.find(c => c.id === bookingData.carId);
        if (!car) {
            throw new Error('Car not found');
        }

        // Calculate total price
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = car.price * days;

        const newBooking: Booking = {
            id: 'BK' + String(Date.now()).slice(-6),
            carId: bookingData.carId,
            car,
            userId: 'user-2', // Mock user
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            totalPrice,
            status: 'Pending',
            createdAt: new Date().toISOString(),
        };

        bookings.push(newBooking);
        return newBooking;
    },

    getMyBookings: async (): Promise<Booking[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return bookings;
    },

    getSellerBookings: async (): Promise<Booking[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return bookings;
    },

    getBookingById: async (id: string): Promise<Booking> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const booking = bookings.find(b => b.id === id);
        if (!booking) {
            throw new Error('Booking not found');
        }
        return booking;
    },

    cancelBooking: async (id: string): Promise<void> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const booking = bookings.find(b => b.id === id);
        if (booking) {
            booking.status = 'Cancelled';
        }
    },

    checkAvailability: async (
        carId: string,
        startDate: string,
        endDate: string
    ): Promise<{ available: boolean }> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const car = mockCars.find(c => c.id === carId);
        if (!car) {
            return { available: false };
        }

        // Check for overlapping bookings
        const hasConflict = bookings.some(booking => {
            if (booking.carId !== carId || booking.status === 'Cancelled') {
                return false;
            }

            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            const requestStart = new Date(startDate);
            const requestEnd = new Date(endDate);

            return requestStart < bookingEnd && requestEnd > bookingStart;
        });

        return { available: !hasConflict && car.isAvailable };
    },
};
