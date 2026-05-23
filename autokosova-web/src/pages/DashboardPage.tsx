import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import type { Booking } from '../lib/types';
import { bookingService } from '../services/bookingService';
import { tenantRequestService, type TenantRequestResponse } from '../services/tenantRequestService';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';

type DashboardTab = 'bookings' | 'profile';

const getStatusClass = (status: Booking['status']) => {
  if (status === 'Confirmed') return 'confirmed';
  if (status === 'Cancelled') return 'cancelled';
  if (status === 'Completed') return 'completed';
  return 'pending';
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tenantRequests, setTenantRequests] = useState<TenantRequestResponse[]>([]);
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('bookings');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRental = user?.role === 'Rental';
  const hasTenant = Boolean(user?.tenantID);
  const latestTenantRequest = tenantRequests[0];

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load your rentals.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTenantRequests = useCallback(async () => {
    if (!user || hasTenant || isRental) return;

    try {
      const data = await tenantRequestService.getMine();
      setTenantRequests(data);
    } catch {
      setTenantRequests([]);
    }
  }, [hasTenant, isRental, user]);

  useEffect(() => {
    void loadBookings();
    void loadTenantRequests();
  }, [loadBookings, loadTenantRequests]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((booking) => booking.status === 'Confirmed').length;
    const pending = bookings.filter((booking) => booking.status === 'PendingPayment').length;
    const totalSpent = bookings
      .filter((booking) => booking.status !== 'Cancelled')
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    return { confirmed, pending, totalSpent };
  }, [bookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      setBookings((current) => current.filter((booking) => booking.id !== bookingId));
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to cancel booking.'));
    }
  };

  if (isRental) {
    return <Navigate to="/seller" replace />;
  }

  return (
    <div className="customer-dashboard-page">
      <section className="customer-dashboard-hero">
        <div>
          <p className="eyebrow">My rentals</p>
          <h1>Your AutoKosova trips</h1>
          <p>Track active rentals, payment status, and your account details from one place.</p>
        </div>
        <Link to="/rent" className="customer-dashboard-primary">
          Browse rental cars
        </Link>
      </section>

      <section className="customer-dashboard-stats" aria-label="Rental summary">
        <div>
          <span>Total bookings</span>
          <strong>{bookings.length}</strong>
        </div>
        <div>
          <span>Confirmed</span>
          <strong>{stats.confirmed}</strong>
        </div>
        <div>
          <span>Pending payment</span>
          <strong>{stats.pending}</strong>
        </div>
        <div>
          <span>Total value</span>
          <strong>{formatCurrency(stats.totalSpent)}</strong>
        </div>
      </section>

      {!hasTenant && (
        <section className="customer-dashboard-callout">
          <div>
            <span>List cars for rent</span>
            <h2>Want to become a renter?</h2>
            <p>
              {latestTenantRequest?.status === 'Pending'
                ? 'Your tenant request is pending review.'
                : latestTenantRequest?.status === 'Rejected'
                  ? 'Your last tenant request was rejected. You can update your details and try again.'
                  : 'Send your business details and wait for SuperAdmin approval.'}
            </p>
          </div>
          <Link to="/tenant-request">
            {latestTenantRequest?.status === 'Pending' ? 'View request' : 'Send request'}
          </Link>
        </section>
      )}

      {error && <div className="customer-dashboard-error">{error}</div>}

      <div className="customer-dashboard-tabs">
        <button
          type="button"
          className={selectedTab === 'bookings' ? 'active' : undefined}
          onClick={() => setSelectedTab('bookings')}
        >
          Bookings
        </button>
        <button
          type="button"
          className={selectedTab === 'profile' ? 'active' : undefined}
          onClick={() => setSelectedTab('profile')}
        >
          Profile
        </button>
      </div>

      {selectedTab === 'bookings' && (
        <section className="customer-dashboard-section">
          <div className="customer-dashboard-section-heading">
            <div>
              <span>Rental history</span>
              <h2>Your bookings</h2>
            </div>
            <Link to="/rent">Find another car</Link>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : bookings.length > 0 ? (
            <div className="customer-booking-list">
              {bookings.map((booking) => (
                <article key={booking.id} className="customer-booking-card">
                  <div className="customer-booking-card__top">
                    <div>
                      <h3>
                        {booking.car?.brand && booking.car?.model
                          ? `${booking.car.brand} ${booking.car.model}`
                          : `Rental car #${booking.carId}`}
                      </h3>
                      <p>Booking #{booking.id}</p>
                    </div>
                    <span className={`customer-booking-status ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="customer-booking-meta">
                    <div>
                      <span>Start</span>
                      <strong>{formatDate(booking.startDate)}</strong>
                    </div>
                    <div>
                      <span>End</span>
                      <strong>{formatDate(booking.endDate)}</strong>
                    </div>
                    <div>
                      <span>Total</span>
                      <strong>{formatCurrency(booking.totalPrice)}</strong>
                    </div>
                    <div>
                      <span>Booked</span>
                      <strong>{formatDate(booking.createdAt)}</strong>
                    </div>
                  </div>

                  {booking.status === 'PendingPayment' && (
                    <button type="button" onClick={() => handleCancelBooking(booking.id)}>
                      Cancel booking
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="customer-dashboard-empty">
              <h3>No rentals yet</h3>
              <p>Choose a car, select your dates, and your bookings will appear here.</p>
              <Link to="/rent">Browse rental cars</Link>
            </div>
          )}
        </section>
      )}

      {selectedTab === 'profile' && (
        <section className="customer-dashboard-section customer-profile-panel">
          <div className="customer-dashboard-section-heading">
            <div>
              <span>Account</span>
              <h2>Profile information</h2>
            </div>
          </div>

          <div className="customer-profile-grid">
            <div>
              <span>Name</span>
              <strong>{user?.accountName} {user?.accountLastname}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user?.accountEmail}</strong>
            </div>
            <div>
              <span>Username</span>
              <strong>{user?.accountUsername}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{user?.role}</strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
