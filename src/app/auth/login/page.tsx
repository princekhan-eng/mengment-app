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
    Code2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function LoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "/API/auth/login",
                {
                    email: formData.email.trim().toLowerCase(),
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
                    error.response?.data?.message || "Invalid email or password"
                );
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center px-4 py-12">
            <section className="flex items-center justify-center">
                <div className="w-full max-w-md">
                    {/* HEADER */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                            <ShieldCheck size={28} />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Welcome back
                        </h2>

                        <p className="mt-1.5 text-xs text-slate-500">
                            Sign in to continue to your ManageHub workspace
                        </p>
                    </div>

                    {/* CARD */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl sm:p-9">
                        {/* ERROR */}
                        {error && (
                            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                                {error}
                            </div>
                        )}

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* EMAIL */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-xs font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        href="/auth/forgotpassword"
                                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <Lock
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-11 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* REMEMBER */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="remember" className="text-xs text-slate-500">
                                    Remember me on this browser
                                </label>
                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    "Signing in..."
                                ) : (
                                    <>
                                        Sign in to Workspace
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* JOIN TEAM DIVIDER */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[11px] font-semibold text-slate-400">OR</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/jointeam")}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 shadow-xs"
                        >
                            <Users size={16} />
                            Join with Employee ID
                            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                        </button>

                        <p className="mt-2.5 text-center text-[11px] text-slate-400">
                            Invited by your company? Enter your employee credentials.
                        </p>

                        {/* SIGN UP / REGISTER LINK */}
                        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-500">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/auth/register"
                                    className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition"
                                >
                                    Create organization
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* SECURITY */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Protected with encrypted role-based session verification
                    </div>
                </div>
            </section>
        </main>
    );
}
