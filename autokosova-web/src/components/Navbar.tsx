import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/helpers';

export const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const canSeeSellerArea = user?.role === 'Seller' || user?.role === 'Admin';

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                            AK
                        </span>
                        <span className="hidden text-xl font-bold text-gray-900 sm:inline">AutoKosova</span>
                    </Link>

                    <div className="hidden items-center gap-6 md:flex">
                        <Link to="/" className="text-sm font-medium text-gray-600 transition hover:text-primary">
                            Browse Cars
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" className="text-sm font-medium text-gray-600 transition hover:text-primary">
                                    Dashboard
                                </Link>
                                <Link to="/favorites" className="text-sm font-medium text-gray-600 transition hover:text-primary">
                                    Favorites
                                </Link>
                                {canSeeSellerArea && (
                                    <Link to="/seller" className="text-sm font-medium text-gray-600 transition hover:text-primary">
                                        My Cars
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    <div className="hidden items-center gap-4 md:flex">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        {user && getInitials(user.firstName, user.lastName)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{user?.role}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link
                                    to="/login"
                                    className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
                        onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
                        aria-label="Toggle navigation"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="space-y-2 border-t border-gray-100 pb-4 pt-3 md:hidden">
                        <Link to="/" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                            Browse Cars
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                                    Dashboard
                                </Link>
                                <Link to="/favorites" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                                    Favorites
                                </Link>
                            </>
                        )}
                        {!isAuthenticated && (
                            <div className="flex gap-2 px-4">
                                <Link
                                    to="/login"
                                    className="flex-1 rounded-lg border border-primary px-3 py-2 text-center text-primary"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-white"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};
