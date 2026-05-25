import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking, Car } from '../lib/types';
import { carService } from '../services/carService';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { EditCarPage } from './EditCarPage';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

export const SellerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cars, setCars] = useState<Car[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingsLoading, setIsBookingsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'cars' | 'bookings'>('cars');
    const [activeModal, setActiveModal] = useState<{
        carId: string;
        mode: 'details' | 'images' | 'features';
        carLabel: string;
    } | null>(null);

    const loadSellerCars = useCallback(async () => {
        await Promise.resolve();
        setIsLoading(true);
        setError(null);
        try {
            if (!user?.accountID) {
                setCars([]);
                return;
            }

            const data = await carService.getSellerCars(user.accountID);
            setCars(data.filter((car) => car.priceType !== 'sale'));
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load cars'));
        } finally {
            setIsLoading(false);
        }
    }, [user?.accountID]);

    const loadSellerBookings = useCallback(async () => {
        setIsBookingsLoading(true);
        setBookingsError(null);

        try {
            const data = await bookingService.getSellerBookings();
            setBookings(data);
        } catch (err: unknown) {
            setBookingsError(getErrorMessage(err, 'Failed to load bookings'));
        } finally {
            setIsBookingsLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            void loadSellerCars();
            void loadSellerBookings();
        });
    }, [loadSellerBookings, loadSellerCars]);

    const handleDeleteCar = async (carId: string) => {
        if (!window.confirm('Are you sure you want to delete this car?')) return;

        try {
            await carService.deleteCar(carId);
            setCars((currentCars) => currentCars.filter((car) => car.id !== carId));
        } catch (err: unknown) {
            alert(getErrorMessage(err, 'Failed to delete car'));
        }
    };

    const availableCars = cars.filter((car) => car.isAvailable).length;
    const inactiveCars = cars.length - availableCars;
    const getStatusClassName = (status?: string) => {
        const normalized = (status ?? 'Inactive').toLowerCase().replace(/\s+/g, '-');
        return `renter-status status-${normalized}`;
    };
    const getListingTypeLabel = (car: Car) => (car.priceType === 'sale' ? 'For sale' : 'For rent');
    const getPriceLabel = (car: Car) => (car.priceType === 'sale' ? formatCurrency(car.price) : `${formatCurrency(car.price)} / day`);

    return (
        <div className="renter-dashboard-page">
            <section className="renter-dashboard-hero">
                <div>
                    <p className="eyebrow">Renter workspace</p>
                    <h1>Rental Dashboard</h1>
                    <p>Manage the cars your tenant offers for rent. Sale listings are not available in this renter flow.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/seller/add-car')}
                    className="ak-button ak-button--primary"
                >
                    Add Rental Car
                </button>
            </section>

            <section className="renter-dashboard-stats" aria-label="Rental car summary">
                <div>
                    <span>Total cars</span>
                    <strong>{cars.length}</strong>
                </div>
                <div>
                    <span>Available</span>
                    <strong>{availableCars}</strong>
                </div>
                <div>
                    <span>Inactive</span>
                    <strong>{inactiveCars}</strong>
                </div>
            </section>

            {error && (
                <div className="auth-alert" role="alert">
                    {error}
                </div>
            )}

            <div className="renter-dashboard-tabs">
                <button
                    type="button"
                    onClick={() => setSelectedTab('cars')}
                    className={selectedTab === 'cars' ? 'active' : undefined}
                >
                    My Rental Cars ({cars.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab('bookings')}
                    className={selectedTab === 'bookings' ? 'active' : undefined}
                >
                    Bookings
                </button>
            </div>

            {selectedTab === 'cars' && (
                <>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : cars.length > 0 ? (
                        <div className="renter-table-card">
                            <table className="renter-cars-table">
                                <thead>
                                <tr>
                                    <th>Car</th>
                                    <th>Mileage</th>
                                    <th>Listing</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cars.map((car) => (
                                    <tr key={car.id}>
                                        <td>
                                            <div className="renter-car-cell">
                                                <div className="renter-car-thumb">
                                                    {car.images[0] ? (
                                                        <img src={car.images[0]} alt={`${car.brand} ${car.model}`} />
                                                    ) : (
                                                        <span>{car.brand.slice(0, 1)}{car.model.slice(0, 1)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>{car.year} {car.brand} {car.model}</strong>
                                                    <span>{car.type}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{car.mileage.toLocaleString()} km</strong>
                                        </td>
                                        <td>
                                            <strong>{getListingTypeLabel(car)}</strong>
                                            <span className="renter-muted">{car.bodyType ?? car.type}</span>
                                        </td>
                                        <td>
                                            <strong className="renter-price">{getPriceLabel(car)}</strong>
                                        </td>
                                        <td>
                                            <span className={getStatusClassName(car.carStatus)}>
                                                {car.carStatus ?? (car.isAvailable ? 'Available' : 'Inactive')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="renter-table-actions">
                                                <button type="button" onClick={() => setActiveModal({
                                                    carId: car.id,
                                                    mode: 'images',
                                                    carLabel: `${car.year} ${car.brand} ${car.model}`,
                                                })}>
                                                    Images
                                                </button>
                                                <button type="button" onClick={() => setActiveModal({
                                                    carId: car.id,
                                                    mode: 'features',
                                                    carLabel: `${car.year} ${car.brand} ${car.model}`,
                                                })}>
                                                    Features
                                                </button>
                                                <button type="button" onClick={() => setActiveModal({
                                                    carId: car.id,
                                                    mode: 'details',
                                                    carLabel: `${car.year} ${car.brand} ${car.model}`,
                                                })}>
                                                    Edit
                                                </button>
                                                <button type="button" className="danger" onClick={() => handleDeleteCar(car.id)}>
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
                        <div className="empty-state renter-empty">
                            <div className="empty-state__mark">AK</div>
                            <h3>No rental cars listed yet</h3>
                            <p>Add your first car for rent and it will appear here with price, status, and actions.</p>
                            <button
                                type="button"
                                onClick={() => navigate('/seller/add-car')}
                                className="ak-button ak-button--primary"
                            >
                                Add Your First Rental Car
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedTab === 'bookings' && (
                <>
                    {bookingsError && (
                        <div className="auth-alert" role="alert">
                            {bookingsError}
                        </div>
                    )}

                    {isBookingsLoading ? (
                        <LoadingSpinner />
                    ) : bookings.length > 0 ? (
                        <div className="renter-table-card">
                            <table className="renter-cars-table">
                                <thead>
                                <tr>
                                    <th>Booking</th>
                                    <th>Dates</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <div className="renter-car-cell">
                                                <div className="renter-car-thumb">
                                                    <span>BK</span>
                                                </div>
                                                <div>
                                                    <strong>
                                                        {booking.carBrand && booking.carModel
                                                            ? `${booking.carBrand} ${booking.carModel}`
                                                            : booking.carTitle || `Car #${booking.carId}`}
                                                    </strong>
                                                    <span>Booking #{booking.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{formatDate(booking.startDate)}</strong>
                                            <span className="renter-muted">{formatDate(booking.endDate)}</span>
                                        </td>
                                        <td>
                                            <strong className="renter-price">{formatCurrency(booking.totalPrice)}</strong>
                                        </td>
                                        <td>
                                            <span className={getStatusClassName(booking.status)}>{booking.status}</span>
                                        </td>
                                        <td>
                                            <strong>{formatDate(booking.createdAt)}</strong>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state renter-empty">
                            <div className="empty-state__mark">BK</div>
                            <h3>No bookings yet</h3>
                            <p>Bookings for your rental cars will appear here when customers complete the rental flow.</p>
                        </div>
                    )}
                </>
            )}

            <Modal
                isOpen={Boolean(activeModal)}
                title={activeModal ? `${activeModal.carLabel} - ${activeModal.mode === 'details' ? 'Edit' : activeModal.mode === 'images' ? 'Images' : 'Features'}` : ''}
                onClose={() => setActiveModal(null)}
                cancelText=""
                size="large"
            >
                {activeModal && (
                    <EditCarPage
                        carId={activeModal.carId}
                        initialSection={activeModal.mode}
                        embedded
                        onClose={() => setActiveModal(null)}
                        onUpdated={loadSellerCars}
                    />
                )}
            </Modal>
        </div>
    );
};
