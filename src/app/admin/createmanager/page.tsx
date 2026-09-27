"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import axios from "axios";
import { ArrowLeft, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setMessage("");
        setError(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        setError(false);

        if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
            setError(true);
            setMessage("Please fill all required fields.");
            return;
        }

        if (form.name.trim().length < 2) {
            setError(true);
            setMessage("Name must be at least 2 characters.");
            return;
        }

        if (form.password.length < 6) {
            setError(true);
            setMessage("Password must be at least 6 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError(true);
            setMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post<CreateManagerResponse>(
                "/API/createemplys/createmenger",
                {
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            const data = response.data;
            if (data.success) {
                setError(false);
                setMessage(`Manager created successfully. Employee ID: ${data.manager?.employeeId}`);
                setForm({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
            }
        } catch (err: any) {
            setError(true);
            if (axios.isAxiosError(err)) {
                setMessage(err.response?.data?.message || "Failed to create manager.");
            } else {
                setMessage("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="mb-6 sm:mb-8">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                        <UserCheck size={12} />
                        Management Provisioning
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                        New Manager Account
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Create an executive manager account for team leadership and task assignment.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-0"
                >
                    {/* Account Header */}
                    <div className="border-b border-slate-100 p-5 sm:p-6 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 text-base">
                            Account Information
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Enter the manager's company account credentials.
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
                    <div className="border-y border-slate-100 bg-slate-50/60 p-5 sm:p-6 space-y-3">
                        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
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
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-indigo-500/25 transition-all"
                        >
                            {loading ? "Creating Manager..." : "Create Manager"}
                        </button>
                    </div>
                </form>
        </div>
    );
}

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
            <label className="mb-2 block text-xs font-bold text-slate-700">
                {label}
            </label>

            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
            />
        </div>
    );
}

function InfoBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-1 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="text-xs font-bold text-indigo-700">
                {value}
            </p>
        </div>
    );
}
