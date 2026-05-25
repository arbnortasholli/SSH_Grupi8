// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';
import authService from 'utils/authService';

const AUTO_KOSOVA_SOURCE = 'AutoKosova';

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
  reviewedByUsername: item.reviewedByUsername ?? item.ReviewedByUsername ?? '',
  externalCarID: item.externalCarID ?? item.ExternalCarID ?? '',
  source: item.source ?? item.Source ?? '',
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

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const getStatusVariant = (status) => {
  if (status === 'Approved') return 'success';
  if (status === 'Rejected') return 'danger';
  if (status === 'Contacted' || status === 'InProgress') return 'info';
  if (status === 'Completed') return 'dark';
  return 'warning';
};

const getRequestHeadline = (request) => {
  if (request.status === 'Approved') {
    return 'Customer is waiting for a phone call from our agent.';
  }

  if (request.status === 'Rejected') {
    return 'Request was rejected.';
  }

  return 'Review and answer this buy-car request.';
};

const isSuperAdmin = (user) => user?.role === 'SuperAdmin';
const isSeller = (user) => user?.role === 'Rental' || user?.role === 'Seller';

export default function BuyCarRequestsPage() {
  const user = authService.getUser();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [adminComment, setAdminComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canLoadAllRequests = isSuperAdmin(user);
  const sellerBlocked = isSeller(user) && !canLoadAllRequests;

  const buyRequests = useMemo(
    () => requests.filter((request) => request.source === AUTO_KOSOVA_SOURCE),
    [requests]
  );

  const pendingCount = useMemo(
    () => buyRequests.filter((request) => request.status === 'Pending').length,
    [buyRequests]
  );

  const loadRequests = async () => {
    if (!canLoadAllRequests) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/external-car-requests');
      setRequests(getResponseList(response.data).map(normalizeRequest));
    } catch (err) {
      setError(getErrorMessage(err, 'Buy-car requests could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const openModal = (request) => {
    setSelectedRequest(request);
    setStatus(request.status || 'Pending');
    setAdminComment(request.adminComment || '');
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setShowModal(false);
  };

  const quickUpdateStatus = async (request, nextStatus) => {
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      await apiClient.put(`/external-car-requests/${request.externalCarRequestID}/status`, {
        status: nextStatus,
        price: request.price,
        currency: request.currency || 'EUR',
        adminComment: request.adminComment || null
      });

      setMessage(`Buy-car request #${request.externalCarRequestID} updated to ${nextStatus}.`);
      await loadRequests();
    } catch (err) {
      setError(getErrorMessage(err, 'Buy-car request could not be updated.'));
    } finally {
      setIsSaving(false);
    }
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
        price: selectedRequest.price,
        currency: selectedRequest.currency || 'EUR',
        adminComment: adminComment.trim() || null
      });

      setMessage('Buy-car request updated successfully.');
      closeModal();
      await loadRequests();
    } catch (err) {
      setError(getErrorMessage(err, 'Buy-car request could not be updated.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Buy Car Requests</h2>
          <p>Review local AutoKosova sale-car requests and answer customers using the existing request workflow.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="shopping-bag" size={28} />
        </div>
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {sellerBlocked && (
        <Alert variant="warning">
          Seller-scoped buy-car requests cannot be shown safely yet. The current backend only exposes
          `GET /api/external-car-requests` for SuperAdmin users and does not provide seller ownership metadata
          or a seller-filtered request endpoint for local sale-car requests.
        </Alert>
      )}

      <Card className="ak-admin-card">
        <Card.Body>
          <div className="ak-permissions-toolbar">
            <div>
              <h5>Buy-car request list</h5>
              <p>{pendingCount} pending request{pendingCount === 1 ? '' : 's'} waiting for review.</p>
            </div>
            {canLoadAllRequests && (
              <Button type="button" variant="light" onClick={loadRequests}>
                <FeatherIcon icon="refresh-cw" size={16} />
                <span>Refresh</span>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading buy-car requests...</span>
            </div>
          ) : sellerBlocked ? (
            <div className="ak-empty-cell">
              Seller-scoped backend support is missing, so this page stays empty to avoid exposing unrelated requests.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Listing ID</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buyRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="ak-empty-cell">
                        No buy-car requests found.
                      </td>
                    </tr>
                  ) : (
                    buyRequests.map((request) => (
                      <tr key={request.externalCarRequestID}>
                        <td>
                          <strong>#{request.externalCarRequestID}</strong>
                        </td>
                        <td>
                          <strong>{request.customerName || request.accountUsername || request.accountID}</strong>
                          <span className="ak-table-muted">{request.customerEmail || request.accountEmail || '-'}</span>
                          <span className="ak-table-muted">{request.customerPhone || '-'}</span>
                        </td>
                        <td>
                          <strong>{request.carName || [request.brand, request.model].filter(Boolean).join(' ') || 'AutoKosova sale car'}</strong>
                          <span className="ak-table-muted">{[request.year, request.brand, request.model].filter(Boolean).join(' - ') || '-'}</span>
                        </td>
                        <td>
                          <span className="ak-table-muted">{request.externalCarID || '-'}</span>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(request.status)}>{request.status}</Badge>
                          <span className="ak-table-muted">{getRequestHeadline(request)}</span>
                        </td>
                        <td>{formatDate(request.createdAt)}</td>
                        <td>
                          <div className="ak-table-actions justify-content-end">
                            {request.status === 'Pending' ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="ak-admin-submit"
                                  disabled={isSaving}
                                  onClick={() => quickUpdateStatus(request, 'Approved')}
                                >
                                  <FeatherIcon icon="check" size={15} />
                                  <span>Approve</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  disabled={isSaving}
                                  onClick={() => quickUpdateStatus(request, 'Rejected')}
                                >
                                  <FeatherIcon icon="x" size={15} />
                                  <span>Reject</span>
                                </Button>
                              </>
                            ) : null}
                            <Button type="button" variant="light" size="sm" onClick={() => openModal(request)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Review</span>
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
            <Modal.Title>Review buy-car request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              <strong>{selectedRequest?.carName}</strong>
            </p>

            <Alert variant={selectedRequest?.status === 'Approved' ? 'success' : selectedRequest?.status === 'Rejected' ? 'danger' : 'warning'}>
              {selectedRequest ? getRequestHeadline(selectedRequest) : 'Review the request.'}
            </Alert>

            <Form.Group className="mb-3" controlId="buyCarRequestStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Contacted">Contacted</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="buyCarRequestAdminComment">
              <Form.Label>Response / comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={adminComment}
                onChange={(event) => setAdminComment(event.target.value)}
                placeholder="Optional note for internal tracking or customer follow-up."
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
