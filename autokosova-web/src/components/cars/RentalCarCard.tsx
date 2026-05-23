import type { Car } from '../../lib/types';
import { Button } from '../common/Button';

type RentalCarCardProps = {
  car: Car;
};

export const RentalCarCard: React.FC<RentalCarCardProps> = ({ car }) => (
  <article className="rental-card">
    <div className="rental-card__image">
      <img src={car.images[0] || '/favicon.svg'} alt={`${car.brand} ${car.model}`} />
      <span className={car.isAvailable ? 'availability available' : 'availability unavailable'}>
        {car.isAvailable ? 'Available' : 'Booked'}
      </span>
    </div>
    <div className="rental-card__body">
      <div className="rental-card__heading">
        <div>
          <h3>
            {car.brand} {car.model}
          </h3>
          <p>
            {car.year} - {car.city ?? 'Kosovo'}
          </p>
        </div>
        <div className="daily-price">
          <strong>&euro;{car.price}</strong>
          <span>/day</span>
        </div>
      </div>
      <div className="rental-meta">
        <span>{car.fuelType}</span>
        <span>{car.transmission}</span>
        <span>{car.seats} seats</span>
      </div>
      <p className="host-line">Hosted by {car.sellerName}</p>
      <Button to={`/cars/${car.id}`} variant={car.isAvailable ? 'primary' : 'secondary'}>
        {car.isAvailable ? 'Book now' : 'View details'}
      </Button>
    </div>
  </article>
);
