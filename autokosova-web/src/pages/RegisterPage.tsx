import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import { authService } from '../services/authService';
import { getErrorMessage, isValidEmail } from '../utils/helpers';

const benefits = [
  'Save and compare cars across Kosovo cities',
  'Send rental requests with pickup details',
  'Contact sellers from a single account',
  'Ready for buyer, seller, and admin roles later',
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const { values, handleChange, handleSubmit, isSubmitting } = useForm({
    accountRoleID: 2,
    accountUsername: '',
    accountEmail: '',
    password: '',
    confirmPassword: '',
    accountName: '',
    accountLastname: '',
    accountPhoneNumber: '',
    accountAddress: '',
    accountCity: '',
    agreeTerms: false,
  });

  const onSubmit = async () => {
    setApiError(null);

    const accountUsername = values.accountUsername.trim();
    const accountEmail = values.accountEmail.trim();
    const password = values.password.trim();
    const confirmPassword = values.confirmPassword.trim();
    const accountName = values.accountName.trim();
    const accountLastname = values.accountLastname.trim();

    if (!accountUsername || !accountEmail || !password || !confirmPassword || !accountName || !accountLastname) {
      setApiError('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(accountEmail)) {
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
      await authService.register({
        accountRoleID: Number(values.accountRoleID),
        accountUsername,
        accountEmail,
        password,
        accountName,
        accountLastname,
        accountPhoneNumber: values.accountPhoneNumber.trim(),
        accountAddress: values.accountAddress.trim(),
        accountCity: values.accountCity.trim(),
      });
      navigate('/login');
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
            <p>Create an AutoKosova account with the real API.</p>
          </div>

          {apiError && (
            <div role="alert" className="auth-alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="auth-form-grid">
              <label className="auth-field" htmlFor="accountName">
                <span>First name</span>
                <input
                  id="accountName"
                  type="text"
                  name="accountName"
                  value={values.accountName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  placeholder="Arber"
                />
              </label>

              <label className="auth-field" htmlFor="accountLastname">
                <span>Last name</span>
                <input
                  id="accountLastname"
                  type="text"
                  name="accountLastname"
                  value={values.accountLastname}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  placeholder="Krasniqi"
                />
              </label>
            </div>

            <div className="auth-form-grid">
              <label className="auth-field" htmlFor="accountUsername">
                <span>Username</span>
                <input
                  id="accountUsername"
                  type="text"
                  name="accountUsername"
                  value={values.accountUsername}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  placeholder="arber"
                />
              </label>

              <label className="auth-field" htmlFor="accountEmail">
                <span>Email address</span>
                <input
                  id="accountEmail"
                  type="email"
                  name="accountEmail"
                  value={values.accountEmail}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                />
              </label>
            </div>

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

            <div className="auth-form-grid">
              <label className="auth-field" htmlFor="accountPhoneNumber">
                <span>Phone number</span>
                <input
                  id="accountPhoneNumber"
                  type="tel"
                  name="accountPhoneNumber"
                  value={values.accountPhoneNumber}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="044123456"
                />
              </label>

              <label className="auth-field" htmlFor="accountCity">
                <span>City</span>
                <input
                  id="accountCity"
                  type="text"
                  name="accountCity"
                  value={values.accountCity}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  placeholder="Prishtine"
                />
              </label>
            </div>

            <label className="auth-field" htmlFor="accountAddress">
              <span>Address</span>
              <input
                id="accountAddress"
                type="text"
                name="accountAddress"
                value={values.accountAddress}
                onChange={handleChange}
                autoComplete="street-address"
                placeholder="Prishtine"
              />
            </label>

            <label className="auth-terms">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={values.agreeTerms}
                onChange={handleChange}
                required
              />
              <span>I agree to the terms and conditions.</span>
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
