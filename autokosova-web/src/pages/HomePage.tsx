import React from 'react';
import { BrandCard } from '../components/cars/BrandCard';
import { CarCard } from '../components/cars/CarCard';
import { HowItWorksCard } from '../components/cars/HowItWorksCard';
import { RentalCarCard } from '../components/cars/RentalCarCard';
import { Button } from '../components/common/Button';
import { SectionHeader } from '../components/common/SectionHeader';
import { BuySearchForm } from '../components/search/BuySearchForm';
import { RentSearchForm } from '../components/search/RentSearchForm';
import { SearchTabs, type SearchMode } from '../components/search/SearchTabs';
import { brands } from '../data/brandsDummyData';
import { saleCars } from '../data/carsDummyData';
import { rentalCars } from '../data/rentalCarsDummyData';

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
  'Structured dummy data ready to be replaced by API results',
];

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<SearchMode>('buy');

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
          <div className="card-grid card-grid--3">
            {saleCars.slice(0, 3).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
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
            <div className="home-rentals__grid">
              {rentalCars.slice(0, 4).map((car) => (
                <RentalCarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ak-section">
        <div className="ak-container">
          <SectionHeader
            eyebrow="Market demand"
            title="Popular brands"
            description="Explore the makes Kosovo buyers search most, with real marketplace signals ready for API data later."
          />
          <div className="brand-grid">
            {brands.map((brand) => (
              <BrandCard key={brand.name} brand={brand} />
            ))}
          </div>
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
