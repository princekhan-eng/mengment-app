"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import axios from "axios";
import { ArrowLeft, Bug, Shield, CheckCircle2, AlertCircle } from "lucide-react";

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

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                setLoadingManagers(true);
                setError("");

                const response = await apiClient.get<ManagersResponse>("/API/getemply/manager");
                if (!response.data.success) {
                    throw new Error(response.data.message || "Failed to fetch managers");
                }

                const rawManagers: Manager[] = Array.isArray(response.data.managers)
                    ? response.data.managers.flat()
                    : [];

                // Deduplicate managers by unique ID
                const uniqueManagers = Array.from(
                    new Map(
                        rawManagers
                            .filter(Boolean)
                            .map((m) => [m._id || m.employeeId, m])
                    ).values()
                );

                setManagers(uniqueManagers);
            } catch (err: any) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || "Failed to load managers.");
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Something went wrong while loading managers.");
                }
            } finally {
                setLoadingManagers(false);
            }
        };

        fetchManagers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError("");
        setMessage("");
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.managerId) {
            setError("Please fill all required fields.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post("/API/createemplys/createtester", {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                managerId: form.managerId,
            });

            const data = response.data;
            setMessage(`Tester ${data.tester?.employeeId || ""} created successfully.`);
            setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                managerId: "",
            });
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to create tester.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="mb-6 sm:mb-8">
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                        <Bug size={12} />
                        QA & Verification Provisioning
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                        New Tester Account
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Create a QA testing account and assign them to a department lead manager.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-0"
                >
                    {/* Account Information */}
                    <div className="border-b border-slate-100 p-5 sm:p-6 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 text-base">
                            Account Information
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Enter the QA tester's company account credentials.
                        </p>
                    </div>

                    <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Full Name <span className="text-rose-600">*</span>
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Saad Khan"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 shadow-xs"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Company Email <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="tester@company.com"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 shadow-xs"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Temporary Password <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 shadow-xs"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Confirm Password <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Manager Assignment */}
                    <div className="border-y border-slate-100 bg-slate-50/50 p-5 sm:p-6 space-y-4">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">
                                Team Assignment
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Assign this QA tester to an executive manager.
                            </p>
                        </div>

                        <div className="max-w-lg">
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Assigned Manager <span className="text-rose-600">*</span>
                            </label>

                            <select
                                name="managerId"
                                value={form.managerId}
                                onChange={handleChange}
                                disabled={loadingManagers}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs font-medium"
                            >
                                <option value="" className="text-slate-400">
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
                                        className="text-slate-800"
                                    >
                                        {manager.employeeId} — {manager.name}
                                    </option>
                                ))}
                            </select>

                            {error && loadingManagers === false && managers.length === 0 && (
                                <p className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1">
                                    <AlertCircle size={13} />
                                    {error}
                                </p>
                            )}

                            {!loadingManagers && managers.length > 0 && (
                                <p className="mt-2 text-xs text-slate-500">
                                    {managers.length} manager{managers.length !== 1 ? "s" : ""} available
                                </p>
                            )}
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="bg-slate-50/60 p-5 sm:p-6 space-y-3">
                        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
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
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Success Banner */}
                    {message && (
                        <div className="px-5 sm:px-6 pt-5">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                                <CheckCircle2 size={14} />
                                {message}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 p-5 sm:p-6 bg-slate-50/40 border-t border-slate-100">
                        <Link
                            href="/admin"
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading || loadingManagers || managers.length === 0}
                            className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2.5 text-xs font-bold text-white hover:from-amber-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-amber-500/25 transition-all"
                        >
                            {loading ? "Creating Tester..." : "Create Tester"}
                        </button>
                    </div>
                </form>
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-1 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="text-xs font-bold text-amber-700">
                {value}
            </p>
        </div>
    );
}