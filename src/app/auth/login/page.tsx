
"use client";

import { FormEvent, useState } from "react";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        // Clear error when user starts typing
        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "/API/auth/login",
                {
                    email: formData.email
                        .trim()
                        .toLowerCase(),
                    password: formData.password,
                },
                {
                    withCredentials: true,
                }
            );

            const role = response.data.user?.role;
            if (role === "manager") {
                router.push("/dashboard/manager");
            } else if (role === "developer") {
                router.push("/dashboard/developer");
            } else if (role === "tester") {
                router.push("/dashboard/tester");
            } else {
                router.push("/admin");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Invalid email or password"
                );
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Something went wrong"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">

                    {/* HEADER */}

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <ShieldCheck size={30} />
                        </div>

                        <h2 className="text-3xl font-bold">
                            Welcome back
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Sign in to continue to
                            your workspace.
                        </p>
                    </div>

                    {/* CARD */}

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {/* ERROR */}

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

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
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                        required
                                        disabled={
                                            loading
                                        }
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-slate-300"
                                    >
                                        Password
                                    </label>

                                    <a
                                        href="/auth/forgotpassword"
                                        className="text-xs text-indigo-400 hover:text-indigo-300"
                                    >
                                        Forgot password?
                                    </a>
                                </div>

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
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        disabled={
                                            loading
                                        }
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                size={18}
                                            />
                                        ) : (
                                            <Eye
                                                size={18}
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* REMEMBER */}

                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                                />

                                <label
                                    htmlFor="remember"
                                    className="text-sm text-slate-400"
                                >
                                    Remember me
                                </label>
                            </div>

                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    "Signing in..."
                                ) : (
                                    <>
                                        Sign in

                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* JOIN TEAM */}

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
            </section>
        </main>
    );
}

