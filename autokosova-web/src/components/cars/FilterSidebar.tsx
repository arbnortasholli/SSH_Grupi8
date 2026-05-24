export type MarketplaceFilters = {
  brand?: string;
  model?: string;
  minYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  fuelType?: string;
  transmission?: string;
  city?: string;
  bodyType?: string;
  carType?: string;
  minSeats?: number;
  minRating?: number;
};

type FilterSidebarProps = {
  mode: 'buy' | 'rent';
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
};

const brands = ['BMW', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Toyota', 'Hyundai', 'Kia', 'Ford', 'Tesla'];
const models = ['Golf', 'A4', 'X5', 'C-Class', 'i20', 'Sportage', 'Model Y', 'Transit'];
const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const transmissions = ['Manual', 'Automatic'];
const cities = ['Prishtina', 'Prizren', 'Peja', 'Ferizaj', 'Gjilan', 'Gjakova', 'Prishtina Airport'];
const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Van', 'Coupe'];
const carTypes = ['Economy', 'SUV', 'Luxury', 'Family', 'Electric', 'Van'];

const salePriceOptions = [
  { label: 'Any price', minPrice: undefined, maxPrice: undefined },
  { label: 'Under EUR 10k', minPrice: undefined, maxPrice: 10000 },
  { label: 'EUR 10k - EUR 25k', minPrice: 10000, maxPrice: 25000 },
  { label: 'EUR 25k+', minPrice: 25000, maxPrice: undefined },
];

const rentalPriceOptions = [
  { label: 'Any price', minPrice: undefined, maxPrice: undefined },
  { label: 'Under EUR 35', minPrice: undefined, maxPrice: 35 },
  { label: 'EUR 35 - EUR 70', minPrice: 35, maxPrice: 70 },
  { label: 'EUR 70+', minPrice: 70, maxPrice: undefined },
];

const priceValue = (filters: MarketplaceFilters) => `${filters.minPrice ?? ''}:${filters.maxPrice ?? ''}`;

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ mode, filters, onFiltersChange }) => {
  const updateFilter = <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const updatePriceRange = (value: string) => {
    const [minPrice, maxPrice] = value.split(':');

    onFiltersChange({
      ...filters,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h3>Filters</h3>
        <button type="button" onClick={() => onFiltersChange({})}>
          Reset
        </button>
      </div>

      {mode === 'buy' ? (
        <>
          <label className="filter-field">
            <span>Brand</span>
            <select value={filters.brand ?? ''} onChange={(event) => updateFilter('brand', event.target.value)}>
              <option value="">Any</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Model</span>
            <select value={filters.model ?? ''} onChange={(event) => updateFilter('model', event.target.value)}>
              <option value="">Any model</option>
              {models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Year from/to</span>
            <select
              value={filters.minYear ?? ''}
              onChange={(event) => updateFilter('minYear', event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Any year</option>
              <option value="2018">2018+</option>
              <option value="2020">2020+</option>
              <option value="2022">2022+</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Price from/to</span>
            <select value={priceValue(filters)} onChange={(event) => updatePriceRange(event.target.value)}>
              {salePriceOptions.map((option) => (
                <option key={option.label} value={`${option.minPrice ?? ''}:${option.maxPrice ?? ''}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Mileage</span>
            <select
              value={filters.maxMileage ?? ''}
              onChange={(event) => updateFilter('maxMileage', event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Any mileage</option>
              <option value="50000">Under 50k</option>
              <option value="100000">Under 100k</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Fuel type</span>
            <select value={filters.fuelType ?? ''} onChange={(event) => updateFilter('fuelType', event.target.value)}>
              <option value="">Any</option>
              {fuelTypes.map((fuelType) => (
                <option key={fuelType} value={fuelType}>{fuelType}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Transmission</span>
            <select value={filters.transmission ?? ''} onChange={(event) => updateFilter('transmission', event.target.value)}>
              <option value="">Any</option>
              {transmissions.map((transmission) => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>City</span>
            <select value={filters.city ?? ''} onChange={(event) => updateFilter('city', event.target.value)}>
              <option value="">Any city</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Body type</span>
            <select value={filters.bodyType ?? ''} onChange={(event) => updateFilter('bodyType', event.target.value)}>
              <option value="">Any</option>
              {bodyTypes.map((bodyType) => (
                <option key={bodyType} value={bodyType}>{bodyType}</option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <>
          <label className="filter-field">
            <span>Daily price range</span>
            <select value={priceValue(filters)} onChange={(event) => updatePriceRange(event.target.value)}>
              {rentalPriceOptions.map((option) => (
                <option key={option.label} value={`${option.minPrice ?? ''}:${option.maxPrice ?? ''}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Car type</span>
            <select value={filters.carType ?? ''} onChange={(event) => updateFilter('carType', event.target.value)}>
              <option value="">Any type</option>
              {carTypes.map((carType) => (
                <option key={carType} value={carType}>{carType}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Seats</span>
            <select
              value={filters.minSeats ?? ''}
              onChange={(event) => updateFilter('minSeats', event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Any</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
              <option value="7">7+</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Transmission</span>
            <select value={filters.transmission ?? ''} onChange={(event) => updateFilter('transmission', event.target.value)}>
              <option value="">Any</option>
              {transmissions.map((transmission) => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Fuel type</span>
            <select value={filters.fuelType ?? ''} onChange={(event) => updateFilter('fuelType', event.target.value)}>
              <option value="">Any</option>
              {fuelTypes.map((fuelType) => (
                <option key={fuelType} value={fuelType}>{fuelType}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>City</span>
            <select value={filters.city ?? ''} onChange={(event) => updateFilter('city', event.target.value)}>
              <option value="">Any city</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Rating</span>
            <select
              value={filters.minRating ?? ''}
              onChange={(event) => updateFilter('minRating', event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Any rating</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
              <option value="5">5.0</option>
            </select>
          </label>
        </>
      )}
    </aside>
  );
};
