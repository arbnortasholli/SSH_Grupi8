// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';

// react-bootstrap
import { Alert, Badge, Card, Col, Row, Spinner, Table } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// project imports
import apiClient from 'config/apiClient';

const numberFormatter = new Intl.NumberFormat('en-US');
const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
});

const formatNumber = (value) => numberFormatter.format(Number(value || 0));
const formatMoney = (value) => moneyFormatter.format(Number(value || 0));

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const getStatusVariant = (status = '') => {
  const normalizedStatus = status.toLowerCase();

  if (['approved', 'available', 'confirmed', 'paid'].includes(normalizedStatus)) {
    return 'success';
  }

  if (['pending', 'pendingpayment', 'inreview'].includes(normalizedStatus)) {
    return 'warning';
  }

  if (['rejected', 'failed', 'cancelled', 'unavailable'].includes(normalizedStatus)) {
    return 'danger';
  }

  return 'secondary';
};

export default function DashSales() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await apiClient.get('/dashboard/summary');

        if (isMounted) {
          setSummary(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.response?.data?.message || 'Dashboard data could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        title: 'Total Cars',
        value: summary?.totalCars,
        icon: 'truck',
        description: `${formatNumber(summary?.availableCars)} available now`
      },
      {
        title: 'For Sale',
        value: summary?.carsForSale,
        icon: 'tag',
        description: 'Cars published for direct sale'
      },
      {
        title: 'For Rent',
        value: summary?.carsForRent,
        icon: 'calendar',
        description: 'Cars active in rental flow'
      },
      {
        title: 'Active Tenants',
        value: summary?.activeTenants,
        icon: 'briefcase',
        description: `${formatNumber(summary?.pendingTenantRequests)} pending requests`
      },
      {
        title: 'Active Bookings',
        value: summary?.activeBookings,
        icon: 'check-square',
        description: `${formatNumber(summary?.bookingsThisMonth)} created this month`
      },
      {
        title: 'Pending Payments',
        value: summary?.pendingPayments,
        icon: 'credit-card',
        description: `${formatNumber(summary?.failedPayments)} failed payments`
      },
      {
        title: 'Accounts',
        value: summary?.totalAccounts,
        icon: 'users',
        description: `${formatNumber(summary?.activeAccounts)} active accounts`
      },
      {
        title: 'Revenue This Month',
        value: formatMoney(summary?.revenueThisMonth),
        icon: 'dollar-sign',
        description: 'Based on paid payment orders',
        isFormatted: true
      }
    ],
    [summary]
  );

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Dashboard</h2>
          <p>Monitor cars, tenants, bookings, accounts and payment activity from one place.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="bar-chart-2" size={28} />
        </div>
      </div>

      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Card className="ak-admin-card">
          <Card.Body>
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              Loading dashboard data...
            </div>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            {cards.map((card) => (
              <Col key={card.title} sm={6} xl={3}>
                <Card className="ak-admin-card ak-dashboard-card">
                  <Card.Body>
                    <div className="ak-dashboard-card__icon">
                      <FeatherIcon icon={card.icon} size={22} />
                    </div>
                    <span>{card.title}</span>
                    <strong>{card.isFormatted ? card.value : formatNumber(card.value)}</strong>
                    <p>{card.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row>
            <Col xl={6}>
              <Card className="ak-admin-card mb-4">
                <Card.Body>
                  <div className="ak-permissions-toolbar">
                    <div>
                      <h5>Recent Cars</h5>
                      <p>Latest cars added to the platform.</p>
                    </div>
                  </div>
                  <Table responsive hover className="ak-permissions-table">
                    <thead>
                      <tr>
                        <th>Car</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary?.recentCars?.length ? (
                        summary.recentCars.map((car) => (
                          <tr key={car.carsID}>
                            <td>
                              <strong>{car.title || `${car.brand} ${car.model}`}</strong>
                              <span className="ak-table-muted">
                                {[car.brand, car.model, car.year].filter(Boolean).join(' ')}
                              </span>
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(car.status)}>{car.status || '-'}</Badge>
                            </td>
                            <td>{formatDate(car.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="ak-empty-cell">
                            No recent cars found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={6}>
              <Card className="ak-admin-card mb-4">
                <Card.Body>
                  <div className="ak-permissions-toolbar">
                    <div>
                      <h5>Tenant Requests</h5>
                      <p>Newest businesses waiting for review.</p>
                    </div>
                  </div>
                  <Table responsive hover className="ak-permissions-table">
                    <thead>
                      <tr>
                        <th>Business</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary?.recentTenantRequests?.length ? (
                        summary.recentTenantRequests.map((request) => (
                          <tr key={request.tenantRequestID}>
                            <td>
                              <strong>{request.businessName}</strong>
                              <span className="ak-table-muted">{request.businessCity || 'No city'}</span>
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(request.status)}>{request.status || '-'}</Badge>
                            </td>
                            <td>{formatDate(request.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="ak-empty-cell">
                            No tenant requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={12}>
              <Card className="ak-admin-card">
                <Card.Body>
                  <div className="ak-permissions-toolbar">
                    <div>
                      <h5>Recent Bookings</h5>
                      <p>Latest rental activity and booking value.</p>
                    </div>
                  </div>
                  <Table responsive hover className="ak-permissions-table">
                    <thead>
                      <tr>
                        <th>Booking</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary?.recentBookings?.length ? (
                        summary.recentBookings.map((booking) => (
                          <tr key={booking.rentalBookingID}>
                            <td>
                              <strong>#{booking.rentalBookingID}</strong>
                              <span className="ak-table-muted">Car #{booking.carID}</span>
                            </td>
                            <td>#{booking.customerAccountID}</td>
                            <td>
                              <Badge bg={getStatusVariant(booking.status)}>{booking.status || '-'}</Badge>
                            </td>
                            <td>{formatMoney(booking.totalPrice)}</td>
                            <td>{formatDate(booking.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="ak-empty-cell">
                            No recent bookings found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
