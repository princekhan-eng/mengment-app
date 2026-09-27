"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    Users,
    Search,
    Loader2,
    Trash2,
    Sparkles,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import ConfirmModal from "@/components/ConfirmModal";
import { useDevelopers, Employee as Developer } from "@/hooks/useEmployees";

export default function ManagerDashboard() {
    return <ManagerDashboardContent />;
}

export function ManagerDashboardContent() {
    const { data: rawDevelopers = [], isLoading: loading } = useDevelopers();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Confirm Modal state
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // Ensure developers are completely deduplicated
    const developers = useMemo(() => {
        const seen = new Set<string>();
        const deduped: Developer[] = [];
        for (const dev of rawDevelopers) {
            const key = dev._id || dev.employeeId || dev.email;
            if (key && !seen.has(key)) {
                seen.add(key);
                deduped.push(dev);
            }
        }
        return deduped;
    }, [rawDevelopers]);

    const handleLogout = async () => {
        try {
            await apiClient.post("/API/auth/logout");
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            window.location.href = "/auth/login";
        }
    };

    const confirmDeleteDeveloper = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        try {
            setDeletingId(id);
            const res = await apiClient.delete(`/API/getemply/developer/${id}`);
            if (res.data.success) {
                queryClient.invalidateQueries({ queryKey: ["developers"] });
            }
        } catch (err) {
            console.error("Delete developer error:", err);
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const activeDevelopers = developers.filter((d) => d.isActive);
    const inactiveDevelopers = developers.filter((d) => !d.isActive);

    const filteredDevelopers = developers.filter(
        (dev) =>
            dev.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dev.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dev.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Developer Account"
                message={`Are you sure you want to delete ${deleteTarget?.name || "this developer"}? This action cannot be undone.`}
                confirmText="Delete Account"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDeleteDeveloper}
                onCancel={() => setDeleteTarget(null)}
            />

                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/50 p-6 shadow-xs relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                                Team Leadership
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back, Manager 👋</h2>
                            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                                Manage developers and QA testers, assign sprint tasks, manage developer accounts, and collaborate via real-time Team Chat.
                            </p>
                        </div>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <p className="text-xs font-semibold text-slate-500">Total Developers</p>
                            <p className="text-2xl font-bold text-slate-900">{loading ? "..." : developers.length}</p>
                            <p className="text-[10px] text-slate-400">Assigned developers</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <p className="text-xs font-semibold text-slate-500">Active Developers</p>
                            <p className="text-2xl font-bold text-emerald-600">{loading ? "..." : activeDevelopers.length}</p>
                            <p className="text-[10px] text-slate-400">Currently active</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <p className="text-xs font-semibold text-slate-500">Inactive Developers</p>
                            <p className="text-2xl font-bold text-amber-600">{loading ? "..." : inactiveDevelopers.length}</p>
                            <p className="text-[10px] text-slate-400">Currently inactive</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <p className="text-xs font-semibold text-slate-500">Team Workspace</p>
                            <p className="text-2xl font-bold text-indigo-600">Active</p>
                            <p className="text-[10px] text-slate-400">Real-time messaging active</p>
                        </div>
                    </div>

                    {/* Developer Directory Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Users size={18} className="text-blue-600" />
                                    Assigned Developer Team & Controls
                                </h3>
                                <p className="text-xs text-slate-500">Software engineers assigned under your management.</p>
                            </div>

                            <div className="relative w-full sm:w-72">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search developers..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                            {loading ? (
                                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                                    <p className="text-xs font-semibold">Loading developers...</p>
                                </div>
                            ) : filteredDevelopers.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-xs">No developers found.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredDevelopers.map((dev) => (
                                        <div
                                            key={dev._id}
                                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/70"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 shrink-0">
                                                    {dev.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-slate-900 text-sm">{dev.name}</h4>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                                dev.isActive
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                                            }`}
                                                        >
                                                            {dev.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        <strong className="text-slate-700">{dev.employeeId}</strong> • {dev.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link
                                                    href={`/dashboard/manager/messages?employeeId=${dev._id}`}
                                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-xs transition"
                                                >
                                                    Message
                                                </Link>
                                                <Link
                                                    href={`/dashboard/manager/createtask?employeeId=${dev._id}`}
                                                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
                                                >
                                                    Assign Task
                                                </Link>
                                                <button
                                                    disabled={deletingId === dev._id}
                                                    onClick={() => setDeleteTarget({ id: dev._id, name: dev.name })}
                                                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-50 inline-flex items-center gap-1 text-xs font-semibold shadow-xs"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
        </div>
    );
}