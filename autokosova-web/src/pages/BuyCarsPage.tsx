import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CarCard } from '../components/cars/CarCard';
import { FilterSidebar, type MarketplaceFilters } from '../components/cars/FilterSidebar';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SectionHeader } from '../components/common/SectionHeader';
import { SortDropdown } from '../components/common/SortDropdown';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Car } from '../lib/types';
import { carService } from '../services/carService';
import { formatCurrency, getErrorMessage } from '../utils/helpers';

const sortCars = (cars: Car[], sort: string) => {
  const sorted = [...cars];

  if (sort === 'lowest-price') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'highest-price') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'lowest-mileage') sorted.sort((a, b) => a.mileage - b.mileage);
  if (sort === 'newest') sorted.sort((a, b) => b.year - a.year);

  return sorted;
};

const numberParam = (value: string | null) => (value ? Number(value) : undefined);

const filtersFromParams = (searchParams: URLSearchParams): MarketplaceFilters => ({
  brand: searchParams.get('brand') || undefined,
  model: searchParams.get('model') || undefined,
  minYear: numberParam(searchParams.get('minYear')),
  minPrice: numberParam(searchParams.get('minPrice')),
  maxPrice: numberParam(searchParams.get('maxPrice')),
  maxMileage: numberParam(searchParams.get('maxMileage')),
  fuelType: searchParams.get('fuelType') || undefined,
  transmission: searchParams.get('transmission') || undefined,
  city: searchParams.get('city') || undefined,
  bodyType: searchParams.get('bodyType') || undefined,
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

const filterSaleCars = (cars: Car[], filters: MarketplaceFilters) =>
  cars.filter((car) => {
    if (filters.brand && car.brand !== filters.brand) return false;
    if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (filters.minYear && car.year < filters.minYear) return false;
    if (filters.minPrice !== undefined && car.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && car.price > filters.maxPrice) return false;
    if (filters.maxMileage !== undefined && car.mileage > filters.maxMileage) return false;
    if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.city && car.city !== filters.city) return false;
    if (filters.bodyType && (car.bodyType ?? car.type) !== filters.bodyType) return false;

    return true;
  });

export const BuyCarsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = React.useState('newest');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const filters = React.useMemo(() => filtersFromParams(searchParams), [searchParams]);

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

  const filteredCars = React.useMemo(() => filterSaleCars(cars, filters), [cars, filters]);
  const sortedCars = React.useMemo(() => sortCars(filteredCars, sort), [filteredCars, sort]);
  const heroStats = React.useMemo(() => {
    const cityCount = new Set(sortedCars.map((car) => car.city).filter(Boolean)).size;
    const lowestPrice = sortedCars.length > 0 ? Math.min(...sortedCars.map((car) => car.price)) : null;

    return {
      listings: sortedCars.length,
      cities: cityCount,
      fromPrice: lowestPrice,
    };
  }, [sortedCars]);
  const marketStats = React.useMemo(() => {
    if (sortedCars.length === 0) {
      return {
        averagePrice: null as number | null,
        topBodyType: 'No data',
        topCity: 'No data',
        newestYear: null as number | null,
      };
    }

    const averagePrice = sortedCars.reduce((sum, car) => sum + car.price, 0) / sortedCars.length;
    const bodyTypeCounts = new Map<string, number>();
    const cityCounts = new Map<string, number>();

    sortedCars.forEach((car) => {
      const bodyType = car.bodyType ?? car.type;
      bodyTypeCounts.set(bodyType, (bodyTypeCounts.get(bodyType) ?? 0) + 1);
      if (car.city) {
        cityCounts.set(car.city, (cityCounts.get(car.city) ?? 0) + 1);
      }
    });

    const topBodyType = [...bodyTypeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data';
    const topCity = [...cityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data';
    const newestYear = Math.max(...sortedCars.map((car) => car.year));

    return { averagePrice, topBodyType, topCity, newestYear };
  }, [sortedCars]);

  const handleFiltersChange = (nextFilters: MarketplaceFilters) => {
    setSearchParams(paramsFromFilters(nextFilters));
  };

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
              <span><strong>{heroStats.listings}</strong> listings</span>
              <span><strong>{heroStats.cities}</strong> cities</span>
              <span><strong>{heroStats.fromPrice !== null ? formatCurrency(heroStats.fromPrice) : 'No data'}</strong> from</span>
            </div>
            <div className="buy-hero-chips">
              <span>Diesel</span>
              <span>Automatic</span>
              <span>Under 50k km</span>
              <span>Live API data</span>
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
          <strong>{marketStats.averagePrice !== null ? formatCurrency(marketStats.averagePrice) : 'No data'}</strong>
        </div>
        <div>
          <span>Most listed body type</span>
          <strong>{marketStats.topBodyType}</strong>
        </div>
        <div>
          <span>Popular city</span>
          <strong>{marketStats.topCity}</strong>
        </div>
        <div>
          <span>Newest listing year</span>
          <strong>{marketStats.newestYear ?? 'No data'}</strong>
        </div>
      </section>

      <section className="ak-container marketplace-layout">
        <div className={filtersOpen ? 'filters-panel open' : 'filters-panel'}>
          <FilterSidebar mode="buy" filters={filters} onFiltersChange={handleFiltersChange} />
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
