"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import axios from "axios";

interface Manager {
    _id: string;
    employeeId: string;
    name: string;
    email?: string;
    isActive?: boolean;
}

interface ManagersResponse {
    success: boolean;
    managers?: Manager[];
    message?: string;
}

export default function CreateTesterPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        managerId: "",
    });

    const [managers, setManagers] = useState<Manager[]>([]);
    const [loadingManagers, setLoadingManagers] = useState(true);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /* ---------------------------------------------------------------------- */
    /* Get Managers */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                setLoadingManagers(true);
                setError("");

                const response =
                    await apiClient.get<ManagersResponse>(
                        "/API/getemply/manager"
                    );

                console.log(
                    "Managers API Response:",
                    response.data
                );

                if (!response.data.success) {
                    throw new Error(
                        response.data.message ||
                        "Failed to fetch managers"
                    );
                }

                const managerData =
                    Array.isArray(response.data.managers)
                        ? response.data.managers.flat()
                        : [];

                console.log(
                    "Managers available:",
                    managerData
                );

                setManagers(managerData);
            } catch (error) {
                console.error(
                    "FETCH MANAGERS ERROR:",
                    error
                );

                if (axios.isAxiosError(error)) {
                    setError(
                        error.response?.data?.message ||
                        "Failed to load managers."
                    );
                } else if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError(
                        "Something went wrong while loading managers."
                    );
                }
            } finally {
                setLoadingManagers(false);
            }
        };

        fetchManagers();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Handle Input */
    /* ---------------------------------------------------------------------- */

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    /* ---------------------------------------------------------------------- */
    /* Create Tester */
    /* ---------------------------------------------------------------------- */

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !form.name ||
            !form.email ||
            !form.password ||
            !form.confirmPassword ||
            !form.managerId
        ) {
            setError(
                "Please fill all required fields."
            );
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await apiClient.post(
                "/API/createemplys/createtester",
                {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    managerId: form.managerId,
                }
            );

            const data = response.data;

            console.log(
                "CREATE TESTER RESPONSE:",
                data
            );

            setMessage(
                `Tester ${data.tester.employeeId} created successfully.`
            );

            setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                managerId: "",
            });
        } catch (error) {
            console.error(
                "CREATE TESTER ERROR:",
                error
            );

            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Failed to create tester."
                );
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Something went wrong."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Link href="/admin" className="hover:text-amber-400 transition">
                                Admin Dashboard
                            </Link>
                            <span>/</span>
                            <span className="text-slate-200">Testers</span>
                        </div>
                        <h1 className="mt-1 text-lg sm:text-xl font-bold text-white">
                            Create QA Tester
                        </h1>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        Back to Admin
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 w-full flex-1">
                <div className="mb-6 sm:mb-8">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                        QA & Verification Provisioning
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                        New Tester Account
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Create a QA testing account and assign them to a department lead manager.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-0"
                >
                    {/* Account Information */}
                    <div className="border-b border-slate-800 p-5 sm:p-6 bg-slate-950/40">
                        <h3 className="font-bold text-white text-base">
                            Account Information
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            Enter the QA tester's company account credentials.
                        </p>
                    </div>

                    <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Saad Khan"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Company Email <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="tester@company.com"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Temporary Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Confirm Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    {/* Manager Assignment */}
                    <div className="border-y border-slate-800 bg-slate-950/40 p-5 sm:p-6 space-y-4">
                        <div>
                            <h3 className="font-bold text-white text-base">
                                Team Assignment
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                                Assign this QA tester to an executive manager.
                            </p>
                        </div>

                        <div className="max-w-lg">
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Assigned Manager <span className="text-rose-500">*</span>
                            </label>

                            <select
                                name="managerId"
                                value={form.managerId}
                                onChange={handleChange}
                                disabled={loadingManagers}
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" className="bg-slate-900 text-slate-400">
                                    {loadingManagers
                                        ? "Loading managers..."
                                        : managers.length === 0
                                            ? "No managers available"
                                            : "Select manager"}
                                </option>

                                {managers.map((manager) => (
                                    <option
                                        key={manager._id}
                                        value={manager._id}
                                        className="bg-slate-900 text-white"
                                    >
                                        {manager.employeeId} — {manager.name}
                                    </option>
                                ))}
                            </select>

                            {error && loadingManagers === false && managers.length === 0 && (
                                <p className="mt-2 text-xs text-rose-400 font-medium">
                                    {error}
                                </p>
                            )}

                            {!loadingManagers && managers.length > 0 && (
                                <p className="mt-2 text-xs text-slate-400">
                                    {managers.length} manager{managers.length !== 1 ? "s" : ""} available
                                </p>
                            )}
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="bg-slate-950/60 p-5 sm:p-6 space-y-3">
                        <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
                            System Provisioning Status
                        </h3>

                        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                            <InfoBox
                                label="Employee ID"
                                value="Generated automatically"
                            />
                            <InfoBox
                                label="Role Assigned"
                                value="QA Tester"
                            />
                            <InfoBox
                                label="Account Status"
                                value="Active"
                            />
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && !(loadingManagers === false && managers.length === 0) && (
                        <div className="px-5 sm:px-6 pt-5">
                            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Success Banner */}
                    {message && (
                        <div className="px-5 sm:px-6 pt-5">
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-300">
                                {message}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 p-5 sm:p-6 bg-slate-950/40 border-t border-slate-800">
                        <Link
                            href="/admin"
                            className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                loadingManagers ||
                                managers.length === 0
                            }
                            className="rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-amber-600/30 transition"
                        >
                            {loading ? "Creating Tester..." : "Create Tester"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/* Info Box Component */
/* -------------------------------------------------------------------------- */

function InfoBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </p>
            <p className="text-xs font-semibold text-amber-300">
                {value}
            </p>
        </div>
    );
}