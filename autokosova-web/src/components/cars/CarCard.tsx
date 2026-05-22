import type { Car } from '../../lib/types';
import { Button } from '../common/Button';

type CarCardProps = {
  car: Car;
};

const formatEuro = (value: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

export const CarCard: React.FC<CarCardProps> = ({ car }) => (
  <article className="listing-card">
    <div className="listing-card__image">
      <img src={car.images[0] || '/favicon.svg'} alt={`${car.brand} ${car.model}`} />
      <button type="button" className={car.isFavorite ? 'favorite active' : 'favorite'} aria-label="Save car">
        &hearts;
      </button>
    </div>
    <div className="listing-card__body">
      <div className="listing-card__top">
        <div>
          <h3>
            {car.brand} {car.model}
          </h3>
          <p>
            {car.year} - {car.city ?? 'Kosovo'}
          </p>
        </div>
        <strong>{formatEuro(car.price)}</strong>
      </div>
      <div className="car-specs">
        <span>{car.mileage.toLocaleString()} km</span>
        <span>{car.fuelType}</span>
        <span>{car.transmission}</span>
        <span>{car.bodyType ?? car.type}</span>
      </div>
      <div className="listing-card__footer">
        <span>{car.sellerType ?? car.sellerName}</span>
        <Button to={`/cars/${car.id}`} variant="secondary">
          View details
        </Button>
      </div>
    </div>
  </article>
);
