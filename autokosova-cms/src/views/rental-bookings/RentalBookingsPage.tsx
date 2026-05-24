// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.Error === 'string') return data.Error;

  return error?.message || fallback;
};

const getResponseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Data)) return payload.Data;
  if (Array.isArray(payload?.$values)) return payload.$values;
  if (Array.isArray(payload?.data?.$values)) return payload.data.$values;
  if (Array.isArray(payload?.Data?.$values)) return payload.Data.$values;

  return [];
};

const normalizeBooking = (item) => ({
  rentalBookingID: item.rentalBookingID ?? item.RentalBookingID,
  tenantID: item.tenantID ?? item.TenantID,
  tenantName: item.tenantName ?? item.TenantName ?? '',
  carID: item.carID ?? item.CarID,
  carTitle: item.carTitle ?? item.CarTitle ?? '',
  carBrand: item.carBrand ?? item.CarBrand ?? '',
  carModel: item.carModel ?? item.CarModel ?? '',
  carYear: item.carYear ?? item.CarYear ?? '',
  customerAccountID: item.customerAccountID ?? item.CustomerAccountID,
  customerName: item.customerName ?? item.CustomerName ?? '',
  customerEmail: item.customerEmail ?? item.CustomerEmail ?? '',
  customerPhoneNumber: item.customerPhoneNumber ?? item.CustomerPhoneNumber ?? '',
  customerCity: item.customerCity ?? item.CustomerCity ?? '',
  rentalBookingStartDate: item.rentalBookingStartDate ?? item.RentalBookingStartDate,
  rentalBookingEndDate: item.rentalBookingEndDate ?? item.RentalBookingEndDate,
  rentalBookingDailyPrice: item.rentalBookingDailyPrice ?? item.RentalBookingDailyPrice ?? 0,
  rentalBookingTotalPrice: item.rentalBookingTotalPrice ?? item.RentalBookingTotalPrice ?? 0,
  rentalBookingStatus: item.rentalBookingStatus ?? item.RentalBookingStatus ?? '',
  rentalBookingCreationDate: item.rentalBookingCreationDate ?? item.RentalBookingCreationDate,
  paymentStatus: item.paymentStatus ?? item.PaymentStatus ?? '',
  paymentAmount: item.paymentAmount ?? item.PaymentAmount,
  paymentPaidDate: item.paymentPaidDate ?? item.PaymentPaidDate
});

const getStatusVariant = (status = '') => {
  const normalizedStatus = status.toLowerCase();

  if (['confirmed', 'completed', 'paid'].includes(normalizedStatus)) return 'success';
  if (['pending', 'pendingpayment'].includes(normalizedStatus)) return 'warning';
  if (['cancelled', 'failed'].includes(normalizedStatus)) return 'danger';

  return 'secondary';
};

const formatDate = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export default function RentalBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadBookings = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/rental-bookings/admin');
      setBookings(getResponseList(response.data).map(normalizeBooking));
    } catch (err) {
      setError(getErrorMessage(err, 'Rental bookings could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const statuses = useMemo(() => {
    const uniqueStatuses = bookings
      .map((booking) => booking.rentalBookingStatus)
      .filter(Boolean)
      .filter((status, index, list) => list.indexOf(status) === index);

    return ['All', ...uniqueStatuses];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'All' || booking.rentalBookingStatus === statusFilter;
      const searchable = [
        booking.customerName,
        booking.customerEmail,
        booking.customerPhoneNumber,
        booking.carTitle,
        booking.carBrand,
        booking.carModel,
        booking.tenantName
      ]
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [bookings, searchTerm, statusFilter]);

  const activeBookings = bookings.filter((booking) =>
    ['Confirmed', 'PendingPayment'].includes(booking.rentalBookingStatus)
  ).length;

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Rental Bookings</h2>
          <p>See every customer who has requested or rented a car, with contact, car, booking and payment details.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="calendar" size={28} />
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={4}>
          <Card className="ak-admin-card ak-dashboard-card">
            <Card.Body>
              <div className="ak-dashboard-card__icon">
                <FeatherIcon icon="list" size={22} />
              </div>
              <span>Total Bookings</span>
              <strong>{bookings.length}</strong>
              <p>All non-deleted rental bookings.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-dashboard-card">
            <Card.Body>
              <div className="ak-dashboard-card__icon">
                <FeatherIcon icon="check-circle" size={22} />
              </div>
              <span>Active Bookings</span>
              <strong>{activeBookings}</strong>
              <p>Confirmed or waiting for payment.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-dashboard-card">
            <Card.Body>
              <div className="ak-dashboard-card__icon">
                <FeatherIcon icon="filter" size={22} />
              </div>
              <span>Visible Results</span>
              <strong>{filteredBookings.length}</strong>
              <p>After search and status filters.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="ak-admin-card">
        <Card.Body>
          <div className="ak-permissions-toolbar">
            <div>
              <h5>Booked cars</h5>
              <p>Customer contact details and rental information in one operational view.</p>
            </div>
            <Button type="button" variant="light" onClick={loadBookings}>
              <FeatherIcon icon="refresh-cw" size={16} />
              <span>Refresh</span>
            </Button>
          </div>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Control
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by customer, phone, email, car or tenant"
              />
            </Col>
            <Col md={4}>
              <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All statuses' : status}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading rental bookings...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Rental Dates</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="ak-empty-cell">
                        No rental bookings found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.rentalBookingID}>
                        <td>
                          <strong>{booking.customerName || `Account #${booking.customerAccountID}`}</strong>
                          <span className="ak-table-muted">{booking.customerEmail || '-'}</span>
                          <span className="ak-table-muted">
                            {[booking.customerPhoneNumber, booking.customerCity].filter(Boolean).join(' · ') || '-'}
                          </span>
                        </td>
                        <td>
                          <strong>{booking.carTitle || `${booking.carBrand} ${booking.carModel}`}</strong>
                          <span className="ak-table-muted">
                            {[booking.carBrand, booking.carModel, booking.carYear].filter(Boolean).join(' ')}
                          </span>
                          <span className="ak-table-muted">{booking.tenantName || `Tenant #${booking.tenantID}`}</span>
                        </td>
                        <td>
                          <strong>
                            {formatDate(booking.rentalBookingStartDate)} - {formatDate(booking.rentalBookingEndDate)}
                          </strong>
                          <span className="ak-table-muted">{formatMoney(booking.rentalBookingDailyPrice)} / day</span>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(booking.rentalBookingStatus)}>
                            {booking.rentalBookingStatus || '-'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(booking.paymentStatus)}>{booking.paymentStatus || 'No payment'}</Badge>
                          <span className="ak-table-muted">
                            {booking.paymentPaidDate ? `Paid ${formatDate(booking.paymentPaidDate)}` : 'Not paid yet'}
                          </span>
                        </td>
                        <td className="text-end">
                          <strong>{formatMoney(booking.rentalBookingTotalPrice)}</strong>
                          <span className="ak-table-muted">Booking #{booking.rentalBookingID}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
