export type SaleCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  city: string;
  price: number;
  sellerType: 'Dealer' | 'Private seller';
  bodyType: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Van';
  image: string;
  isFavorite?: boolean;
};

export const saleCars: SaleCar[] = [
  {
    id: 'sale-1',
    brand: 'BMW',
    model: '320d M Sport',
    year: 2021,
    mileage: 42000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    city: 'Prishtina',
    price: 26800,
    sellerType: 'Dealer',
    bodyType: 'Sedan',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    isFavorite: true,
  },
  {
    id: 'sale-2',
    brand: 'Mercedes-Benz',
    model: 'C 220 d',
    year: 2020,
    mileage: 71500,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    city: 'Prizren',
    price: 29900,
    sellerType: 'Dealer',
    bodyType: 'Sedan',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sale-3',
    brand: 'Volkswagen',
    model: 'Golf 8 2.0 TDI',
    year: 2022,
    mileage: 25000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    city: 'Peja',
    price: 22900,
    sellerType: 'Private seller',
    bodyType: 'Hatchback',
    image: 'https://images.unsplash.com/photo-1617814076668-24a0d5cf4c0d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sale-4',
    brand: 'Audi',
    model: 'Q5 quattro',
    year: 2019,
    mileage: 82000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    city: 'Gjilan',
    price: 33900,
    sellerType: 'Dealer',
    bodyType: 'SUV',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sale-5',
    brand: 'Toyota',
    model: 'Corolla Hybrid',
    year: 2021,
    mileage: 39000,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    city: 'Gjakova',
    price: 21500,
    sellerType: 'Private seller',
    bodyType: 'Sedan',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sale-6',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    mileage: 12000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    city: 'Gjilan',
    price: 39800,
    sellerType: 'Dealer',
    bodyType: 'Sedan',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
  },
];
