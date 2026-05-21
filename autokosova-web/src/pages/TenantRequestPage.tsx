import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tenantRequestService, type TenantRequestResponse } from '../services/tenantRequestService';
import { getErrorMessage, isValidEmail } from '../utils/helpers';

const emptyForm = {
  businessName: '',
  businessNumber: '',
  businessEmail: '',
  businessPhoneNumber: '',
  businessCity: '',
  businessAddress: '',
  message: '',
};

export const TenantRequestPage: React.FC = () => {
  const [values, setValues] = useState(emptyForm);
  const [requests, setRequests] = useState<TenantRequestResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadMyRequests = async () => {
    setIsLoading(true);

    try {
      setRequests(await tenantRequestService.getMine());
    } catch (err) {
      setError(getErrorMessage(err, 'Tenant requests could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMyRequests();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess('');
    setError('');

    const businessName = values.businessName.trim();
    const businessEmail = values.businessEmail.trim();

    if (!businessName) {
      setError('Business name is required.');
      return;
    }

    if (businessEmail && !isValidEmail(businessEmail)) {
      setError('Please enter a valid business email.');
      return;
    }

    setIsSubmitting(true);

    try {
      await tenantRequestService.create({
        businessName,
        businessNumber: values.businessNumber.trim() || undefined,
        businessEmail: businessEmail || undefined,
        businessPhoneNumber: values.businessPhoneNumber.trim() || undefined,
        businessCity: values.businessCity.trim() || undefined,
        businessAddress: values.businessAddress.trim() || undefined,
        message: values.message.trim() || undefined,
      });

      setValues(emptyForm);
      setSuccess('Your tenant request was sent successfully.');
      await loadMyRequests();
    } catch (err) {
      setError(getErrorMessage(err, 'Tenant request could not be sent.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestRequest = requests[0];

  return (
    <section className="auth-page auth-page--register">
      <div className="ak-container auth-shell auth-shell--register">
        <aside className="auth-visual" aria-label="Tenant request summary">
          <div className="auth-visual__content">
            <Link to="/" className="auth-brand">
              AutoKosova
            </Link>

            <div>
              <p className="eyebrow">Become a renter</p>
              <h1>Apply for a tenant account.</h1>
              <p>
                Send your business details to AutoKosova. A SuperAdmin reviews the request and activates your renter profile.
              </p>
            </div>

            {latestRequest && (
              <div className="auth-benefit-list">
                <div>
                  <span aria-hidden="true">OK</span>
                  <p>Latest request status: {latestRequest.status}</p>
                </div>
                {latestRequest.adminComment && (
                  <div>
                    <span aria-hidden="true">OK</span>
                    <p>{latestRequest.adminComment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="auth-panel">
          <Link to="/" className="auth-back">
            Back to home
          </Link>

          <div className="auth-heading">
            <p className="eyebrow">Tenant Request</p>
            <h2>Business application</h2>
            <p>Submit your renter details for review.</p>
          </div>

          {success && (
            <div role="status" className="owner-form-success">
              {success}
            </div>
          )}

          {error && (
            <div role="alert" className="auth-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <label className="auth-field" htmlFor="businessName">
              <span>Business name</span>
              <input
                id="businessName"
                name="businessName"
                value={values.businessName}
                onChange={handleChange}
                placeholder="Auto Rent Prishtina"
                required
              />
            </label>

            <div className="auth-form-grid">
              <label className="auth-field" htmlFor="businessNumber">
                <span>Business number</span>
                <input
                  id="businessNumber"
                  name="businessNumber"
                  value={values.businessNumber}
                  onChange={handleChange}
                  placeholder="810000000"
                />
              </label>

              <label className="auth-field" htmlFor="businessEmail">
                <span>Business email</span>
                <input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  value={values.businessEmail}
                  onChange={handleChange}
                  placeholder="business@example.com"
                />
              </label>
            </div>

            <div className="auth-form-grid">
              <label className="auth-field" htmlFor="businessPhoneNumber">
                <span>Phone number</span>
                <input
                  id="businessPhoneNumber"
                  name="businessPhoneNumber"
                  value={values.businessPhoneNumber}
                  onChange={handleChange}
                  placeholder="044123456"
                />
              </label>

              <label className="auth-field" htmlFor="businessCity">
                <span>City</span>
                <input
                  id="businessCity"
                  name="businessCity"
                  value={values.businessCity}
                  onChange={handleChange}
                  placeholder="Prishtine"
                />
              </label>
            </div>

            <label className="auth-field" htmlFor="businessAddress">
              <span>Address</span>
              <input
                id="businessAddress"
                name="businessAddress"
                value={values.businessAddress}
                onChange={handleChange}
                placeholder="Business address"
              />
            </label>

            <label className="auth-field" htmlFor="message">
              <span>Message</span>
              <textarea
                id="message"
                name="message"
                value={values.message}
                onChange={handleChange}
                placeholder="Tell us about your rental business."
                rows={4}
              />
            </label>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending request...' : 'Send request'}
            </button>
          </form>

          {!isLoading && requests.length > 0 && (
            <p className="auth-switch">
              You have {requests.length} tenant request{requests.length === 1 ? '' : 's'}.
            </p>
          )}
        </main>
      </div>
    </section>
  );
};
