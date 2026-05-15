export type RentalCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyPrice: number;
  location: string;
  rating: number;
  trips: number;
  hostName: string;
  carType: 'Economy' | 'SUV' | 'Luxury' | 'Family' | 'Electric' | 'Van';
  seats: number;
  transmission: 'Manual' | 'Automatic';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  available: boolean;
  image: string;
};

export const rentalCars: RentalCar[] = [
  {
    id: 'rent-1',
    brand: 'Hyundai',
    model: 'i20',
    year: 2022,
    dailyPrice: 29,
    location: 'Prishtina',
    rating: 4.8,
    trips: 96,
    hostName: 'CityDrive Prishtina',
    carType: 'Economy',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    available: true,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c3ff86b08?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rent-2',
    brand: 'Kia',
    model: 'Sportage',
    year: 2023,
    dailyPrice: 58,
    location: 'Prizren',
    rating: 4.9,
    trips: 71,
    hostName: 'Besa Rent a Car',
    carType: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    available: true,
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rent-3',
    brand: 'Mercedes-Benz',
    model: 'E 220 d',
    year: 2021,
    dailyPrice: 88,
    location: 'Prishtina Airport',
    rating: 4.7,
    trips: 42,
    hostName: 'Premium Mobility',
    carType: 'Luxury',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    available: true,
    image: 'https://images.unsplash.com/photo-1616788494672-ec7ca25fdda9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rent-4',
    brand: 'Volkswagen',
    model: 'Touran',
    year: 2020,
    dailyPrice: 49,
    location: 'Peja',
    rating: 4.6,
    trips: 58,
    hostName: 'Dukagjini Rent',
    carType: 'Family',
    seats: 7,
    transmission: 'Manual',
    fuelType: 'Diesel',
    available: false,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rent-5',
    brand: 'Tesla',
    model: 'Model Y',
    year: 2023,
    dailyPrice: 84,
    location: 'Gjakova',
    rating: 5,
    trips: 31,
    hostName: 'EV Kosova',
    carType: 'Electric',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    available: true,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rent-6',
    brand: 'Ford',
    model: 'Transit',
    year: 2021,
    dailyPrice: 76,
    location: 'Ferizaj',
    rating: 4.5,
    trips: 24,
    hostName: 'MoveKS',
    carType: 'Van',
    seats: 9,
    transmission: 'Manual',
    fuelType: 'Diesel',
    available: true,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259b6e09?auto=format&fit=crop&w=900&q=80',
  },
];
