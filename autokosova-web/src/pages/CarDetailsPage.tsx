import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Booking, Car, CarFeature } from '../lib/types';
import { carService } from '../services/carService';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { daysBetween, formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const getFallbackFeatures = (car: Car): CarFeature[] => [
    { id: 'fuel', name: `${car.fuelType} engine` },
    { id: 'transmission', name: `${car.transmission} transmission` },
    { id: 'body', name: `${car.bodyType ?? car.type} body` },
    { id: 'mileage', name: `${car.mileage.toLocaleString()} km mileage` },
    { id: 'seats', name: `${car.seats} seats` },
    ...(car.color ? [{ id: 'color', name: `${car.color} color` }] : []),
];

export const CarDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [car, setCar] = useState<Car | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadCar = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);
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
        void loadCar();
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

    const featureList = useMemo(() => (car ? (car.features?.length ? car.features : getFallbackFeatures(car)) : []), [car]);

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
                        onClick={() => navigate('/buy')}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Cars
                    </button>
                </div>
            </div>
        );
    }

    const isSaleListing = car.priceType === 'sale';
    const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
    const totalPrice = days > 0 ? car.price * days : 0;
    const quickFacts = [
        { label: 'City', value: car.city ?? 'Not listed' },
        { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
        { label: 'Fuel', value: car.fuelType },
        { label: 'Gearbox', value: car.transmission },
    ];

    return (
        <div className="car-details-page">
            {error && <div className="car-details-alert">{error}</div>}

            <section className="car-details-hero">
                <div className="car-details-gallery">
                    <div className="car-details-main-image">
                        {car.images.length > 0 ? (
                            <img src={car.images[currentImageIndex]} alt={`${car.brand} ${car.model}`} />
                        ) : (
                            <span>No images</span>
                        )}
                    </div>

                    {car.images.length > 1 && (
                        <div className="car-details-thumbs">
                            {car.images.map((img, idx) => (
                                <button
                                    key={img}
                                    type="button"
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={currentImageIndex === idx ? 'active' : undefined}
                                >
                                    <img src={img} alt={`${car.brand} ${car.model} ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="car-details-summary">
                    <span className="details-badge">{isSaleListing ? 'For sale' : 'For rent'}</span>
                    <h1>
                        {car.year} {car.brand} {car.model}
                    </h1>
                    <p>{car.city ? `${car.city} - ` : ''}{car.bodyType ?? car.type}</p>

                    <div className="details-price">
                        <strong>{formatCurrency(car.price)}</strong>
                        {!isSaleListing && <span>per {car.priceType}</span>}
                    </div>

                    <div className="details-highlights" aria-label="Key car characteristics">
                        {quickFacts.map((fact) => (
                            <div key={fact.label}>
                                <span>{fact.label}</span>
                                <strong>{fact.value}</strong>
                            </div>
                        ))}
                    </div>

                    {isSaleListing ? (
                        <div className="seller-panel">
                            <div>
                                <span>Seller</span>
                                <strong>{car.sellerName}</strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong>{car.isAvailable ? 'Available' : 'Unavailable'}</strong>
                            </div>
                            <button type="button" className="details-primary-action">
                                Contact seller
                            </button>
                        </div>
                    ) : (
                        <div className="booking-panel">
                            {!car.isAvailable && <div className="booking-warning">This car is currently unavailable</div>}

                            <label>
                                <span>Start Date</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    disabled={!car.isAvailable}
                                />
                            </label>

                            <label>
                                <span>End Date</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    disabled={!car.isAvailable}
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleCheckAvailability}
                                disabled={!car.isAvailable || isCheckingAvailability}
                                className="details-secondary-action"
                            >
                                {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
                            </button>

                            {startDate && endDate && (
                                <div className="booking-total">
                                    <span>{days} day{days !== 1 ? 's' : ''}</span>
                                    <strong>{formatCurrency(totalPrice)}</strong>
                                </div>
                            )}

                            {isAvailable && startDate && endDate && <p className="booking-available">Available</p>}

                            <button
                                type="button"
                                onClick={handleBooking}
                                disabled={!isAvailable || !startDate || !endDate || isBooking}
                                className="details-primary-action"
                            >
                                {isBooking ? 'Booking...' : 'Book Now'}
                            </button>
                        </div>
                    )}
                </aside>
            </section>

            <section className="car-details-content">
                <div className="details-section">
                    <div className="details-section-heading">
                        <span>Overview</span>
                        <h2>Car specifications</h2>
                    </div>

                    <div className="spec-grid">
                        <div><span>Fuel</span><strong>{car.fuelType}</strong></div>
                        <div><span>Transmission</span><strong>{car.transmission}</strong></div>
                        <div><span>Mileage</span><strong>{car.mileage.toLocaleString()} km</strong></div>
                        <div><span>Body</span><strong>{car.bodyType ?? car.type}</strong></div>
                        <div><span>Seats</span><strong>{car.seats}</strong></div>
                        <div><span>Year</span><strong>{car.year}</strong></div>
                        <div><span>Color</span><strong>{car.color ?? 'Not listed'}</strong></div>
                        <div><span>Location</span><strong>{car.city ?? 'Not listed'}</strong></div>
                        <div><span>Listing type</span><strong>{isSaleListing ? 'Sale' : 'Rental'}</strong></div>
                    </div>

                    <p className="details-description">{car.description}</p>
                    <p className="details-listed">Listed by {car.sellerName} on {formatDate(car.createdAt)}</p>
                </div>

                <div className="details-section">
                    <div className="details-section-heading details-section-heading--split">
                        <div>
                            <span>Features</span>
                            <h2>Vehicle characteristics</h2>
                        </div>
                        <strong>{featureList.length} shown</strong>
                    </div>

                    {featureList.length > 0 ? (
                        <div className="features-grid">
                            {featureList.map((feature) => (
                                <div key={feature.id} className="feature-tile">
                                    <span aria-hidden="true">OK</span>
                                    <div>
                                        <strong>{feature.name}</strong>
                                        {feature.description && <p>{feature.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="details-empty">No vehicle characteristics have been added for this listing.</p>
                    )}
                </div>
            </section>
        </div>
    );
};
