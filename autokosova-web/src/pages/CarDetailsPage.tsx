import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Car, ExternalCarRequest } from '../lib/types';
import { carService } from '../services/carService';
import { bookingService } from '../services/bookingService';
import { externalCarService } from '../services/externalCarService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { daysBetween, formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const ACTIVE_BUY_REQUEST_STATUSES = new Set(['Pending', 'Approved', 'Contacted', 'InProgress']);

const getBuyRequestStatusMessage = (request: ExternalCarRequest | null) => {
    if (!request) return null;

    if (request.status === 'Approved') {
        return 'Your request has been approved. One of our agents will call you soon to discuss and finalize the car purchase.';
    }

    if (request.status === 'Rejected') {
        return 'Your buy request was rejected. Please contact AutoKosova if you need more information.';
    }

    if (request.status === 'Contacted' || request.status === 'InProgress') {
        return 'Your request is being processed. Please wait for a phone call from one of our agents.';
    }

    return 'Your request has been sent. Please wait while our team reviews it.';
};

export const CarDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [car, setCar] = useState<Car | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isSubmittingBuyRequest, setIsSubmittingBuyRequest] = useState(false);
    const [isRequestStatusLoading, setIsRequestStatusLoading] = useState(false);
    const [buyRequest, setBuyRequest] = useState<ExternalCarRequest | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [purchaseForm, setPurchaseForm] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerCity: '',
        message: '',
    });

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

    useEffect(() => {
        setPurchaseForm((current) => ({
            ...current,
            customerName: current.customerName || [user?.accountName ?? user?.firstName, user?.accountLastname ?? user?.lastName].filter(Boolean).join(' '),
            customerEmail: current.customerEmail || user?.accountEmail || user?.email || '',
        }));
    }, [user]);

    const loadBuyRequestStatus = useCallback(async () => {
        if (!isAuthenticated || !id || !car || car.priceType !== 'sale') {
            setBuyRequest(null);
            return;
        }

        setIsRequestStatusLoading(true);
        try {
            const requests = await externalCarService.getMyRequests();
            const latestRequest = requests
                .filter((request) => request.source === 'AutoKosova' && request.externalCarID === id)
                .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null;
            setBuyRequest(latestRequest);
        } catch (err: unknown) {
            setPurchaseError(getErrorMessage(err, 'Could not load your buy request status.'));
        } finally {
            setIsRequestStatusLoading(false);
        }
    }, [car, id, isAuthenticated]);

    useEffect(() => {
        void loadBuyRequestStatus();
    }, [loadBuyRequestStatus]);

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
            const booking = await bookingService.createBooking({
                carId: id,
                startDate,
                endDate,
            });

            if (!booking.checkoutUrl) {
                throw new Error('Checkout URL was not returned by the API.');
            }

            window.location.href = booking.checkoutUrl;
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to create booking'));
        } finally {
            setIsBooking(false);
        }
    };

    const updatePurchaseField = (field: keyof typeof purchaseForm, value: string) => {
        setPurchaseForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const redirectToLogin = () => {
        navigate('/login', { state: { returnTo: `/cars/${id}` } });
    };

    const handlePurchaseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!car) return;

        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        if (buyRequest && ACTIVE_BUY_REQUEST_STATUSES.has(buyRequest.status)) {
            setPurchaseError(getBuyRequestStatusMessage(buyRequest));
            return;
        }

        setIsSubmittingBuyRequest(true);
        setPurchaseError(null);
        setPurchaseSuccess(null);

        try {
            await externalCarService.createAutoKosovaBuyRequest(car, {
                customerName: purchaseForm.customerName.trim(),
                customerEmail: purchaseForm.customerEmail.trim(),
                customerPhone: purchaseForm.customerPhone.trim(),
                message: [purchaseForm.customerCity.trim(), purchaseForm.message.trim()].filter(Boolean).join(' | '),
            });
            await loadBuyRequestStatus();
            setPurchaseSuccess('Your request has been sent. Please wait while our team reviews it.');
            setIsPurchaseModalOpen(false);
        } catch (err: unknown) {
            setPurchaseError(getErrorMessage(err, 'Failed to send your buy request.'));
        } finally {
            setIsSubmittingBuyRequest(false);
        }
    };

    const featureList = useMemo(() => car?.features ?? [], [car]);

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
    const buyRequestStatusMessage = getBuyRequestStatusMessage(buyRequest);
    const isBuyRequestBlocked = Boolean(buyRequest && ACTIVE_BUY_REQUEST_STATUSES.has(buyRequest.status));
    const quickFacts = [
        { label: 'City', value: car.city ?? 'Not listed' },
        { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
        { label: 'Fuel', value: car.fuelType },
        { label: 'Gearbox', value: car.transmission },
    ];

    return (
        <div className="car-details-page">
            {error && <div className="car-details-alert">{error}</div>}
            {purchaseSuccess && <div className="car-details-alert car-details-alert--success">{purchaseSuccess}</div>}

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
                            {isRequestStatusLoading ? (
                                <div className="booking-available">Loading your request status...</div>
                            ) : buyRequestStatusMessage ? (
                                <div className="booking-available">{buyRequestStatusMessage}</div>
                            ) : null}
                            <button
                                type="button"
                                className="details-primary-action"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        redirectToLogin();
                                        return;
                                    }

                                    setPurchaseError(null);
                                    setIsPurchaseModalOpen(true);
                                }}
                                disabled={isBuyRequestBlocked}
                            >
                                {isBuyRequestBlocked ? 'Request already sent' : 'Buy this car'}
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

            <Modal
                isOpen={isPurchaseModalOpen}
                title={`Buy ${car.brand} ${car.model}`}
                onClose={() => {
                    setIsPurchaseModalOpen(false);
                }}
                cancelText=""
            >
                <form className="purchase-form" onSubmit={handlePurchaseSubmit}>
                    {purchaseError && (
                        <div className="auth-alert" role="alert">
                            {purchaseError}
                        </div>
                    )}
                    <div className="purchase-summary">
                        <div>
                            <span>Selected car</span>
                            <strong>{car.year} {car.brand} {car.model}</strong>
                        </div>
                        <div>
                            <span>Listed price</span>
                            <strong>{formatCurrency(car.price)}</strong>
                        </div>
                    </div>

                    <div className="purchase-form-grid">
                        <label>
                            <span>Full name</span>
                            <input
                                required
                                value={purchaseForm.customerName}
                                onChange={(event) => updatePurchaseField('customerName', event.target.value)}
                            />
                        </label>
                        <label>
                            <span>Email</span>
                            <input
                                required
                                type="email"
                                value={purchaseForm.customerEmail}
                                onChange={(event) => updatePurchaseField('customerEmail', event.target.value)}
                            />
                        </label>
                        <label>
                            <span>Phone number</span>
                            <input
                                required
                                value={purchaseForm.customerPhone}
                                onChange={(event) => updatePurchaseField('customerPhone', event.target.value)}
                            />
                        </label>
                        <label>
                            <span>City</span>
                            <input
                                required
                                value={purchaseForm.customerCity}
                                onChange={(event) => updatePurchaseField('customerCity', event.target.value)}
                            />
                        </label>
                    </div>

                    <label>
                        <span>Message to AutoKosova</span>
                        <textarea
                            rows={4}
                            value={purchaseForm.message}
                            onChange={(event) => updatePurchaseField('message', event.target.value)}
                            placeholder="Add any notes about financing, preferred contact time, or questions about the car."
                        />
                    </label>

                    <div className="purchase-actions">
                        <button type="button" className="details-secondary-action" onClick={() => setIsPurchaseModalOpen(false)}>
                            Close
                        </button>
                        <button type="submit" className="details-primary-action" disabled={isSubmittingBuyRequest}>
                            {isSubmittingBuyRequest ? 'Sending request...' : 'Send buy request'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
