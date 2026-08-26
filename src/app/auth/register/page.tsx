"use client";

import { FormEvent, useState } from "react";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Briefcase,
    ArrowRight,
    ShieldCheck,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
;

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "/API/auth/register",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Registration failed");
            }

            console.log("Registration successful:", response.data);
            router.push(`/auth/verfiy?email=${encodeURIComponent(
                formData.email
            )}`);

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">

                {/* LEFT SIDE */}
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-purple-400 to-slate-900 p-10 text-white">

                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                                <Briefcase size={23} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold">
                                    ManageHub
                                </h1>
                                <p className="text-xs text-white/70">
                                    Team Management System
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Build better teams.
                            <br />
                            Manage smarter.
                        </h2>

                        <p className="mt-5 max-w-md text-white/75 leading-7">
                            Create your account and join your organization.
                            Manage projects, tasks, teams and workflows from
                            one powerful platform.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                                    <ShieldCheck size={17} />
                                </div>
                                <span className="text-sm">
                                    Secure authentication
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                                    <ShieldCheck size={17} />
                                </div>
                                <span className="text-sm">
                                    Role-based access
                                </span>
                            </div>


                            <div className="my-7 flex items-center gap-4">
                                <div className="h-px flex-1 bg-slate-800" />

                                <span className="text-xs text-slate-600">
                                    OR
                                </span>

                                <div className="h-px flex-1 bg-slate-800" />
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/jointeam"
                                    )
                                }
                                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-400"
                            >
                                <Users
                                    size={18}
                                />

                                Join Team

                                <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </button>

                            <p className="mt-3 text-center text-xs text-slate-600">
                                Have an employee ID?
                                Join your company
                                team.
                            </p>
                        </div>

                        {/* SECURITY */}

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
                            <ShieldCheck size={14} />

                            Your account is protected
                            with secure authentication.
                        </div>
                    </div>

                    <p className="text-xs text-white/50">
                        © 2026 ManageHub. All rights reserved.
                    </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="p-6 sm:p-10">

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white">
                            Create account
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Create your management workspace account.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* NAME */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Full name
                            </label>

                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Email address
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@company.com"
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    required
                                    minLength={8}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                                Use at least 8 characters.
                            </p>
                        </div>
                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    required
                                    minLength={8}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                                Confirm your password.
                            </p>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                "Creating account..."
                            ) : (
                                <>
                                    Create account

                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <a
                            href="/auth/login"
                            className="font-medium text-indigo-400 hover:text-indigo-300"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}