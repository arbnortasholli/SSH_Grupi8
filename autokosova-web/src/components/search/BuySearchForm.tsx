import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

const brands = ['Any brand', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Toyota'];
const cities = ['Any city', 'Prishtina', 'Prizren', 'Peja', 'Ferizaj', 'Gjilan'];

export const BuySearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [brand, setBrand] = React.useState('');
  const [model, setModel] = React.useState('');
  const [priceRange, setPriceRange] = React.useState('');
  const [city, setCity] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (model.trim()) params.set('model', model.trim());
    if (city) params.set('city', city);

    if (priceRange === 'under-10000') {
      params.set('maxPrice', '10000');
    } else if (priceRange === '10000-25000') {
      params.set('minPrice', '10000');
      params.set('maxPrice', '25000');
    } else if (priceRange === '25000-50000') {
      params.set('minPrice', '25000');
      params.set('maxPrice', '50000');
    }

    navigate(`/buy${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label>
        <span>Brand</span>
        <select value={brand} onChange={(event) => setBrand(event.target.value)}>
          {brands.map((brandOption) => (
            <option key={brandOption} value={brandOption === 'Any brand' ? '' : brandOption}>
              {brandOption}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Model</span>
        <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="e.g. Golf, X5, A4" />
      </label>
      <label>
        <span>Price range</span>
        <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
          <option value="">Any price</option>
          <option value="under-10000">Under EUR 10,000</option>
          <option value="10000-25000">EUR 10,000 - EUR 25,000</option>
          <option value="25000-50000">EUR 25,000 - EUR 50,000</option>
        </select>
      </label>
      <label>
        <span>City</span>
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          {cities.map((cityOption) => (
            <option key={cityOption} value={cityOption === 'Any city' ? '' : cityOption}>
              {cityOption}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" className="search-form__button">
        Search cars
      </Button>
    </form>
  );
};
