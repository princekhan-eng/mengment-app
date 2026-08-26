"use client";

import { FormEvent, useState } from "react";
import {
    Mail,
    ArrowRight,
    ArrowLeft,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";
import router from "next/router";

export default function ForgotPasswordPage() {
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
                throw new Error(
                    data.message || "Something went wrong"
                );
            }

            setMessage(
                "If an account exists with this email, a password reset link has been sent."
            );
            router.push(`/auth/verify?email=${encodeURIComponent(
                email
            )}`);
            setEmail("");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">



            {/* CONTENT */}
            <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10">

                <div className="w-full max-w-md">

                    {/* ICON */}
                    <div className="mb-6 flex justify-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <LockKeyhole size={30} />
                        </div>

                    </div>

                    {/* HEADING */}
                    <div className="mb-8 text-center">

                        <h1 className="text-3xl font-bold">
                            Forgot your password?
                        </h1>

                        <p className="mt-3 leading-6 text-slate-400">
                            Enter your email address and we'll send you
                            a secure link to reset your password.
                        </p>

                    </div>

                    {/* CARD */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-400">
                                {message}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* EMAIL */}
                            <div>

                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Email address
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />

                                </div>

                            </div>

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {loading ? (
                                    "Sending reset link..."
                                ) : (
                                    <>
                                        Send reset link

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

                            <a
                                href="/auth/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                            >
                                <ArrowLeft size={16} />
                                Back to login
                            </a>

                        </div>

                    </div>

                    {/* SECURITY */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">

                        <ShieldCheck size={14} />

                        Your password reset is handled securely.

                    </div>

                </div>

            </section>

        </main>
    );
}