import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterSidebar, type MarketplaceFilters } from '../components/cars/FilterSidebar';
import { RentalCarCard } from '../components/cars/RentalCarCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SectionHeader } from '../components/common/SectionHeader';
import { RentSearchForm } from '../components/search/RentSearchForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Car } from '../lib/types';
import { carService } from '../services/carService';
import { getErrorMessage } from '../utils/helpers';

const categories = ['Economy', 'SUV', 'Luxury', 'Family', 'Electric', 'Van'];

type RatedCar = Car & { rating?: number };

const numberParam = (value: string | null) => (value ? Number(value) : undefined);

const filtersFromParams = (searchParams: URLSearchParams): MarketplaceFilters => ({
  minPrice: numberParam(searchParams.get('minPrice')),
  maxPrice: numberParam(searchParams.get('maxPrice')),
  carType: searchParams.get('carType') || undefined,
  minSeats: numberParam(searchParams.get('minSeats')),
  transmission: searchParams.get('transmission') || undefined,
  fuelType: searchParams.get('fuelType') || undefined,
  city: searchParams.get('city') || undefined,
  minRating: numberParam(searchParams.get('minRating')),
});

const paramsFromFilters = (filters: MarketplaceFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return params;
};

const filterRentalCars = (cars: Car[], filters: MarketplaceFilters) =>
  cars.filter((car) => {
    const rating = (car as RatedCar).rating;

    if (filters.minPrice !== undefined && car.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && car.price > filters.maxPrice) return false;
    if (filters.carType && (car.bodyType ?? car.type) !== filters.carType) return false;
    if (filters.minSeats && car.seats < filters.minSeats) return false;
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
    if (filters.city && car.city !== filters.city) return false;
    if (filters.minRating && (rating === undefined || rating < filters.minRating)) return false;

    return true;
  });

export const RentCarsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [rentalCars, setRentalCars] = React.useState<Car[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const filters = React.useMemo(() => filtersFromParams(searchParams), [searchParams]);

  React.useEffect(() => {
    const loadCars = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rentals = await carService.getCarsForRent();
        setRentalCars(rentals);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load rental cars.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCars();
  }, []);

  const filteredRentalCars = React.useMemo(() => filterRentalCars(rentalCars, filters), [rentalCars, filters]);

  const handleFiltersChange = (nextFilters: MarketplaceFilters) => {
    setSearchParams(paramsFromFilters(nextFilters));
  };

  const handleCategoryClick = (category: string) => {
    handleFiltersChange({
      ...filters,
      carType: filters.carType === category ? undefined : category,
    });
  };

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
          <button
            key={category}
            type="button"
            className={filters.carType === category ? 'active' : undefined}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="ak-container marketplace-toolbar">
        <div>
          <strong>{filteredRentalCars.length} rental cars found</strong>
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
          <FilterSidebar mode="rent" filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        <main className="marketplace-results">
          <SectionHeader
            title="Available rentals"
            description="Compare daily price, host, rating, trips, seats, and pickup location."
          />
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <EmptyState title="Could not load rentals" description={error} />
          ) : filteredRentalCars.length > 0 ? (
            <div className="card-grid rental-card-grid">
              {filteredRentalCars.map((car) => (
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
