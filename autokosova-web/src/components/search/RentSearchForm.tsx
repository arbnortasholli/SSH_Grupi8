import { Button } from '../common/Button';

const cities = ['Prishtina', 'Prizren', 'Peja', 'Ferizaj', 'Gjilan'];
const types = ['Any type', 'Economy', 'SUV', 'Luxury', 'Family', 'Electric', 'Van'];

export const RentSearchForm: React.FC = () => (
  <form className="search-form search-form--rent">
    <label>
      <span>Pickup city</span>
      <select>
        {cities.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
    </label>
    <label>
      <span>Pickup date</span>
      <input type="date" />
    </label>
    <label>
      <span>Return date</span>
      <input type="date" />
    </label>
    <label>
      <span>Car type</span>
      <select>
        {types.map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>
    </label>
    <Button to="/rent" className="search-form__button">
      Find rentals
    </Button>
  </form>
);
