import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { getErrorMessage } from '../utils/helpers';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { values, handleChange, handleSubmit, isSubmitting } = useForm({
    emailOrUsername: '',
    password: '',
    rememberMe: true,
  });

  const onSubmit = async () => {
    setApiError(null);

    const emailOrUsername = values.emailOrUsername.trim();
    const password = values.password.trim();

    if (!emailOrUsername || !password) {
      setApiError('Email/username and password are required.');
      return;
    }

    try {
      const authData = await login(emailOrUsername, password);
      navigate(authData.role === 'Rental' ? '/seller' : '/');
    } catch (error: unknown) {
      setApiError(getErrorMessage(error, 'Login failed.'));
    }
  };

  return (
    <section className="auth-page auth-page--login">
      <div className="ak-container auth-shell">
        <aside className="auth-visual" aria-label="AutoKosova account overview">
          <div className="auth-visual__content">
            <Link to="/" className="auth-brand">
              AutoKosova
            </Link>

            <div>
              <p className="eyebrow">Secure access</p>
              <h1>Sign in to manage your car journey.</h1>
              <p>
                Keep favorite cars, continue rental requests, and manage rental
                activity from one focused dashboard.
              </p>
            </div>

            <div className="auth-proof-grid">
              <div>
                <strong>JWT</strong>
                <span>secure access</span>
              </div>
              <div>
                <strong>API</strong>
                <span>connected auth flow</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="auth-panel">
          <Link to="/" className="auth-back">
            Back to home
          </Link>

          <div className="auth-heading">
            <p className="eyebrow">Login</p>
            <h2>Welcome back</h2>
            <p>Use your email or username to continue.</p>
          </div>

          {apiError && (
            <div role="alert" className="auth-alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <label className="auth-field" htmlFor="emailOrUsername">
              <span>Email or username</span>
              <input
                id="emailOrUsername"
                type="text"
                name="emailOrUsername"
                value={values.emailOrUsername}
                onChange={handleChange}
                required
                autoComplete="username"
                placeholder="name@example.com or username"
              />
            </label>

            <label className="auth-field" htmlFor="password">
              <span>Password</span>
              <input
                id="password"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </label>

            <div className="auth-form-row">
              <label className="auth-check">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={values.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>

              <button type="button" className="auth-link-button">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            New to AutoKosova? <Link to="/register">Create an account</Link>
          </p>
        </main>
      </div>
    </section>
  );
};
