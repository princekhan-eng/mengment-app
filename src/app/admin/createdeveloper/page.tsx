"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { ArrowLeft, Code2, Layers, CheckCircle2, AlertCircle } from "lucide-react";

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
    const [isError, setIsError] = useState(false);

    const [managerSearch, setManagerSearch] = useState("");
    const [showManagerDropdown, setShowManagerDropdown] = useState(false);

    // Single deduplicated effect to fetch managers
    useEffect(() => {
        const fetchManagers = async () => {
            try {
                setLoadingManagers(true);
                const response = await apiClient.get("/API/getemply/manager");
                const data = response.data;

                if (!data.success) {
                    throw new Error(data.message || "Failed to load managers");
                }

                const rawList: Manager[] = Array.isArray(data.managers) ? data.managers.flat() : [];
                // Deduplicate managers by unique ID
                const uniqueManagers = Array.from(
                    new Map(
                        rawList
                            .filter(Boolean)
                            .map((m) => [m._id || m.employeeId || m.email, m])
                    ).values()
                );

                setManagers(uniqueManagers);
            } catch (error) {
                setIsError(true);
                setMessage(
                    error instanceof Error ? error.message : "Failed to load managers."
                );
            } finally {
                setLoadingManagers(false);
            }
        };

        fetchManagers();
    }, []);

    const filteredManagers = useMemo(() => {
        const keyword = managerSearch.trim().toLowerCase();
        if (!keyword) return managers;

        return managers.filter(
            (manager) =>
                manager.employeeId?.toLowerCase().includes(keyword) ||
                manager.name?.toLowerCase().includes(keyword) ||
                manager.email?.toLowerCase().includes(keyword)
        );
    }, [managers, managerSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setMessage("");
        setIsError(false);
    };

    const handleManagerSelect = (manager: Manager) => {
        setForm((prev) => ({
            ...prev,
            managerEmplyId: manager.employeeId,
        }));
        setManagerSearch(`${manager.employeeId} — ${manager.name}`);
        setShowManagerDropdown(false);
        setMessage("");
        setIsError(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        setIsError(false);

        if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.managerEmplyId) {
            setIsError(true);
            setMessage("Please fill all required fields.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setIsError(true);
            setMessage("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setIsError(true);
            setMessage("Password must contain at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/API/createemplys/createdeveloper", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                    managerEmplyId: form.managerEmplyId,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to create developer");
            }

            setIsError(false);
            setMessage(`Developer created successfully. Employee ID: ${data.developer?.employeeId || ""}`);
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
            setIsError(true);
            setMessage(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="mb-6 sm:mb-8">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                        <Layers size={12} />
                        Engineering Provisioning
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                        New Developer Account
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Create an internal developer account and assign the developer to a lead manager.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-0"
                >
                    {/* Account Information Header */}
                    <div className="border-b border-slate-100 p-5 sm:p-6 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 text-base">
                            Account Information
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Enter the developer's company credentials.
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
                                placeholder="e.g. Ali Khan"
                                autoComplete="name"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-xs"
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
                                placeholder="developer@company.com"
                                autoComplete="email"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-xs"
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
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-xs"
                            />
                            <p className="mt-1.5 text-[11px] text-slate-400">Minimum 6 characters.</p>
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
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Team Assignment */}
                    <div className="border-y border-slate-100 bg-slate-50/50 p-5 sm:p-6 space-y-4">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">
                                Team Assignment
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Select the lead manager responsible for assigning sprint tasks.
                            </p>
                        </div>

                        <div className="max-w-lg">
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Assigned Manager <span className="text-rose-600">*</span>
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
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
                                />

                                {showManagerDropdown && !loadingManagers && (
                                    <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl divide-y divide-slate-100 animate-in fade-in duration-150">
                                        {filteredManagers.length > 0 ? (
                                            filteredManagers.map((manager, index) => (
                                                <button
                                                    key={`${manager._id || manager.employeeId || manager.email}-${index}`}
                                                    type="button"
                                                    onClick={() => handleManagerSelect(manager)}
                                                    className="w-full px-4 py-3 text-left transition hover:bg-slate-50 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-xs">
                                                            {manager.name}
                                                        </div>
                                                        <div className="mt-0.5 text-[11px] text-slate-500">
                                                            {manager.email}
                                                        </div>
                                                    </div>
                                                    <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                                                        ID: {manager.employeeId}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-xs text-slate-500">
                                                No manager found matching query.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {form.managerEmplyId && (
                                <p className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                    <CheckCircle2 size={13} />
                                    Manager selected successfully.
                                </p>
                            )}

                            {!loadingManagers && managers.length === 0 && (
                                <p className="mt-2 text-xs text-amber-700 font-semibold flex items-center gap-1">
                                    <AlertCircle size={13} />
                                    No active managers available. Please create a manager first.
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
                            <div
                                className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                                    isError
                                        ? "bg-rose-50 border border-rose-200 text-rose-700"
                                        : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                }`}
                            >
                                {message}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 p-5 sm:p-6 bg-slate-50/40 border-t border-slate-100">
                        <Link
                            href="/admin"
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading || loadingManagers || managers.length === 0 || !form.managerEmplyId}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-blue-500/25 transition-all"
                        >
                            {loading ? "Creating Developer..." : "Create Developer"}
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
            <p className="text-xs font-bold text-blue-700">
                {value}
            </p>
        </div>
    );
}
