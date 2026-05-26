# SSH_Grupi8 - AutoKosova

AutoKosova is a distributed car marketplace platform for selling and renting vehicles. The repository currently contains a layered .NET backend, automated tests, Entity Framework Core migrations, and a partial frontend source folder intended to consume the backend through REST APIs.

## Overview

The goal of AutoKosova is to provide a platform where users can:

- browse cars offered for sale
- browse cars available for rent
- manage vehicle listings
- handle rental bookings
- work with tenant/business workflows for rental operations

The system is designed as a client-server application. The frontend and backend are separated, and the frontend is expected to communicate with the backend only through HTTP REST API endpoints.

## Architecture

The backend follows a layered architecture:

- `AutoKosova.Api` exposes controllers, authentication, authorization, Swagger, and HTTP endpoints.
- `AutoKosova.Business` contains business rules, DTOs, and service implementations.
- `AutoKosova.DataAccess` contains the EF Core `AppDbContext` and database migrations.
- `AutoKosova.Entity` defines the core domain entities/models.
- `AutoKosova.Tests` contains service-level unit tests.
- `AutoKosova.ApiTests` contains API/integration-style tests for controllers.

The repository also contains a frontend folder:

- `autokosova-web` currently exists as a partial source folder, but this repository snapshot does not include a runnable frontend package manifest or a separate `autokosova-cms` application.

## Technologies Used

### Backend

- .NET 10 / ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT Bearer Authentication
- Swagger / OpenAPI via Swashbuckle

### Testing

- xUnit
- FluentAssertions
- Moq
- `Microsoft.AspNetCore.Mvc.Testing`

### Additional integrations present in the codebase

- StackExchange.Redis
- Stripe payment flow for rental bookings
- OpenAI-backed chat endpoint
- CarAPIs external vehicle integration
- SMTP email queue/background worker

### Frontend

- `autokosova-web` folder is present, but a runnable React application configuration is not included in this repository snapshot.
- TypeScript could not be confirmed from the repository because no frontend package or build configuration files are present.

### CI/CD

- No GitHub Actions workflow was found in this repository snapshot.

## Main Features

Based on the current codebase, the backend supports:

- user registration and login with JWT
- role-based authorization with permission policies
- account, role, and permission management
- car listing management
- separate sale and rental car flows
- car image upload and management
- car feature management
- favorites
- rental bookings
- tenant and tenant request management
- dashboard endpoints
- external car request flow
- payment endpoints for rental checkout and webhook handling
- API documentation with Swagger

## Project Structure

```text
AutoKosova.sln
AutoKosova.Api/
AutoKosova.ApiTests/
AutoKosova.Business/
AutoKosova.DataAccess/
AutoKosova.Entity/
AutoKosova.Tests/
autokosova-web/
build-check/
```

### Folder summary

- `AutoKosova.Api/`  
  API entry point, controllers, authorization helpers, background jobs, Swagger configuration, and app settings.

- `AutoKosova.Business/`  
  Business services and DTOs for accounts, cars, car images, features, favorites, bookings, tenants, permissions, payments, chat, and external car requests.

- `AutoKosova.DataAccess/`  
  EF Core database context and migrations.

- `AutoKosova.Entity/`  
  Domain entities such as `Account`, `AccountRole`, `Cars`, `CarImage`, `Tenant`, `RentalBooking`, `Permission`, and related models.

- `AutoKosova.Tests/`  
  Unit tests for business services.

- `AutoKosova.ApiTests/`  
  Controller and API-level tests using ASP.NET Core test hosting.

- `autokosova-web/`  
  Partial frontend source directory. In this snapshot it does not contain `package.json`, a lock file, or a full runnable React app configuration.

- `build-check/`  
  Local build/test support artifacts used during development.

## Backend Setup

### Prerequisites

- .NET SDK 10
- SQL Server or SQL Server Express
- Entity Framework Core CLI tools

Install EF Core CLI if needed:

```bash
dotnet tool install --global dotnet-ef
```

### 1. Clone the repository

```bash
git clone <repository-url>
cd autokosova-api
```

### 2. Restore dependencies

```bash
dotnet restore
```

### 3. Configure backend settings

The API project contains:

- `AutoKosova.Api/appsettings.json`
- `AutoKosova.Api/appsettings.Development.json`
- `AutoKosova.Api/appsettings.Development.json.example`

Recommended approach:

1. Use `appsettings.Development.json.example` as a reference.
2. Set the SQL Server connection string in `ConnectionStrings:DefaultConnection`.
3. Store sensitive values such as API keys, email credentials, and payment secrets in user secrets or environment variables instead of committed files.

### 4. Apply database migrations

```bash
dotnet ef database update --project AutoKosova.DataAccess --startup-project AutoKosova.Api
```

Note: the API also attempts to run migrations automatically in the `Development` environment during startup.

### 5. Build the solution

```bash
dotnet build
```

### 6. Run the API

```bash
dotnet run --project AutoKosova.Api
```

The launch settings define these local URLs:

- `http://localhost:5265`
- `https://localhost:7110`

### 7. Open Swagger

After startup, open:

- `https://localhost:7110/swagger`

## Frontend Setup

The repository currently contains only a partial `autokosova-web` source folder. It does not include:

- `package.json`
- a lock file
- a Vite or Create React App configuration
- a separate `autokosova-cms` folder

Because of that, the frontend cannot be started from this repository snapshot with `npm install` and `npm run dev`.

When the frontend applications are added or restored, make sure to:

- configure the API base URL to point to the backend
- allow the frontend origin through the backend CORS policy

The backend currently allows common local frontend origins including ports `3000`, `3001`, `5173`, and `5174`.

## Database

The backend uses SQL Server with Entity Framework Core.

### EF Core migrations

Migrations are stored in:

- `AutoKosova.DataAccess/Migrations`

The migration history shows active development for:

- initial models
- favorites and car features
- dynamic authorization tables
- tenant linkage and tenant requests
- email queue support
- Stripe rental payment tables
- external car requests
- role renaming from `Seller` to `Rental`

### Important entities

Core entities defined in `AutoKosova.Entity` include:

- `Account`
- `AccountRole`
- `AccountRolePermission`
- `Permission`
- `Tenant`
- `TenantRequest`
- `Cars`
- `CarImage`
- `CarFavorite`
- `CarFeature`
- `CarFeatureMapping`
- `RentalBooking`
- `RentalBookingStatus`
- `PaymentOrder`
- `PaymentStatus`
- `PaymentEvent`
- `ExternalCarRequest`
- `EmailQueue`

## Authentication and Authorization

Authentication is implemented with JWT Bearer tokens.

The login and registration endpoints are available in `AccountController`, and the generated JWT includes claims such as:

- account ID
- username
- email
- role
- tenant information when available

Authorization is implemented in two layers:

- role claims inside the JWT
- permission-based policies using custom authorization components

The codebase also contains dynamic permission checks such as:

- `Accounts.View`
- `Accounts.Create`
- `Cars.Create`
- `Cars.Update`
- `Cars.Delete`
- `RentalBookings.View`

Role names found in the repository include:

- `SuperAdmin`
- `Seller`
- `Customer`
- `Rental`

Note: the migration history shows that `Seller` was later renamed to `Rental`, so both names still appear in parts of the code and tests.

## API Documentation

Swagger is enabled in the `Development` environment.

Typical local URL:

```text
https://localhost:7110/swagger
```

Swagger is configured in `Program.cs` and includes Bearer token support for authenticated endpoint testing.

## Testing

The repository contains both unit and API tests:

- `AutoKosova.Tests`
- `AutoKosova.ApiTests`

Run all tests with:

```bash
dotnet test
```

## Contribution Guidelines

Basic recommended workflow:

1. Create a feature branch.
2. Follow the existing naming and project structure conventions.
3. Keep business logic in the appropriate layer.
4. Write clean, readable, and testable code.
5. Run build and test commands before pushing.
6. Open a pull request with a clear description of the change.

## Future Improvements

Realistic next steps for the project include:

- complete and commit the frontend applications (`autokosova-web` and CMS)
- stronger configuration and secret management
- payment flow hardening and production-grade webhook handling
- advanced car search and filtering
- real-time notifications
- email verification and password reset flows
- business and tenant verification workflows
- richer analytics/dashboard reporting
- Docker support
- deployment automation / CI-CD pipelines

## Authors

Developed by: **AutoKosova Team**
