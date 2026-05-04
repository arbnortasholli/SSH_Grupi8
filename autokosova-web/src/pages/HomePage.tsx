import React, { useCallback, useEffect, useState } from 'react';
import type { Car, CarFilters } from '../lib/types';
import { carService } from '../services/carService';
import { CarCard } from '../components/CarCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { SkeletonCard } from '../components/LoadingSpinner';
import { getErrorMessage } from '../utils/helpers';
import '../App.css'
const trustItems = [
    'Verifikim i shitësit',
    'Rezervim për qira',
    'Filtrim sipas buxhetit',
];

const demoCities = ['Prishtinë', 'Prizren', 'Pejë', 'Ferizaj'];

export const HomePage: React.FC = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [filters, setFilters] = useState<CarFilters>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const pageSize = 12;

    const loadCars = useCallback(async () => {
        await Promise.resolve();
        setIsLoading(true);
        setError(null);

        try {
            // Për momentin carService mund të kthejë dummy data.
            // Kur API përfundon, ndërrohet vetëm implementimi në service layer.
            const response = await carService.getCars(filters, page, pageSize);
            setCars(response.data);
            setTotal(response.total);
        } catch (err: unknown) {
            setCars([]);
            setTotal(0);
            setError(getErrorMessage(err, 'Failed to load cars'));
        } finally {
            setIsLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        queueMicrotask(() => {
            void loadCars();
        });
    }, [loadCars]);

    const handleFiltersChange = (newFilters: CarFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleRetry = () => {
        void loadCars();
    };

    const totalPages = Math.ceil(total / pageSize);
    const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, total);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.18),_transparent_35%)]" />
                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
                    <div className="flex flex-col justify-center">
                        <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            AutoKosova Demo Marketplace
                        </div>

                        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">
                            Blej, shit ose merr me qira vetura në Kosovë.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                            Platformë moderne për vetura të përdorura, me filtra të qartë, listings për shitje dhe qira,
                            dhe strukturë të gatshme për API kur backend-i të përfundojë.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#cars"
                                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
                            >
                                Shiko veturat
                            </a>
                            <a
                                href="#filters"
                                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                            >
                                Filtro ofertat
                            </a>
                        </div>

                        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                            {trustItems.map((item) => (
                                <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold text-slate-100 backdrop-blur">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-[1.5rem] bg-white p-5 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Featured demo</p>
                                    <h2 className="text-2xl font-black text-slate-950">BMW X5 xDrive</h2>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Available</span>
                            </div>

                            <div className="grid h-56 place-items-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
                                <div className="text-center">
                                    <div className="text-7xl">🚙</div>
                                    <p className="mt-3 text-sm font-semibold text-blue-100">Dummy image placeholder</p>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">Year</p>
                                    <p className="font-black">2021</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">Fuel</p>
                                    <p className="font-black">Diesel</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">Price</p>
                                    <p className="font-black">€42k</p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-950 p-4 text-white">
                                <div>
                                    <p className="text-xs text-slate-400">Rental from</p>
                                    <p className="text-xl font-black">€85/day</p>
                                </div>
                                <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950">Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-3xl font-black text-slate-950">{total}</p>
                        <p className="text-sm text-slate-500">Vetura në demo</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-3xl font-black text-slate-950">12+</p>
                        <p className="text-sm text-slate-500">Brende</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-3xl font-black text-slate-950">6</p>
                        <p className="text-sm text-slate-500">Lloje veturash</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-3xl font-black text-slate-950">24/7</p>
                        <p className="text-sm text-slate-500">Kërkim online</p>
                    </div>
                </div>
            </section>

            <main id="cars" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-7 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Inventory</p>
                        <h2 className="mt-1 text-3xl font-black text-slate-950">Veturat e disponueshme</h2>
                        <p className="mt-2 max-w-2xl text-slate-600">
                            Këto të dhëna janë dummy data për fazën fillestare. UI mbetet i njëjtë kur lidhet me API.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {demoCities.map((city) => (
                            <span key={city} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">
                                {city}
                            </span>
                        ))}
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="w-fit rounded-xl border border-red-300 px-4 py-2 text-sm font-bold hover:bg-red-100"
                        >
                            Provo përsëri
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <aside id="filters" className="lg:col-span-1">
                        <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <FilterSidebar
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                isLoading={isLoading}
                            />
                        </div>
                    </aside>

                    <section className="lg:col-span-3">
                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))}
                            </div>
                        ) : cars.length > 0 ? (
                            <>
                                <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-slate-700">
                                        Showing <span className="font-bold text-slate-950">{firstItem}</span> -{' '}
                                        <span className="font-bold text-slate-950">{lastItem}</span> of{' '}
                                        <span className="font-bold text-slate-950">{total}</span> cars
                                    </p>
                                    {totalPages > 1 && (
                                        <p className="text-sm font-semibold text-slate-500">
                                            Page {page} of {totalPages}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {cars.map((car) => (
                                        <CarCard key={car.id} car={car} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                                            disabled={page === 1}
                                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        {Array.from({ length: totalPages }).map((_, index) => {
                                            const pageNumber = index + 1;

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    type="button"
                                                    onClick={() => setPage(pageNumber)}
                                                    aria-current={page === pageNumber ? 'page' : undefined}
                                                    className={`rounded-xl px-3 py-2 font-semibold ${
                                                        page === pageNumber
                                                            ? 'bg-blue-600 text-white'
                                                            : 'border border-slate-300 bg-white hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                                            disabled={page === totalPages}
                                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                                <p className="text-xl font-black text-slate-950">Nuk u gjet asnjë veturë</p>
                                <p className="mt-2 text-slate-600">Provo të ndryshosh filtrat ose fjalën kërkuese.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};
