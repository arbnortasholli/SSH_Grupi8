export type Brand = {
  name: string;
  slug: string;
  logoUrl: string;
  count: number;
  averagePrice: string;
  popularModel: string;
  topCity: string;
  accent: string;
};

export const brands: Brand[] = [
  {
    name: 'Volkswagen',
    slug: 'volkswagen',
    logoUrl: 'https://cdn.simpleicons.org/volkswagen/1d4ed8',
    count: 32,
    averagePrice: 'EUR 18,900',
    popularModel: 'Golf',
    topCity: 'Prishtina',
    accent: '#1d4ed8',
  },
  {
    name: 'BMW',
    slug: 'bmw',
    logoUrl: 'https://cdn.simpleicons.org/bmw/111827',
    count: 22,
    averagePrice: 'EUR 34,500',
    popularModel: 'Series 3',
    topCity: 'Prizren',
    accent: '#111827',
  },
  {
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    logoUrl: 'https://cdn.simpleicons.org/mercedesbenz/475569',
    count: 19,
    averagePrice: 'EUR 39,800',
    popularModel: 'C-Class',
    topCity: 'Peja',
    accent: '#475569',
  },
  {
    name: 'Audi',
    slug: 'audi',
    logoUrl: 'https://cdn.simpleicons.org/audi/b91c1c',
    count: 17,
    averagePrice: 'EUR 31,200',
    popularModel: 'A4',
    topCity: 'Gjilan',
    accent: '#b91c1c',
  },
  {
    name: 'Toyota',
    slug: 'toyota',
    logoUrl: 'https://cdn.simpleicons.org/toyota/15803d',
    count: 14,
    averagePrice: 'EUR 22,400',
    popularModel: 'Corolla',
    topCity: 'Ferizaj',
    accent: '#15803d',
  },
  {
    name: 'Tesla',
    slug: 'tesla',
    logoUrl: 'https://cdn.simpleicons.org/tesla/991b1b',
    count: 8,
    averagePrice: 'EUR 46,900',
    popularModel: 'Model 3',
    topCity: 'Prishtina',
    accent: '#991b1b',
  },
];
