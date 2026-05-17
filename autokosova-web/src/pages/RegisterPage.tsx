import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { getErrorMessage, isValidEmail } from '../utils/helpers';

const benefits = [
  'Save and compare cars across Kosovo cities',
  'Send rental requests with pickup details',
  'Contact sellers from a single account',
  'Ready for buyer, seller, and admin roles later',
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { values, handleChange, handleSubmit, isSubmitting } = useForm({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeTerms: false,
  });

  const onSubmit = async () => {
    setApiError(null);

    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();
    const password = values.password.trim();
    const confirmPassword = values.confirmPassword.trim();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setApiError('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setApiError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setApiError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setApiError('Passwords do not match.');
      return;
    }

    if (!values.agreeTerms) {
      setApiError('You must agree to the terms and conditions.');
      return;
    }

    try {
      await register(email, password, firstName, lastName);
      navigate('/dashboard');
    } catch (error: unknown) {
      setApiError(getErrorMessage(error, 'Registration failed.'));
    }
  };

  return (
    <section className="auth-page auth-page--register">
      <div className="ak-container auth-shell auth-shell--register">
        <aside className="auth-visual" aria-label="AutoKosova account benefits">
          <div className="auth-visual__content">
            <Link to="/" className="auth-brand">AutoKosova</Link>
            <div>
              <p className="eyebrow">Create account</p>
              <h1>Build your AutoKosova profile.</h1>
              <p>
                One account for buying, renting, saving cars, and preparing seller features as the platform grows.
              </p>
            </div>
            <div className="auth-benefit-list">
              {benefits.map((benefit) => (
                <div key={benefit}>
                  <span aria-hidden="true">OK</span>
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="auth-panel">
          <Link to="/" className="auth-back">Back to home</Link>
          <div className="auth-heading">
            <p className="eyebrow">Register</p>
            <h2>Create your account</h2>
            <p>Registration currently uses mock auth, with the form structure ready for the real API.</p>
          </div>

          {apiError && (
            <div role="alert" className="auth-alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="auth-form-grid">
              <label className="auth-field" htmlFor="firstName">
                <span>First name</span>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  placeholder="Arber"
                />
              </label>

              <label className="auth-field" htmlFor="lastName">
                <span>Last name</span>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  placeholder="Krasniqi"
                />
              </label>
            </div>

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
                placeholder="name@example.com"
              />
            </label>

            <div className="auth-form-grid">
              <label className="auth-field" htmlFor="password">
                <span>Password</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </label>

              <label className="auth-field" htmlFor="confirmPassword">
                <span>Confirm password</span>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                />
              </label>
            </div>

            <label className="auth-terms">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={values.agreeTerms}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the terms and understand this account is currently connected to a demo authentication flow.
              </span>
            </label>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </main>
      </div>
    </section>
  );
};
