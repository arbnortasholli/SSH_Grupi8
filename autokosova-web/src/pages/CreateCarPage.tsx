import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useForm } from '../hooks/useForm';
import { carService } from '../services/carService';
import { getErrorMessage } from '../utils/helpers';
import type { Car } from '../lib/types';

type CarType = Car['type'];
type FuelType = Car['fuelType'];
type Transmission = Car['transmission'];
type PriceType = Car['priceType'];

const carTypes: CarType[] = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van'];
const fuelTypes: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissions: Transmission[] = ['Manual', 'Automatic'];
const priceTypes: PriceType[] = ['sale', 'daily'];

const fallbackCreateCarImage = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=900&q=82';

export const CreateCarPage: React.FC = () => {
  const [createdCar, setCreatedCar] = React.useState<Car | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [images, setImages] = React.useState<File[]>([]);
  const imagePreviews = React.useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

  React.useEffect(() => () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [imagePreviews]);

  const { values, handleChange, handleSubmit, isSubmitting, reset } = useForm({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Sedan',
    price: 45,
    priceType: 'sale',
    mileage: 0,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    sellerName: '',
    createdByAccountID: 1,
    description: '',
    isAvailable: true,
  });

  const previewImage = imagePreviews[0] || fallbackCreateCarImage;

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setError(null);

    if (files.length > 10) {
      setError('Maximum 10 images are allowed.');
      event.target.value = '';
      return;
    }

    const invalidFile = files.find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setError('Only JPEG, PNG, or WEBP images up to 5MB are allowed.');
      event.target.value = '';
      return;
    }

    setImages(files);
  };

  const onSubmit = async () => {
    setError(null);
    setCreatedCar(null);

    const brand = String(values.brand).trim();
    const model = String(values.model).trim();
    const description = String(values.description).trim();
    const sellerName = String(values.sellerName).trim();
    const year = Number(values.year);
    const price = Number(values.price);
    const mileage = Number(values.mileage);
    const seats = Number(values.seats);
    const createdByAccountID = Number(values.createdByAccountID);

    if (!brand || !model || !description || !sellerName) {
      setError('Brand, model, seller name, and description are required.');
      return;
    }

    if (year < 1950 || year > new Date().getFullYear() + 1) {
      setError('Please enter a valid car year.');
      return;
    }

    if (price <= 0 || mileage < 0 || seats <= 0) {
      setError('Price, mileage, and seats must be valid numbers.');
      return;
    }

    if (createdByAccountID <= 0) {
      setError('Created by account ID is required.');
      return;
    }

    try {
      const priceType = values.priceType as PriceType;
      const formData = new FormData();
      formData.append('createdByAccountID', String(createdByAccountID));
      formData.append('carTitle', `${year} ${brand} ${model}`);
      formData.append('carBrand', brand);
      formData.append('carModel', model);
      formData.append('carYear', String(year));
      formData.append('carMileage', String(mileage));
      formData.append('carFuelType', values.fuelType as FuelType);
      formData.append('carTransmission', values.transmission as Transmission);
      formData.append('carBodyType', values.type as CarType);
      formData.append('carDescription', description);
      formData.append('isForSale', String(priceType === 'sale'));
      formData.append('isForRent', String(priceType !== 'sale'));
      formData.append('salePrice', priceType === 'sale' ? String(price) : '');
      formData.append('rentalDailyPrice', priceType !== 'sale' ? String(price) : '');
      formData.append('carStatus', Boolean(values.isAvailable) ? 'Available' : 'Inactive');
      images.forEach((image) => formData.append('images', image));

      const car = await carService.createCar(formData);

      setCreatedCar(car);
      setImages([]);
      reset();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create car.'));
    }
  };

  return (
    <div className="page create-car-page">
      <section className="page-hero page-hero--create-car">
        <div className="ak-container create-car-hero">
          <div>
            <p className="eyebrow">Create car</p>
            <h1>Create a car record for the marketplace.</h1>
            <p>
              Add the vehicle data in the same shape the frontend services use now. In mock mode, the car is created
              locally and can later be wired to the backend database.
            </p>
            <div className="hero-actions">
              <a href="#create-car-form" className="ak-button ak-button--primary">Create car</a>
              <Button to="/rent-your-car" variant="secondary">Rent your car</Button>
            </div>
          </div>

          <aside className="create-car-preview">
            <img
              src={previewImage}
              alt="Car preview"
              onError={(event) => {
                event.currentTarget.src = fallbackCreateCarImage;
              }}
            />
            <div>
              <span>{values.year || 'Year'}</span>
              <strong>{values.brand || 'Brand'} {values.model || 'Model'}</strong>
              <p>{values.price || 0} EUR / {values.priceType}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="ak-section ak-section--soft">
        <div className="ak-container create-car-shell">
          <aside className="owner-listing-copy">
            <p className="eyebrow">Mock database flow</p>
            <h2>Ready for API connection later.</h2>
            <p>
              This form calls the existing `carService.createCar` method. With mock data enabled it creates a local
              record; when the backend is connected, the same flow can post to the API.
            </p>
            <div className="reason-list">
              <div>Uses the existing car service layer</div>
              <div>Matches the current frontend car type</div>
              <div>Includes image preview and availability</div>
              <div>Validates required fields before submit</div>
            </div>
          </aside>

          <main className="owner-form-panel" id="create-car-form">
            <div className="owner-form-heading">
              <div>
                <p className="eyebrow">Vehicle data</p>
                <h2>Create car</h2>
              </div>
              <span>Drive upload</span>
            </div>

            {error && <div className="auth-alert" role="alert">{error}</div>}
            {createdCar && (
              <div className="owner-form-success" role="status">
                {createdCar.brand} {createdCar.model} was created.
              </div>
            )}

            <form className="owner-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="owner-form-grid">
                <label className="owner-field" htmlFor="brand">
                  <span>Brand</span>
                  <input id="brand" name="brand" value={values.brand} onChange={handleChange} placeholder="Mercedes-Benz" required />
                </label>

                <label className="owner-field" htmlFor="model">
                  <span>Model</span>
                  <input id="model" name="model" value={values.model} onChange={handleChange} placeholder="C-Class" required />
                </label>
              </div>

              <div className="owner-form-grid owner-form-grid--three">
                <label className="owner-field" htmlFor="createdByAccountID">
                  <span>Created by account ID</span>
                  <input id="createdByAccountID" type="number" name="createdByAccountID" value={values.createdByAccountID} onChange={handleChange} min={1} required />
                </label>
              </div>

              <div className="owner-image-row">
                <label className="owner-field" htmlFor="images">
                  <span>Car photos</span>
                  <input id="images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImagesChange} />
                </label>

                <div className="owner-image-preview">
                  <img
                    src={previewImage}
                    alt="Create car preview"
                    onError={(event) => {
                      event.currentTarget.src = fallbackCreateCarImage;
                    }}
                  />
                  <span>{images.length > 0 ? `${images.length} selected` : 'Preview'}</span>
                </div>
              </div>

              {imagePreviews.length > 1 && (
                <div className="image-preview-grid">
                  {imagePreviews.map((preview, index) => (
                    <img key={preview} src={preview} alt={`Selected car ${index + 1}`} />
                  ))}
                </div>
              )}

              <div className="owner-form-grid owner-form-grid--three">
                <label className="owner-field" htmlFor="year">
                  <span>Year</span>
                  <input id="year" type="number" name="year" value={values.year} onChange={handleChange} min={1950} required />
                </label>

                <label className="owner-field" htmlFor="price">
                  <span>Price</span>
                  <input id="price" type="number" name="price" value={values.price} onChange={handleChange} min={1} required />
                </label>

                <label className="owner-field" htmlFor="priceType">
                  <span>Price type</span>
                  <select id="priceType" name="priceType" value={values.priceType} onChange={handleChange}>
                    {priceTypes.map((priceType) => <option key={priceType} value={priceType}>{priceType}</option>)}
                  </select>
                </label>
              </div>

              <div className="owner-form-grid owner-form-grid--three">
                <label className="owner-field" htmlFor="type">
                  <span>Body type</span>
                  <select id="type" name="type" value={values.type} onChange={handleChange}>
                    {carTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>

                <label className="owner-field" htmlFor="fuelType">
                  <span>Fuel type</span>
                  <select id="fuelType" name="fuelType" value={values.fuelType} onChange={handleChange}>
                    {fuelTypes.map((fuelType) => <option key={fuelType} value={fuelType}>{fuelType}</option>)}
                  </select>
                </label>

                <label className="owner-field" htmlFor="transmission">
                  <span>Transmission</span>
                  <select id="transmission" name="transmission" value={values.transmission} onChange={handleChange}>
                    {transmissions.map((transmission) => <option key={transmission} value={transmission}>{transmission}</option>)}
                  </select>
                </label>
              </div>

              <div className="owner-form-grid owner-form-grid--three">
                <label className="owner-field" htmlFor="mileage">
                  <span>Mileage</span>
                  <input id="mileage" type="number" name="mileage" value={values.mileage} onChange={handleChange} min={0} required />
                </label>

                <label className="owner-field" htmlFor="seats">
                  <span>Seats</span>
                  <input id="seats" type="number" name="seats" value={values.seats} onChange={handleChange} min={1} required />
                </label>

                <label className="owner-switch">
                  <input type="checkbox" name="isAvailable" checked={values.isAvailable} onChange={handleChange} />
                  <span>Available</span>
                </label>
              </div>

              <label className="owner-field" htmlFor="sellerName">
                <span>Seller name</span>
                <input id="sellerName" name="sellerName" value={values.sellerName} onChange={handleChange} placeholder="AutoKosova Owner" required />
              </label>

              <label className="owner-field" htmlFor="description">
                <span>Description</span>
                <textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  placeholder="Write the condition, features, and notes for this car."
                  required
                />
              </label>

              <div className="create-car-actions">
                <Link to="/rent" className="ak-button ak-button--secondary">View marketplace</Link>
                <button type="submit" className="auth-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating car...' : 'Create car'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </section>
    </div>
  );
};
