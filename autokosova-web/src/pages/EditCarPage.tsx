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

type EditCarPageProps = {
  carId?: string;
  initialSection?: 'details' | 'images' | 'features';
  embedded?: boolean;
  onClose?: () => void;
  onUpdated?: () => void | Promise<void>;
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
  status: car.carStatus ?? (car.isAvailable ? 'Available' : 'Inactive'),
});

export const EditCarPage: React.FC<EditCarPageProps> = ({
  carId,
  initialSection = 'details',
  embedded = false,
  onClose,
  onUpdated,
}) => {
  const { id: routeId } = useParams<{ id: string }>();
  const id = carId ?? routeId;
  const [car, setCar] = React.useState<Car | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);
  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = React.useState('');
  const [allFeatures, setAllFeatures] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isImageSaving, setIsImageSaving] = React.useState(false);
  const [isFeatureSaving, setIsFeatureSaving] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<'details' | 'images' | 'features'>(initialSection);
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

  const notifyUpdated = React.useCallback(async () => {
    await Promise.resolve(onUpdated?.());
  }, [onUpdated]);

  React.useEffect(() => {
    void loadCar();
  }, [loadCar]);

  React.useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await carService.getAllFeatures();
        setAllFeatures(data);
      } catch (err) {
        console.error('Failed to load features', err);
      }
    };

    void fetchFeatures();
  }, []);

  React.useEffect(() => {
    if (embedded) {
      setActiveSection(initialSection);
      return;
    }

    const hash = window.location.hash;
    if (hash === '#images') {
      setActiveSection('images');
      return;
    }

    if (hash === '#features') {
      setActiveSection('features');
      return;
    }

    setActiveSection(initialSection);
  }, [embedded, initialSection, car]);

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

    setError(null);
    setNewImages(files);
    setMainImageIndex('');
  };

  const refresh = async () => {
    await loadCar();
    setNewImages([]);
    setMainImageIndex('');
    await notifyUpdated();
  };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        carStatus: form.status,
      });

      await refresh();
      setActiveSection('details');
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

  const handleImageUpload = async () => {
    if (!id) return;
    if (newImages.length === 0) {
      setError('At least one image file is required.');
      return;
    }

    setIsImageSaving(true);
    setError(null);
    try {
      await carService.uploadCarImages(
        id,
        newImages,
        mainImageIndex === '' ? undefined : Number(mainImageIndex)
      );
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload images.'));
    } finally {
      setIsImageSaving(false);
    }
  };

  const handleAddFeature = async () => {
    if (!id || !selectedFeatureId) return;

    setIsFeatureSaving(true);
    setError(null);
    try {
      await carService.assignFeature(id, selectedFeatureId);
      setSelectedFeatureId('');
      await loadCar();
      await notifyUpdated();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add feature.'));
    } finally {
      setIsFeatureSaving(false);
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    if (!id || !window.confirm('Remove this feature?')) return;

    try {
      await carService.removeFeature(id, featureId);
      await loadCar();
      await notifyUpdated();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to remove feature.'));
    }
  };

  if (!form) {
    const loadingContent = <div className="ak-container edit-car-shell">{error || 'Loading car...'}</div>;

    if (embedded) {
      return loadingContent;
    }

    return (
      <div className="page create-car-page">
        {loadingContent}
      </div>
    );
  }

  const content = (
    <div className={embedded ? 'edit-car-shell edit-car-shell--modal' : 'ak-container edit-car-shell'}>
      <div className="owner-form-heading">
        <div>
          <p className="eyebrow">Edit car</p>
          <h2>{form.year} {form.brand} {form.model}</h2>
        </div>
        {embedded ? (
          onClose ? <button type="button" className="ak-button ak-button--secondary" onClick={onClose}>Close</button> : null
        ) : (
          <Link to="/seller" className="ak-button ak-button--secondary">Back</Link>
        )}
      </div>

      <div className="edit-car-tabs" role="tablist" aria-label="Car editor sections">
        <button type="button" className={activeSection === 'details' ? 'active' : undefined} onClick={() => setActiveSection('details')}>
          Edit
        </button>
        <button type="button" className={activeSection === 'images' ? 'active' : undefined} onClick={() => setActiveSection('images')}>
          Images
        </button>
        <button type="button" className={activeSection === 'features' ? 'active' : undefined} onClick={() => setActiveSection('features')}>
          Features
        </button>
      </div>

      {error && <div className="auth-alert" role="alert">{error}</div>}

      <form className="owner-form" onSubmit={handleSave}>
        {activeSection === 'details' && (
          <>
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
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <label className="owner-field">
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={handleChange} required />
            </label>

            <div className="create-car-actions">
              <button type="submit" className="auth-submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </>
        )}

        {activeSection === 'images' && (
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
              <>
                <div className="features-selector">
                  <select className="renter-select" value={mainImageIndex} onChange={(event) => setMainImageIndex(event.target.value)}>
                    <option value="">Keep current main image</option>
                    {newImages.map((image, index) => (
                      <option key={`${image.name}-${index}`} value={index}>
                        {index + 1} - {image.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="ak-button ak-button--secondary"
                    onClick={handleImageUpload}
                    disabled={isImageSaving}
                  >
                    {isImageSaving ? 'Uploading...' : 'Add images'}
                  </button>
                </div>

                <div className="ak-image-preview-grid mt-2 mb-4">
                  {previews.map((preview, index) => (
                    <div key={preview} className="ak-image-preview-card">
                      <img src={preview} alt={`New upload ${index + 1}`} />
                      <span className="ak-preview-tag">New image {index + 1}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {activeSection === 'features' && (
          <section className="features-manager">
            <div className="details-section-heading">
              <span>Features</span>
              <h2>Car Features</h2>
            </div>

            <div className="features-selector">
              <select className="renter-select" value={selectedFeatureId} onChange={(e) => setSelectedFeatureId(e.target.value)}>
                <option value="">Select a feature to add</option>
                {allFeatures
                  .filter((feature) => !car?.features?.some((assignedFeature) => assignedFeature.id === feature.id))
                  .map((feature) => (
                    <option key={feature.id} value={feature.id}>
                      {feature.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="ak-button ak-button--secondary"
                onClick={handleAddFeature}
                disabled={!selectedFeatureId || isFeatureSaving}
              >
                {isFeatureSaving ? 'Adding...' : 'Add Feature'}
              </button>
            </div>

            <div className="assigned-features-list">
              {car?.features?.map((feature) => (
                <div key={feature.id} className="feature-tag">
                  <span>{feature.name}</span>
                  <button type="button" onClick={() => handleRemoveFeature(feature.id)}>
                    &times;
                  </button>
                </div>
              ))}
              {(!car?.features || car.features.length === 0) && (
                <p className="renter-muted">No features assigned to this car yet.</p>
              )}
            </div>
          </section>
        )}
      </form>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="page create-car-page">
      <section className="ak-section ak-section--soft">
        {content}
      </section>
    </div>
  );
};
