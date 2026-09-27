"use client";

import { FormEvent, useState } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function ResetPasswordPage() {
    const router = useRouter();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (newPassword.length < 8) {
            setError("New password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (oldPassword === newPassword) {
            setError("New password must be different from your old password.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "/API/auth/resetpassword",
                {
                    oldPassword,
                    newPassword,
                },
                {
                    withCredentials: true,
                }
            );

            if (!response.data.success && !response.data.ok) {
                throw new Error(response.data.message || "Failed to change password.");
            }

            setMessage("Password changed successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                router.push("/auth/login");
            }, 1200);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to reset password.");
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center px-4 py-12">
            <section className="flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                            <Lock size={28} />
                        </div>
                    </div>

                    <div className="mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Change Password
                        </h1>
                        <p className="mt-1.5 text-xs text-slate-500">
                            Update your login credentials securely
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl sm:p-9">
                        {error && (
                            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3.5 pr-10 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    New Password (min. 8 characters)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3.5 pr-10 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3.5 pr-10 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
                            >
                                {loading ? "Updating password..." : "Update Password"}
                            </button>
                        </form>

                        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
                            >
                                <ArrowLeft size={14} />
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}