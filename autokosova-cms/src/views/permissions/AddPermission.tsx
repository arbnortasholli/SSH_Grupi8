// @ts-nocheck
import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const initialValues = {
  permissionName: '',
  permissionDescription: '',
  permissionGroup: '',
  persmissionIsActive: true
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;

  return error?.message || 'Permission could not be saved.';
};

export default function AddPermission() {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!values.permissionName.trim()) {
      setError('Permission name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/permissions', {
        permissionName: values.permissionName.trim(),
        permissionDescription: values.permissionDescription.trim() || null,
        permissionGroup: values.permissionGroup.trim() || null,
        persmissionIsActive: values.persmissionIsActive
      });

      setMessage(response.data?.message || 'Permission created successfully.');
      setValues(initialValues);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Add Permission</h2>
          <p>Create a permission record that can later be assigned to account roles.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="shield" size={28} />
        </div>
      </div>

      <Row>
        <Col lg={7} xl={6}>
          <Card className="ak-admin-card">
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="permissionName">
                  <Form.Label>Permission name</Form.Label>
                  <Form.Control
                    type="text"
                    name="permissionName"
                    value={values.permissionName}
                    onChange={handleChange}
                    placeholder="Example: Cars.Create"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="permissionGroup">
                  <Form.Label>Permission group</Form.Label>
                  <Form.Control
                    type="text"
                    name="permissionGroup"
                    value={values.permissionGroup}
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
                    value={values.permissionDescription}
                    onChange={handleChange}
                    placeholder="Describe what this permission allows."
                  />
                </Form.Group>

                <Form.Check
                  className="mb-4"
                  type="checkbox"
                  id="persmissionIsActive"
                  name="persmissionIsActive"
                  label="Permission is active"
                  checked={values.persmissionIsActive}
                  onChange={handleChange}
                />

                <Button type="submit" className="ak-admin-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save permission'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
