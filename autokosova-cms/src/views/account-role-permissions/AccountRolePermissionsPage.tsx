// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const emptyForm = {
  accountRoleID: '',
  permissionID: ''
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
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.Result)) return payload.Result;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.Items)) return payload.Items;
  if (Array.isArray(payload?.$values)) return payload.$values;
  if (Array.isArray(payload?.data?.$values)) return payload.data.$values;
  if (Array.isArray(payload?.Data?.$values)) return payload.Data.$values;

  return [];
};

const normalizeRole = (item) => ({
  accountRoleID: item.accountRoleID ?? item.AccountRoleID,
  accountRoleName: item.accountRoleName ?? item.AccountRoleName ?? ''
});

const normalizePermission = (item) => ({
  permissionID: item.permissionID ?? item.PermissionID,
  permissionName: item.permissionName ?? item.PermissionName ?? '',
  permissionGroup: item.permissionGroup ?? item.PermissionGroup ?? ''
});

const normalizeRolePermission = (item) => ({
  accountRolePermissionID: item.accountRolePermissionID ?? item.AccountRolePermissionID,
  accountRoleID: item.accountRoleID ?? item.AccountRoleID,
  accountRoleName: item.accountRoleName ?? item.AccountRoleName ?? '',
  permissionID: item.permissionID ?? item.PermissionID,
  permissionName: item.permissionName ?? item.PermissionName ?? '',
  permissionDescription: item.permissionDescription ?? item.PermissionDescription ?? '',
  permissionGroup: item.permissionGroup ?? item.PermissionGroup ?? '',
  accountRolePermissionCreatedAt: item.accountRolePermissionCreatedAt ?? item.AccountRolePermissionCreatedAt
});

export default function AccountRolePermissionsPage() {
  const [rolePermissions, setRolePermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingRolePermission, setEditingRolePermission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const uniqueRolesCount = useMemo(
    () => new Set(rolePermissions.map((item) => item.accountRoleID)).size,
    [rolePermissions]
  );

  const loadRoles = async () => {
    const response = await apiClient.get('/AccountRole');
    setRoles(getResponseList(response.data).map(normalizeRole));
  };

  const loadPermissions = async () => {
    const response = await apiClient.get('/Permission');
    setPermissions(getResponseList(response.data).map(normalizePermission));
  };

  const loadRolePermissions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/AccountRolePermission');
      setRolePermissions(getResponseList(response.data).map(normalizeRolePermission));
    } catch (err) {
      setError(getErrorMessage(err, 'Role permissions could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadRoles(), loadPermissions(), loadRolePermissions()]).catch((err) => {
      setError(getErrorMessage(err, 'Role permission data could not be loaded.'));
      setIsLoading(false);
    });
  }, []);

  const openCreateModal = () => {
    setEditingRolePermission(null);
    setFormValues({
      accountRoleID: roles[0]?.accountRoleID || '',
      permissionID: permissions[0]?.permissionID || ''
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingRolePermission(item);
    setFormValues({
      accountRoleID: item.accountRoleID || '',
      permissionID: item.permissionID || ''
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRolePermission(null);
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

    if (!formValues.accountRoleID || !formValues.permissionID) {
      setError('Account role and permission are required.');
      return;
    }

    const payload = {
      accountRoleID: Number(formValues.accountRoleID),
      permissionID: Number(formValues.permissionID)
    };

    setIsSaving(true);

    try {
      if (editingRolePermission) {
        await apiClient.put(`/AccountRolePermission/${editingRolePermission.accountRolePermissionID}`, payload);
        setMessage('Role permission updated successfully.');
      } else {
        await apiClient.post('/AccountRolePermission', payload);
        setMessage('Role permission created successfully.');
      }

      closeModal();
      await loadRolePermissions();
    } catch (err) {
      setError(getErrorMessage(err, 'Role permission could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Remove "${item.permissionName}" from "${item.accountRoleName}"?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingId(item.accountRolePermissionID);

    try {
      await apiClient.delete(`/AccountRolePermission/${item.accountRolePermissionID}`);
      setMessage('Role permission deleted successfully.');
      await loadRolePermissions();
    } catch (err) {
      setError(getErrorMessage(err, 'Role permission could not be deleted.'));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Role Permissions</h2>
          <p>Connect account roles with permissions used by the authorization system.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="link" size={28} />
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Total mappings</span>
              <strong>{rolePermissions.length}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Roles with permissions</span>
              <strong>{uniqueRolesCount}</strong>
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
              <h5>Role permission list</h5>
              <p>All role-permission mappings from the database.</p>
            </div>
            <Button type="button" className="ak-admin-submit" onClick={openCreateModal}>
              <FeatherIcon icon="plus" size={16} />
              <span>Add New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading role permissions...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Permission</th>
                    <th>Group</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rolePermissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ak-empty-cell">
                        No role permissions found.
                      </td>
                    </tr>
                  ) : (
                    rolePermissions.map((item) => (
                      <tr key={item.accountRolePermissionID}>
                        <td>
                          <strong>{item.accountRoleName || '-'}</strong>
                        </td>
                        <td>
                          <strong>{item.permissionName || '-'}</strong>
                          {item.permissionDescription && <span className="ak-table-muted">{item.permissionDescription}</span>}
                        </td>
                        <td>{item.permissionGroup || '-'}</td>
                        <td>
                          {item.accountRolePermissionCreatedAt
                            ? new Date(item.accountRolePermissionCreatedAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            <Button type="button" variant="light" size="sm" onClick={() => openEditModal(item)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingId === item.accountRolePermissionID}
                              onClick={() => handleDelete(item)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isDeletingId === item.accountRolePermissionID ? 'Deleting...' : 'Delete'}</span>
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
            <Modal.Title>{editingRolePermission ? 'Edit Role Permission' : 'Add Role Permission'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="accountRoleID">
              <Form.Label>Account role</Form.Label>
              <Form.Select name="accountRoleID" value={formValues.accountRoleID} onChange={handleChange}>
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.accountRoleID} value={role.accountRoleID}>
                    {role.accountRoleName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="permissionID">
              <Form.Label>Permission</Form.Label>
              <Form.Select name="permissionID" value={formValues.permissionID} onChange={handleChange}>
                <option value="">Select permission</option>
                {permissions.map((permission) => (
                  <option key={permission.permissionID} value={permission.permissionID}>
                    {permission.permissionGroup ? `${permission.permissionGroup} - ` : ''}
                    {permission.permissionName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingRolePermission ? 'Save changes' : 'Create mapping'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
