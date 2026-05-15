type FilterSidebarProps = {
  mode: 'buy' | 'rent';
};

const buyFilters = [
  { label: 'Brand', options: ['Any', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Toyota'] },
  { label: 'Model', options: ['Any model', 'Golf', 'A4', 'X5', 'C-Class'] },
  { label: 'Year from/to', options: ['Any year', '2018+', '2020+', '2022+'] },
  { label: 'Price from/to', options: ['Any price', 'Under €10k', '€10k - €25k', '€25k+'] },
  { label: 'Mileage', options: ['Any mileage', 'Under 50k', 'Under 100k'] },
  { label: 'Fuel type', options: ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'] },
  { label: 'Transmission', options: ['Any', 'Manual', 'Automatic'] },
  { label: 'City', options: ['Any city', 'Prishtina', 'Prizren', 'Peja'] },
  { label: 'Body type', options: ['Any', 'Sedan', 'SUV', 'Hatchback', 'Van'] },
];

const rentFilters = [
  { label: 'Daily price range', options: ['Any price', 'Under €35', '€35 - €70', '€70+'] },
  { label: 'Car type', options: ['Any type', 'Economy', 'SUV', 'Luxury', 'Family', 'Electric'] },
  { label: 'Seats', options: ['Any', '4+', '5+', '7+'] },
  { label: 'Transmission', options: ['Any', 'Manual', 'Automatic'] },
  { label: 'Fuel type', options: ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'] },
  { label: 'City', options: ['Any city', 'Prishtina', 'Prizren', 'Peja'] },
  { label: 'Rating', options: ['Any rating', '4.5+', '4.8+', '5.0'] },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ mode }) => {
  const filters = mode === 'buy' ? buyFilters : rentFilters;

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h3>Filters</h3>
        <button type="button">Reset</button>
      </div>
      {filters.map((filter) => (
        <label key={filter.label} className="filter-field">
          <span>{filter.label}</span>
          <select>
            {filter.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      ))}
    </aside>
  );
};
