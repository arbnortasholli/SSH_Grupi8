// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const emptyForm = {
  carFeatureName: '',
  carFeatureDescription: '',
  carFeatureIsActive: true,
  carFeatureOrderNumber: 0
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

const normalizeFeature = (item) => ({
  carFeatureID: item.carFeatureID ?? item.CarFeatureID,
  carFeatureName: item.carFeatureName ?? item.CarFeatureName ?? '',
  carFeatureDescription: item.carFeatureDescription ?? item.CarFeatureDescription ?? '',
  carFeatureIsActive: item.carFeatureIsActive ?? item.CarFeatureIsActive ?? true,
  carFeatureOrderNumber: item.carFeatureOrderNumber ?? item.CarFeatureOrderNumber ?? 0,
  carFeatureCreationDate: item.carFeatureCreationDate ?? item.CarFeatureCreationDate
});

export default function CarFeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingFeature, setEditingFeature] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activeCount = useMemo(() => features.filter((feature) => feature.carFeatureIsActive).length, [features]);

  const loadFeatures = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/car-features');
      setFeatures(getResponseList(response.data).map(normalizeFeature));
    } catch (err) {
      setError(getErrorMessage(err, 'Car features could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const openCreateModal = () => {
    setEditingFeature(null);
    setFormValues(emptyForm);
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (feature) => {
    setEditingFeature(feature);
    setFormValues({
      carFeatureName: feature.carFeatureName,
      carFeatureDescription: feature.carFeatureDescription || '',
      carFeatureIsActive: feature.carFeatureIsActive,
      carFeatureOrderNumber: feature.carFeatureOrderNumber
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFeature(null);
    setFormValues(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!formValues.carFeatureName.trim()) {
      setError('Feature name is required.');
      return;
    }

    const payload = {
      carFeatureName: formValues.carFeatureName.trim(),
      carFeatureDescription: formValues.carFeatureDescription.trim() || null,
      carFeatureIsActive: formValues.carFeatureIsActive,
      carFeatureOrderNumber: Number(formValues.carFeatureOrderNumber)
    };

    setIsSaving(true);

    try {
      if (editingFeature) {
        await apiClient.put(`/car-features/${editingFeature.carFeatureID}`, payload);
        setMessage('Car feature updated successfully.');
      } else {
        await apiClient.post('/car-features', payload);
        setMessage('Car feature created successfully.');
      }

      closeModal();
      await loadFeatures();
    } catch (err) {
      setError(getErrorMessage(err, 'Car feature could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (feature) => {
    const confirmed = window.confirm(`Delete car feature "${feature.carFeatureName}"?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingId(feature.carFeatureID);

    try {
      await apiClient.delete(`/car-features/${feature.carFeatureID}`);
      setMessage('Car feature deleted successfully.');
      await loadFeatures();
    } catch (err) {
      setError(getErrorMessage(err, 'Car feature could not be deleted.'));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Car Features</h2>
          <p>Manage reusable car equipment and feature labels.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="sliders" size={28} />
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Total features</span>
              <strong>{features.length}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Active features</span>
              <strong>{activeCount}</strong>
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
              <h5>Feature list</h5>
              <p>All active car feature records from the database.</p>
            </div>
            <Button type="button" className="ak-admin-submit" onClick={openCreateModal}>
              <FeatherIcon icon="plus" size={16} />
              <span>Add New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading car features...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {features.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ak-empty-cell">
                        No car features found.
                      </td>
                    </tr>
                  ) : (
                    features.map((feature) => (
                      <tr key={feature.carFeatureID}>
                        <td>
                          <strong>{feature.carFeatureName}</strong>
                        </td>
                        <td>{feature.carFeatureDescription || '-'}</td>
                        <td>{feature.carFeatureOrderNumber}</td>
                        <td>
                          <Badge bg={feature.carFeatureIsActive ? 'success' : 'secondary'}>
                            {feature.carFeatureIsActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            <Button type="button" variant="light" size="sm" onClick={() => openEditModal(feature)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingId === feature.carFeatureID}
                              onClick={() => handleDelete(feature)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isDeletingId === feature.carFeatureID ? 'Deleting...' : 'Delete'}</span>
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
            <Modal.Title>{editingFeature ? 'Edit Car Feature' : 'Add Car Feature'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="carFeatureName">
              <Form.Label>Feature name</Form.Label>
              <Form.Control
                name="carFeatureName"
                value={formValues.carFeatureName}
                onChange={handleChange}
                placeholder="Example: Bluetooth"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="carFeatureDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="carFeatureDescription"
                value={formValues.carFeatureDescription}
                onChange={handleChange}
                placeholder="Describe this feature."
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="carFeatureOrderNumber">
              <Form.Label>Order number</Form.Label>
              <Form.Control
                type="number"
                name="carFeatureOrderNumber"
                value={formValues.carFeatureOrderNumber}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="carFeatureIsActive"
              name="carFeatureIsActive"
              label="Feature is active"
              checked={formValues.carFeatureIsActive}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingFeature ? 'Save changes' : 'Create feature'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
