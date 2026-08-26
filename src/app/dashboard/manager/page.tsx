"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    Briefcase,
    Code2,
    ShieldCheck,
    MessageSquare,
    Plus,
    Users,
    Activity,
    Search,
    Loader2,
    LogOut,
    Trash2,
    Menu,
    X,
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import apiClient from "@/lib/apiClient";
import ConfirmModal from "@/components/ConfirmModal";
import { useDevelopers, Employee as Developer } from "@/hooks/useEmployees";

interface DevelopersResponse {
    success: boolean;
    developers?: Developer[];
    message?: string;
}

export default function ManagerDashboard() {
    return <ManagerDashboardContent />;
}

export function ManagerDashboardContent() {
    const { data: developers = [], isLoading: loading } = useDevelopers();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Confirm Modal state
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
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

            {/* Mobile Backdrop */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile Drawer) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:flex lg:translate-x-0 ${
                    mobileSidebarOpen ? "flex translate-x-0" : "hidden lg:flex -translate-x-full"
                }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30">
                            <Briefcase size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base">ManagerHub</h2>
                            <p className="text-[11px] text-slate-400">Team Leader Control</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-1 text-slate-400 hover:text-white lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Overview</p>
                        <Link
                            href="/dashboard/manager"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="flex items-center gap-3 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
                        >
                            <Activity size={16} />
                            Manager Dashboard
                        </Link>
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Team Management</p>
                        <div className="space-y-1">
                            <Link
                                href="/dashboard/manager/developers"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Code2 size={16} />
                                My Developers
                            </Link>
                            <Link
                                href="/dashboard/manager/testers"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <ShieldCheck size={16} />
                                QA Testers
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Tasks & Assignments</p>
                        <div className="space-y-1">
                            <Link
                                href="/dashboard/manager/createtask"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Plus size={16} />
                                Assign New Task
                            </Link>
                            <Link
                                href="/dashboard/manager/tasks"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Briefcase size={16} />
                                Team Tasks Overview
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Communication</p>
                        <Link
                            href="/dashboard/manager/messages"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        >
                            <MessageSquare size={16} />
                            Team Workspace Chat
                        </Link>
                    </div>
                </nav>

                <div className="border-t border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-xs">
                            MGR
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">Team Manager</p>
                            <p className="text-[10px] text-slate-400">Department Leader</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-600 hover:text-white transition"
                    >
                        <LogOut size={14} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 backdrop-blur lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white lg:hidden"
                            title="Toggle Navigation"
                        >
                            <Menu size={18} />
                        </button>
                        <div>
                            <p className="text-xs text-slate-400 hidden sm:block">Manager Operations Portal</p>
                            <h1 className="text-base sm:text-lg font-bold text-white">Manager Dashboard</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationCenter currentUserId="manager_id" />

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition"
                        >
                            <LogOut size={14} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Body Content */}
                <main className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                                Team Leadership
                            </span>
                            <h2 className="text-2xl font-bold text-white">Welcome back, Manager 👋</h2>
                            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                                Manage developers and QA testers, assign sprint tasks, delete developer accounts if needed, and collaborate via Team Chat.
                            </p>
                        </div>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <p className="text-xs font-medium text-slate-400">Total Developers</p>
                            <p className="text-2xl font-bold text-white">{loading ? "..." : developers.length}</p>
                            <p className="text-[10px] text-slate-500">Assigned developers</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <p className="text-xs font-medium text-slate-400">Active Developers</p>
                            <p className="text-2xl font-bold text-emerald-400">{loading ? "..." : activeDevelopers.length}</p>
                            <p className="text-[10px] text-slate-500">Currently active</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <p className="text-xs font-medium text-slate-400">Inactive Developers</p>
                            <p className="text-2xl font-bold text-amber-400">{loading ? "..." : inactiveDevelopers.length}</p>
                            <p className="text-[10px] text-slate-500">Currently inactive</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <p className="text-xs font-medium text-slate-400">Team Workspace</p>
                            <p className="text-2xl font-bold text-indigo-400">Live</p>
                            <p className="text-[10px] text-slate-500">Real-time messaging active</p>
                        </div>
                    </div>

                    {/* Developer Directory Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Users size={18} className="text-blue-400" />
                                    Assigned Developer Team & Controls
                                </h3>
                                <p className="text-xs text-slate-400">Software engineers assigned under your management.</p>
                            </div>

                            <div className="relative w-full sm:w-72">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search developers..."
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                            {loading ? (
                                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                                    Loading developers...
                                </div>
                            ) : filteredDevelopers.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">No developers found.</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {filteredDevelopers.map((dev) => (
                                        <div
                                            key={dev._id}
                                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-800/40"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 shrink-0">
                                                    {dev.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-white text-sm">{dev.name}</h4>
                                                        <span
                                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                                dev.isActive
                                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                            }`}
                                                        >
                                                            {dev.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        <strong className="text-slate-300">{dev.employeeId}</strong> • {dev.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link
                                                    href={`/dashboard/manager/messages?employeeId=${dev._id}`}
                                                    className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                                                >
                                                    Message
                                                </Link>
                                                <Link
                                                    href={`/dashboard/manager/createtask?employeeId=${dev._id}`}
                                                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
                                                >
                                                    Assign Task
                                                </Link>
                                                <button
                                                    disabled={deletingId === dev._id}
                                                    onClick={() => setDeleteTarget({ id: dev._id, name: dev.name })}
                                                    className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition disabled:opacity-50 inline-flex items-center gap-1 text-xs font-semibold"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}