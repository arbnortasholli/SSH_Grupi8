import React from 'react';
import { CarCard } from '../components/cars/CarCard';
import { FilterSidebar } from '../components/cars/FilterSidebar';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SectionHeader } from '../components/common/SectionHeader';
import { SortDropdown } from '../components/common/SortDropdown';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Car } from '../lib/types';
import { carService } from '../services/carService';
import { getErrorMessage } from '../utils/helpers';

const sortCars = (cars: Car[], sort: string) => {
  const sorted = [...cars];

  if (sort === 'lowest-price') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'highest-price') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'lowest-mileage') sorted.sort((a, b) => a.mileage - b.mileage);
  if (sort === 'newest') sorted.sort((a, b) => b.year - a.year);

  return sorted;
};

export const BuyCarsPage: React.FC = () => {
  const [sort, setSort] = React.useState('newest');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadCars = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const saleListings = await carService.getCarsForSale();
        setCars(saleListings);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load cars for sale.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCars();
  }, []);

  const sortedCars = sortCars(cars, sort);

  return (
    <div className="page marketplace-page">
      <section className="page-hero page-hero--buy">
        <div className="ak-container buy-hero-layout">
          <div className="buy-hero-copy">
            <p className="eyebrow">Buy cars</p>
            <h1>Cars for Sale</h1>
            <p>Compare verified-looking sale listings by city, mileage, fuel type, price, and seller type.</p>
          </div>

          <div className="buy-hero-panel">
            <div>
              <span className="panel-label">Live market preview</span>
              <strong>Find the right car faster</strong>
              <p>Search sale listings across Kosovo with useful filters and clear comparison cards.</p>
            </div>
            <div className="buy-hero-stats">
              <span><strong>{sortedCars.length}</strong> listings</span>
              <span><strong>6</strong> cities</span>
              <span><strong>€21.5k</strong> from</span>
            </div>
            <div className="buy-hero-chips">
              <span>Diesel</span>
              <span>Automatic</span>
              <span>Under 50k km</span>
              <span>Dealer listings</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ak-container marketplace-toolbar">
        <div>
          <strong>{sortedCars.length} cars found</strong>
          <span>Showing sale listings across Kosovo cities.</span>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="filter-toggle" onClick={() => setFiltersOpen((current) => !current)}>
            Filters
          </button>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </section>

      <section className="ak-container buy-market-strip" aria-label="Market highlights">
        <div>
          <span>Average listed price</span>
          <strong>€31,450</strong>
        </div>
        <div>
          <span>Most listed body type</span>
          <strong>Sedan</strong>
        </div>
        <div>
          <span>Popular city</span>
          <strong>Prishtina</strong>
        </div>
        <div>
          <span>Dealer listings</span>
          <strong>64%</strong>
        </div>
      </section>

      <section className="ak-container marketplace-layout">
        <div className={filtersOpen ? 'filters-panel open' : 'filters-panel'}>
          <FilterSidebar mode="buy" />
        </div>

        <main className="marketplace-results">
          <SectionHeader
            title="Available sale listings"
            description="Narrow by brand, year, price, mileage, fuel, transmission, city, and body type."
            action={<Button variant="ghost">Save search</Button>}
          />
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <EmptyState title="Could not load cars" description={error} />
          ) : sortedCars.length > 0 ? (
            <div className="listing-stack">
              {sortedCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <EmptyState title="No cars found" description="Adjust filters or clear the search to see more listings." />
          )}
        </main>
      </section>
    </div>
  );
};
