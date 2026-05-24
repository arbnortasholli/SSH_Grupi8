import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import type { ExternalCar } from '../lib/types';
import { externalCarService } from '../services/externalCarService';
import { getErrorMessage } from '../utils/helpers';

const formatMileage = (value?: number | null) => {
  if (!value) return 'Mileage pending';
  return `${value.toLocaleString()} km`;
};

const getCarTitle = (car: ExternalCar) => {
  const fullName = [car.brand, car.model, car.trim, car.year].filter(Boolean).join(' ');
  return fullName || car.name || 'Korean import car';
};

const getCarSubtitle = (car: ExternalCar) => {
  return [car.year, car.brand, car.model, car.trim].filter(Boolean).join(' - ') || 'Korean import car';
};

const getExtraSpecs = (car: ExternalCar) => {
  return [
    car.bodyType,
    car.fuelType,
    car.transmission,
    car.engine,
    car.drivetrain,
    car.color,
  ].filter((value): value is string => Boolean(value));
};

const getImageSrc = (value?: string | null) => {
  if (!value) return null;

  const trimmedValue = value.trim();
  if (!trimmedValue || /^\d+(\.\d+)?$/.test(trimmedValue)) return null;

  return /^(https?:)?\/\//i.test(trimmedValue) ||
    trimmedValue.startsWith('/') ||
    /^data:image\//i.test(trimmedValue)
    ? trimmedValue
    : null;
};

export const KoreanCarsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [cars, setCars] = React.useState<ExternalCar[]>([]);
  const [page, setPage] = React.useState(1);
  const [brand, setBrand] = React.useState('');
  const [yearFrom, setYearFrom] = React.useState('2015');
  const [yearTo, setYearTo] = React.useState('2024');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [cached, setCached] = React.useState(false);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [selectedCar, setSelectedCar] = React.useState<ExternalCar | null>(null);
  const [requestForm, setRequestForm] = React.useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    message: '',
  });

  const loadCars = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await externalCarService.getExternalCars({
        page,
        pageSize: 20,
        brand,
        yearFrom: yearFrom ? Number(yearFrom) : undefined,
        yearTo: yearTo ? Number(yearTo) : undefined,
        availableOnly: false,
      });

      setCars(response.data);
      setCached(response.cached);
      setTotalRecords(response.totalRecords);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load Korean import listings.'));
    } finally {
      setIsLoading(false);
    }
  }, [brand, page, yearFrom, yearTo]);

  React.useEffect(() => {
    void loadCars();
  }, [loadCars]);

  const openRequestModal = (car: ExternalCar) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSelectedCar(car);
    setSuccessMessage(null);
    setRequestForm({
      customerName: [user?.accountName ?? user?.firstName, user?.accountLastname ?? user?.lastName].filter(Boolean).join(' '),
      customerEmail: user?.accountEmail ?? user?.email ?? '',
      customerPhone: '',
      message: `I am interested in ${getCarTitle(car)}.`,
    });
  };

  const handleSubmitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCar) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await externalCarService.createRequest({
        externalCarID: selectedCar.externalId,
        source: selectedCar.source,
        carName: getCarTitle(selectedCar),
        brand: selectedCar.brand,
        model: selectedCar.model,
        year: selectedCar.year,
        price: selectedCar.price,
        currency: selectedCar.currency,
        mileage: selectedCar.mileage,
        imageUrl: selectedCar.imageUrl,
        detailUrl: selectedCar.detailUrl,
        customerName: requestForm.customerName,
        customerEmail: requestForm.customerEmail,
        customerPhone: requestForm.customerPhone,
        message: requestForm.message,
      });

      setSelectedCar(null);
      setSuccessMessage('Your request was sent. Our team will review it in the admin panel.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not send the request.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page korean-cars-page">
      <section className="page-hero page-hero--korean">
        <div className="ak-container korean-hero-layout">
          <div>
            <p className="eyebrow">Korean import catalog</p>
            <h1>Korean Cars</h1>
            <p>Browse available import options. After you request a car, AutoKosova prepares a tailored price offer for you.</p>
          </div>

          <div className="korean-cache-panel">
            <span>Redis status</span>
            <strong>{cached ? 'Cache hit' : 'Live fetch'}</strong>
            <p>{cached ? 'These results came from Redis.' : 'These results were fetched from Carapis and cached.'}</p>
          </div>
        </div>
      </section>

      <section className="ak-container korean-toolbar">
        <form
          className="korean-filter-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (page === 1) {
              void loadCars();
            } else {
              setPage(1);
            }
          }}
        >
          <label>
            <span>Brand</span>
            <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Hyundai, Kia, BMW" />
          </label>
          <label>
            <span>Year from</span>
            <input value={yearFrom} onChange={(event) => setYearFrom(event.target.value)} inputMode="numeric" />
          </label>
          <label>
            <span>Year to</span>
            <input value={yearTo} onChange={(event) => setYearTo(event.target.value)} inputMode="numeric" />
          </label>
          <Button type="submit">Search</Button>
        </form>

        <div className="korean-result-meta">
          <strong>{totalRecords || cars.length} listings</strong>
          <span>{cached ? 'Served from Redis cache' : 'Fetched from Carapis API'}</span>
        </div>
      </section>

      <section className="ak-container korean-results">
        {successMessage && <div className="auth-alert auth-alert--success">{successMessage}</div>}
        {error && <div className="auth-alert">{error}</div>}

        {isLoading ? (
          <LoadingSpinner />
        ) : cars.length > 0 ? (
          <div className="listing-stack">
            {cars.map((car) => (
              <article className="listing-card external-car-card" key={`${car.source}-${car.externalId}`}>
                {(() => {
                  const imageSrc = getImageSrc(car.imageUrl);

                  return (
                    <>
                      <div className="listing-card__image">
                        {imageSrc && (
                          <img
                            src={imageSrc}
                            alt={getCarTitle(car)}
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                              event.currentTarget.nextElementSibling?.classList.add('visible');
                            }}
                          />
                        )}
                        <div className={`external-car-placeholder${imageSrc ? '' : ' visible'}`}>
                          <strong>{car.brand?.slice(0, 2).toUpperCase() || 'AK'}</strong>
                          <span>No photo</span>
                        </div>
                      </div>
                      <div className="listing-card__body">
                        <div className="listing-card__top">
                          <div>
                            <h3>{getCarTitle(car)}</h3>
                            <p>{getCarSubtitle(car)}</p>
                          </div>
                          <strong>Offer after request</strong>
                        </div>
                        <div className="car-specs">
                          <span>{formatMileage(car.mileage)}</span>
                          <span>{car.available === false ? 'Availability pending' : 'Available to request'}</span>
                        </div>
                        {getExtraSpecs(car).length > 0 && (
                          <div className="external-spec-grid">
                            {getExtraSpecs(car).map((spec) => (
                              <span key={spec}>{spec}</span>
                            ))}
                          </div>
                        )}
                        <div className="listing-card__footer">
                          <span>Request this car and we will prepare a price offer.</span>
                          <div className="external-card-actions">
                            {car.detailUrl && (
                              <a className="ak-button ak-button--ghost" href={car.detailUrl} target="_blank" rel="noreferrer">
                                Details
                              </a>
                            )}
                            <button type="button" className="ak-button ak-button--secondary" onClick={() => openRequestModal(car)}>
                              Request this car
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No Korean cars found" description="Try another brand or year range." />
        )}

        <div className="korean-pagination">
          <button type="button" disabled={page === 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </button>
          <span>Page {page}</span>
          <button type="button" disabled={isLoading || cars.length === 0} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </div>
      </section>

      {selectedCar && (
        <div className="ak-modal" role="dialog" aria-modal="true" aria-labelledby="external-request-title">
          <div className="ak-modal__backdrop" onClick={() => setSelectedCar(null)} />
          <div className="ak-modal__panel">
            <div className="ak-modal__header">
              <h2 id="external-request-title">Request this car</h2>
              <button type="button" className="ak-modal__close" onClick={() => setSelectedCar(null)}>
                X
              </button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="ak-modal__body">
                <div className="external-request-summary">
                  <strong>{getCarTitle(selectedCar)}</strong>
                  <span>Offer will be prepared after request - {formatMileage(selectedCar.mileage)}</span>
                </div>

                <div className="external-request-form">
                  <label>
                    <span>Name</span>
                    <input
                      value={requestForm.customerName}
                      onChange={(event) => setRequestForm((current) => ({ ...current, customerName: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={requestForm.customerEmail}
                      onChange={(event) => setRequestForm((current) => ({ ...current, customerEmail: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input
                      value={requestForm.customerPhone}
                      onChange={(event) => setRequestForm((current) => ({ ...current, customerPhone: event.target.value }))}
                      placeholder="+383..."
                    />
                  </label>
                  <label className="external-request-form__message">
                    <span>Message</span>
                    <textarea
                      value={requestForm.message}
                      onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))}
                      rows={4}
                    />
                  </label>
                </div>
              </div>
              <div className="ak-modal__footer">
                <button type="button" className="ak-button ak-button--ghost" onClick={() => setSelectedCar(null)}>
                  Cancel
                </button>
                <button type="submit" className="ak-button ak-button--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
