# Mock Data & Demo Setup Guide

This guide explains how to use the mock data for development before the backend API is ready.

## Quick Start

The application is configured to use **mock data by default**. You can test all features without a backend!

### Demo Accounts

Use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| **Seller** | seller@autokosova.com | password |
| **User** | user@autokosova.com | password |
| **Admin** | admin@autokosova.com | password |

### Mock Data Included

✅ **12 Sample Cars** - Various brands, types, prices
✅ **3 Sample Bookings** - Different statuses (Pending, Confirmed, Completed)
✅ **3 Demo Users** - Different roles (Seller, User, Admin)
✅ **Full Filtering** - All car filters work with mock data
✅ **Favorites System** - Add/remove from favorites (stored in memory)
✅ **Booking Creation** - Create and manage bookings
✅ **Availability Checking** - Check car availability for dates

## Configuration

The mock/real API toggle is in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  // Set to true to use mock data
  USE_MOCK_DATA: true,
  
  // Set to false to use real API
  // USE_MOCK_DATA: false,
  
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
};
```

### Switching Between Mock and Real API

**To use Mock Data (Development):**
```typescript
USE_MOCK_DATA: true,
```

**To use Real API (When Backend is Ready):**
```typescript
USE_MOCK_DATA: false,
```

## File Structure

Mock data files are located in `src/services/`:

```
src/services/
├── mockData.ts              # Mock users, cars, bookings
├── mockAuthService.ts       # Auth endpoints (login, register)
├── mockCarService.ts        # Car endpoints (getCars, createCar, etc)
├── mockBookingService.ts    # Booking endpoints
└── config/
    └── api.ts               # Configuration toggle
```

## Features You Can Test

### ✅ Authentication
- [x] Register new account
- [x] Login with demo credentials
- [x] Logout
- [x] Protected routes
- [x] Auth context & state

### ✅ Car Browsing
- [x] View all cars (with pagination)
- [x] Search by brand/model
- [x] Filter by type, price, fuel, transmission
- [x] View car details
- [x] Image gallery
- [x] Availability status

### ✅ User Features
- [x] Add/remove favorites
- [x] View bookings
- [x] Create new bookings
- [x] Cancel bookings
- [x] User profile

### ✅ Seller Features
- [x] View own cars
- [x] Add new car
- [x] Edit car
- [x] Delete car
- [x] View bookings for cars

## Testing Scenarios

### 1. Login & Browse Cars

```javascript
// Login
Email: user@autokosova.com
Password: password

// Then browse the home page - 12 cars will be displayed
```

### 2. Add to Favorites

```javascript
// After logging in
1. Click on car cards' heart icon
2. Go to Favorites page to see saved cars
```

### 3. Book a Car

```javascript
// After logging in
1. Click on a car
2. Select start and end dates
3. Click "Check Availability"
4. Click "Book Now"
5. Go to Dashboard to see booking
```

### 4. Seller Dashboard

```javascript
// Login as Seller
Email: seller@autokosova.com
Password: password

// Then click "My Cars" to see all cars
// Click "Add New Car" to add a new vehicle
```

## Adding More Mock Data

To add more cars, edit `src/services/mockData.ts`:

```typescript
export const mockCars: Car[] = [
  // ... existing cars
  {
    id: '13',
    brand: 'Your Brand',
    model: 'Your Model',
    year: 2024,
    type: 'Sedan',
    price: 50,
    priceType: 'daily',
    mileage: 1000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    description: 'Your car description',
    images: ['https://example.com/image.jpg'],
    isFavorite: false,
    isAvailable: true,
    sellerId: '1',
    sellerName: 'Arben Nortasholli',
    createdAt: new Date().toISOString(),
  },
];
```

## Simulated API Delays

Mock services include realistic delays to simulate API calls:
- Auth: 500ms
- Car operations: 300-500ms
- Booking operations: 300-500ms

To change delays, edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  MOCK_API_DELAY: 300, // Change this value (in milliseconds)
};
```

## Local Storage

When you login, the mock auth service stores:
- **token**: JWT-like token (for demo purposes)
- **user**: User object with role information

These are stored in `localStorage` and available across page reloads.

## Important Notes

⚠️ **Mock Data is In-Memory:**
- Data resets when you refresh the page
- No persistent storage between sessions
- Perfect for development and testing

✅ **When Backend is Ready:**
1. Update `USE_MOCK_DATA: false` in `src/config/api.ts`
2. Ensure `VITE_API_URL` environment variable points to your backend
3. Update backend endpoints to match the expected API routes
4. Test with real data

## Switching to Real API

When your ASP.NET Core backend is ready:

1. **Set Environment Variable:**
   ```bash
   # .env.local
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Update Config:**
   ```typescript
   // src/config/api.ts
   export const API_CONFIG = {
     USE_MOCK_DATA: false,  // ← Change this
     API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
   };
   ```

3. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

## Backend API Expectations

When you're ready to connect the real backend, ensure these endpoints exist:

### Auth
- `POST /auth/login` 
- `POST /auth/register`
- `GET /auth/me`

### Cars
- `GET /cars` - With query params: filters, page, pageSize
- `GET /cars/:id`
- `POST /cars`
- `PUT /cars/:id`
- `DELETE /cars/:id`
- `GET /cars/seller/my-cars`
- `POST /cars/:id/favorite`
- `DELETE /cars/:id/favorite`
- `GET /cars/favorites`

### Bookings
- `POST /bookings`
- `GET /bookings/my-bookings`
- `GET /bookings/seller-bookings`
- `GET /bookings/:id`
- `POST /bookings/:id/cancel`
- `POST /bookings/check-availability`

## Troubleshooting

**Issue: Data not persisting after refresh**
- Expected behavior with mock data. Refresh resets everything.

**Issue: Can't login**
- Use exact email from DEMO_ACCOUNTS table
- Check password (it's "password" for all demo accounts)

**Issue: Mock data not showing**
- Ensure `USE_MOCK_DATA: true` in `src/config/api.ts`
- Check browser console for errors

**Issue: Want to disable mock data**
- Set `USE_MOCK_DATA: false` in `src/config/api.ts`
- Ensure backend is running and accessible

---

Happy Development! 🚗
