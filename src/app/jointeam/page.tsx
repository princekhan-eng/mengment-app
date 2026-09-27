"use client";

import { FormEvent, useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    ShieldCheck,
    UserRound,
    Users,
    Briefcase,
    Code2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface JoinTeamResponse {
    success: boolean;
    message: string;
    employee?: {
        id: string;
        employeeId: string;
        name: string;
        role: string;
    };
}
type Role = "manager" | "developer" | "tester";

export default function JoinTeamPage() {
    const router = useRouter();

    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("developer");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const cleanEmployeeId = employeeId.trim();

        if (!cleanEmployeeId) {
            setError("Please enter your employee ID.");
            return;
        }

        if (!/^\d{8}$/.test(cleanEmployeeId)) {
            setError("Employee ID must be exactly 8 digits.");
            return;
        }

        if (!role) {
            setError("Please select your role.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post<JoinTeamResponse>(
                "/API/join/all",
                {
                    employeeId: cleanEmployeeId,
                    password,
                    role,
                }
            );

            const data = response.data;

            if (!data.success) {
                throw new Error(data.message || "Failed to join team.");
            }

            if (role === "manager") {
                router.push(`/dashboard/manager?employeeId=${cleanEmployeeId}`);
            } else if (role === "developer") {
                router.push(`/dashboard/developer?employeeId=${cleanEmployeeId}`);
            } else if (role === "tester") {
                router.push(`/dashboard/tester?employeeId=${cleanEmployeeId}`);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message || "Invalid employee ID or password."
                );
            } else {
                setError("Something went wrong. Please check your credentials.");
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
                            <UserRound size={28} />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Join Your Team
                        </h1>

                        <p className="mt-1.5 text-xs text-slate-500">
                            Enter your company employee ID and credentials to access your workspace
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* EMPLOYEE ID */}
                            <div>
                                <label
                                    htmlFor="employeeId"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Employee ID (8 digits)
                                </label>

                                <div className="relative">
                                    <UserRound
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="employeeId"
                                        name="employeeId"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        value={employeeId}
                                        onChange={(e) => {
                                            setEmployeeId(e.target.value.replace(/\D/g, ""));
                                            setError("");
                                        }}
                                        placeholder="e.g. 58321476"
                                        autoComplete="username"
                                        disabled={loading}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-mono tracking-wider text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* ROLE */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Select Assigned Role
                                </label>

                                <div className="relative">
                                    <Users
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        id="role"
                                        name="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as Role)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs text-slate-900 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs capitalize cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="developer">Developer</option>
                                        <option value="tester">QA Tester</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Assigned Password
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
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your employee password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-11 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
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

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
                            >
                                {loading ? (
                                    "Verifying credentials..."
                                ) : (
                                    <>
                                        Join Workspace
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-500">
                                Organization admin?{" "}
                                <Link
                                    href="/auth/login"
                                    className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                                >
                                    Sign in as Admin
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Credentials verified via secure company registry
                    </div>
                </div>
            </section>
        </main>
    );
}