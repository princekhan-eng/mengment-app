"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ShieldCheck,
    ArrowRight,
    Mail,
    RefreshCw,
} from "lucide-react";
import axios from "axios";

function VerifyOTPContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!email) {
            setError("Email is missing.");
            return;
        }

        if (otp.length !== 4) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "/API/auth/verfiy",
                {
                    email,
                    otp,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message || "Invalid OTP."
                );
            }

            setMessage(
                response.data.message
            );

            // Redirect to login
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError("");
        setMessage("");

        if (!email) {
            setError("Email is missing.");
            return;
        }

        setResending(true);

        try {
            const response = await fetch(
                "/API/auth/resendotp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to resend OTP."
                );
            }



            setMessage(
                "A new OTP has been sent to your email."
            );

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to resend OTP."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">



            {/* CONTENT */}
            <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10">

                <div className="w-full max-w-md">

                    {/* HEADER */}
                    <div className="mb-8 text-center">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <Mail size={30} />
                        </div>

                        <h2 className="text-3xl font-bold">
                            Verify your email
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            We've sent a 6-digit verification code
                            to
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-indigo-400">
                            {email || "your email"}
                        </p>

                    </div>

                    {/* CARD */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {/* ERROR */}
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {message && (
                            <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                                {message}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* OTP */}
                            <div>

                                <label
                                    htmlFor="otp"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Verification code
                                </label>

                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            );

                                        setOtp(value);
                                    }}
                                    placeholder="0000"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    Enter the 4-digit code from your email.
                                </p>

                            </div>

                            {/* VERIFY */}
                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    otp.length !== 4
                                }
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {loading ? (
                                    "Verifying..."
                                ) : (
                                    <>
                                        Verify email

                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* RESEND */}
                        <div className="mt-7 border-t border-slate-800 pt-6 text-center">

                            <p className="mb-3 text-sm text-slate-500">
                                Didn't receive the code?
                            </p>

                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resending}
                                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 transition hover:text-indigo-300 disabled:opacity-50"
                            >

                                <RefreshCw
                                    size={16}
                                    className={
                                        resending
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                {resending
                                    ? "Sending..."
                                    : "Resend OTP"}

                            </button>

                        </div>

                    </div>

                    {/* SECURITY */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">

                        <ShieldCheck size={14} />

                        Never share your verification code with anyone.

                    </div>

                </div>

            </section>

        </main>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}