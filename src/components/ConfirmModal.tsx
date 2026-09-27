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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl space-y-5 relative transform transition-all scale-100">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                    <X size={18} />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                            type === "danger"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}
                    >
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">{title}</h3>
                        <p className="text-xs text-slate-500">Please review before proceeding</p>
                    </div>
                </div>

                {/* Body Message */}
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition ${
                            type === "danger"
                                ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/25"
                                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
