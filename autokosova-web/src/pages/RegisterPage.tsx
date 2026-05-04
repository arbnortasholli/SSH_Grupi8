import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { getErrorMessage, isValidEmail } from '../utils/helpers';

const benefits = [
    'Ruaj veturat favorite',
    'Dërgo kërkesë për qira',
    'Kontakto shitësin direkt',
    'Përgatitur për role user/seller',
];

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [apiError, setApiError] = useState<string | null>(null);

    const { values, handleChange, handleSubmit, isSubmitting } = useForm({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        agreeTerms: false,
    });

    const onSubmit = async () => {
        setApiError(null);

        const firstName = values.firstName.trim();
        const lastName = values.lastName.trim();
        const email = values.email.trim();
        const password = values.password.trim();
        const confirmPassword = values.confirmPassword.trim();

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setApiError('Please fill in all required fields');
            return;
        }

        if (!isValidEmail(email)) {
            setApiError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setApiError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setApiError('Passwords do not match');
            return;
        }

        if (!values.agreeTerms) {
            setApiError('You must agree to the terms and conditions');
            return;
        }

        try {
            await register(email, password, firstName, lastName);
            navigate('/dashboard');
        } catch (error: unknown) {
            setApiError(getErrorMessage(error, 'Registration failed'));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[0.9fr_1fr]">
                <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.45),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_38%)]" />
                    <div className="relative">
                        <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-blue-100 backdrop-blur">
                            AutoKosova Account
                        </p>
                        <h1 className="mt-6 max-w-lg text-5xl font-black tracking-tight">Krijo profilin për blerje dhe qira.</h1>
                        <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">
                            Në fazën fillestare regjistrimi lidhet me mock auth/dummy data, por forma është gati për API.
                        </p>
                    </div>

                    <div className="relative space-y-3">
                        {benefits.map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-500 text-sm font-black">✓</span>
                                <span className="font-semibold text-slate-100">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-xl">
                        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                            ← Kthehu në Home
                        </Link>

                        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Create account</p>
                        <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Bashkohu me AutoKosova</h2>
                        <p className="mt-3 text-slate-600">Krijo llogari demo për të testuar rrjedhën e platformës.</p>

                        {apiError && (
                            <div
                                role="alert"
                                className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                            >
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-slate-700">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        value={values.firstName}
                                        onChange={handleChange}
                                        required
                                        autoComplete="given-name"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        placeholder="Arbër"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="mb-2 block text-sm font-bold text-slate-700">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        value={values.lastName}
                                        onChange={handleChange}
                                        required
                                        autoComplete="family-name"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        placeholder="Halimi"
                                    />
                                </div>
                            </div>

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
                                    placeholder="name@autokosova.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={values.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        placeholder="At least 6 characters"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-slate-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        value={values.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>

                            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={values.agreeTerms}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                                />
                                <span className="text-sm leading-6 text-slate-600">
                                    I agree to the{' '}
                                    <a href="#" className="font-bold text-blue-600 hover:text-blue-700">
                                        terms and conditions
                                    </a>{' '}
                                    and understand this is currently a demo flow.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};
