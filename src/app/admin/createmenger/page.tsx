"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import axios from "axios";

interface ManagerForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface CreateManagerResponse {
    success: boolean;
    message: string;
    manager?: {
        _id: string;
        employeeId: string;
        name: string;
        email: string;
        role: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt?: string;
    };
}

export default function CreateManagerPage() {
    const [form, setForm] = useState<ManagerForm>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear message when user starts editing
        setMessage("");
        setError(false);
    };

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setMessage("");
        setError(false);

        // =========================
        // Frontend validation
        // =========================

        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError(true);
            setMessage(
                "Please fill all required fields."
            );
            return;
        }

        if (form.name.trim().length < 2) {
            setError(true);
            setMessage(
                "Name must be at least 2 characters."
            );
            return;
        }

        if (form.password.length < 6) {
            setError(true);
            setMessage(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError(true);
            setMessage(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            // =========================
            // Axios API request
            // =========================

            const response =
                await apiClient.post<CreateManagerResponse>(
                    "/API/createemplys/createmenger",
                    {
                        name: form.name.trim(),
                        email: form.email
                            .trim()
                            .toLowerCase(),
                        password: form.password,
                    },
                    {
                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        // Send cookies
                        withCredentials: true,
                    }
                );

            const data = response.data;

            // =========================
            // Success
            // =========================

            if (data.success) {
                setError(false);

                setMessage(
                    `Manager created successfully. Employee ID: ${data.manager?.employeeId}`
                );

                // Reset form
                setForm({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            setError(true);

            // Axios error
            if (axios.isAxiosError(error)) {
                const apiMessage =
                    error.response?.data?.message;

                setMessage(
                    apiMessage ||
                    "Failed to create manager."
                );
            } else {
                setMessage(
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
                            <Link href="/admin" className="hover:text-indigo-400 transition">
                                Admin Dashboard
                            </Link>
                            <span>/</span>
                            <span className="text-slate-200">Managers</span>
                        </div>
                        <h1 className="mt-1 text-lg sm:text-xl font-bold text-white">
                            Create Manager
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
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                        Management Provisioning
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                        New Manager Account
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Create an executive manager account for team leadership and task assignment.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-0"
                >
                    {/* Account Header */}
                    <div className="border-b border-slate-800 p-5 sm:p-6 bg-slate-950/40">
                        <h3 className="font-bold text-white text-base">
                            Account Information
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            Enter the manager's company account details.
                        </p>
                    </div>

                    <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                        <Input
                            label="Full Name"
                            name="name"
                            placeholder="e.g. Muhammad Khan"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <Input
                            label="Company Email"
                            name="email"
                            type="email"
                            placeholder="manager@company.com"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <Input
                            label="Temporary Password"
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {/* System Information */}
                    <div className="border-y border-slate-800 bg-slate-950/60 p-5 sm:p-6 space-y-3">
                        <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
                            System Provisioning Status
                        </h3>

                        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                            <InfoBox
                                label="Employee ID"
                                value="8-digit ID auto-generated"
                            />
                            <InfoBox
                                label="Role Assigned"
                                value="Manager"
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
                                    error
                                        ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                }`}
                            >
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
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-indigo-600/30 transition"
                        >
                            {loading ? "Creating Manager..." : "Create Manager"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/* Input Component */
/* -------------------------------------------------------------------------- */

function Input({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    type?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">
                {label}
            </label>

            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* InfoBox Component */
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
            <p className="text-xs font-semibold text-indigo-300">
                {value}
            </p>
        </div>
    );
}