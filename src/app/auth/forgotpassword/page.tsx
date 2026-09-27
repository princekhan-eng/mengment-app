"use client";

import { FormEvent, useState } from "react";
import {
    Mail,
    ArrowRight,
    ArrowLeft,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/API/auth/forgotpassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessage("If an account exists with this email, a password reset link has been sent.");
            router.push(`/auth/verfiy?email=${encodeURIComponent(email)}`);
            setEmail("");
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Something went wrong"
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
                            <LockKeyhole size={28} />
                        </div>
                    </div>

                    <div className="mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Forgot your password?
                        </h1>
                        <p className="mt-1.5 text-xs text-slate-500">
                            Enter your email address and we'll send you an OTP verification code.
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
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Work Email Address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
                            >
                                {loading ? (
                                    "Sending OTP..."
                                ) : (
                                    <>
                                        Send Reset Code
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
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

                    <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Secure identity verification
                    </div>
                </div>
            </section>
        </main>
    );
}