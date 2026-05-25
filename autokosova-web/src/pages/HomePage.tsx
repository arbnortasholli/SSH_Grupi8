import React from 'react';
import { BrandCard, type BrandCardData } from '../components/cars/BrandCard';
import { CarCard } from '../components/cars/CarCard';
import { HowItWorksCard } from '../components/cars/HowItWorksCard';
import { RentalCarCard } from '../components/cars/RentalCarCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SectionHeader } from '../components/common/SectionHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BuySearchForm } from '../components/search/BuySearchForm';
import { RentSearchForm } from '../components/search/RentSearchForm';
import { SearchTabs, type SearchMode } from '../components/search/SearchTabs';
import type { Car } from '../lib/types';
import { carService } from '../services/carService';
import { formatCurrency, getErrorMessage } from '../utils/helpers';

const howItWorks = [
  {
    step: '01',
    label: 'Search',
    title: 'Start with the right flow',
    description: 'Choose Buy or Rent, then narrow results by Kosovo city, budget, dates, brand, and vehicle type.',
  },
  {
    step: '02',
    label: 'Compare',
    title: 'Review the details that matter',
    description:
      'Sale listings show price, mileage, fuel, seller type, and city. Rentals show daily price, host, rating, and availability.',
  },
  {
    step: '03',
    label: 'Connect',
    title: 'Contact or continue booking',
    description: 'Move from shortlist to action with seller contact for buying or a date-based booking path for rentals.',
  },
];

const reasons = [
  'Kosovo city filters for sale and rental searches',
  'Separate buying and booking flows',
  'Vehicle details arranged for fast comparison',
  'Live listing data loaded from the AutoKosova API',
];

const brandAccents = ['#1d4ed8', '#111827', '#475569', '#b91c1c', '#15803d', '#991b1b'];

const buildBrandLogoUrl = (brandName: string) =>
  `https://cdn.simpleicons.org/${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;

const buildPopularBrands = (cars: Car[]): BrandCardData[] => {
  const brandMap = new Map<string, {
    count: number;
    totalPrice: number;
    models: Map<string, number>;
    cities: Map<string, number>;
  }>();

  cars.forEach((car) => {
    const brandName = car.brand.trim();
    if (!brandName) return;

    const current = brandMap.get(brandName) ?? {
      count: 0,
      totalPrice: 0,
      models: new Map<string, number>(),
      cities: new Map<string, number>(),
    };

    current.count += 1;
    current.totalPrice += car.price;
    if (car.model) {
      current.models.set(car.model, (current.models.get(car.model) ?? 0) + 1);
    }
    if (car.city) {
      current.cities.set(car.city, (current.cities.get(car.city) ?? 0) + 1);
    }

    brandMap.set(brandName, current);
  });

  return [...brandMap.entries()]
    .sort(([, left], [, right]) => right.count - left.count)
    .slice(0, 6)
    .map(([name, stats], index) => {
      const popularModel = [...stats.models.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Model data unavailable';
      const topCity = [...stats.cities.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Not listed';

      return {
        name,
        logoUrl: buildBrandLogoUrl(name),
        count: stats.count,
        averagePrice: formatCurrency(stats.totalPrice / stats.count),
        popularModel,
        topCity,
        accent: brandAccents[index % brandAccents.length],
      };
    });
};

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<SearchMode>('buy');
  const [saleCars, setSaleCars] = React.useState<Car[]>([]);
  const [rentalCars, setRentalCars] = React.useState<Car[]>([]);
  const [brands, setBrands] = React.useState<BrandCardData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadFeaturedCars = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [saleListings, rentalListings, allCarsResponse] = await Promise.all([
          carService.getCarsForSale(),
          carService.getCarsForRent(),
          carService.getCars(undefined, 1, 200),
        ]);

        setSaleCars(saleListings.slice(0, 3));
        setRentalCars(rentalListings.slice(0, 4));
        setBrands(buildPopularBrands(allCarsResponse.data));
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Could not load homepage listings.'));
        setSaleCars([]);
        setRentalCars([]);
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadFeaturedCars();
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div className="ak-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">AutoKosova</p>
            <h1>Find your next car in Kosovo</h1>
            <p>Search cars for sale or rent by city, budget, dates, and vehicle type.</p>
            <div className="hero-actions">
              <Button to="/buy">Browse cars for sale</Button>
              <Button to="/rent" variant="secondary">Find rental cars</Button>
            </div>
          </div>

          <div className="hero-search" aria-label="Search cars">
            <div className="search-panel-heading">
              <strong>Start your search</strong>
              <span>Choose a buying or rental flow</span>
            </div>
            <SearchTabs activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === 'buy' ? <BuySearchForm /> : <RentSearchForm />}
          </div>
        </div>
      </section>

      <section className="ak-section">
        <div className="ak-container">
          <SectionHeader
            eyebrow="For sale"
            title="Featured cars for sale"
            description="Selected sale listings with price, mileage, fuel type, and seller information."
            action={<Button to="/buy" variant="ghost">View all</Button>}
          />
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <EmptyState title="Could not load featured sale cars" description={error} />
          ) : saleCars.length > 0 ? (
            <div className="card-grid card-grid--3">
              {saleCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <EmptyState title="No sale cars available" description="Featured sale listings will appear here when cars are available." />
          )}
        </div>
      </section>

      <section className="ak-section ak-section--soft home-rentals-section">
        <div className="ak-container home-rentals">
          <div className="home-rentals__panel">
            <p className="eyebrow">Rentals</p>
            <h2>Popular rental cars for quick Kosovo trips</h2>
            <p>
              Compare daily prices, host ratings, pickup cities, and availability before choosing the car that fits your dates.
            </p>
            <div className="home-rentals__trip">
              <div>
                <span>Pickup</span>
                <strong>Prishtina</strong>
              </div>
              <div>
                <span>Trip dates</span>
                <strong>Fri - Sun</strong>
              </div>
              <div>
                <span>Popular type</span>
                <strong>SUV</strong>
              </div>
            </div>
            <div className="home-rentals__chips" aria-label="Popular rental categories">
              <span>Economy</span>
              <span>SUV</span>
              <span>Family</span>
              <span>Luxury</span>
            </div>
            <Button to="/rent">Find rental cars</Button>
          </div>

          <div className="home-rentals__content">
            <SectionHeader
              title="Available this week"
              description="Booking-focused picks with daily price, location, rating, and host details."
              action={<Button to="/rent" variant="ghost">Explore rentals</Button>}
            />
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <EmptyState title="Could not load featured rentals" description={error} />
            ) : rentalCars.length > 0 ? (
              <div className="home-rentals__grid">
                {rentalCars.map((car) => (
                  <RentalCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <EmptyState title="No rental cars available" description="Featured rentals will appear here when cars are available." />
            )}
          </div>
        </div>
      </section>

      <section className="ak-section">
        <div className="ak-container">
          <SectionHeader
            eyebrow="Market demand"
            title="Popular brands"
            description="Explore the makes most represented in the current marketplace listings."
          />
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <EmptyState title="Could not load popular brands" description={error} />
          ) : brands.length > 0 ? (
            <div className="brand-grid">
              {brands.map((brand) => (
                <BrandCard key={brand.name} brand={brand} />
              ))}
            </div>
          ) : (
            <EmptyState title="No brand data available" description="Popular brands will appear here when listings are available." />
          )}
        </div>
      </section>

      <section className="ak-section ak-section--soft">
        <div className="ak-container how-section">
          <div className="how-section__intro">
            <p className="eyebrow">How AutoKosova works</p>
            <h2>One search experience, two clear paths</h2>
            <p>
              Buying and renting need different decisions. AutoKosova keeps both flows simple, but shows the right details at the right moment.
            </p>
            <div className="how-route-panel" aria-label="AutoKosova flows">
              <div>
                <span>Buy path</span>
                <strong>Search to compare to contact seller</strong>
              </div>
              <div>
                <span>Rent path</span>
                <strong>Set dates to compare hosts to book</strong>
              </div>
            </div>
          </div>
          <div className="how-flow">
            {howItWorks.map((item, index) => (
              <HowItWorksCard key={item.step} isLast={index === howItWorks.length - 1} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="ak-section">
        <div className="ak-container why-panel">
          <div>
            <p className="eyebrow">Why choose AutoKosova</p>
            <h2>Built for practical car decisions</h2>
            <p>
              Sale listings emphasize ownership details and vehicle condition; rental listings emphasize dates, price per day, and availability.
            </p>
          </div>
          <div className="reason-list">
            {reasons.map((reason) => (
              <div key={reason}>{reason}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
