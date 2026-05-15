import type { RentalCar } from '../../data/rentalCarsDummyData';
import { Button } from '../common/Button';

type RentalCarCardProps = {
  car: RentalCar;
};

export const RentalCarCard: React.FC<RentalCarCardProps> = ({ car }) => (
  <article className="rental-card">
    <div className="rental-card__image">
      <img src={car.image} alt={`${car.brand} ${car.model}`} />
      <span className={car.available ? 'availability available' : 'availability unavailable'}>
        {car.available ? 'Available' : 'Booked'}
      </span>
    </div>
    <div className="rental-card__body">
      <div className="rental-card__heading">
        <div>
          <h3>
            {car.brand} {car.model}
          </h3>
          <p>
            {car.year} - {car.location}
          </p>
        </div>
        <div className="daily-price">
          <strong>&euro;{car.dailyPrice}</strong>
          <span>/day</span>
        </div>
      </div>
      <div className="rental-meta">
        <span>{car.rating.toFixed(1)} rating</span>
        <span>{car.trips} trips</span>
        <span>{car.seats} seats</span>
      </div>
      <p className="host-line">Hosted by {car.hostName}</p>
      <Button to={`/cars/${car.id}`} variant={car.available ? 'primary' : 'secondary'}>
        {car.available ? 'Book now' : 'View details'}
      </Button>
    </div>
  </article>
);
