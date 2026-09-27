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
import Link from "next/link";

function VerifyOTPContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!email) {
            setError("Email is missing.");
            return;
        }

        if (otp.length < 4) {
            setError("Please enter your verification code.");
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
                throw new Error(response.data.message || "Invalid OTP.");
            }

            setMessage(response.data.message || "Verification successful!");

            // Redirect to login
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Invalid verification code.");
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Something went wrong.");
            }
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
            const response = await fetch("/API/auth/resendotp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to resend OTP.");
            }

            setMessage("A new verification code has been sent to your email.");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to resend code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center px-4 py-12">
            <section className="flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                            <Mail size={28} />
                        </div>
                    </div>

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Verify your email
                        </h2>

                        <p className="mt-1.5 text-xs text-slate-500">
                            We've sent a verification code to
                        </p>

                        <p className="mt-1 break-all text-xs font-semibold text-indigo-600">
                            {email || "your email address"}
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

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="otp"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Verification Code
                                </label>

                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        setOtp(value);
                                        setError("");
                                    }}
                                    placeholder="000000"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                                />

                                <p className="mt-2 text-center text-[11px] text-slate-400">
                                    Check your inbox or spam folder.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 4}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    "Verifying code..."
                                ) : (
                                    <>
                                        Confirm & Complete Setup
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Didn't receive code?</span>
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resending}
                                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 transition disabled:opacity-50"
                            >
                                <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
                                Resend Code
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/login"
                            className="text-xs text-slate-500 hover:text-indigo-600 hover:underline"
                        >
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading verification...
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    );
}