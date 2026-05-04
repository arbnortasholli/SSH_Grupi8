# AutoKosova Web Frontend

A modern car marketplace and rental platform frontend built with React, TypeScript, and Vite.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

## Project Structure

```
/src
  /components        - Reusable UI components
    - Navbar.tsx
    - Footer.tsx
    - CarCard.tsx
    - FilterSidebar.tsx
    - ProtectedRoute.tsx
    - LoadingSpinner.tsx
    - MainLayout.tsx

  /pages             - Page components
    - HomePage.tsx
    - LoginPage.tsx
    - RegisterPage.tsx
    - CarDetailsPage.tsx
    - DashboardPage.tsx
    - FavoritesPage.tsx
    - SellerDashboardPage.tsx

  /services          - API integration
    - apiClient.ts   - Axios instance with interceptors
    - authService.ts
    - carService.ts
    - bookingService.ts

  /context           - React Context providers
    - AuthContext.tsx

  /hooks             - Custom React hooks
    - useFetch.ts
    - useForm.ts

  /layouts           - Layout components
    - MainLayout.tsx

  /utils             - Utility functions
    - helpers.ts

  /lib/types         - TypeScript types and interfaces
    - index.d.ts

  /routes            - Routing configuration
    - Routes.tsx
```

## Features Implemented

### Authentication
- ✅ Login/Register pages
- ✅ JWT token management (localStorage)
- ✅ Protected routes
- ✅ Auth context with hooks
- ✅ Automatic token attachment to API requests

### Car Browsing
- ✅ Home page with car grid
- ✅ Advanced filters (brand, type, price, fuel, transmission)
- ✅ Pagination
- ✅ Car details page
- ✅ Car images gallery

### User Features
- ✅ Dashboard with bookings
- ✅ Booking management (view, cancel)
- ✅ Favorites system
- ✅ Profile view

### Seller Features
- ✅ Seller dashboard
- ✅ View/manage own cars
- ✅ Add/edit/delete cars
- ✅ Car availability toggle

### UI/UX
- ✅ Responsive design
- ✅ Navbar with auth state
- ✅ Footer
- ✅ Loading spinners
- ✅ Error handling
- ✅ Skeleton loaders

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## API Integration

The app communicates with an ASP.NET Core backend. Update the `VITE_API_URL` environment variable to point to your backend API.

### Key API Endpoints Expected

**Auth:**
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /auth/me` - Get current user

**Cars:**
- `GET /cars` - List cars with filters
- `GET /cars/:id` - Get car details
- `POST /cars` - Create car (Seller)
- `PUT /cars/:id` - Update car (Seller)
- `DELETE /cars/:id` - Delete car (Seller)
- `GET /cars/seller/my-cars` - Get seller's cars
- `POST /cars/:id/favorite` - Add to favorites
- `DELETE /cars/:id/favorite` - Remove from favorites
- `GET /cars/favorites` - Get user's favorites

**Bookings:**
- `POST /bookings` - Create booking
- `GET /bookings/my-bookings` - Get user's bookings
- `GET /bookings/seller-bookings` - Get seller's bookings
- `GET /bookings/:id` - Get booking details
- `POST /bookings/:id/cancel` - Cancel booking
- `POST /bookings/check-availability` - Check availability

## Usage Examples

### Using Auth Hook

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </>
  );
}
```

### Using Form Hook

```typescript
import { useForm } from '@/hooks/useForm';

function MyForm() {
  const { values, handleChange, handleSubmit, isSubmitting } = useForm({
    email: '',
    password: '',
  });

  return (
    <form onSubmit={handleSubmit(async () => {
      // Submit logic
    })}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

### Using API Services

```typescript
import { carService } from '@/services/carService';

async function loadCars() {
  try {
    const response = await carService.getCars({ brand: 'BMW' });
    console.log(response.data);
  } catch (error) {
    console.error('Failed to load cars:', error);
  }
}
```

## Styling

This project uses Tailwind CSS for styling. Customize colors and theme in `tailwind.config.js`.

### Primary Color
- Default: `#2563eb` (blue)

To change, update `theme.extend.colors.primary` in `tailwind.config.js`.

## Development Tips

1. **Type Safety**: Always define types for your data
2. **Reusable Components**: Create components in `/components`
3. **API Calls**: Use services in `/services` for all API calls
4. **Custom Hooks**: Create reusable logic as custom hooks in `/hooks`
5. **State Management**: Use Context API for global state, useState for local state

## Next Steps

To extend the application:

1. **Implement Admin Pages** - Manage users, manage all cars
2. **Add Car Management Forms** - Edit/create car pages with image upload
3. **Payment Integration** - Add payment processing
4. **Search/Sorting** - Enhance search capabilities
5. **Reviews/Ratings** - Add user reviews for cars
6. **Notifications** - Implement notifications system
7. **Chat** - Add messaging between sellers and buyers
8. **Analytics** - Track user behavior

## License

This project is part of the AutoKosova platform. All rights reserved.
