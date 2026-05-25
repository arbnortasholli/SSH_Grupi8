// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
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

const getImageSource = (imageUrl) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const apiBaseUrl = apiClient.defaults.baseURL || '';
  const apiOrigin = apiBaseUrl.replace(/\/api\/?$/i, '');

  return `${apiOrigin}${imageUrl}`;
};

const normalizeRequest = (item) => ({
  externalCarRequestID: item.externalCarRequestID ?? item.ExternalCarRequestID,
  accountID: item.accountID ?? item.AccountID,
  accountUsername: item.accountUsername ?? item.AccountUsername ?? '',
  accountEmail: item.accountEmail ?? item.AccountEmail ?? '',
  reviewedByUsername: item.reviewedByUsername ?? item.ReviewedByUsername ?? '',
  externalCarID: item.externalCarID ?? item.ExternalCarID ?? '',
  source: item.source ?? item.Source ?? '-',
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
  customerDecisionAt: item.customerDecisionAt ?? item.CustomerDecisionAt ?? null,
  createdAt: item.createdAt ?? item.CreatedAt,
  reviewedAt: item.reviewedAt ?? item.ReviewedAt
});

const formatMoney = (value, currency = 'EUR') => {
  if (value === null || value === undefined || value === '') return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0
  }).format(Number(value));
};

const formatMileage = (value) => {
  if (!value) return '-';
  return `${Number(value).toLocaleString()} km`;
};

const getStatusVariant = (status) => {
  if (status === 'Approved' || status === 'Completed') return 'success';
  if (status === 'Rejected') return 'danger';
  if (status === 'Contacted' || status === 'InProgress') return 'info';
  return 'warning';
};

export default function ExternalCarRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [adminComment, setAdminComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === 'Pending').length,
    [requests]
  );

  const loadRequests = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/external-car-requests');
      setRequests(getResponseList(response.data).map(normalizeRequest));
    } catch (err) {
      setError(getErrorMessage(err, 'External car requests could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openModal = (request) => {
    setSelectedRequest(request);
    setStatus(request.status || 'Pending');
    setPrice(request.price ?? '');
    setCurrency(request.currency || 'EUR');
    setAdminComment(request.adminComment || '');
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setShowModal(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedRequest) return;

    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      await apiClient.put(`/external-car-requests/${selectedRequest.externalCarRequestID}/status`, {
        status,
        price: price === '' ? null : Number(price),
        currency: currency.trim() || 'EUR',
        adminComment: adminComment.trim() || null
      });

      setMessage('External car request updated successfully.');
      closeModal();
      await loadRequests();
    } catch (err) {
      setError(getErrorMessage(err, 'External car request could not be updated.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>External Car Requests</h2>
          <p>Review imported car requests and set the final customer price manually.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="truck" size={28} />
        </div>
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="ak-admin-card">
        <Card.Body>
          <div className="ak-permissions-toolbar">
            <div>
              <h5>Request list</h5>
              <p>{pendingCount} pending request{pendingCount === 1 ? '' : 's'} waiting for pricing.</p>
            </div>
            <Button type="button" variant="light" onClick={loadRequests}>
              <FeatherIcon icon="refresh-cw" size={16} />
              <span>Refresh</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading external car requests...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Car</th>
                    <th>Customer</th>
                    <th>Specs</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="ak-empty-cell">
                        No external car requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.externalCarRequestID}>
                        <td>
                          <span>{request.source || '-'}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {request.imageUrl ? (
                              <img
                                src={getImageSource(request.imageUrl)}
                                alt={request.carName}
                                style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 8 }}
                              />
                            ) : null}
                            <div>
                              <strong>{request.carName}</strong>
                              <span className="ak-table-muted">{request.externalCarID}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{request.customerName || request.accountUsername || request.accountID}</strong>
                          <span className="ak-table-muted">{request.customerEmail || request.accountEmail}</span>
                          <span className="ak-table-muted">{request.customerPhone || '-'}</span>
                        </td>
                        <td>
                          <div>{[request.year, request.brand, request.model].filter(Boolean).join(' - ') || '-'}</div>
                          <span className="ak-table-muted">{formatMileage(request.mileage)}</span>
                        </td>
                        <td>
                          <strong>{formatMoney(request.price, request.currency)}</strong>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(request.status)}>{request.status}</Badge>
                        </td>
                        <td>
                          <Badge bg={request.customerDecision === 'Interested' ? 'success' : request.customerDecision === 'Declined' ? 'secondary' : 'light'}>
                            {request.customerDecision}
                          </Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            <Button type="button" variant="light" size="sm" onClick={() => openModal(request)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Price / Status</span>
                            </Button>
                          </div>
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

      <Modal show={showModal} onHide={closeModal} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>Set request price</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              <strong>{selectedRequest?.carName}</strong>
            </p>

            <Form.Group className="mb-3" controlId="externalRequestPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Example: 18500"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="externalRequestCurrency">
              <Form.Label>Currency</Form.Label>
              <Form.Select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="KRW">KRW</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="externalRequestStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="InProgress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="externalRequestAdminComment">
              <Form.Label>Admin comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={adminComment}
                onChange={(event) => setAdminComment(event.target.value)}
                placeholder="Optional internal note."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}





