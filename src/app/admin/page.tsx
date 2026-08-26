"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Shield,
    Users,
    Briefcase,
    MessageSquare,
    UserPlus,
    Clock,
    Activity,
    Search,
    Loader2,
    LogOut,
    Trash2,
    Menu,
    X,
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import ConfirmModal from "@/components/ConfirmModal";

interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    role: "manager" | "developer" | "tester";
    isActive: boolean;
    createdAt: string;
}

export function AdminDashboardContent() {
    const { data: adminData, isLoading: loading } = useQuery({
        queryKey: ["admin", "dashboard"],
        queryFn: async () => {
            const [mgrRes, devRes, tstRes, taskRes] = await Promise.all([
                apiClient.get("/API/getemply/manager").catch(() => ({ data: { managers: [] } })),
                apiClient.get("/API/getemply/developer").catch(() => ({ data: { developers: [] } })),
                apiClient.get("/API/getemply/tester").catch(() => ({ data: { testers: [] } })),
                apiClient.get("/API/admin/getalltask").catch(() => ({ data: { tasks: [] } })),
            ]);

            const mgrList = Array.isArray(mgrRes.data.managers)
                ? mgrRes.data.managers.flat().map((m: any) => ({ ...m, role: "manager" }))
                : [];
            const devList = Array.isArray(devRes.data.developers)
                ? devRes.data.developers.flat().map((d: any) => ({ ...d, role: "developer" }))
                : [];
            const tstList = Array.isArray(tstRes.data.testers)
                ? tstRes.data.testers.flat().map((t: any) => ({ ...t, role: "tester" }))
                : [];

            return {
                managers: mgrList,
                developers: devList,
                testers: tstList,
                tasksCount: taskRes.data.tasks?.length || 0,
            };
        },
    });

    const managers = adminData?.managers || [];
    const developers = adminData?.developers || [];
    const testers = adminData?.testers || [];
    const tasksCount = adminData?.tasksCount || 0;

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "manager" | "developer" | "tester">("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Confirm Modal State
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; role: string; name: string } | null>(null);

    const handleLogout = async () => {
        try {
            await apiClient.post("/API/auth/logout");
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            window.location.href = "/auth/login";
        }
    };

    const queryClient = useQueryClient();

    const confirmDeleteEmployee = async () => {
        if (!deleteTarget) return;
        const { id, role } = deleteTarget;
        try {
            setDeletingId(id);
            let url = `/API/getemply/developer/${id}`;
            if (role === "manager") url = `/API/manager/${id}`;
            if (role === "tester") url = `/API/tester/${id}`;

            const res = await apiClient.delete(url);
            if (res.data.success) {
                queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
            }
        } catch (err) {
            console.error("Delete employee error:", err);
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const allEmployees: Employee[] = [...managers, ...developers, ...testers].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const filteredEmployees = allEmployees.filter(
        (emp) =>
            emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
            {/* Custom Confirm Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title={`Delete ${deleteTarget?.role ? deleteTarget.role.toUpperCase() : "Employee"}`}
                message={`Are you sure you want to permanently delete ${deleteTarget?.name || "this employee"} (${deleteTarget?.role}) from company database?`}
                confirmText="Yes, Delete Permanently"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDeleteEmployee}
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30">
                            <Shield size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base">AdminHub</h2>
                            <p className="text-[11px] text-slate-400">System Admin Control</p>
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
                            href="/admin"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="flex items-center gap-3 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30"
                        >
                            <Activity size={16} />
                            Dashboard Overview
                        </Link>
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Employee Management</p>
                        <div className="space-y-1">
                            <Link
                                href="/admin/employees"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Users size={16} />
                                All Employees
                            </Link>
                            <Link
                                href="/admin/createmanager"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <UserPlus size={16} />
                                Create Manager
                            </Link>
                            <Link
                                href="/admin/createdeveloper"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <UserPlus size={16} />
                                Create Developer
                            </Link>
                            <Link
                                href="/admin/createtester"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <UserPlus size={16} />
                                Create Tester
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Tasks & Logs</p>
                        <div className="space-y-1">
                            <Link
                                href="/admin/tasks/today"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Clock size={16} />
                                Today's Tasks
                            </Link>
                            <Link
                                href="/admin/tasks"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Briefcase size={16} />
                                All Company Tasks
                            </Link>
                            <Link
                                href="/admin/tasks/history"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Activity size={16} />
                                Task History
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Communication</p>
                        <Link
                            href="/admin/messages"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        >
                            <MessageSquare size={16} />
                            Team Messages
                        </Link>
                    </div>
                </nav>

                <div className="border-t border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 font-bold text-white text-xs">
                            ADM
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">Administrator</p>
                            <p className="text-[10px] text-slate-400">System Admin</p>
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
                            <p className="text-xs text-slate-400 hidden sm:block">System Admin Control Center</p>
                            <h1 className="text-base sm:text-lg font-bold text-white">Admin Dashboard</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationCenter currentUserId="admin_id" />

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
                <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
                                Root Admin Panel
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome back, Administrator 👋</h2>
                            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                                Control company accounts, assign leadership, delete accounts, monitor task progress, and communicate directly with managers, developers, and QA testers.
                            </p>
                        </div>
                    </div>

                    {/* Quick Employee Action Shortcuts (Prominent on Mobile & Desktop) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <UserPlus size={14} className="text-rose-400" />
                                Employee Creation & Quick Actions
                            </h3>
                            <Link href="/admin/employees" className="text-xs text-rose-400 hover:underline font-medium">
                                View All ({allEmployees.length}) →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Link
                                href="/admin/createmanager"
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-200 font-semibold text-xs transition shadow-md group"
                            >
                                <span className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold">
                                        +
                                    </div>
                                    Create Manager
                                </span>
                                <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                                    Add Manager
                                </span>
                            </Link>

                            <Link
                                href="/admin/createdeveloper"
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/40 text-blue-200 font-semibold text-xs transition shadow-md group"
                            >
                                <span className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center font-bold">
                                        +
                                    </div>
                                    Create Developer
                                </span>
                                <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition">
                                    Add Developer
                                </span>
                            </Link>

                            <Link
                                href="/admin/createtester"
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 font-semibold text-xs transition shadow-md group"
                            >
                                <span className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold">
                                        +
                                    </div>
                                    Create QA Tester
                                </span>
                                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-300 group-hover:bg-amber-600 group-hover:text-white transition">
                                    Add Tester
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Stat Metrics Grid (Compact & Perfectly Sized) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-5 shadow-lg space-y-1 sm:space-y-2">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">Total Employees</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">{loading ? "..." : allEmployees.length}</p>
                            <p className="text-[10px] text-slate-500 hidden sm:block">Across all roles</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-5 shadow-lg space-y-1 sm:space-y-2">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">Active Managers</p>
                            <p className="text-xl sm:text-2xl font-bold text-indigo-400">{loading ? "..." : managers.length}</p>
                            <p className="text-[10px] text-slate-500 hidden sm:block">Department leaders</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-5 shadow-lg space-y-1 sm:space-y-2">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">Developers</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-400">{loading ? "..." : developers.length}</p>
                            <p className="text-[10px] text-slate-500 hidden sm:block">Software engineers</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-5 shadow-lg space-y-1 sm:space-y-2">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">QA Testers</p>
                            <p className="text-xl sm:text-2xl font-bold text-amber-400">{loading ? "..." : testers.length}</p>
                            <p className="text-[10px] text-slate-500 hidden sm:block">Verification team</p>
                        </div>

                        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-5 shadow-lg space-y-1 sm:space-y-2">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">Total Tasks</p>
                            <p className="text-xl sm:text-2xl font-bold text-rose-400">{loading ? "..." : tasksCount}</p>
                            <p className="text-[10px] text-slate-500 hidden sm:block">Global tasks logged</p>
                        </div>
                    </div>

                    {/* Company Employees Directory */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Users size={18} className="text-blue-400" />
                                    Company Employees Directory
                                </h3>
                                <p className="text-xs text-slate-400">Manage, message, or remove employee accounts.</p>
                            </div>

                            <div className="relative w-full sm:w-72">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search name, email, ID..."
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                            {loading ? (
                                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-rose-500 mb-2" />
                                    Loading employees...
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">No employees found.</div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                    <th className="p-4">Employee ID</th>
                                                    <th className="p-4">Name</th>
                                                    <th className="p-4">Email</th>
                                                    <th className="p-4">Role</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800 text-xs">
                                                {filteredEmployees.map((emp) => (
                                                    <tr key={emp._id} className="hover:bg-slate-800/40 transition">
                                                        <td className="p-4 font-mono text-slate-300 font-semibold">{emp.employeeId || "N/A"}</td>
                                                        <td className="p-4 font-semibold text-white">{emp.name}</td>
                                                        <td className="p-4 text-slate-400">{emp.email}</td>
                                                        <td className="p-4">
                                                            <span
                                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                    emp.role === "manager"
                                                                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                                                        : emp.role === "developer"
                                                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                                }`}
                                                            >
                                                                {emp.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <Link
                                                                href={`/admin/messages?employeeId=${emp._id}`}
                                                                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 transition inline-block"
                                                            >
                                                                Message
                                                            </Link>

                                                            <button
                                                                disabled={deletingId === emp._id}
                                                                onClick={() => setDeleteTarget({ id: emp._id, role: emp.role, name: emp.name })}
                                                                className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition disabled:opacity-50 inline-flex items-center gap-1 font-semibold"
                                                            >
                                                                <Trash2 size={12} />
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards View */}
                                    <div className="md:hidden divide-y divide-slate-800">
                                        {filteredEmployees.map((emp) => (
                                            <div key={emp._id} className="p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-semibold text-white text-sm">{emp.name}</h4>
                                                        <p className="text-xs text-slate-400">{emp.email}</p>
                                                    </div>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                                            emp.role === "manager"
                                                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                                                : emp.role === "developer"
                                                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                        }`}
                                                    >
                                                        {emp.role}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                                                    <span className="font-mono text-slate-300 font-semibold">ID: {emp.employeeId || "N/A"}</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                                                    <Link
                                                        href={`/admin/messages?employeeId=${emp._id}`}
                                                        className="flex-1 text-center py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                                                    >
                                                        Message
                                                    </Link>

                                                    <button
                                                        disabled={deletingId === emp._id}
                                                        onClick={() => setDeleteTarget({ id: emp._id, role: emp.role, name: emp.name })}
                                                        className="flex-1 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 font-semibold text-xs"
                                                    >
                                                        <Trash2 size={13} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    return <AdminDashboardContent />;
}
