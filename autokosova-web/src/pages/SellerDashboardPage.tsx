import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Car } from '../lib/types';
import { carService } from '../services/carService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

export const SellerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'cars' | 'bookings'>('cars');

    const loadSellerCars = useCallback(async () => {
        await Promise.resolve();
        setIsLoading(true);
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

    useEffect(() => {
        queueMicrotask(() => {
            void loadSellerCars();
        });
    }, [loadSellerCars]);

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
                                        <th>Price</th>
                                        <th>Availability</th>
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
                                                <strong className="renter-price">{formatCurrency(car.price)}</strong>
                                                <span className="renter-muted">per day</span>
                                            </td>
                                            <td>
                                                <span className={car.isAvailable ? 'renter-status available' : 'renter-status inactive'}>
                                                    {car.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="renter-table-actions">
                                                    <button type="button" onClick={() => navigate(`/seller/edit-car/${car.id}`)}>
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
                <div className="empty-state renter-empty">
                    <div className="empty-state__mark">BK</div>
                    <h3>No booking panel yet</h3>
                    <p>Bookings for your rental cars will appear here after the booking flow is connected.</p>
                </div>
            )}
        </div>
    );
};
