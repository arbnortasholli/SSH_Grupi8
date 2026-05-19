import React from 'react';
import { Button } from '../components/common/Button';
import { useForm } from '../hooks/useForm';

const ownerSteps = [
  {
    value: '01',
    title: 'Share the car details',
    description: 'Add make, model, year, pickup city, daily price, and the basics renters need to compare.',
  },
  {
    value: '02',
    title: 'Set availability',
    description: 'Tell customers when the car is ready, where pickup works best, and what usage rules apply.',
  },
  {
    value: '03',
    title: 'Receive requests',
    description: 'Rental requests can move into the owner dashboard once the API flow is connected.',
  },
];

const ownerBenefits = [
  'Daily price and city-first listing structure',
  'Rental-focused details instead of sale-only fields',
  'Prepared for seller accounts and booking requests',
  'Consistent with the existing AutoKosova marketplace UI',
];

const fallbackCarImage = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=82';

export const RentYourCarPage: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);

  const { values, handleChange, handleSubmit, isSubmitting, reset } = useForm({
    ownerName: '',
    phone: '',
    city: 'Prishtina',
    brand: '',
    model: '',
    imageUrl: '',
    year: new Date().getFullYear(),
    dailyPrice: 45,
    availability: 'Available now',
    notes: '',
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    setSubmitted(true);
    reset();
  };

  return (
    <div className="page rent-your-car-page">
      <section className="page-hero page-hero--owner">
        <div className="ak-container owner-hero-layout">
          <div className="owner-hero-copy">
            <p className="eyebrow">Rent your car</p>
            <h1>Put your car in front of renters across Kosovo.</h1>
            <p>
              Create a rental-ready owner lead with the car details, pickup city, daily price, and availability.
            </p>
            <div className="hero-actions">
              <a href="#owner-listing-form" className="ak-button ak-button--primary">Start listing</a>
              <Button to="/rent" variant="secondary">View rentals</Button>
            </div>
          </div>

          <aside className="owner-hero-card" aria-label="Owner listing summary">
            <span>Owner flow</span>
            <strong>List the car, set daily price, review requests.</strong>
            <dl>
              <div>
                <dt>Setup</dt>
                <dd>5 min</dd>
              </div>
              <div>
                <dt>Pricing</dt>
                <dd>Daily</dd>
              </div>
              <div>
                <dt>Market</dt>
                <dd>Kosovo</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="ak-section owner-flow-section">
        <div className="ak-container owner-flow-grid">
          {ownerSteps.map((step) => (
            <article key={step.value} className="owner-step-card">
              <span>{step.value}</span>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ak-section ak-section--soft">
        <div className="ak-container owner-listing-shell">
          <aside className="owner-listing-copy">
            <p className="eyebrow">Owner request</p>
            <h2>Send the car information.</h2>
            <p>
              This frontend form is ready for the same service flow used by the rest of the app. For now it confirms the
              request locally, so the page can be tested without backend setup.
            </p>
            <div className="reason-list">
              {ownerBenefits.map((benefit) => (
                <div key={benefit}>{benefit}</div>
              ))}
            </div>
          </aside>

          <main className="owner-form-panel" id="owner-listing-form">
            <div className="owner-form-heading">
              <div>
                <p className="eyebrow">Car owner details</p>
                <h2>Rent your car</h2>
              </div>
              <span>Frontend demo</span>
            </div>

            {submitted && (
              <div className="owner-form-success" role="status">
                Your rental car request was prepared successfully.
              </div>
            )}

            <form className="owner-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="owner-form-grid">
                <label className="owner-field" htmlFor="ownerName">
                  <span>Owner name</span>
                  <input
                    id="ownerName"
                    name="ownerName"
                    value={values.ownerName}
                    onChange={handleChange}
                    placeholder="Arber Krasniqi"
                    required
                  />
                </label>

                <label className="owner-field" htmlFor="phone">
                  <span>Phone number</span>
                  <input
                    id="phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    placeholder="+383 44 000 000"
                    required
                  />
                </label>
              </div>

              <div className="owner-form-grid">
                <label className="owner-field" htmlFor="brand">
                  <span>Brand</span>
                  <input id="brand" name="brand" value={values.brand} onChange={handleChange} placeholder="BMW" required />
                </label>

                <label className="owner-field" htmlFor="model">
                  <span>Model</span>
                  <input id="model" name="model" value={values.model} onChange={handleChange} placeholder="320d" required />
                </label>
              </div>

              <div className="owner-image-row">
                <label className="owner-field" htmlFor="imageUrl">
                  <span>Car image URL</span>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    value={values.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/car-photo.jpg"
                  />
                </label>

                <div className="owner-image-preview">
                  <img
                    src={values.imageUrl ? String(values.imageUrl) : fallbackCarImage}
                    alt="Car preview"
                    onError={(event) => {
                      event.currentTarget.src = fallbackCarImage;
                    }}
                  />
                  <span>Image preview</span>
                </div>
              </div>

              <div className="owner-form-grid owner-form-grid--three">
                <label className="owner-field" htmlFor="year">
                  <span>Year</span>
                  <input id="year" type="number" name="year" value={values.year} onChange={handleChange} min={1990} required />
                </label>

                <label className="owner-field" htmlFor="dailyPrice">
                  <span>Daily price</span>
                  <input id="dailyPrice" type="number" name="dailyPrice" value={values.dailyPrice} onChange={handleChange} min={1} required />
                </label>

                <label className="owner-field" htmlFor="city">
                  <span>Pickup city</span>
                  <select id="city" name="city" value={values.city} onChange={handleChange}>
                    <option>Prishtina</option>
                    <option>Prizren</option>
                    <option>Peja</option>
                    <option>Gjakova</option>
                    <option>Ferizaj</option>
                    <option>Gjilan</option>
                  </select>
                </label>
              </div>

              <label className="owner-field" htmlFor="availability">
                <span>Availability</span>
                <select id="availability" name="availability" value={values.availability} onChange={handleChange}>
                  <option>Available now</option>
                  <option>Available this week</option>
                  <option>Available next week</option>
                  <option>Available on request</option>
                </select>
              </label>

              <label className="owner-field" htmlFor="notes">
                <span>Notes</span>
                <textarea
                  id="notes"
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  placeholder="Pickup location, insurance notes, mileage rules, or anything renters should know."
                />
              </label>

              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Preparing request...' : 'Submit rental listing'}
              </button>
            </form>
          </main>
        </div>
      </section>
    </div>
  );
};
