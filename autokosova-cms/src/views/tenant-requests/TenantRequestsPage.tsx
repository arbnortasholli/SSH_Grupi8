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

const normalizeTenantRequest = (item) => ({
  tenantRequestID: item.tenantRequestID ?? item.TenantRequestID,
  accountID: item.accountID ?? item.AccountID,
  accountUsername: item.accountUsername ?? item.AccountUsername ?? '',
  accountEmail: item.accountEmail ?? item.AccountEmail ?? '',
  reviewedByAccountID: item.reviewedByAccountID ?? item.ReviewedByAccountID ?? null,
  reviewedByUsername: item.reviewedByUsername ?? item.ReviewedByUsername ?? '',
  createdTenantID: item.createdTenantID ?? item.CreatedTenantID ?? null,
  businessName: item.businessName ?? item.BusinessName ?? '',
  businessNumber: item.businessNumber ?? item.BusinessNumber ?? '',
  businessEmail: item.businessEmail ?? item.BusinessEmail ?? '',
  businessPhoneNumber: item.businessPhoneNumber ?? item.BusinessPhoneNumber ?? '',
  businessCity: item.businessCity ?? item.BusinessCity ?? '',
  businessAddress: item.businessAddress ?? item.BusinessAddress ?? '',
  message: item.message ?? item.Message ?? '',
  status: item.status ?? item.Status ?? 'Pending',
  adminComment: item.adminComment ?? item.AdminComment ?? '',
  createdAt: item.createdAt ?? item.CreatedAt,
  reviewedAt: item.reviewedAt ?? item.ReviewedAt
});

const getStatusVariant = (status) => {
  if (status === 'Approved') return 'success';
  if (status === 'Rejected') return 'danger';
  return 'warning';
};

export default function TenantRequestsPage() {
  const [tenantRequests, setTenantRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const pendingCount = useMemo(
    () => tenantRequests.filter((item) => item.status === 'Pending').length,
    [tenantRequests]
  );

  const loadTenantRequests = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/tenant-requests');
      setTenantRequests(getResponseList(response.data).map(normalizeTenantRequest));
    } catch (err) {
      setError(getErrorMessage(err, 'Tenant requests could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenantRequests();
  }, []);

  const openReviewModal = (tenantRequest, status) => {
    setSelectedRequest(tenantRequest);
    setReviewStatus(status);
    setAdminComment('');
    setMessage('');
    setError('');
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setSelectedRequest(null);
    setReviewStatus('');
    setAdminComment('');
    setShowReviewModal(false);
  };

  const handleReview = async (event) => {
    event.preventDefault();

    if (!selectedRequest || !reviewStatus) return;

    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      await apiClient.put(`/tenant-requests/${selectedRequest.tenantRequestID}/review`, {
        status: reviewStatus,
        adminComment: adminComment.trim() || null
      });

      setMessage(`Tenant request ${reviewStatus.toLowerCase()} successfully.`);
      closeReviewModal();
      await loadTenantRequests();
    } catch (err) {
      setError(getErrorMessage(err, 'Tenant request could not be reviewed.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Tenant Requests</h2>
          <p>Review renter applications and approve or reject tenant onboarding.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="briefcase" size={28} />
        </div>
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="ak-admin-card">
        <Card.Body>
          <div className="ak-permissions-toolbar">
            <div>
              <h5>Request list</h5>
              <p>{pendingCount} pending request{pendingCount === 1 ? '' : 's'} waiting for review.</p>
            </div>
            <Button type="button" variant="light" onClick={loadTenantRequests}>
              <FeatherIcon icon="refresh-cw" size={16} />
              <span>Refresh</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading tenant requests...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Applicant</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ak-empty-cell">
                        No tenant requests found.
                      </td>
                    </tr>
                  ) : (
                    tenantRequests.map((tenantRequest) => (
                      <tr key={tenantRequest.tenantRequestID}>
                        <td>
                          <strong>{tenantRequest.businessName}</strong>
                          <span className="ak-table-muted">{tenantRequest.businessCity || '-'}</span>
                        </td>
                        <td>
                          <strong>@{tenantRequest.accountUsername || tenantRequest.accountID}</strong>
                          <span className="ak-table-muted">{tenantRequest.accountEmail}</span>
                        </td>
                        <td>
                          <div>{tenantRequest.businessEmail || '-'}</div>
                          <span className="ak-table-muted">{tenantRequest.businessPhoneNumber || '-'}</span>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(tenantRequest.status)}>{tenantRequest.status}</Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            {tenantRequest.status === 'Pending' ? (
                              <>
                                <Button
                                  type="button"
                                  variant="light"
                                  size="sm"
                                  onClick={() => openReviewModal(tenantRequest, 'Approved')}
                                >
                                  <FeatherIcon icon="check" size={15} />
                                  <span>Approve</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => openReviewModal(tenantRequest, 'Rejected')}
                                >
                                  <FeatherIcon icon="x" size={15} />
                                  <span>Reject</span>
                                </Button>
                              </>
                            ) : (
                              <span className="ak-table-muted">{tenantRequest.reviewedByUsername || '-'}</span>
                            )}
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

      <Modal show={showReviewModal} onHide={closeReviewModal} centered>
        <Form onSubmit={handleReview}>
          <Modal.Header closeButton>
            <Modal.Title>{reviewStatus === 'Approved' ? 'Approve tenant request' : 'Reject tenant request'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              {selectedRequest?.businessName}
            </p>
            <Form.Group controlId="adminComment">
              <Form.Label>Admin comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={adminComment}
                onChange={(event) => setAdminComment(event.target.value)}
                placeholder="Optional note for this review."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeReviewModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : reviewStatus === 'Approved' ? 'Approve' : 'Reject'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
