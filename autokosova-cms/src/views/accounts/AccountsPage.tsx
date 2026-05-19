// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const emptyForm = {
  accountRoleID: '',
  accountUsername: '',
  accountEmail: '',
  password: '',
  accountName: '',
  accountLastname: '',
  accountPhoneNumber: '',
  accountAddress: '',
  accountCity: '',
  accountIsActive: true
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

const normalizeAccount = (item) => ({
  accountID: item.accountID ?? item.AccountID,
  accountRoleID: item.accountRoleID ?? item.AccountRoleID ?? '',
  role: item.role ?? item.Role ?? item.accountRoleName ?? item.AccountRoleName ?? item.accountRole?.accountRoleName ?? '',
  accountUsername: item.accountUsername ?? item.AccountUsername ?? '',
  accountEmail: item.accountEmail ?? item.AccountEmail ?? '',
  accountName: item.accountName ?? item.AccountName ?? '',
  accountLastname: item.accountLastname ?? item.AccountLastname ?? '',
  accountPhoneNumber: item.accountPhoneNumber ?? item.AccountPhoneNumber ?? '',
  accountAddress: item.accountAddress ?? item.AccountAddress ?? '',
  accountCity: item.accountCity ?? item.AccountCity ?? '',
  accountIsActive: item.accountIsActive ?? item.AccountIsActive ?? true
});

const normalizeRole = (item) => ({
  accountRoleID: item.accountRoleID ?? item.AccountRoleID,
  accountRoleName: item.accountRoleName ?? item.AccountRoleName ?? ''
});

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activeCount = useMemo(
    () => accounts.filter((account) => account.accountIsActive).length,
    [accounts]
  );

  const getRoleName = (account) => {
    if (account.role) return account.role;

    const role = roles.find((item) => Number(item.accountRoleID) === Number(account.accountRoleID));
    return role?.accountRoleName || '-';
  };

  const loadRoles = async () => {
    try {
      const response = await apiClient.get('/AccountRole');
      setRoles(getResponseList(response.data).map(normalizeRole));
    } catch {
      try {
        const fallbackResponse = await apiClient.get('/accountroles');
        setRoles(getResponseList(fallbackResponse.data).map(normalizeRole));
      } catch {
        setRoles([]);
      }
    }
  };

  const loadAccounts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/Account');
      const accountList = getResponseList(response.data).map(normalizeAccount);
      setAccounts(accountList);
    } catch (err) {
      try {
        const fallbackResponse = await apiClient.get('/accounts');
        const accountList = getResponseList(fallbackResponse.data).map(normalizeAccount);
        setAccounts(accountList);
      } catch (fallbackErr) {
        setError(getErrorMessage(fallbackErr, 'Accounts could not be loaded.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadAccounts();
  }, []);

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormValues({
      ...emptyForm,
      accountRoleID: roles[0]?.accountRoleID || ''
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormValues({
      accountRoleID: account.accountRoleID || '',
      accountUsername: account.accountUsername,
      accountEmail: account.accountEmail,
      password: '',
      accountName: account.accountName,
      accountLastname: account.accountLastname,
      accountPhoneNumber: account.accountPhoneNumber || '',
      accountAddress: account.accountAddress || '',
      accountCity: account.accountCity || '',
      accountIsActive: account.accountIsActive
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
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

    if (
      !formValues.accountRoleID ||
      !formValues.accountUsername.trim() ||
      !formValues.accountEmail.trim() ||
      !formValues.accountName.trim() ||
      !formValues.accountLastname.trim()
    ) {
      setError('Role, username, email, first name and last name are required.');
      return;
    }

    if (!editingAccount && !formValues.password.trim()) {
      setError('Password is required when creating an account.');
      return;
    }

    const payload = {
      accountRoleID: Number(formValues.accountRoleID),
      accountUsername: formValues.accountUsername.trim(),
      accountEmail: formValues.accountEmail.trim(),
      accountName: formValues.accountName.trim(),
      accountLastname: formValues.accountLastname.trim(),
      accountPhoneNumber: formValues.accountPhoneNumber.trim() || null,
      accountAddress: formValues.accountAddress.trim() || null,
      accountCity: formValues.accountCity.trim() || null,
      accountIsActive: formValues.accountIsActive
    };

    if (formValues.password.trim()) {
      payload.password = formValues.password.trim();
    }

    setIsSaving(true);

    try {
      if (editingAccount) {
        await apiClient.put(`/Account/${editingAccount.accountID}`, payload);
        setMessage('Account updated successfully.');
      } else {
        await apiClient.post('/Account', payload);
        setMessage('Account created successfully.');
      }

      closeModal();
      await loadAccounts();
    } catch (err) {
      setError(getErrorMessage(err, 'Account could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (account) => {
    const confirmed = window.confirm(`Delete account "${account.accountUsername}"?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingId(account.accountID);

    try {
      await apiClient.delete(`/Account/${account.accountID}`);
      setMessage('Account deleted successfully.');
      await loadAccounts();
    } catch (err) {
      setError(getErrorMessage(err, 'Account could not be deleted.'));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Accounts</h2>
          <p>Manage platform users, their profile data, active status, and assigned roles.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="user-check" size={28} />
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Total accounts</span>
              <strong>{accounts.length}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Active accounts</span>
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
              <h5>Account list</h5>
              <p>All account records from the database.</p>
            </div>
            <Button type="button" className="ak-admin-submit" onClick={openCreateModal}>
              <FeatherIcon icon="plus" size={16} />
              <span>Add New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading accounts...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>City</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="ak-empty-cell">
                        No accounts found.
                      </td>
                    </tr>
                  ) : (
                    accounts.map((account) => (
                      <tr key={account.accountID}>
                        <td>
                          <strong>{account.accountName} {account.accountLastname}</strong>
                          <span className="ak-table-muted">@{account.accountUsername}</span>
                        </td>
                        <td>{account.accountEmail}</td>
                        <td>{getRoleName(account)}</td>
                        <td>{account.accountCity || '-'}</td>
                        <td>
                          <Badge bg={account.accountIsActive ? 'success' : 'secondary'}>
                            {account.accountIsActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            <Button type="button" variant="light" size="sm" onClick={() => openEditModal(account)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingId === account.accountID}
                              onClick={() => handleDelete(account)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isDeletingId === account.accountID ? 'Deleting...' : 'Delete'}</span>
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

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingAccount ? 'Edit Account' : 'Add Account'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="accountName">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountName"
                    value={formValues.accountName}
                    onChange={handleChange}
                    placeholder="Example: Arber"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="accountLastname">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountLastname"
                    value={formValues.accountLastname}
                    onChange={handleChange}
                    placeholder="Example: Krasniqi"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="accountUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountUsername"
                    value={formValues.accountUsername}
                    onChange={handleChange}
                    placeholder="Example: arber"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="accountEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="accountEmail"
                    value={formValues.accountEmail}
                    onChange={handleChange}
                    placeholder="Example: arber@example.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="accountRoleID">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="accountRoleID" value={formValues.accountRoleID} onChange={handleChange}>
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.accountRoleID} value={role.accountRoleID}>
                        {role.accountRoleName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>{editingAccount ? 'New password' : 'Password'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder={editingAccount ? 'Leave empty to keep current password' : 'Enter password'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="accountPhoneNumber">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountPhoneNumber"
                    value={formValues.accountPhoneNumber}
                    onChange={handleChange}
                    placeholder="044123456"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="accountCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountCity"
                    value={formValues.accountCity}
                    onChange={handleChange}
                    placeholder="Prishtine"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="accountAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountAddress"
                    value={formValues.accountAddress}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="checkbox"
              id="accountIsActive"
              name="accountIsActive"
              label="Account is active"
              checked={formValues.accountIsActive}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingAccount ? 'Save changes' : 'Create account'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
