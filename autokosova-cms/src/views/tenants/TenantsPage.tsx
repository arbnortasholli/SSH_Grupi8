// @ts-nocheck
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const emptyForm = {
  ownerAccountID: '',
  tenantName: '',
  tenantBusinessNumber: '',
  tenantEmail: '',
  tenantPhoneNumber: '',
  tenantCity: '',
  tenantAddress: '',
  tenantIsActive: true
};

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

const normalizeTenant = (item) => ({
  tenantID: item.tenantID ?? item.TenantID,
  ownerAccountID: item.ownerAccountID ?? item.OwnerAccountID ?? null,
  ownerUsername: item.ownerUsername ?? item.OwnerUsername ?? '',
  ownerEmail: item.ownerEmail ?? item.OwnerEmail ?? '',
  tenantName: item.tenantName ?? item.TenantName ?? '',
  tenantBusinessNumber: item.tenantBusinessNumber ?? item.TenantBusinessNumber ?? '',
  tenantEmail: item.tenantEmail ?? item.TenantEmail ?? '',
  tenantPhoneNumber: item.tenantPhoneNumber ?? item.TenantPhoneNumber ?? '',
  tenantCity: item.tenantCity ?? item.TenantCity ?? '',
  tenantAddress: item.tenantAddress ?? item.TenantAddress ?? '',
  tenantIsActive: item.tenantIsActive ?? item.TenantIsActive ?? false,
  tenantCreationDate: item.tenantCreationDate ?? item.TenantCreationDate
});

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadTenants = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/Tenant');
      setTenants(getResponseList(response.data).map(normalizeTenant));
    } catch (err) {
      setError(getErrorMessage(err, 'Tenants could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const openCreateModal = () => {
    setEditingTenant(null);
    setFormValues(emptyForm);
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (tenant) => {
    setEditingTenant(tenant);
    setFormValues({
      ownerAccountID: tenant.ownerAccountID || '',
      tenantName: tenant.tenantName,
      tenantBusinessNumber: tenant.tenantBusinessNumber || '',
      tenantEmail: tenant.tenantEmail || '',
      tenantPhoneNumber: tenant.tenantPhoneNumber || '',
      tenantCity: tenant.tenantCity || '',
      tenantAddress: tenant.tenantAddress || '',
      tenantIsActive: Boolean(tenant.tenantIsActive)
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTenant(null);
    setFormValues(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const buildPayload = () => ({
    ownerAccountID: formValues.ownerAccountID ? Number(formValues.ownerAccountID) : null,
    tenantName: formValues.tenantName.trim(),
    tenantBusinessNumber: formValues.tenantBusinessNumber.trim() || null,
    tenantEmail: formValues.tenantEmail.trim() || null,
    tenantPhoneNumber: formValues.tenantPhoneNumber.trim() || null,
    tenantCity: formValues.tenantCity.trim() || null,
    tenantAddress: formValues.tenantAddress.trim() || null,
    tenantIsActive: Boolean(formValues.tenantIsActive)
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!formValues.tenantName.trim()) {
      setError('Tenant name is required.');
      return;
    }

    const payload = buildPayload();
    setIsSaving(true);

    try {
      if (editingTenant) {
        await apiClient.put(`/Tenant/${editingTenant.tenantID}`, payload);
        setMessage('Tenant updated successfully.');
      } else {
        await apiClient.post('/Tenant', payload);
        setMessage('Tenant created successfully.');
      }

      closeModal();
      await loadTenants();
    } catch (err) {
      setError(getErrorMessage(err, 'Tenant could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (tenant) => {
    const confirmed = window.confirm(`Deactivate tenant "${tenant.tenantName}"?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingId(tenant.tenantID);

    try {
      await apiClient.delete(`/Tenant/${tenant.tenantID}`);
      setMessage('Tenant deactivated successfully.');
      await loadTenants();
    } catch (err) {
      setError(getErrorMessage(err, 'Tenant could not be deactivated.'));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Tenants</h2>
          <p>Manage renter businesses that can list cars and receive bookings.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="briefcase" size={28} />
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Total tenants</span>
              <strong>{tenants.length}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Active tenants</span>
              <strong>{tenants.filter((tenant) => tenant.tenantIsActive).length}</strong>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="ak-admin-card">
        <Card.Body>
          <div className="ak-permissions-toolbar">
            <div>
              <h5>Tenant list</h5>
              <p>All renter businesses from the database.</p>
            </div>
            <Button type="button" className="ak-admin-submit" onClick={openCreateModal}>
              <FeatherIcon icon="plus" size={16} />
              <span>Add New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading tenants...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ak-empty-cell">
                        No tenants found.
                      </td>
                    </tr>
                  ) : (
                    tenants.map((tenant) => (
                      <tr key={tenant.tenantID}>
                        <td>
                          <strong>{tenant.tenantName}</strong>
                          <span className="ak-table-muted">{tenant.tenantCity || '-'}</span>
                        </td>
                        <td>
                          <strong>{tenant.ownerUsername || tenant.ownerAccountID || '-'}</strong>
                          <span className="ak-table-muted">{tenant.ownerEmail || '-'}</span>
                        </td>
                        <td>
                          <div>{tenant.tenantEmail || '-'}</div>
                          <span className="ak-table-muted">{tenant.tenantPhoneNumber || '-'}</span>
                        </td>
                        <td>
                          <Badge bg={tenant.tenantIsActive ? 'success' : 'secondary'}>
                            {tenant.tenantIsActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            <Button type="button" variant="light" size="sm" onClick={() => openEditModal(tenant)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingId === tenant.tenantID || !tenant.tenantIsActive}
                              onClick={() => handleDelete(tenant)}
                            >
                              <FeatherIcon icon="slash" size={15} />
                              <span>{isDeletingId === tenant.tenantID ? 'Saving...' : 'Deactivate'}</span>
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
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingTenant ? 'Edit Tenant' : 'Add Tenant'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="tenantName">
              <Form.Label>Tenant name</Form.Label>
              <Form.Control
                type="text"
                name="tenantName"
                value={formValues.tenantName}
                onChange={handleChange}
                placeholder="Example: Auto Rent Prishtina"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="ownerAccountID">
                  <Form.Label>Owner account ID</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    name="ownerAccountID"
                    value={formValues.ownerAccountID}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="tenantBusinessNumber">
                  <Form.Label>Business number</Form.Label>
                  <Form.Control
                    type="text"
                    name="tenantBusinessNumber"
                    value={formValues.tenantBusinessNumber}
                    onChange={handleChange}
                    placeholder="810000000"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="tenantEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="tenantEmail"
                    value={formValues.tenantEmail}
                    onChange={handleChange}
                    placeholder="business@example.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="tenantPhoneNumber">
                  <Form.Label>Phone number</Form.Label>
                  <Form.Control
                    type="text"
                    name="tenantPhoneNumber"
                    value={formValues.tenantPhoneNumber}
                    onChange={handleChange}
                    placeholder="044123456"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="tenantCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="tenantCity"
                    value={formValues.tenantCity}
                    onChange={handleChange}
                    placeholder="Prishtine"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="tenantAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="tenantAddress"
                    value={formValues.tenantAddress}
                    onChange={handleChange}
                    placeholder="Business address"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="switch"
              id="tenantIsActive"
              name="tenantIsActive"
              label="Tenant is active"
              checked={formValues.tenantIsActive}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingTenant ? 'Save changes' : 'Create tenant'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
