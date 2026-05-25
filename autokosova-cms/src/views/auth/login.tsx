import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// react-bootstrap
import { Alert, Card, Button, Form, InputGroup } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// services
import authService from 'utils/authService';
import { CMS_ACCESS_ROLES, getDefaultCmsPath, hasAllowedRole } from 'config/roleAccess';

// types
import type { LoginRequest } from 'types/auth';

export default function SignIn1() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginRequest>({
    emailOrUsername: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');

    if (!formData.emailOrUsername.trim()) {
      setErrorMessage('Email or username is required.');
      return;
    }

    if (!formData.password.trim()) {
      setErrorMessage('Password is required.');
      return;
    }

    try {
      setIsLoading(true);

      await authService.login({
        emailOrUsername: formData.emailOrUsername.trim(),
        password: formData.password
      });

      const user = authService.getUser();

      if (!hasAllowedRole(user, CMS_ACCESS_ROLES)) {
        authService.logout();
        setErrorMessage('Only SuperAdmin, Rental, and Seller accounts can access this panel.');
        return;
      }

      navigate(getDefaultCmsPath(user));
    } catch (error: unknown) {
      let message = 'Login failed. Please check your credentials.';

      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: string | {
              message?: string;
              errorMessage?: string;
              title?: string;
            };
          };
        };

        if (typeof axiosError.response?.data === 'string') {
          message = axiosError.response.data;
        } else if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.errorMessage) {
          message = axiosError.response.data.errorMessage;
        } else if (axiosError.response?.data?.title) {
          message = axiosError.response.data.title;
        }
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper autokosova-login">
      <div className="auth-content">
        <Card className="borderless autokosova-login-card">
          <Card.Body className="autokosova-login-body">
            <div className="autokosova-login-header">
              <div className="autokosova-login-brand" aria-label="AutoKosova">
                <span className="autokosova-brand-icon">AK</span>
                <span className="autokosova-brand-wordmark">AutoKosova</span>
              </div>

              <span className="autokosova-admin-badge">Admin / Seller / Rental</span>
            </div>

            <h4>Welcome back</h4>
            <p className="autokosova-muted">
              Sign in to continue to AutoKosova admin.
            </p>

            {errorMessage && (
              <Alert variant="danger" className="mb-3">
                {errorMessage}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Label>Email or username</Form.Label>
              <InputGroup className="mb-3 autokosova-input-group">
                <InputGroup.Text>
                  <FeatherIcon icon="user" size={18} />
                </InputGroup.Text>

                <Form.Control
                  name="emailOrUsername"
                  type="text"
                  placeholder="admin@autokosova.com"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </InputGroup>

              <Form.Label>Password</Form.Label>
              <InputGroup className="mb-3 autokosova-input-group">
                <InputGroup.Text>
                  <FeatherIcon icon="lock" size={18} />
                </InputGroup.Text>

                <Form.Control
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </InputGroup>

              <div className="autokosova-login-options">
                <Form.Check type="checkbox" label="Remember me" defaultChecked />

                <button type="button" className="autokosova-link-button">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="autokosova-login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
                {!isLoading && <FeatherIcon icon="arrow-right" size={17} />}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
