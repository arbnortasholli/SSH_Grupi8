import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { PaymentStatusResponse } from '../lib/types';
import { bookingService } from '../services/bookingService';
import { formatCurrency, getErrorMessage } from '../utils/helpers';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const PaymentStatusPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const paymentOrderID = useMemo(() => Number(searchParams.get('paymentOrderId')), [searchParams]);
    const rentalBookingID = useMemo(() => Number(searchParams.get('rentalBookingId')), [searchParams]);

    useEffect(() => {
        let isMounted = true;
        let attempts = 0;
        let timeoutId: number | undefined;

        const loadStatus = async () => {
            if (!paymentOrderID && !rentalBookingID) {
                if (isMounted) {
                    setError('Payment reference is missing.');
                    setIsLoading(false);
                }
                return;
            }

            if (attempts === 0) {
                setIsLoading(true);
            }

            if (isMounted) {
                setError(null);
            }

            try {
                const result = paymentOrderID
                    ? await bookingService.getPaymentStatus(paymentOrderID)
                    : await bookingService.getPaymentStatusByBooking(rentalBookingID);

                if (!isMounted) {
                    return;
                }

                setPaymentStatus(result);

                if (result.paymentStatus === 'Pending' && attempts < 6) {
                    attempts += 1;
                    timeoutId = window.setTimeout(loadStatus, 3000);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(getErrorMessage(err, 'Payment status could not be loaded.'));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadStatus();

        return () => {
            isMounted = false;
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [paymentOrderID, rentalBookingID]);

    if (isLoading) {
        return (
            <div className="payment-status-page">
                <LoadingSpinner />
            </div>
        );
    }

    const isPaid = paymentStatus?.paymentStatus === 'Paid';
    const isCancelled = paymentStatus?.paymentStatus === 'Cancelled';
    const statusVariant = isPaid ? 'paid' : isCancelled ? 'cancelled' : 'pending';
    const title = isPaid ? 'Booking confirmed' : isCancelled ? 'Payment cancelled' : 'Payment in progress';
    const description = isPaid
        ? 'Your rental is confirmed. AutoKosova has verified the payment and saved the booking.'
        : isCancelled
            ? 'This checkout was cancelled. Your rental booking was not confirmed.'
            : 'We are verifying the payment with Stripe. This usually updates automatically within a few seconds.';

    return (
        <div className="payment-status-page">
            <section className={`payment-status-panel ${statusVariant}`}>
                <div className="payment-status-header">
                    <div className={`payment-status-mark ${statusVariant}`} aria-hidden="true">
                        <span />
                    </div>
                    <div>
                        <span className={`payment-status-badge ${statusVariant}`}>
                            {paymentStatus?.paymentStatus ?? 'Unknown'}
                        </span>
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                </div>

                {error && <div className="payment-status-error">{error}</div>}

                {paymentStatus && (
                    <div className="payment-status-details">
                        <div>
                            <span>Booking reference</span>
                            <strong>#{paymentStatus.rentalBookingID}</strong>
                        </div>
                        <div>
                            <span>Payment reference</span>
                            <strong>#{paymentStatus.paymentOrderID}</strong>
                        </div>
                        <div>
                            <span>Total amount</span>
                            <strong>{formatCurrency(paymentStatus.amount, paymentStatus.currency.toUpperCase())}</strong>
                        </div>
                        <div>
                            <span>Booking status</span>
                            <strong>{paymentStatus.rentalBookingStatus}</strong>
                        </div>
                    </div>
                )}

                {!isPaid && !isCancelled && (
                    <div className="payment-status-note">
                        <span aria-hidden="true" />
                        <p>Keep this page open while AutoKosova checks the latest Stripe status.</p>
                    </div>
                )}

                <div className="payment-status-actions">
                    <Link to="/rent" className="payment-status-button secondary">Browse rentals</Link>
                    <Link to="/" className="payment-status-button primary">Go home</Link>
                </div>
            </section>
        </div>
    );
};
