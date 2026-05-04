import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { getErrorMessage, isValidEmail } from '../utils/helpers';

const demoCredentials = {
    email: 'demo@autokosova.com',
    password: 'Demo123!',
};

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [apiError, setApiError] = useState<string | null>(null);

    const { values, handleChange, handleSubmit, isSubmitting } = useForm({
        email: '',
        password: '',
    });

    const onSubmit = async () => {
        setApiError(null);

        const email = values.email.trim();
        const password = values.password.trim();

        if (!email || !password) {
            setApiError('Email and password are required');
            return;
        }

        if (!isValidEmail(email)) {
            setApiError('Please enter a valid email address');
            return;
        }

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error: unknown) {
            setApiError(getErrorMessage(error, 'Login failed'));
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:grid-cols-[1fr_0.9fr]">
                <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.45),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.18),_transparent_38%)]" />
                    <div className="relative">
                        <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-blue-100 backdrop-blur">
                            AutoKosova Access
                        </p>
                        <h1 className="mt-6 max-w-lg text-5xl font-black tracking-tight">Hyr në panelin tënd të veturave.</h1>
                        <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">
                            Menaxho favorites, kërkesat për qira dhe komunikimin me shitësit nga një vend i vetëm.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-2 gap-4">
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                            <p className="text-3xl font-black">120+</p>
                            <p className="mt-1 text-sm text-slate-300">Demo listings</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                            <p className="text-3xl font-black">API</p>
                            <p className="mt-1 text-sm text-slate-300">Ready structure</p>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-md">
                        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                            ← Kthehu në Home
                        </Link>

                        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Sign in</p>
                        <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Mirë se u ktheve</h2>
                        <p className="mt-3 text-slate-600">Përdor llogarinë demo derisa API/Auth të përfundojë.</p>

                        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                            <p className="font-bold">Demo credentials</p>
                            <p className="mt-1">Email: {demoCredentials.email}</p>
                            <p>Password: {demoCredentials.password}</p>
                        </div>

                        {apiError && (
                            <div
                                role="alert"
                                className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                            >
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    placeholder={demoCredentials.email}
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                        Password
                                    </label>
                                    <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                                        Forgot?
                                    </a>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-slate-600">
                            Nuk ke llogari?{' '}
                            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                                Krijo llogari
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};
