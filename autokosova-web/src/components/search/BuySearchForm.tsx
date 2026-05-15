import { Button } from '../common/Button';

const brands = ['Any brand', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Toyota'];
const cities = ['Any city', 'Prishtina', 'Prizren', 'Peja', 'Ferizaj', 'Gjilan'];

export const BuySearchForm: React.FC = () => (
  <form className="search-form">
    <label>
      <span>Brand</span>
      <select>
        {brands.map((brand) => (
          <option key={brand}>{brand}</option>
        ))}
      </select>
    </label>
    <label>
      <span>Model</span>
      <input placeholder="e.g. Golf, X5, A4" />
    </label>
    <label>
      <span>Price range</span>
      <select>
        <option>Any price</option>
        <option>Under €10,000</option>
        <option>€10,000 - €25,000</option>
        <option>€25,000 - €50,000</option>
      </select>
    </label>
    <label>
      <span>City</span>
      <select>
        {cities.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
    </label>
    <Button to="/buy" className="search-form__button">
      Search cars
    </Button>
  </form>
);
