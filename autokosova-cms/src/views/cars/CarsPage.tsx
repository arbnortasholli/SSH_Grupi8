// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';

const currentYear = new Date().getFullYear();

const emptyForm = {
  tenantID: '',
  createdByAccountID: '',
  carTitle: '',
  carBrand: '',
  carModel: '',
  carYear: currentYear,
  carMileage: 0,
  carFuelType: '',
  carTransmission: '',
  carBodyType: '',
  carColor: '',
  carDescription: '',
  isForSale: true,
  salePrice: '',
  isForRent: false,
  rentalDailyPrice: '',
  carStatus: 'Available'
};

const emptyImageForm = {
  image: null,
  carImageIsMain: false,
  carImageOrderNumber: 0
};

const emptyFeatureForm = {
  carFeatureID: ''
};

const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.Error === 'string') return data.Error;

  return error?.message || fallback;
};

const getResponseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Data)) return payload.Data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.Result)) return payload.Result;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.Items)) return payload.Items;
  if (Array.isArray(payload?.$values)) return payload.$values;
  if (Array.isArray(payload?.data?.$values)) return payload.data.$values;
  if (Array.isArray(payload?.Data?.$values)) return payload.Data.$values;

  return [];
};

const getImageSource = (imageUrl) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const apiBaseUrl = apiClient.defaults.baseURL || '';
  const apiOrigin = apiBaseUrl.replace(/\/api\/?$/i, '');

  return `${apiOrigin}${imageUrl}`;
};

const normalizeCar = (item) => ({
  carsID: item.carsID ?? item.CarsID,
  tenantID: item.tenantID ?? item.TenantID ?? '',
  createdByAccountID: item.createdByAccountID ?? item.CreatedByAccountID ?? '',
  carTitle: item.carTitle ?? item.CarTitle ?? '',
  carBrand: item.carBrand ?? item.CarBrand ?? '',
  carModel: item.carModel ?? item.CarModel ?? '',
  carYear: item.carYear ?? item.CarYear ?? currentYear,
  carMileage: item.carMileage ?? item.CarMileage ?? 0,
  carFuelType: item.carFuelType ?? item.CarFuelType ?? '',
  carTransmission: item.carTransmission ?? item.CarTransmission ?? '',
  carBodyType: item.carBodyType ?? item.CarBodyType ?? '',
  carColor: item.carColor ?? item.CarColor ?? '',
  carDescription: item.carDescription ?? item.CarDescription ?? '',
  isForSale: item.isForSale ?? item.IsForSale ?? false,
  salePrice: item.salePrice ?? item.SalePrice ?? '',
  isForRent: item.isForRent ?? item.IsForRent ?? false,
  rentalDailyPrice: item.rentalDailyPrice ?? item.RentalDailyPrice ?? '',
  carStatus: item.carStatus ?? item.CarStatus ?? 'Available',
  carCreationDate: item.carCreationDate ?? item.CarCreationDate
});

const normalizeAccount = (item) => ({
  accountID: item.accountID ?? item.AccountID,
  accountUsername: item.accountUsername ?? item.AccountUsername ?? '',
  accountName: item.accountName ?? item.AccountName ?? '',
  accountLastname: item.accountLastname ?? item.AccountLastname ?? ''
});

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [imageFormValues, setImageFormValues] = useState(emptyImageForm);
  const [featureFormValues, setFeatureFormValues] = useState(emptyFeatureForm);
  const [selectedCarForImages, setSelectedCarForImages] = useState(null);
  const [selectedCarForFeatures, setSelectedCarForFeatures] = useState(null);
  const [carImages, setCarImages] = useState([]);
  const [carFeatures, setCarFeatures] = useState([]);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSavingFeature, setIsSavingFeature] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isDeletingImageId, setIsDeletingImageId] = useState(null);
  const [isRemovingFeatureId, setIsRemovingFeatureId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const forSaleCount = useMemo(() => cars.filter((car) => car.isForSale).length, [cars]);
  const forRentCount = useMemo(() => cars.filter((car) => car.isForRent).length, [cars]);

  const loadAccounts = async () => {
    try {
      const response = await apiClient.get('/Account');
      setAccounts(getResponseList(response.data).map(normalizeAccount));
    } catch {
      setAccounts([]);
    }
  };

  const loadAvailableFeatures = async () => {
    try {
      const response = await apiClient.get('/car-features');
      setAvailableFeatures(getResponseList(response.data));
    } catch {
      setAvailableFeatures([]);
    }
  };

  const loadCars = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/Cars');
      setCars(getResponseList(response.data).map(normalizeCar));
    } catch (err) {
      setError(getErrorMessage(err, 'Cars could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCarImages = async (carId) => {
    setIsLoadingImages(true);
    setError('');

    try {
      const response = await apiClient.get(`/cars/${carId}/images`);
      setCarImages(getResponseList(response.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Car images could not be loaded.'));
    } finally {
      setIsLoadingImages(false);
    }
  };

  const loadCarFeatures = async (carId) => {
    setIsLoadingFeatures(true);
    setError('');

    try {
      const response = await apiClient.get(`/cars/${carId}/features`);
      setCarFeatures(getResponseList(response.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Car features could not be loaded.'));
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadAvailableFeatures();
    loadCars();
  }, []);

  const getAccountLabel = (accountID) => {
    const account = accounts.find((item) => Number(item.accountID) === Number(accountID));
    if (!account) return accountID ? `Account #${accountID}` : '-';

    const name = `${account.accountName} ${account.accountLastname}`.trim();
    return name ? `${name} (@${account.accountUsername})` : account.accountUsername;
  };

  const openCreateModal = () => {
    setEditingCar(null);
    setFormValues({
      ...emptyForm,
      createdByAccountID: accounts[0]?.accountID || ''
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = async (car) => {
    setEditingCar(car);
    setMessage('');
    setError('');

    let details = car;
    try {
      const response = await apiClient.get(`/Cars/${car.carsID}`);
      details = normalizeCar(response.data);
    } catch {
      details = car;
    }

    setFormValues({
      tenantID: details.tenantID || '',
      createdByAccountID: details.createdByAccountID || '',
      carTitle: details.carTitle,
      carBrand: details.carBrand,
      carModel: details.carModel,
      carYear: details.carYear,
      carMileage: details.carMileage,
      carFuelType: details.carFuelType || '',
      carTransmission: details.carTransmission || '',
      carBodyType: details.carBodyType || '',
      carColor: details.carColor || '',
      carDescription: details.carDescription || '',
      isForSale: details.isForSale,
      salePrice: details.salePrice || '',
      isForRent: details.isForRent,
      rentalDailyPrice: details.rentalDailyPrice || '',
      carStatus: details.carStatus || 'Available'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCar(null);
    setFormValues(emptyForm);
  };

  const openImagesModal = async (car) => {
    setSelectedCarForImages(car);
    setImageFormValues(emptyImageForm);
    setMessage('');
    setError('');
    setShowImagesModal(true);
    await loadCarImages(car.carsID);
  };

  const closeImagesModal = () => {
    setShowImagesModal(false);
    setSelectedCarForImages(null);
    setCarImages([]);
    setImageFormValues(emptyImageForm);
  };

  const openFeaturesModal = async (car) => {
    setSelectedCarForFeatures(car);
    setFeatureFormValues(emptyFeatureForm);
    setMessage('');
    setError('');
    setShowFeaturesModal(true);
    await loadCarFeatures(car.carsID);
  };

  const closeFeaturesModal = () => {
    setShowFeaturesModal(false);
    setSelectedCarForFeatures(null);
    setCarFeatures([]);
    setFeatureFormValues(emptyFeatureForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    setImageFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value
    }));
  };

  const handleFeatureChange = (event) => {
    const { name, value } = event.target;

    setFeatureFormValues((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!formValues.carTitle.trim() || !formValues.carBrand.trim() || !formValues.carModel.trim()) {
      setError('Title, brand and model are required.');
      return;
    }

    if (!editingCar && !formValues.createdByAccountID) {
      setError('Created by account is required.');
      return;
    }

    if (!formValues.isForSale && !formValues.isForRent) {
      setError('Car must be marked for sale or rent.');
      return;
    }

    if (formValues.isForSale && Number(formValues.salePrice) <= 0) {
      setError('Sale price is required when car is for sale.');
      return;
    }

    if (formValues.isForRent && Number(formValues.rentalDailyPrice) <= 0) {
      setError('Rental daily price is required when car is for rent.');
      return;
    }

    const payload = {
      tenantID: formValues.tenantID ? Number(formValues.tenantID) : null,
      carTitle: formValues.carTitle.trim(),
      carBrand: formValues.carBrand.trim(),
      carModel: formValues.carModel.trim(),
      carYear: Number(formValues.carYear),
      carMileage: Number(formValues.carMileage),
      carFuelType: formValues.carFuelType.trim() || null,
      carTransmission: formValues.carTransmission.trim() || null,
      carBodyType: formValues.carBodyType.trim() || null,
      carColor: formValues.carColor.trim() || null,
      carDescription: formValues.carDescription.trim() || null,
      isForSale: formValues.isForSale,
      salePrice: formValues.isForSale ? Number(formValues.salePrice) : null,
      isForRent: formValues.isForRent,
      rentalDailyPrice: formValues.isForRent ? Number(formValues.rentalDailyPrice) : null,
      carStatus: formValues.carStatus || 'Available'
    };

    if (!editingCar) {
      payload.createdByAccountID = Number(formValues.createdByAccountID);
    }

    setIsSaving(true);

    try {
      if (editingCar) {
        await apiClient.put(`/Cars/${editingCar.carsID}`, payload);
        setMessage('Car updated successfully.');
      } else {
        await apiClient.post('/Cars', payload);
        setMessage('Car created successfully.');
      }

      closeModal();
      await loadCars();
    } catch (err) {
      setError(getErrorMessage(err, 'Car could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (car) => {
    const confirmed = window.confirm(`Delete car "${car.carTitle}"?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingId(car.carsID);

    try {
      await apiClient.delete(`/Cars/${car.carsID}`);
      setMessage('Car deleted successfully.');
      await loadCars();
    } catch (err) {
      setError(getErrorMessage(err, 'Car could not be deleted.'));
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!selectedCarForImages) return;

    if (!imageFormValues.image) {
      setError('Image file is required.');
      return;
    }

    setIsSavingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFormValues.image);
      formData.append('carImageIsMain', String(imageFormValues.carImageIsMain));
      formData.append('carImageOrderNumber', String(imageFormValues.carImageOrderNumber));

      await apiClient.post(`/cars/${selectedCarForImages.carsID}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImageFormValues(emptyImageForm);
      setMessage('Car image added successfully.');
      await loadCarImages(selectedCarForImages.carsID);
    } catch (err) {
      setError(getErrorMessage(err, 'Car image could not be saved.'));
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSetMainImage = async (image) => {
    if (!selectedCarForImages) return;

    setMessage('');
    setError('');

    try {
      await apiClient.put(`/car-images/${image.carImageID}/set-main`);
      setMessage('Main image updated successfully.');
      await loadCarImages(selectedCarForImages.carsID);
    } catch (err) {
      setError(getErrorMessage(err, 'Main image could not be updated.'));
    }
  };

  const handleDeleteImage = async (image) => {
    if (!selectedCarForImages) return;

    const confirmed = window.confirm('Delete this car image?');
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsDeletingImageId(image.carImageID);

    try {
      await apiClient.delete(`/car-images/${image.carImageID}`);
      setMessage('Car image deleted successfully.');
      await loadCarImages(selectedCarForImages.carsID);
    } catch (err) {
      setError(getErrorMessage(err, 'Car image could not be deleted.'));
    } finally {
      setIsDeletingImageId(null);
    }
  };

  const handleFeatureSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!selectedCarForFeatures) return;

    if (!featureFormValues.carFeatureID) {
      setError('Feature is required.');
      return;
    }

    setIsSavingFeature(true);

    try {
      await apiClient.post(`/cars/${selectedCarForFeatures.carsID}/features/${featureFormValues.carFeatureID}`);
      setFeatureFormValues(emptyFeatureForm);
      setMessage('Feature assigned successfully.');
      await loadCarFeatures(selectedCarForFeatures.carsID);
    } catch (err) {
      setError(getErrorMessage(err, 'Feature could not be assigned.'));
    } finally {
      setIsSavingFeature(false);
    }
  };

  const handleRemoveFeature = async (feature) => {
    if (!selectedCarForFeatures) return;

    const confirmed = window.confirm(`Remove feature "${feature.carFeatureName}" from this car?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setIsRemovingFeatureId(feature.carFeatureID);

    try {
      await apiClient.delete(`/cars/${selectedCarForFeatures.carsID}/features/${feature.carFeatureID}`);
      setMessage('Feature removed successfully.');
      await loadCarFeatures(selectedCarForFeatures.carsID);
    } catch (err) {
      setError(getErrorMessage(err, 'Feature could not be removed.'));
    } finally {
      setIsRemovingFeatureId(null);
    }
  };

  const assignedFeatureIds = new Set(carFeatures.map((feature) => Number(feature.carFeatureID)));
  const unassignedFeatures = availableFeatures.filter((feature) => {
    const featureId = feature.carFeatureID ?? feature.CarFeatureID;
    return !assignedFeatureIds.has(Number(featureId));
  });

  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Cars</h2>
          <p>Manage car listings for sale and rent using the current backend car API.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="truck" size={28} />
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>Total cars</span>
              <strong>{cars.length}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>For sale</span>
              <strong>{forSaleCount}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="ak-admin-card ak-permission-stat">
            <Card.Body>
              <span>For rent</span>
              <strong>{forRentCount}</strong>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="ak-admin-card">
        <Card.Body>
          <div className="ak-permissions-toolbar">
            <div>
              <h5>Car list</h5>
              <p>All active car records from the database.</p>
            </div>
            <Button type="button" className="ak-admin-submit" onClick={openCreateModal}>
              <FeatherIcon icon="plus" size={16} />
              <span>Add New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading cars...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Year</th>
                    <th>Mileage</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="ak-empty-cell">
                        No cars found.
                      </td>
                    </tr>
                  ) : (
                    cars.map((car) => (
                      <tr key={car.carsID}>
                        <td>
                          <strong>{car.carTitle}</strong>
                          <span className="ak-table-muted">{car.carBrand} {car.carModel}</span>
                        </td>
                        <td>{car.carYear}</td>
                        <td>{Number(car.carMileage).toLocaleString()} km</td>
                        <td>
                          {car.isForSale && car.salePrice ? <div>Sale: €{Number(car.salePrice).toLocaleString()}</div> : null}
                          {car.isForRent && car.rentalDailyPrice ? <div>Rent: €{Number(car.rentalDailyPrice).toLocaleString()}/day</div> : null}
                        </td>
                        <td>
                          <Badge bg={car.carStatus === 'Available' ? 'success' : 'secondary'}>{car.carStatus}</Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            <Button type="button" variant="light" size="sm" onClick={() => openImagesModal(car)}>
                              <FeatherIcon icon="image" size={15} />
                              <span>Images</span>
                            </Button>
                            <Button type="button" variant="light" size="sm" onClick={() => openFeaturesModal(car)}>
                              <FeatherIcon icon="sliders" size={15} />
                              <span>Features</span>
                            </Button>
                            <Button type="button" variant="light" size="sm" onClick={() => openEditModal(car)}>
                              <FeatherIcon icon="edit-2" size={15} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingId === car.carsID}
                              onClick={() => handleDelete(car)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isDeletingId === car.carsID ? 'Deleting...' : 'Delete'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingCar ? 'Edit Car' : 'Add Car'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="carTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control name="carTitle" value={formValues.carTitle} onChange={handleChange} placeholder="BMW 320d" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="createdByAccountID">
                  <Form.Label>Created by</Form.Label>
                  <Form.Select
                    name="createdByAccountID"
                    value={formValues.createdByAccountID}
                    onChange={handleChange}
                    disabled={Boolean(editingCar)}
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.accountID} value={account.accountID}>
                        {getAccountLabel(account.accountID)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carBrand">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control name="carBrand" value={formValues.carBrand} onChange={handleChange} placeholder="BMW" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carModel">
                  <Form.Label>Model</Form.Label>
                  <Form.Control name="carModel" value={formValues.carModel} onChange={handleChange} placeholder="320d" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carYear">
                  <Form.Label>Year</Form.Label>
                  <Form.Control type="number" name="carYear" value={formValues.carYear} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carMileage">
                  <Form.Label>Mileage</Form.Label>
                  <Form.Control type="number" name="carMileage" value={formValues.carMileage} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carFuelType">
                  <Form.Label>Fuel type</Form.Label>
                  <Form.Control name="carFuelType" value={formValues.carFuelType} onChange={handleChange} placeholder="Diesel" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carTransmission">
                  <Form.Label>Transmission</Form.Label>
                  <Form.Control name="carTransmission" value={formValues.carTransmission} onChange={handleChange} placeholder="Automatic" />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carBodyType">
                  <Form.Label>Body type</Form.Label>
                  <Form.Control name="carBodyType" value={formValues.carBodyType} onChange={handleChange} placeholder="Sedan" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carColor">
                  <Form.Label>Color</Form.Label>
                  <Form.Control name="carColor" value={formValues.carColor} onChange={handleChange} placeholder="Black" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="carStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="carStatus" value={formValues.carStatus} onChange={handleChange}>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="carDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="carDescription"
                value={formValues.carDescription}
                onChange={handleChange}
                placeholder="Describe the car."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Check
                  className="mb-2"
                  type="checkbox"
                  id="isForSale"
                  name="isForSale"
                  label="For sale"
                  checked={formValues.isForSale}
                  onChange={handleChange}
                />
                <Form.Control
                  type="number"
                  name="salePrice"
                  value={formValues.salePrice}
                  onChange={handleChange}
                  disabled={!formValues.isForSale}
                  placeholder="Sale price"
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  className="mb-2"
                  type="checkbox"
                  id="isForRent"
                  name="isForRent"
                  label="For rent"
                  checked={formValues.isForRent}
                  onChange={handleChange}
                />
                <Form.Control
                  type="number"
                  name="rentalDailyPrice"
                  value={formValues.rentalDailyPrice}
                  onChange={handleChange}
                  disabled={!formValues.isForRent}
                  placeholder="Daily rental price"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="light" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="ak-admin-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingCar ? 'Save changes' : 'Create car'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showImagesModal} onHide={closeImagesModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedCarForImages ? `Images - ${selectedCarForImages.carTitle}` : 'Car Images'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleImageSubmit} className="mb-4">
            <Row>
              <Col md={7}>
                <Form.Group className="mb-3" controlId="carImageFile">
                  <Form.Label>Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3" controlId="carImageOrderNumber">
                  <Form.Label>Order</Form.Label>
                  <Form.Control
                    type="number"
                    name="carImageOrderNumber"
                    value={imageFormValues.carImageOrderNumber}
                    onChange={handleImageChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  id="carImageIsMain"
                  name="carImageIsMain"
                  label="Main"
                  checked={imageFormValues.carImageIsMain}
                  onChange={handleImageChange}
                />
              </Col>
            </Row>

            <Button type="submit" className="ak-admin-submit" disabled={isSavingImage}>
              {isSavingImage ? 'Saving...' : 'Add image'}
            </Button>
          </Form>

          {isLoadingImages ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading images...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>URL</th>
                    <th>Order</th>
                    <th>Main</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carImages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ak-empty-cell">
                        No images found.
                      </td>
                    </tr>
                  ) : (
                    carImages.map((image) => (
                      <tr key={image.carImageID}>
                        <td>
                          <img className="ak-car-image-thumb" src={getImageSource(image.carImageUrl)} alt="" />
                        </td>
                        <td>
                          <span className="ak-table-muted">{image.carImageUrl}</span>
                        </td>
                        <td>{image.carImageOrderNumber}</td>
                        <td>
                          <Badge bg={image.carImageIsMain ? 'success' : 'secondary'}>
                            {image.carImageIsMain ? 'Main' : 'No'}
                          </Badge>
                        </td>
                        <td>
                          <div className="ak-table-actions">
                            {!image.carImageIsMain && (
                              <Button type="button" variant="light" size="sm" onClick={() => handleSetMainImage(image)}>
                                <FeatherIcon icon="star" size={15} />
                                <span>Main</span>
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isDeletingImageId === image.carImageID}
                              onClick={() => handleDeleteImage(image)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isDeletingImageId === image.carImageID ? 'Deleting...' : 'Delete'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showFeaturesModal} onHide={closeFeaturesModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedCarForFeatures ? `Features - ${selectedCarForFeatures.carTitle}` : 'Car Features'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFeatureSubmit} className="mb-4">
            <Row>
              <Col md={9}>
                <Form.Group className="mb-3" controlId="carFeatureID">
                  <Form.Label>Feature</Form.Label>
                  <Form.Select name="carFeatureID" value={featureFormValues.carFeatureID} onChange={handleFeatureChange}>
                    <option value="">Select feature</option>
                    {unassignedFeatures.map((feature) => {
                      const featureId = feature.carFeatureID ?? feature.CarFeatureID;
                      const featureName = feature.carFeatureName ?? feature.CarFeatureName;

                      return (
                        <option key={featureId} value={featureId}>
                          {featureName}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button type="submit" className="ak-admin-submit w-100 mb-3" disabled={isSavingFeature}>
                  {isSavingFeature ? 'Saving...' : 'Add feature'}
                </Button>
              </Col>
            </Row>
          </Form>

          {isLoadingFeatures ? (
            <div className="ak-permissions-loading">
              <Spinner animation="border" size="sm" />
              <span>Loading features...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="ak-permissions-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carFeatures.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="ak-empty-cell">
                        No features assigned.
                      </td>
                    </tr>
                  ) : (
                    carFeatures.map((feature) => (
                      <tr key={feature.carFeatureMappingID}>
                        <td>
                          <strong>{feature.carFeatureName}</strong>
                        </td>
                        <td>{feature.carFeatureDescription || '-'}</td>
                        <td>{feature.carFeatureOrderNumber}</td>
                        <td>
                          <div className="ak-table-actions">
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              disabled={isRemovingFeatureId === feature.carFeatureID}
                              onClick={() => handleRemoveFeature(feature)}
                            >
                              <FeatherIcon icon="trash-2" size={15} />
                              <span>{isRemovingFeatureId === feature.carFeatureID ? 'Removing...' : 'Remove'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
