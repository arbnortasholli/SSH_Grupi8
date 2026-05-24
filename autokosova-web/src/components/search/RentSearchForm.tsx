import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

const cities = ['Prishtina', 'Prizren', 'Peja', 'Ferizaj', 'Gjilan'];
const types = ['Any type', 'Economy', 'SUV', 'Luxury', 'Family', 'Electric', 'Van'];

export const RentSearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = React.useState('');
  const [carType, setCarType] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (carType) params.set('carType', carType);

    navigate(`/rent${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form className="search-form search-form--rent" onSubmit={handleSubmit}>
      <label>
        <span>Pickup city</span>
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">Any city</option>
          {cities.map((cityOption) => (
            <option key={cityOption} value={cityOption}>{cityOption}</option>
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
        <select value={carType} onChange={(event) => setCarType(event.target.value)}>
          {types.map((type) => (
            <option key={type} value={type === 'Any type' ? '' : type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" className="search-form__button">
        Find rentals
      </Button>
    </form>
  );
};
