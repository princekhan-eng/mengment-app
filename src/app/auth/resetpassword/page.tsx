"use client";

import { FormEvent, useState } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ResetPasswordPage() {
    const router = useRouter();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (newPassword.length < 8) {
            setError(
                "New password must contain at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (oldPassword === newPassword) {
            setError(
                "New password must be different from your old password."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "/APi/auth/resetpassword",
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        oldPassword,
                        newPassword,
                    }),
                }
            );



            if (!response.data.ok) {
                throw new Error(
                    response.data.message ||
                    "Failed to change password."
                );
            }

            setMessage(
                "Password changed successfully."
            );

            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Optional
            // router.push("/dashboard");

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

    return (
        <main className="min-h-screen bg-slate-950 text-white">



            {/* CONTENT */}
            <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10">

                <div className="w-full max-w-md">

                    {/* HEADER */}
                    <div className="mb-8 text-center">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <ShieldCheck size={30} />
                        </div>

                        <h2 className="text-3xl font-bold">
                            Change password
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Update your password to keep your
                            ManageHub account secure.
                        </p>

                    </div>

                    {/* CARD */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {/* ERROR */}
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-400">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {message && (
                            <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-400">
                                {message}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* OLD PASSWORD */}
                            <PasswordInput
                                id="oldPassword"
                                label="Current password"
                                placeholder="Enter current password"
                                value={oldPassword}
                                onChange={setOldPassword}
                                show={showOldPassword}
                                setShow={setShowOldPassword}
                            />

                            {/* NEW PASSWORD */}
                            <PasswordInput
                                id="newPassword"
                                label="New password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={setNewPassword}
                                show={showNewPassword}
                                setShow={setShowNewPassword}
                            />

                            {/* CONFIRM PASSWORD */}
                            <PasswordInput
                                id="confirmPassword"
                                label="Confirm new password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                show={showConfirmPassword}
                                setShow={setShowConfirmPassword}
                            />

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    "Updating password..."
                                ) : (
                                    <>
                                        Update password

                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>

                        </form>

                    </div>

                    {/* SECURITY */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">

                        <ShieldCheck size={14} />

                        Never share your password with anyone.

                    </div>

                </div>

            </section>

        </main>
    );
}


/* =========================
   PASSWORD INPUT
========================= */

function PasswordInput({
    id,
    label,
    placeholder,
    value,
    onChange,
    show,
    setShow,
}: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    setShow: (value: boolean) => void;
}) {
    return (
        <div>

            <label
                htmlFor={id}
                className="mb-2 block text-sm font-medium text-slate-300"
            >
                {label}
            </label>

            <div className="relative">

                <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                    id={id}
                    name={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    placeholder={placeholder}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                >
                    {show ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>

            </div>

        </div>
    );
}