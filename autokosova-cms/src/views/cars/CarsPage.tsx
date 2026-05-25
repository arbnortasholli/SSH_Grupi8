// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import apiClient from 'config/apiClient';
import authService from 'utils/authService';

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
  images: [],
  mainImageIndex: ''
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
  carCreationDate: item.carCreationDate ?? item.CarCreationDate,
  mainImageUrl: item.mainImageUrl ?? item.MainImageUrl ?? ''
});

const normalizeCarImage = (item) => ({
  carImageID: item.carImageID ?? item.CarImageID,
  carID: item.carID ?? item.CarID,
  carImageUrl: item.carImageUrl ?? item.CarImageUrl ?? '',
  carImageOriginalFileName: item.carImageOriginalFileName ?? item.CarImageOriginalFileName ?? '',
  carImageContentType: item.carImageContentType ?? item.CarImageContentType ?? '',
  carImageSizeBytes: item.carImageSizeBytes ?? item.CarImageSizeBytes ?? null,
  carImageIsMain: item.carImageIsMain ?? item.CarImageIsMain ?? false,
  carImageOrderNumber: item.carImageOrderNumber ?? item.CarImageOrderNumber ?? 0,
  carImageCreationDate: item.carImageCreationDate ?? item.CarImageCreationDate
});

const normalizeAccount = (item) => ({
  accountID: item.accountID ?? item.AccountID,
  accountUsername: item.accountUsername ?? item.AccountUsername ?? '',
  accountName: item.accountName ?? item.AccountName ?? '',
  accountLastname: item.accountLastname ?? item.AccountLastname ?? ''
});

export default function CarsPage() {
  const currentUser = authService.getUser();
  const isSeller = currentUser?.role === 'Seller';
  const currentUserAccount = currentUser
    ? {
        accountID: currentUser.accountID,
        accountUsername: currentUser.accountUsername,
        accountName: currentUser.accountName,
        accountLastname: currentUser.accountLastname
      }
    : null;
  const [cars, setCars] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [createImages, setCreateImages] = useState([]);
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

  const createImagePreviews = useMemo(
      () => createImages.map((image) => URL.createObjectURL(image)),
      [createImages]
  );

  const uploadImagePreviews = useMemo(
      () => imageFormValues.images.map((image) => URL.createObjectURL(image)),
      [imageFormValues.images]
  );

  useEffect(() => () => {
    createImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [createImagePreviews]);

  useEffect(() => () => {
    uploadImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [uploadImagePreviews]);

  const forSaleCount = useMemo(() => cars.filter((car) => car.isForSale).length, [cars]);
  const forRentCount = useMemo(() => cars.filter((car) => car.isForRent).length, [cars]);

  const ensureCurrentUserAccount = (accountList) => {
    if (!currentUserAccount?.accountID) {
      return accountList;
    }

    const hasCurrentUser = accountList.some((account) => Number(account.accountID) === Number(currentUserAccount.accountID));
    return hasCurrentUser ? accountList : [currentUserAccount, ...accountList];
  };

  const loadAccounts = async () => {
    try {
      const response = await apiClient.get('/Account');
      setAccounts(ensureCurrentUserAccount(getResponseList(response.data).map(normalizeAccount)));
    } catch {
      setAccounts(ensureCurrentUserAccount([]));
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
      setCarImages(getResponseList(response.data).map(normalizeCarImage));
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
    if (!account && Number(currentUserAccount?.accountID) === Number(accountID)) {
      const currentUserName = `${currentUserAccount.accountName} ${currentUserAccount.accountLastname}`.trim();
      return currentUserName ? `${currentUserName} (@${currentUserAccount.accountUsername})` : currentUserAccount.accountUsername;
    }

    if (!account) return accountID ? `Account #${accountID}` : '-';

    const name = `${account.accountName} ${account.accountLastname}`.trim();
    return name ? `${name} (@${account.accountUsername})` : account.accountUsername;
  };

  const openCreateModal = () => {
    setEditingCar(null);
    setFormValues({
      ...emptyForm,
      createdByAccountID: currentUser?.accountID || ''
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
    setCreateImages([]);
    setMessage('');
    setError('');
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
    setMessage('');
    setError('');
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
    setMessage('');
    setError('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (event) => {
    const { name, value, type, files } = event.target;

    setImageFormValues((current) => ({
      ...current,
      [name]: type === 'file' ? Array.from(files || []) : value
    }));
  };

  const validateImages = (files) => {
    if (!files.length) return '';
    if (files.length > 10) return 'Maximum 10 images are allowed.';

    const invalidFile = files.find((file) => {
      const hasExtension = /\.[a-z0-9]+$/i.test(file.name);
      const allowedType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      return !hasExtension || !allowedType || file.size > 5 * 1024 * 1024;
    });

    return invalidFile ? 'Only JPEG, PNG, or WEBP images up to 5MB are allowed.' : '';
  };

  const handleCreateImagesChange = (event) => {
    const files = Array.from(event.target.files || []);
    const validationError = validateImages(files);

    if (validationError) {
      setError(validationError);
      event.target.value = '';
      setCreateImages([]);
      return;
    }

    setError('');
    setCreateImages(files);
  };

  const handleFeatureChange = (event) => {
    const { name, value } = event.target;

    setFeatureFormValues((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleListingTypeChange = (event) => {
    const value = event.target.value;
    if (isSeller && value !== 'ForSale') {
      return;
    }

    const isForSale = value === 'ForSale';
    const isForRent = value === 'ForRent';

    setFormValues((current) => {
      let carStatus = current.carStatus;
      const saleStatuses = ['Available', 'Reserved', 'Sold', 'Inactive'];
      const rentStatuses = ['Available', 'Rented', 'Under Maintenance', 'Inactive'];

      if (isForSale && !saleStatuses.includes(carStatus)) {
        carStatus = 'Available';
      } else if (isForRent && !rentStatuses.includes(carStatus)) {
        carStatus = 'Available';
      }

      return {
        ...current,
        isForSale,
        isForRent,
        carStatus,
        salePrice: isForSale ? current.salePrice : '',
        rentalDailyPrice: isForRent ? current.rentalDailyPrice : ''
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const generatedTitle = `${formValues.carYear} ${formValues.carBrand} ${formValues.carModel}`.trim();

    if (!formValues.carBrand.trim() || !formValues.carModel.trim()) {
      setError('Brand and model are required.');
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

    if (isSeller && (!formValues.isForSale || formValues.isForRent)) {
      setError('Seller accounts can manage only cars for sale.');
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

    setIsSaving(true);

    try {
      if (editingCar) {
        const payload = {
          tenantID: formValues.tenantID ? Number(formValues.tenantID) : null,
          carTitle: generatedTitle,
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

        await apiClient.put(`/Cars/${editingCar.carsID}`, payload);
        setMessage('Car updated successfully.');
        await loadCars();
        // Wait 2 seconds before closing the modal so the user can see the success message
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        const formData = new FormData();
        formData.append('tenantID', formValues.tenantID ? String(Number(formValues.tenantID)) : '');
        formData.append('createdByAccountID', String(Number(formValues.createdByAccountID)));
        formData.append('carTitle', generatedTitle);
        formData.append('carBrand', formValues.carBrand.trim());
        formData.append('carModel', formValues.carModel.trim());
        formData.append('carYear', String(Number(formValues.carYear)));
        formData.append('carMileage', String(Number(formValues.carMileage)));
        formData.append('carFuelType', formValues.carFuelType.trim());
        formData.append('carTransmission', formValues.carTransmission.trim());
        formData.append('carBodyType', formValues.carBodyType.trim());
        formData.append('carColor', formValues.carColor.trim());
        formData.append('carDescription', formValues.carDescription.trim());
        formData.append('isForSale', String(formValues.isForSale));
        formData.append('salePrice', formValues.isForSale ? String(Number(formValues.salePrice)) : '');
        formData.append('isForRent', String(formValues.isForRent));
        formData.append('rentalDailyPrice', formValues.isForRent ? String(Number(formValues.rentalDailyPrice)) : '');
        formData.append('carStatus', formValues.carStatus || 'Available');
        createImages.forEach((image) => formData.append('images', image));

        await apiClient.post('/Cars', formData);
        setMessage('Car created successfully.');
        await loadCars();
        // Wait 2 seconds before closing the modal so the user can see the success message
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
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

    if (!imageFormValues.images.length) {
      setError('At least one image file is required.');
      return;
    }

    const existingCount = carImages.length;
    if (existingCount + imageFormValues.images.length > 10) {
      setError('A car can have a maximum of 10 images.');
      return;
    }

    const validationError = validateImages(imageFormValues.images);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSavingImage(true);

    try {
      const formData = new FormData();
      imageFormValues.images.forEach((image) => formData.append('images', image));
      if (imageFormValues.mainImageIndex !== '') {
        formData.append('mainImageIndex', String(imageFormValues.mainImageIndex));
      }

      await apiClient.post(`/cars/${selectedCarForImages.carsID}/images`, formData);

      setImageFormValues(emptyImageForm);
      setMessage('Car image added successfully.');
      await loadCarImages(selectedCarForImages.carsID);
      await loadCars(); // Refresh main list too
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
      await apiClient.put(`/cars/${selectedCarForImages.carsID}/images/${image.carImageID}/set-main`);
      setMessage('Main image updated successfully.');
      await loadCarImages(selectedCarForImages.carsID);
      await loadCars(); // Refresh main list too
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
      await apiClient.delete(`/cars/${selectedCarForImages.carsID}/images/${image.carImageID}`);
      setMessage('Car image deleted successfully.');
      await loadCarImages(selectedCarForImages.carsID);
      await loadCars(); // Refresh main list too
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
                      <th>Photo</th>
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
                          <td colSpan={7} className="ak-empty-cell">
                            No cars found.
                          </td>
                        </tr>
                    ) : (
                        cars.map((car) => (
                            <tr key={car.carsID}>
                              <td>
                                {car.mainImageUrl ? (
                                    <img className="ak-car-image-thumb" src={getImageSource(car.mainImageUrl)} alt={car.carTitle} />
                                ) : (
                                    <span className="ak-table-muted">No image</span>
                                )}
                              </td>
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
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="createdByAccountID">
                    <Form.Label>Created by</Form.Label>
                    <Form.Select
                        name="createdByAccountID"
                        value={formValues.createdByAccountID}
                        onChange={handleChange}
                        disabled
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
                <Col md={3}>
                  <Form.Group className="mb-3" controlId="carBodyType">
                    <Form.Label>Body type</Form.Label>
                    <Form.Control name="carBodyType" value={formValues.carBodyType} onChange={handleChange} placeholder="Sedan" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3" controlId="carColor">
                    <Form.Label>Color</Form.Label>
                    <Form.Control name="carColor" value={formValues.carColor} onChange={handleChange} placeholder="Black" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3" controlId="listingType">
                    <Form.Label>Listing type</Form.Label>
                    <Form.Select
                        name="listingType"
                        value={formValues.isForSale ? 'ForSale' : formValues.isForRent ? 'ForRent' : ''}
                        onChange={handleListingTypeChange}
                    >
                      <option value="" disabled>Select type</option>
                      <option value="ForSale">For Sale</option>
                      {!isSeller && <option value="ForRent">For Rent</option>}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3" controlId="carStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="carStatus" value={formValues.carStatus} onChange={handleChange}>
                      <option value="Available">Available</option>
                      {formValues.isForSale && (
                          <>
                            <option value="Reserved">Reserved</option>
                            <option value="Sold">Sold</option>
                          </>
                      )}
                      {formValues.isForRent && (
                          <>
                            <option value="Rented">Rented</option>
                            <option value="Under Maintenance">Under Maintenance</option>
                          </>
                      )}
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
                  {formValues.isForSale && (
                      <Form.Group className="mb-3" controlId="salePrice">
                        <Form.Label>Sale price</Form.Label>
                        <Form.Control
                            type="number"
                            name="salePrice"
                            value={formValues.salePrice}
                            onChange={handleChange}
                            placeholder="Sale price"
                        />
                      </Form.Group>
                  )}
                  {formValues.isForRent && (
                      <Form.Group className="mb-3" controlId="rentalDailyPrice">
                        <Form.Label>Daily rental price</Form.Label>
                        <Form.Control
                            type="number"
                            name="rentalDailyPrice"
                            value={formValues.rentalDailyPrice}
                            onChange={handleChange}
                            placeholder="Daily rental price"
                        />
                      </Form.Group>
                  )}
                </Col>
              </Row>

              {!editingCar && (
                  <div className="mt-4">
                    <Form.Group className="mb-3" controlId="createCarImages">
                      <Form.Label>Car photos</Form.Label>
                      <Form.Control
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleCreateImagesChange}
                      />
                      <Form.Text className="text-muted">
                        Upload up to 10 JPEG, PNG, or WEBP images. Each image must be 5MB or smaller.
                      </Form.Text>
                    </Form.Group>

                    {createImagePreviews.length > 0 && (
                        <div className="ak-image-preview-grid">
                          {createImagePreviews.map((preview, index) => (
                              <div key={preview} className="ak-image-preview-card">
                                <img src={preview} alt={`Car upload preview ${index + 1}`} />
                                <span>{index === 0 ? 'Main image' : `Image ${index + 1}`}</span>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              )}
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
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
            <Form onSubmit={handleImageSubmit} className="mb-4">
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3" controlId="carImageFile">
                    <Form.Label>Images</Form.Label>
                    <Form.Control
                        type="file"
                        name="images"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="mainImageIndex">
                    <Form.Label>Main image index</Form.Label>
                    <Form.Select
                        name="mainImageIndex"
                        value={imageFormValues.mainImageIndex}
                        onChange={handleImageChange}
                    >
                      <option value="">Keep current</option>
                      {imageFormValues.images.map((image, index) => (
                          <option key={`${image.name}-${index}`} value={index}>
                            {index + 1} - {image.name}
                          </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {uploadImagePreviews.length > 0 && (
                  <div className="ak-image-preview-grid mb-3">
                    {uploadImagePreviews.map((preview, index) => (
                        <div key={preview} className="ak-image-preview-card">
                          <img src={preview} alt={`New car image ${index + 1}`} />
                          <span>{index + 1}</span>
                        </div>
                    ))}
                  </div>
              )}

              <Button type="submit" className="ak-admin-submit" disabled={isSavingImage}>
                {isSavingImage ? 'Saving...' : 'Add images'}
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
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
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
