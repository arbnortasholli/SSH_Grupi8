import React from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { ExternalCarRequest } from '../lib/types';
import { externalCarService } from '../services/externalCarService';
import { getErrorMessage } from '../utils/helpers';

const formatMoney = (value?: number | null, currency?: string | null) => {
  if (!value) return 'Waiting for offer';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatMileage = (value?: number | null) => {
  if (!value) return null;
  return `${value.toLocaleString()} km`;
};

const getDecisionText = (request: ExternalCarRequest) => {
  if (request.customerDecision === 'Interested') return 'You accepted this offer. Our team will contact you.';
  if (request.customerDecision === 'Declined') return 'You declined this offer.';
  if (request.price) return 'Do you want to buy this car?';
  return 'Our team is reviewing your request and preparing an offer.';
};

export const ImportRequestsPage: React.FC = () => {
  const [requests, setRequests] = React.useState<ExternalCarRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const loadRequests = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setRequests(await externalCarService.getMyRequests());
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not load your import requests.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateDecision = async (request: ExternalCarRequest, decision: 'Interested' | 'Declined') => {
    setSavingId(request.externalCarRequestID);
    setError(null);
    setMessage(null);

    try {
      await externalCarService.updateMyDecision(request.externalCarRequestID, decision);
      setMessage(
        decision === 'Interested'
          ? 'Great, our team will contact you about this car.'
          : 'Thanks, your decision was saved.'
      );
      await loadRequests();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not save your decision.'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page import-requests-page">
      <section className="page-hero page-hero--korean">
        <div className="ak-container">
          <p className="eyebrow">My import requests</p>
          <h1>Car Offers</h1>
          <p>Review prices prepared by AutoKosova for the cars you requested.</p>
        </div>
      </section>

      <section className="ak-container import-request-results">
        {message && <div className="auth-alert auth-alert--success">{message}</div>}
        {error && <div className="auth-alert">{error}</div>}

        {isLoading ? (
          <LoadingSpinner />
        ) : requests.length > 0 ? (
          <div className="listing-stack">
            {requests.map((request) => {
              const hasDecision = request.customerDecision === 'Interested' || request.customerDecision === 'Declined';
              const hasOffer = Boolean(request.price);

              return (
                <article className="listing-card import-request-card" key={request.externalCarRequestID}>
                  <div className="listing-card__image">
                    {request.imageUrl ? (
                      <img src={request.imageUrl} alt={request.carName} />
                    ) : (
                      <div className="external-car-placeholder visible">
                        <strong>AK</strong>
                        <span>No photo</span>
                      </div>
                    )}
                  </div>

                  <div className="listing-card__body">
                    <div className="listing-card__top">
                      <div>
                        <h3>{request.carName}</h3>
                        <p>{[request.year, request.brand, request.model].filter(Boolean).join(' - ') || 'Requested import car'}</p>
                      </div>
                      <strong>{formatMoney(request.price, request.currency)}</strong>
                    </div>

                    <div className="car-specs">
                      {formatMileage(request.mileage) && <span>{formatMileage(request.mileage)}</span>}
                      <span>{request.status}</span>
                      <span>{request.customerDecision || 'Pending decision'}</span>
                    </div>

                    {request.adminComment && (
                      <div className="import-request-note">
                        <strong>AutoKosova note</strong>
                        <p>{request.adminComment}</p>
                      </div>
                    )}

                    <div className="import-request-decision">
                      <strong>{getDecisionText(request)}</strong>
                      {hasOffer && !hasDecision && (
                        <div className="external-card-actions">
                          <button
                            type="button"
                            className="ak-button ak-button--primary"
                            disabled={savingId === request.externalCarRequestID}
                            onClick={() => updateDecision(request, 'Interested')}
                          >
                            Yes, contact me
                          </button>
                          <button
                            type="button"
                            className="ak-button ak-button--ghost"
                            disabled={savingId === request.externalCarRequestID}
                            onClick={() => updateDecision(request, 'Declined')}
                          >
                            No thanks
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No import requests yet" description="Request a Korean import car and your offers will appear here." />
        )}
      </section>
    </div>
  );
};
