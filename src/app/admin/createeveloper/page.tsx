"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";

interface Manager {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
}

export default function CreateDeveloperPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        managerEmplyId: "",
    });

    const [managers, setManagers] = useState<Manager[]>([]);
    const [loadingManagers, setLoadingManagers] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [managerSearch, setManagerSearch] = useState("");
    const [showManagerDropdown, setShowManagerDropdown] = useState(false);

    /*
     * Get managers from database
     */
    useEffect(() => {
        const handleManagerSelect = async () => {
            try {
                const response = await apiClient.get(
                    "/API/getemply/manager"
                );

                const data = response.data;

                if (!response.data.success) {
                    throw new Error(
                        data.message || "Failed to load managers"
                    );
                }

                setManagers(data.managers || []);
            } catch (error) {
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to load managers."
                );
            } finally {
                setLoadingManagers(false);
            }
        };

        handleManagerSelect();
    }, []);

    const filteredManagers = useMemo(() => {
        const keyword = managerSearch.trim().toLowerCase();

        if (!keyword) return managers;

        return managers.filter((manager) =>
            manager.employeeId?.toLowerCase().includes(keyword) ||
            manager.name?.toLowerCase().includes(keyword) ||
            manager.email?.toLowerCase().includes(keyword)
        );
    }, [managers, managerSearch]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const handleManagerSelect = (manager: Manager) => {
        setForm((prev) => ({
            ...prev,
            managerEmplyId: manager.employeeId,
        }));

        setManagerSearch(
            `${manager.employeeId} — ${manager.name}`
        );

        setShowManagerDropdown(false);
    };

    useEffect(() => {
        const getManagers = async () => {
            try {
                const response = await apiClient.get(
                    "/API/getemply/manager"
                );

                const data = response.data;

                console.log("Manager API:", data);

                if (!data.success) {
                    throw new Error(
                        data.message || "Failed to load managers"
                    );
                }

                const managerList = Array.isArray(data.managers)
                    ? data.managers.flat()
                    : [];

                console.log("Manager List:", managerList);

                setManagers(managerList);
            } catch (error) {
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to load managers."
                );
            } finally {
                setLoadingManagers(false);
            }
        };

        getManagers();
    }, []);

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setMessage("");

        if (
            !form.name ||
            !form.email ||
            !form.password ||
            !form.confirmPassword ||
            !form.managerEmplyId
        ) {
            setMessage("Please fill all required fields.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setMessage(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/API/createemplys/createdeveloper",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        name: form.name.trim(),
                        email: form.email
                            .trim()
                            .toLowerCase(),
                        password: form.password,
                        managerEmplyId: form.managerEmplyId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to create developer"
                );
            }

            setMessage(
                `Developer ${data.developer?.employeeId || ""
                } created successfully.`
            );

            setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                managerEmplyId: "",
            });

            setManagerSearch("");
            setShowManagerDropdown(false);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
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
                            <Link href="/admin" className="hover:text-blue-400 transition">
                                Admin Dashboard
                            </Link>
                            <span>/</span>
                            <span className="text-slate-200">Developers</span>
                        </div>
                        <h1 className="mt-1 text-lg sm:text-xl font-bold text-white">
                            Create Developer
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
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                        Engineering Provisioning
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                        New Developer Account
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Create an internal developer account and assign the developer to a lead manager.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-0"
                >
                    {/* Account Information Header */}
                    <div className="border-b border-slate-800 p-5 sm:p-6 bg-slate-950/40">
                        <h3 className="font-bold text-white text-base">
                            Account Information
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            Enter the developer's company credentials.
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
                                placeholder="e.g. Ali Khan"
                                autoComplete="name"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                                placeholder="developer@company.com"
                                autoComplete="email"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="mt-1.5 text-[11px] text-slate-500">Minimum 6 characters.</p>
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
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Team Assignment */}
                    <div className="border-y border-slate-800 bg-slate-950/40 p-5 sm:p-6 space-y-4">
                        <div>
                            <h3 className="font-bold text-white text-base">
                                Team Assignment
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                                Select the lead manager responsible for assigning sprint tasks.
                            </p>
                        </div>

                        <div className="max-w-lg">
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Assigned Manager <span className="text-rose-500">*</span>
                            </label>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={managerSearch}
                                    onChange={(e) => {
                                        setManagerSearch(e.target.value);
                                        setShowManagerDropdown(true);
                                        if (form.managerEmplyId) {
                                            setForm((prev) => ({
                                                ...prev,
                                                managerEmplyId: "",
                                            }));
                                        }
                                    }}
                                    onFocus={() => setShowManagerDropdown(true)}
                                    placeholder={
                                        loadingManagers
                                            ? "Loading managers..."
                                            : "Search Employee ID, name or email..."
                                    }
                                    disabled={loadingManagers}
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                />

                                {showManagerDropdown && !loadingManagers && (
                                    <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
                                        {filteredManagers.length > 0 ? (
                                            filteredManagers.map((manager, index) => (
                                                <button
                                                    key={`${manager._id || manager.employeeId || manager.email}-${index}`}
                                                    type="button"
                                                    onClick={() => handleManagerSelect(manager)}
                                                    className="w-full border-b border-slate-800 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-800"
                                                >
                                                    <div className="font-semibold text-white text-xs">
                                                        ID: {manager.employeeId}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-indigo-400 font-semibold">
                                                        {manager.name}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] text-slate-400">
                                                        {manager.email}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-xs text-slate-400">
                                                No manager found matching query.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {form.managerEmplyId && (
                                <p className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
                                    ✓ Manager selected successfully.
                                </p>
                            )}

                            {!loadingManagers && managers.length === 0 && (
                                <p className="mt-2 text-xs text-amber-400 font-medium">
                                    No active managers available. Please create a manager first.
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
                                value="Developer"
                            />
                            <InfoBox
                                label="Account Status"
                                value="Active"
                            />
                        </div>
                    </div>

                    {/* Message Banner */}
                    {message && (
                        <div className="px-5 sm:px-6 pt-5">
                            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-semibold text-blue-400">
                                {message}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
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
                                managers.length === 0 ||
                                !form.managerEmplyId
                            }
                            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-blue-600/30 transition"
                        >
                            {loading ? "Creating Developer..." : "Create Developer"}
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
            <p className="text-xs font-semibold text-blue-300">
                {value}
            </p>
        </div>
    );
}