import React from 'react';
import type { CarFilters } from '../lib/types';

interface FilterSidebarProps {
    filters: CarFilters;
    onFiltersChange: (filters: CarFilters) => void;
    isLoading?: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    filters,
    onFiltersChange,
    isLoading = false,
}) => {
    const carBrands = [
        'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Toyota',
        'Honda', 'Hyundai', 'Kia', 'Nissan', 'Renault', 'Peugeot',
    ];

    const carTypes = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van'];
    const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
    const transmissions = ['Manual', 'Automatic'];

    const handleChange = <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

    return (
        <aside className="sticky top-24 h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                    type="button"
                    onClick={() => onFiltersChange({})}
                    disabled={isLoading}
                    className="text-sm font-medium text-primary hover:text-blue-700 disabled:opacity-50"
                >
                    Reset
                </button>
            </div>

            <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Search
                </label>
                <input
                    type="text"
                    placeholder="Brand, model..."
                    value={filters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                    disabled={isLoading}
                    className={inputClass}
                />
            </div>

            <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Brand
                </label>
                <select
                    value={filters.brand || ''}
                    onChange={(e) => handleChange('brand', e.target.value || undefined)}
                    disabled={isLoading}
                    className={inputClass}
                >
                    <option value="">All Brands</option>
                    {carBrands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Type
                </label>
                <select
                    value={filters.type || ''}
                    onChange={(e) => handleChange('type', e.target.value || undefined)}
                    disabled={isLoading}
                    className={inputClass}
                >
                    <option value="">All Types</option>
                    {carTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price Range
                </label>
                <div className="space-y-2">
                    <input
                        type="number"
                        placeholder="Min price"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                        disabled={isLoading}
                        className={inputClass}
                    />
                    <input
                        type="number"
                        placeholder="Max price"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                        disabled={isLoading}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Fuel Type
                </label>
                <select
                    value={filters.fuelType || ''}
                    onChange={(e) => handleChange('fuelType', e.target.value || undefined)}
                    disabled={isLoading}
                    className={inputClass}
                >
                    <option value="">All Fuel Types</option>
                    {fuelTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Transmission
                </label>
                <select
                    value={filters.transmission || ''}
                    onChange={(e) => handleChange('transmission', e.target.value || undefined)}
                    disabled={isLoading}
                    className={inputClass}
                >
                    <option value="">All Transmissions</option>
                    {transmissions.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <label className="flex items-center rounded-lg bg-gray-50 px-3 py-2">
                <input
                    type="checkbox"
                    checked={filters.availability ?? false}
                    onChange={(e) => handleChange('availability', e.target.checked || undefined)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded text-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Available only</span>
            </label>
        </aside>
    );
};
