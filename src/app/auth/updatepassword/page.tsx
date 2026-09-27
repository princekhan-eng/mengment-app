"use client";

import { FormEvent, useState, Suspense } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function UpdatePasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/API/auth/updatepassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to reset password.");
            }

            setMessage("Your password has been updated successfully.");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                router.push("/auth/login");
            }, 1200);
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Something went wrong."
            );
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
                            Create New Password
                        </h1>
                        <p className="mt-1.5 text-xs text-slate-500">
                            Enter and confirm your new secure account password
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
                                    New Password (min. 8 characters)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3.5 pr-10 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                                {loading ? "Updating password..." : "Set New Password"}
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

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading password reset...
            </div>
        }>
            <UpdatePasswordContent />
        </Suspense>
    );
}