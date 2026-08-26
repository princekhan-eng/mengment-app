"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title = "Confirm Action",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 relative transform transition-all scale-100">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                    <X size={18} />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                            type === "danger"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                    >
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">{title}</h3>
                        <p className="text-xs text-slate-400">Please review before proceeding</p>
                    </div>
                </div>

                {/* Body Message */}
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-800/60 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition ${
                            type === "danger"
                                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
