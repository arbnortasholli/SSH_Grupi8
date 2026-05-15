import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { getErrorMessage, isValidEmail } from '../utils/helpers';

const demoAccounts = [
  {
    role: 'Buyer',
    email: 'user@autokosova.com',
    password: 'password',
    description: 'Save favorites and compare listings.',
  },
  {
    role: 'Rental host',
    email: 'seller@autokosova.com',
    password: 'password',
    description: 'List cars for rent and manage requests.',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { values, handleChange, handleSubmit, setValues, isSubmitting } = useForm({
    email: '',
    password: '',
    rememberMe: true,
  });

  const selectDemoAccount = (email: string, password: string) => {
    setApiError(null);
    setValues({
      ...values,
      email,
      password,
    });
  };

  const onSubmit = async () => {
    setApiError(null);

    const email = values.email.trim();
    const password = values.password.trim();

    if (!email || !password) {
      setApiError('Email and password are required.');
      return;
    }

    if (!isValidEmail(email)) {
      setApiError('Please enter a valid email address.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: unknown) {
      setApiError(getErrorMessage(error, 'Login failed.'));
    }
  };

  return (
    <section className="auth-page auth-page--login">
      <div className="ak-container auth-shell">
        <aside className="auth-visual" aria-label="AutoKosova account overview">
          <div className="auth-visual__content">
            <Link to="/" className="auth-brand">AutoKosova</Link>
            <div>
              <p className="eyebrow">Secure access</p>
              <h1>Sign in to manage your car journey.</h1>
              <p>
                Keep favorite cars, continue rental requests, and manage seller activity from one focused dashboard.
              </p>
            </div>
            <div className="auth-proof-grid">
              <div>
                <strong>2</strong>
                <span>demo account types</span>
              </div>
              <div>
                <strong>API</strong>
                <span>ready auth flow</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="auth-panel">
          <Link to="/" className="auth-back">Back to home</Link>
          <div className="auth-heading">
            <p className="eyebrow">Login</p>
            <h2>Welcome back</h2>
            <p>Use a demo account while authentication is connected to mock data.</p>
          </div>

          <div className="demo-account-grid" aria-label="Demo accounts">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                className="demo-account"
                onClick={() => selectDemoAccount(account.email, account.password)}
              >
                <span>{account.role}</span>
                <strong>{account.email}</strong>
                <small>{account.description}</small>
              </button>
            ))}
          </div>

          {apiError && (
            <div role="alert" className="auth-alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <label className="auth-field" htmlFor="email">
              <span>Email address</span>
              <input
                id="email"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="user@autokosova.com"
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
