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
    CheckCircle2,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

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
        if (error) setError("");
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

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

            router.push(`/auth/verfiy?email=${encodeURIComponent(formData.email)}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Registration failed.");
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
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-10">
            <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl">
                {/* LEFT BRAND BANNER */}
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-10 text-white">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs shadow-xs">
                                <Briefcase size={22} className="text-white" />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight">ManageHub</h1>
                                <p className="text-xs text-indigo-100">Team Management Platform</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-extrabold leading-tight">
                                Build better teams.
                                <br />
                                Manage faster.
                            </h2>
                            <p className="text-xs text-indigo-100/90 leading-relaxed max-w-sm">
                                Create your organization workspace. Manage projects, assign tasks to developers and QA testers, and monitor progress in real-time.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-xs text-indigo-50">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span>Complete sprint lifecycle and task workflows</span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-indigo-50">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span>Direct role-based security & permissions</span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-indigo-50">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span>Real-time team chat with ImageKit file attachments</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-indigo-200">
                        <span>Protected by AES session encryption</span>
                        <span>© 2026 ManageHub</span>
                    </div>
                </div>

                {/* RIGHT SIDE FORM */}
                <div className="p-7 sm:p-10 flex flex-col justify-center">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Create account
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Set up your company administration credentials
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* NAME */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                            >
                                Full name
                            </label>

                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                            >
                                Work email address
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
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                            >
                                Password
                            </label>

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
                                    placeholder="Create password (min. 8 characters)"
                                    required
                                    minLength={8}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-11 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                            >
                                Confirm password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    required
                                    minLength={8}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-11 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
                        >
                            {loading ? (
                                "Creating account..."
                            ) : (
                                <>
                                    Create Organization Workspace
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}