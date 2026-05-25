// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
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

const normalizeRequest = (item) => ({
  externalCarRequestID: item.externalCarRequestID ?? item.ExternalCarRequestID,
  accountID: item.accountID ?? item.AccountID,
  accountUsername: item.accountUsername ?? item.AccountUsername ?? '',
  accountEmail: item.accountEmail ?? item.AccountEmail ?? '',
  externalCarID: item.externalCarID ?? item.ExternalCarID ?? '',
  carName: item.carName ?? item.CarName ?? '',
  brand: item.brand ?? item.Brand ?? '',
  model: item.model ?? item.Model ?? '',
  year: item.year ?? item.Year ?? null,
  price: item.price ?? item.Price ?? null,
  currency: item.currency ?? item.Currency ?? 'EUR',
  mileage: item.mileage ?? item.Mileage ?? null,
  imageUrl: item.imageUrl ?? item.ImageUrl ?? '',
  detailUrl: item.detailUrl ?? item.DetailUrl ?? '',
  customerName: item.customerName ?? item.CustomerName ?? '',
  customerEmail: item.customerEmail ?? item.CustomerEmail ?? '',
  customerPhone: item.customerPhone ?? item.CustomerPhone ?? '',
  message: item.message ?? item.Message ?? '',
  status: item.status ?? item.Status ?? 'Pending',
  adminComment: item.adminComment ?? item.AdminComment ?? '',
  customerDecision: item.customerDecision ?? item.CustomerDecision ?? 'Pending',
  customerDecisionAt: item.customerDecisionAt ?? item.CustomerDecisionAt ?? null
});

const formatMoney = (value, currency = 'EUR') => {
  if (value === null || value === undefined || value === '') return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0
  }).format(Number(value));
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

export default function InterestedCustomersPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const interestedRequests = useMemo(
    () => requests.filter((request) => request.customerDecision === 'Interested'),
    [requests]
  );

  const loadRequests = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/external-car-requests');
      setRequests(getResponseList(response.data).map(normalizeRequest));
    } catch (err) {
      setError(getErrorMessage(err, 'Interested customers could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Buy Car Requests</h2>
          <p>Customers who accepted an import offer and are waiting to be contacted.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="phone-call" size={28} />
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="ak-admin-card">
        <Card.Body>
          <div className="ak-permissions-toolbar">
            <div>
              <h5>Contact queue</h5>
              <p>{interestedRequests.length} interested customer{interestedRequests.length === 1 ? '' : 's'}.</p>
            </div>
            <Button type="button" variant="light" onClick={loadRequests}>
              <FeatherIcon icon="refresh-cw" size={16} />
              <span>Refresh</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading interested customers...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Car</th>
                    <th>Offer</th>
                    <th>Decision Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {interestedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="ak-empty-cell">
                        No interested customers yet.
                      </td>
                    </tr>
                  ) : (
                    interestedRequests.map((request) => (
                      <tr key={request.externalCarRequestID}>
                        <td>
                          <strong>{request.customerName || request.accountUsername || request.accountID}</strong>
                          <span className="ak-table-muted">@{request.accountUsername || request.accountID}</span>
                        </td>
                        <td>
                          <div>{request.customerEmail || request.accountEmail || '-'}</div>
                          <span className="ak-table-muted">{request.customerPhone || '-'}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {request.imageUrl ? (
                              <img
                                src={request.imageUrl}
                                alt={request.carName}
                                style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 8 }}
                              />
                            ) : null}
                            <div>
                              <strong>{request.carName}</strong>
                              <span className="ak-table-muted">
                                {[request.year, request.brand, request.model].filter(Boolean).join(' - ') || request.externalCarID}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{formatMoney(request.price, request.currency)}</strong>
                          {request.adminComment && <span className="ak-table-muted">{request.adminComment}</span>}
                        </td>
                        <td>{formatDate(request.customerDecisionAt)}</td>
                        <td>
                          <Badge bg="success">Interested</Badge>
                          <span className="ak-table-muted">{request.status}</span>
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
