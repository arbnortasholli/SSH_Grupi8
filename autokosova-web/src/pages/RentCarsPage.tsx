import React from 'react';
import { FilterSidebar } from '../components/cars/FilterSidebar';
import { RentalCarCard } from '../components/cars/RentalCarCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SectionHeader } from '../components/common/SectionHeader';
import { RentSearchForm } from '../components/search/RentSearchForm';
import { rentalCars } from '../data/rentalCarsDummyData';

const categories = ['Economy', 'SUV', 'Luxury', 'Family', 'Electric', 'Van'];

export const RentCarsPage: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  return (
    <div className="page marketplace-page rental-page">
      <section className="page-hero page-hero--rent">
        <div className="ak-container rent-hero-layout">
          <div>
            <p className="eyebrow">Rent cars</p>
            <h1>Rent a Car</h1>
            <p>Search rental cars by pickup city, dates, type, seats, and daily budget.</p>
          </div>
          <div className="rent-trip-card">
            <span>Quick trip setup</span>
            <strong>Prishtina weekend pickup</strong>
            <p>Set your city and dates, then compare daily prices, host ratings, seats, and availability.</p>
          </div>
          <div className="rent-search-shell">
            <RentSearchForm />
          </div>
        </div>
      </section>

      <section className="ak-container rental-categories">
        {categories.map((category) => (
          <button key={category} type="button">
            {category}
          </button>
        ))}
      </section>

      <section className="ak-container marketplace-toolbar">
        <div>
          <strong>{rentalCars.length} rental cars found</strong>
          <span>Booking-focused rentals with daily pricing and availability.</span>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="filter-toggle" onClick={() => setFiltersOpen((current) => !current)}>
            Filters
          </button>
          <Button to="/rent" variant="secondary">
            Update search
          </Button>
        </div>
      </section>

      <section className="ak-container marketplace-layout">
        <div className={filtersOpen ? 'filters-panel open' : 'filters-panel'}>
          <FilterSidebar mode="rent" />
        </div>

        <main className="marketplace-results">
          <SectionHeader
            title="Available rentals"
            description="Compare daily price, host, rating, trips, seats, and pickup location."
          />
          {rentalCars.length > 0 ? (
            <div className="card-grid rental-card-grid">
              {rentalCars.map((car) => (
                <RentalCarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <EmptyState title="No rentals found" description="Try different dates or another pickup city." />
          )}
        </main>
      </section>
    </div>
  );
};
