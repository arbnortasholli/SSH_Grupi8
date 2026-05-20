// @ts-nocheck
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const emptyForm = {
  accountRoleName: '',
  accountRoleDescription: ''
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

const normalizeRole = (item) => ({
  accountRoleID: item.accountRoleID ?? item.AccountRoleID,
  accountRoleName: item.accountRoleName ?? item.AccountRoleName ?? '',
  accountRoleDescription: item.accountRoleDescription ?? item.AccountRoleDescription ?? ''
});

export default function AccountRolesPage() {
  const [roles, setRoles] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingRole, setEditingRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRoles = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/AccountRole');
      setRoles(getResponseList(response.data).map(normalizeRole));
    } catch (err) {
      try {
        const fallbackResponse = await apiClient.get('/accountroles');
        setRoles(getResponseList(fallbackResponse.data).map(normalizeRole));
      } catch (fallbackErr) {
        setError(getErrorMessage(fallbackErr, 'Account roles could not be loaded.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormValues(emptyForm);
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormValues({
      accountRoleName: role.accountRoleName,
      accountRoleDescription: role.accountRoleDescription || ''
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormValues(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!formValues.accountRoleName.trim()) {
      setError('Account role name is required.');
      return;
    }

    const payload = {
      accountRoleName: formValues.accountRoleName.trim(),
      accountRoleDescription: formValues.accountRoleDescription.trim() || null
    };

    setIsSaving(true);

    try {
      if (editingRole) {
        await apiClient.put(`/AccountRole/${editingRole.accountRoleID}`, payload);
        setMessage('Account role updated successfully.');
      } else {
        await apiClient.post('/AccountRole', payload);
        setMessage('Account role created successfully.');
      }

      closeModal();
      await loadRoles();
    } catch (err) {
      setError(getErrorMessage(err, 'Account role could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role) => {
    const confirmed = window.confirm(`Delete account role "${role.accountRoleName}"?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingId(role.accountRoleID);

    try {
      await apiClient.delete(`/AccountRole/${role.accountRoleID}`);
      setMessage('Account role deleted successfully.');
      await loadRoles();
    } catch (err) {
      setError(getErrorMessage(err, 'Account role could not be deleted.'));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Account Roles</h2>
          <p>Manage role records used to group accounts and assign permissions later.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="users" size={28} />
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Total roles</span>
              <strong>{roles.length}</strong>
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
              <h5>Account role list</h5>
              <p>All account role records from the database.</p>
            </div>
            <Button type="button" className="ak-admin-submit" onClick={openCreateModal}>
              <FeatherIcon icon="plus" size={16} />
              <span>Add New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading account roles...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="ak-empty-cell">
                        No account roles found.
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.accountRoleID}>
                        <td>
                          <strong>{role.accountRoleName}</strong>
                        </td>
                        <td>{role.accountRoleDescription || '-'}</td>
                        <td>
                          <div className="ak-table-actions">
                            <Button type="button" variant="light" size="sm" onClick={() => openEditModal(role)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingId === role.accountRoleID}
                              onClick={() => handleDelete(role)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isDeletingId === role.accountRoleID ? 'Deleting...' : 'Delete'}</span>
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
            <Modal.Title>{editingRole ? 'Edit Account Role' : 'Add Account Role'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="accountRoleName">
              <Form.Label>Role name</Form.Label>
              <Form.Control
                type="text"
                name="accountRoleName"
                value={formValues.accountRoleName}
                onChange={handleChange}
                placeholder="Example: Admin"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="accountRoleDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="accountRoleDescription"
                value={formValues.accountRoleDescription}
                onChange={handleChange}
                placeholder="Describe what this role is used for."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingRole ? 'Save changes' : 'Create role'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
