import React from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Car, CarImage } from '../lib/types';
import { carService } from '../services';
import { getErrorMessage } from '../utils/helpers';

type FormState = {
  brand: string;
  model: string;
  year: number;
  bodyType: string;
  price: number;
  priceType: 'sale' | 'daily';
  mileage: number;
  fuelType: Car['fuelType'];
  transmission: Car['transmission'];
  color: string;
  description: string;
  status: string;
};

const toFormState = (car: Car): FormState => ({
  brand: car.brand,
  model: car.model,
  year: car.year,
  bodyType: car.bodyType ?? car.type,
  price: car.price,
  priceType: 'daily',
  mileage: car.mileage,
  fuelType: car.fuelType,
  transmission: car.transmission,
  color: car.color ?? '',
  description: car.description,
  status: car.isAvailable ? 'Available' : 'Inactive',
});

export const EditCarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = React.useState<Car | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);
  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const previews = React.useMemo(() => newImages.map((image) => URL.createObjectURL(image)), [newImages]);

  React.useEffect(() => () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [previews]);

  const loadCar = React.useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await carService.getCarById(id);
      setCar(data);
      setForm(toFormState(data));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load car.'));
    }
  }, [id]);

  React.useEffect(() => {
    void loadCar();
  }, [loadCar]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => current ? { ...current, [name]: value } : current);
  };

  const handleNewImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const existingCount = car?.imageRecords?.length ?? 0;
    if (existingCount + files.length > 10) {
      setError('A car can have a maximum of 10 images.');
      event.target.value = '';
      return;
    }

    const invalidFile = files.find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setError('Only JPEG, PNG, or WEBP images up to 5MB are allowed.');
      event.target.value = '';
      return;
    }

    setNewImages(files);
  };

  const refresh = async () => {
    await loadCar();
    setNewImages([]);
  };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {    event.preventDefault();
    if (!id || !form || !car) return;

    setIsSaving(true);
    setError(null);
    try {
      await carService.updateCar(id, {
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        type: form.bodyType as Car['type'],
        bodyType: form.bodyType,
        price: Number(form.price),
        priceType: 'daily',
        tenantID: car.tenantID,
        mileage: Number(form.mileage),
        fuelType: form.fuelType,
        transmission: form.transmission,
        color: form.color,
        description: form.description,
        isAvailable: form.status === 'Available',
      });

      if (newImages.length > 0) {
        await carService.uploadCarImages(id, newImages);
      }

      await refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save car.'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteImage = async (image: CarImage) => {
    if (!id || !window.confirm('Delete this image?')) return;
    await carService.deleteCarImage(id, image.id);
    await refresh();
  };

  const setMainImage = async (image: CarImage) => {
    if (!id) return;
    await carService.setMainCarImage(id, image.id);
    await refresh();
  };

  const moveImage = async (image: CarImage, direction: -1 | 1) => {
    if (!id || !car?.imageRecords) return;
    const ordered = [...car.imageRecords].sort((a, b) => a.orderNumber - b.orderNumber);
    const index = ordered.findIndex((item) => item.id === image.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    [ordered[index], ordered[targetIndex]] = [ordered[targetIndex], ordered[index]];
    const payload = ordered.map((item, orderIndex) => ({ id: item.id, orderNumber: orderIndex + 1 }));
    await carService.reorderCarImages(id, payload);
    await refresh();
  };

  if (!form) {
    return (
      <div className="page create-car-page">
        <div className="ak-container edit-car-shell">{error || 'Loading car...'}</div>
      </div>
    );
  }

  return (
    <div className="page create-car-page">
      <section className="ak-section ak-section--soft">
        <div className="ak-container edit-car-shell">
          <div className="owner-form-heading">
            <div>
              <p className="eyebrow">Edit car</p>
              <h2>{form.year} {form.brand} {form.model}</h2>
            </div>
            <Link to="/seller" className="ak-button ak-button--secondary">Back</Link>
          </div>

          {error && <div className="auth-alert" role="alert">{error}</div>}

          <form className="owner-form" onSubmit={handleSave}>
            <div className="owner-form-grid">
              <label className="owner-field">
                <span>Brand</span>
                <input name="brand" value={form.brand} onChange={handleChange} required />
              </label>
              <label className="owner-field">
                <span>Model</span>
                <input name="model" value={form.model} onChange={handleChange} required />
              </label>
            </div>

            <div className="owner-form-grid owner-form-grid--three">
              <label className="owner-field">
                <span>Year</span>
                <input type="number" name="year" value={form.year} onChange={handleChange} min={1950} required />
              </label>
              <label className="owner-field">
                <span>Daily rental price</span>
                <input type="number" name="price" value={form.price} onChange={handleChange} min={1} required />
              </label>
              <div className="owner-field">
                <span>Listing type</span>
                <input value="Rental only" readOnly />
              </div>
            </div>

            <div className="owner-form-grid owner-form-grid--three">
              <label className="owner-field">
                <span>Body</span>
                <input name="bodyType" value={form.bodyType} onChange={handleChange} required />
              </label>
              <label className="owner-field">
                <span>Fuel</span>
                <select name="fuelType" value={form.fuelType} onChange={handleChange}>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </label>
              <label className="owner-field">
                <span>Transmission</span>
                <select name="transmission" value={form.transmission} onChange={handleChange}>
                  <option>Manual</option>
                  <option>Automatic</option>
                </select>
              </label>
            </div>

            <div className="owner-form-grid owner-form-grid--three">
              <label className="owner-field">
                <span>Mileage</span>
                <input type="number" name="mileage" value={form.mileage} onChange={handleChange} min={0} required />
              </label>
              <label className="owner-field">
                <span>Color</span>
                <input name="color" value={form.color} onChange={handleChange} />
              </label>
              <label className="owner-field">
                <span>Status</span>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Available</option>
                  <option>Inactive</option>
                  <option>Sold</option>
                  <option>Rented</option>
                </select>
              </label>
            </div>

            <label className="owner-field">
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={handleChange} required />
            </label>

            <section className="image-manager">
              <div className="details-section-heading details-section-heading--split">
                <div>
                  <span>Photos</span>
                  <h2>Existing images</h2>
                </div>
                <strong>{car?.imageRecords?.length ?? 0} active</strong>
              </div>

              <div className="image-manager-grid">
                {(car?.imageRecords ?? []).map((image) => (
                  <article key={image.id} className={image.isMain ? 'image-manager-card main' : 'image-manager-card'}>
                    <img src={image.url} alt={image.originalFileName ?? 'Car'} />
                    <div>
                      <strong>{image.isMain ? 'Main image' : `Order ${image.orderNumber}`}</strong>
                      <span>{image.originalFileName ?? image.url}</span>
                    </div>
                    <div className="image-manager-actions">
                      <button type="button" onClick={() => moveImage(image, -1)}>Up</button>
                      <button type="button" onClick={() => moveImage(image, 1)}>Down</button>
                      <button type="button" onClick={() => setMainImage(image)}>Main</button>
                      <button type="button" onClick={() => deleteImage(image)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>

              <label className="owner-field">
                <span>Add new images</span>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleNewImages} />
              </label>

              {previews.length > 0 && (
                <div className="image-preview-grid">
                  {previews.map((preview, index) => (
                    <img key={preview} src={preview} alt={`New upload ${index + 1}`} />
                  ))}
                </div>
              )}
            </section>

            <div className="create-car-actions">
              <button type="submit" className="auth-submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
