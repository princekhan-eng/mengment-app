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
} from "lucide-react";
import { useRouter } from "next/navigation";
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

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");

        // =========================
        // Validate Employee ID
        // =========================

        const cleanEmployeeId = employeeId.trim();

        if (!cleanEmployeeId) {
            setError("Please enter your employee ID.");
            return;
        }

        if (!/^\d{8}$/.test(cleanEmployeeId)) {
            setError(
                "Employee ID must be exactly 8 digits."
            );
            return;
        }

        // =========================
        // Validate Role
        // =========================

        if (!role) {
            setError("Please select your role.");
            return;
        }

        // =========================
        // Validate Password
        // =========================

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            // =========================
            // Join Team API
            // =========================

            const response =
                await axios.post<JoinTeamResponse>(
                    "/API/join/all",
                    {
                        employeeId,
                        password,
                        role,
                    },
                    {
                        withCredentials: true,
                    }
                );

            const data = response.data;

            if (!data.success) {
                setError(
                    data.message ||
                    "Unable to join team."
                );
                return;
            }

            // =========================
            // Success
            // =========================

            console.log("Joined successfully:", data);

            // You can redirect after successful join
            if (role === "manager") {
                router.push(`/dashboard/manager?employeeId=${employeeId}`);
            } else if (role === "developer") {
                router.push(`/dashboard/developer?employeeId=${employeeId}`);
            } else if (role === "tester") {
                router.push(`/dashboard/tester?employeeId=${employeeId}`);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Invalid employee ID or password."
                );
            } else {
                setError(
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <section className="flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">

                    {/* HEADER */}

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <UserRound size={30} />
                        </div>

                        <h1 className="text-3xl font-bold">
                            Join Your Team
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Enter your employee ID,
                            role and password to
                            access your workspace.
                        </p>
                    </div>

                    {/* CARD */}

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {/* ERROR */}

                        {error && (
                            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* EMPLOYEE ID */}

                            <div>
                                <label
                                    htmlFor="employeeId"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Employee ID
                                </label>

                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                    />

                                    <input
                                        id="employeeId"
                                        name="employeeId"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        value={employeeId}
                                        onChange={(e) => {
                                            setEmployeeId(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            );
                                            setError("");
                                        }}
                                        placeholder="e.g. 58321476"
                                        autoComplete="username"
                                        disabled={loading}
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-sm tracking-wider text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-slate-600">
                                    Enter the 8-digit ID
                                    provided by your
                                    administrator.
                                </p>
                            </div>

                            {/* ROLE */}

                            <div>
                                <label
                                    htmlFor="role"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Select Role
                                </label>

                                <div className="relative">
                                    <Users
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                    />

                                    <select
                                        id="role"
                                        name="role"
                                        value={role}
                                        onChange={(e) => {
                                            setRole(
                                                e.target.value as Role
                                            );
                                            setError("");
                                        }}
                                        disabled={loading}
                                        required
                                        className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-sm capitalize text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="developer">
                                            Developer
                                        </option>

                                        <option value="tester">
                                            Tester
                                        </option>

                                        <option value="manager">
                                            Manager
                                        </option>
                                    </select>
                                </div>

                                <p className="mt-2 text-xs text-slate-600">
                                    Select the role associated
                                    with your employee ID.
                                </p>
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
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        required
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
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* JOIN BUTTON */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    "Joining..."
                                ) : (
                                    <>
                                        Join Team

                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* BACK TO LOGIN */}

                        <div className="mt-7 text-center">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/auth/login"
                                    )
                                }
                                className="text-sm text-slate-500 transition hover:text-indigo-400"
                            >
                                ← Back to Login
                            </button>
                        </div>
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