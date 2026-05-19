// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const emptyForm = {
  permissionName: '',
  permissionDescription: '',
  permissionGroup: '',
  persmissionIsActive: true
};

const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.Error === 'string') return data.Error;

  return error?.message || fallback;
};

const normalizePermission = (item) => ({
  permissionID: item.permissionID ?? item.PermissionID,
  permissionName: item.permissionName ?? item.PermissionName ?? '',
  permissionDescription: item.permissionDescription ?? item.PermissionDescription ?? '',
  permissionGroup: item.permissionGroup ?? item.PermissionGroup ?? '',
  persmissionIsActive: item.persmissionIsActive ?? item.PersmissionIsActive ?? false
});

const getResponseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Data)) return payload.Data;
  if (Array.isArray(payload?.$values)) return payload.$values;
  if (Array.isArray(payload?.data?.$values)) return payload.data.$values;
  if (Array.isArray(payload?.Data?.$values)) return payload.Data.$values;

  return [];
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingPermission, setEditingPermission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activeCount = useMemo(
    () => permissions.filter((permission) => permission.persmissionIsActive).length,
    [permissions]
  );

  const loadPermissions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/Permission');
      setPermissions(getResponseList(response.data).map(normalizePermission));
    } catch (err) {
      try {
        const fallbackResponse = await apiClient.get('/permissions');
        setPermissions(getResponseList(fallbackResponse.data).map(normalizePermission));
      } catch (fallbackErr) {
        setError(getErrorMessage(fallbackErr, 'Permissions could not be loaded.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const openCreateModal = () => {
    setEditingPermission(null);
    setFormValues(emptyForm);
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (permission) => {
    setEditingPermission(permission);
    setFormValues({
      permissionName: permission.permissionName,
      permissionDescription: permission.permissionDescription || '',
      permissionGroup: permission.permissionGroup || '',
      persmissionIsActive: permission.persmissionIsActive
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPermission(null);
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

    if (!formValues.permissionName.trim()) {
      setError('Permission name is required.');
      return;
    }

    const payload = {
      permissionName: formValues.permissionName.trim(),
      permissionDescription: formValues.permissionDescription.trim() || null,
      permissionGroup: formValues.permissionGroup.trim() || null,
      persmissionIsActive: formValues.persmissionIsActive
    };

    setIsSaving(true);

    try {
      if (editingPermission) {
        await apiClient.put(`/Permission/${editingPermission.permissionID}`, payload);
        setMessage('Permission updated successfully.');
      } else {
        await apiClient.post('/Permission', payload);
        setMessage('Permission created successfully.');
      }

      closeModal();
      await loadPermissions();
    } catch (err) {
      setError(getErrorMessage(err, 'Permission could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (permission) => {
    const confirmed = window.confirm(`Delete permission "${permission.permissionName}"?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingId(permission.permissionID);

    try {
      await apiClient.delete(`/Permission/${permission.permissionID}`);
      setMessage('Permission deleted successfully.');
      await loadPermissions();
    } catch (err) {
      setError(getErrorMessage(err, 'Permission could not be deleted.'));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Permissions</h2>
          <p>Manage permissions that can later be assigned to account roles.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="shield" size={28} />
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Total permissions</span>
              <strong>{permissions.length}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Active permissions</span>
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
              <h5>Permission list</h5>
              <p>All available permission records from the database.</p>
            </div>
            <Button type="button" className="ak-admin-submit" onClick={openCreateModal}>
              <FeatherIcon icon="plus" size={16} />
              <span>Add New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading permissions...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Group</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ak-empty-cell">
                        No permissions found.
                      </td>
                    </tr>
                  ) : (
                    permissions.map((permission) => (
                      <tr key={permission.permissionID}>
                        <td>
                          <strong>{permission.permissionName}</strong>
                        </td>
                        <td>{permission.permissionGroup || '-'}</td>
                        <td>{permission.permissionDescription || '-'}</td>
                        <td>
                          <Badge bg={permission.persmissionIsActive ? 'success' : 'secondary'}>
                            {permission.persmissionIsActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            <Button
                              type="button"
                              variant="light"
                              size="sm"
                              onClick={() => openEditModal(permission)}
                            >
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingId === permission.permissionID}
                              onClick={() => handleDelete(permission)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isDeletingId === permission.permissionID ? 'Deleting...' : 'Delete'}</span>
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
            <Modal.Title>{editingPermission ? 'Edit Permission' : 'Add Permission'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="permissionName">
              <Form.Label>Permission name</Form.Label>
              <Form.Control
                type="text"
                name="permissionName"
                value={formValues.permissionName}
                onChange={handleChange}
                placeholder="Example: Cars.Create"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="permissionGroup">
              <Form.Label>Permission group</Form.Label>
              <Form.Control
                type="text"
                name="permissionGroup"
                value={formValues.permissionGroup}
                onChange={handleChange}
                placeholder="Example: Cars"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="permissionDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="permissionDescription"
                value={formValues.permissionDescription}
                onChange={handleChange}
                placeholder="Describe what this permission allows."
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="persmissionIsActive"
              name="persmissionIsActive"
              label="Permission is active"
              checked={formValues.persmissionIsActive}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingPermission ? 'Save changes' : 'Create permission'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
