"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import {
    Shield,
    Users,
    UserPlus,
    Activity,
    Briefcase,
    MessageSquare,
    Search,
    Loader2,
    LogOut,
    Trash2,
    Eye,
    RefreshCw,
    Filter,
    X,
    BadgeCheck,
    Calendar,
    Mail,
    UserCheck,
    UserX,
    Building2,
    Layers,
    Clock,
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import ConfirmModal from "@/components/ConfirmModal";

interface BaseEmployee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    isActive: boolean;
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    managerEmplyId?: string;
    managerId?: string;
}

export type EmployeeRole = "manager" | "developer" | "tester";

export interface EmployeeWithRole extends BaseEmployee {
    role: EmployeeRole;
}

export default function AllEmployeesPage() {
    const [managers, setManagers] = useState<BaseEmployee[]>([]);
    const [developers, setDevelopers] = useState<BaseEmployee[]>([]);
    const [testers, setTesters] = useState<BaseEmployee[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"all" | EmployeeRole>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    // Modal state for view details
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRole | null>(null);

    // Confirm modal state for deletion
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        role: EmployeeRole;
        name: string;
        employeeId: string;
    } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError("");

            const [mgrRes, devRes, tstRes] = await Promise.all([
                apiClient.get("/API/getemply/manager").catch((err) => {
                    console.error("Fetch managers error:", err);
                    return { data: { managers: [] } };
                }),
                apiClient.get("/API/getemply/developer").catch((err) => {
                    console.error("Fetch developers error:", err);
                    return { data: { developers: [] } };
                }),
                apiClient.get("/API/getemply/tester").catch((err) => {
                    console.error("Fetch testers error:", err);
                    return { data: { testers: [] } };
                }),
            ]);

            const normalize = (data: any): BaseEmployee[] => {
                if (!data) return [];
                if (Array.isArray(data)) {
                    return data.flat();
                }
                return [];
            };

            const mgrList = normalize(mgrRes.data?.managers);
            const devList = normalize(devRes.data?.developers);
            const tstList = normalize(tstRes.data?.testers);

            setManagers(mgrList);
            setDevelopers(devList);
            setTesters(tstList);
        } catch (err: any) {
            console.error("Failed to load employee list:", err);
            setError("Failed to load employees. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await apiClient.post("/API/auth/logout");
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            window.location.href = "/auth/login";
        }
    };

    const confirmDeleteEmployee = async () => {
        if (!deleteTarget) return;
        const { id, role } = deleteTarget;
        try {
            setDeletingId(id);
            let url = `/API/getemply/developer/${id}`;
            if (role === "manager") url = `/API/manager/${id}`;
            if (role === "tester") url = `/API/tester/${id}`;

            const res = await apiClient.delete(url);
            if (res.data && res.data.success) {
                if (role === "manager") {
                    setManagers((prev) => prev.filter((m) => m._id !== id));
                } else if (role === "developer") {
                    setDevelopers((prev) => prev.filter((d) => d._id !== id));
                } else if (role === "tester") {
                    setTesters((prev) => prev.filter((t) => t._id !== id));
                }

                if (selectedEmployee && selectedEmployee._id === id) {
                    setSelectedEmployee(null);
                }
            } else {
                setError(res.data?.message || "Failed to delete employee.");
            }
        } catch (err: any) {
            console.error("Delete employee error:", err);
            setError(err.response?.data?.message || "Failed to delete employee.");
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const allEmployees: EmployeeWithRole[] = [
        ...managers.map((m) => ({ ...m, role: "manager" as const })),
        ...developers.map((d) => ({ ...d, role: "developer" as const })),
        ...testers.map((t) => ({ ...t, role: "tester" as const })),
    ].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const filteredEmployees = allEmployees.filter((emp) => {
        // Tab role filter
        if (activeTab !== "all" && emp.role !== activeTab) {
            return false;
        }
        // Status filter
        if (statusFilter === "active" && !emp.isActive) return false;
        if (statusFilter === "inactive" && emp.isActive) return false;

        // Text query search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const nameMatch = emp.name?.toLowerCase().includes(query);
            const emailMatch = emp.email?.toLowerCase().includes(query);
            const idMatch = emp.employeeId?.toLowerCase().includes(query);
            const roleMatch = emp.role.toLowerCase().includes(query);
            return nameMatch || emailMatch || idMatch || roleMatch;
        }

        return true;
    });

    const activeCount = allEmployees.filter((e) => e.isActive).length;
    const inactiveCount = allEmployees.length - activeCount;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title={`Delete ${deleteTarget?.role ? deleteTarget.role.toUpperCase() : "Employee"}`}
                message={`Are you sure you want to permanently delete ${deleteTarget?.name || "this employee"} (${deleteTarget?.employeeId})? This action cannot be undone.`}
                confirmText="Delete Employee"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDeleteEmployee}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Employee Details Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6 relative transform transition-all">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedEmployee(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 font-bold text-xl border border-rose-500/20 shadow-lg shadow-rose-500/10">
                                {selectedEmployee.name?.charAt(0).toUpperCase() || "E"}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-white">{selectedEmployee.name}</h3>
                                    {selectedEmployee.isVerified && (
                                        <BadgeCheck className="text-blue-400" size={18} />
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <Mail size={12} className="text-slate-500" />
                                    {selectedEmployee.email}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Employee ID</span>
                                <p className="text-sm font-semibold text-white font-mono">{selectedEmployee.employeeId}</p>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Role</span>
                                <div>
                                    <RoleBadge role={selectedEmployee.role} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Account Status</span>
                                <div>
                                    <StatusBadge isActive={selectedEmployee.isActive} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Joining Date</span>
                                <p className="text-xs font-medium text-slate-300 flex items-center gap-1 mt-0.5">
                                    <Calendar size={13} className="text-slate-400" />
                                    {selectedEmployee.createdAt
                                        ? new Date(selectedEmployee.createdAt).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        {(selectedEmployee.managerEmplyId || selectedEmployee.managerId) && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Manager Reference</span>
                                <p className="text-xs font-mono text-slate-300">
                                    {selectedEmployee.managerEmplyId || selectedEmployee.managerId}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            <button
                                onClick={() => {
                                    const target = {
                                        id: selectedEmployee._id,
                                        role: selectedEmployee.role,
                                        name: selectedEmployee.name,
                                        employeeId: selectedEmployee.employeeId,
                                    };
                                    setSelectedEmployee(null);
                                    setDeleteTarget(target);
                                }}
                                className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition"
                            >
                                <Trash2 size={15} />
                                Delete Employee
                            </button>

                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="rounded-xl border border-slate-800 bg-slate-800/80 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-900 fixed inset-y-0 z-30">
                <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-base">AdminHub</h2>
                        <p className="text-[11px] text-slate-400">System Admin Control</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Overview</p>
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
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
                                className="flex items-center gap-3 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30"
                            >
                                <Users size={16} />
                                All Employees
                            </Link>
                            <Link
                                href="/admin/createmanager"
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <UserPlus size={16} />
                                Create Manager
                            </Link>
                            <Link
                                href="/admin/createdeveloper"
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <UserPlus size={16} />
                                Create Developer
                            </Link>
                            <Link
                                href="/admin/createtester"
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
                                href="/admin/tasks"
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Briefcase size={16} />
                                Global Tasks Overview
                            </Link>
                            <Link
                                href="/admin/messages"
                                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <MessageSquare size={16} />
                                Team Broadcasts
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-xs shadow-md">
                                AD
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">Administrator</p>
                                <p className="text-[10px] text-slate-400 truncate">System Root</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-xl">
                    <div>
                        <p className="text-xs font-medium text-slate-400">Employee Directory</p>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="text-rose-500" size={20} />
                            All Company Employees
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchEmployees}
                            disabled={loading}
                            title="Refresh Data"
                            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin text-rose-500" : ""} />
                            <span className="hidden sm:inline">Refresh Directory</span>
                        </button>
                        <NotificationCenter currentUserId="admin_id" />
                    </div>
                </header>

                <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between text-rose-400 text-xs font-medium">
                            <div className="flex items-center gap-2">
                                <X size={16} />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={fetchEmployees}
                                className="underline hover:text-rose-300 font-semibold ml-4"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Stat Cards Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Employees"
                            count={allEmployees.length}
                            icon={<Users className="text-rose-500" size={20} />}
                            subtitle={`${activeCount} Active • ${inactiveCount} Inactive`}
                            active={activeTab === "all"}
                            onClick={() => setActiveTab("all")}
                        />
                        <StatCard
                            title="Managers"
                            count={managers.length}
                            icon={<Building2 className="text-purple-400" size={20} />}
                            subtitle="Executive & Project Leads"
                            active={activeTab === "manager"}
                            onClick={() => setActiveTab("manager")}
                        />
                        <StatCard
                            title="Developers"
                            count={developers.length}
                            icon={<Layers className="text-blue-400" size={20} />}
                            subtitle="Frontend, Backend & Systems"
                            active={activeTab === "developer"}
                            onClick={() => setActiveTab("developer")}
                        />
                        <StatCard
                            title="Testers"
                            count={testers.length}
                            icon={<Shield className="text-amber-400" size={20} />}
                            subtitle="QA & Automated Testing"
                            active={activeTab === "tester"}
                            onClick={() => setActiveTab("tester")}
                        />
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
                        {/* Role Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <TabButton
                                label="All"
                                count={allEmployees.length}
                                active={activeTab === "all"}
                                onClick={() => setActiveTab("all")}
                            />
                            <TabButton
                                label="Managers"
                                count={managers.length}
                                active={activeTab === "manager"}
                                onClick={() => setActiveTab("manager")}
                            />
                            <TabButton
                                label="Developers"
                                count={developers.length}
                                active={activeTab === "developer"}
                                onClick={() => setActiveTab("developer")}
                            />
                            <TabButton
                                label="Testers"
                                count={testers.length}
                                active={activeTab === "tester"}
                                onClick={() => setActiveTab("tester")}
                            />
                        </div>

                        {/* Search & Status Filter */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 border border-slate-800 bg-slate-950 rounded-xl px-3 py-1.5 text-xs text-slate-400">
                                <Filter size={13} className="text-slate-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e: any) => setStatusFilter(e.target.value)}
                                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="all" className="bg-slate-900 text-white">All Status</option>
                                    <option value="active" className="bg-slate-900 text-white">Active Only</option>
                                    <option value="inactive" className="bg-slate-900 text-white">Inactive Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Employee Directory Table */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 px-6 py-4 gap-2">
                            <div>
                                <h3 className="font-bold text-white text-sm">
                                    {activeTab === "all"
                                        ? "All Employees List"
                                        : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List`}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Showing {filteredEmployees.length} of {allEmployees.length} total staff records
                                </p>
                            </div>

                            {/* Create Buttons Quick Links */}
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/admin/createmanager"
                                    className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-purple-400 hover:bg-purple-500/20 transition"
                                >
                                    + Manager
                                </Link>
                                <Link
                                    href="/admin/createdeveloper"
                                    className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/20 transition"
                                >
                                    + Developer
                                </Link>
                                <Link
                                    href="/admin/createtester"
                                    className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20 transition"
                                >
                                    + Tester
                                </Link>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                                <p className="text-xs font-medium">Fetching company staff records...</p>
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="p-16 text-center space-y-3">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500">
                                    <Users size={24} />
                                </div>
                                <h4 className="font-semibold text-white text-sm">No employees match criteria</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    {searchQuery
                                        ? `No results found for "${searchQuery}". Try clearing search keywords.`
                                        : "There are currently no registered staff members in this role view."}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="mt-2 text-xs font-semibold text-rose-400 hover:underline"
                                    >
                                        Clear Search Query
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[10px] font-bold text-slate-400">
                                            <th className="px-6 py-4">Employee ID</th>
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Joined Date</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {filteredEmployees.map((emp) => (
                                            <tr
                                                key={`${emp.role}-${emp._id}`}
                                                className="hover:bg-slate-800/40 transition group"
                                            >
                                                <td className="px-6 py-4 font-mono font-semibold text-slate-300">
                                                    {emp.employeeId || "N/A"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 font-bold text-white border border-slate-700 text-xs">
                                                            {emp.name?.charAt(0).toUpperCase() || "E"}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white group-hover:text-rose-400 transition">
                                                                {emp.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">
                                                    {emp.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <RoleBadge role={emp.role} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge isActive={emp.isActive} />
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">
                                                    {emp.createdAt
                                                        ? new Date(emp.createdAt).toLocaleDateString(undefined, {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                        : "N/A"}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedEmployee(emp)}
                                                            title="View Profile Details"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white transition"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteTarget({
                                                                    id: emp._id,
                                                                    role: emp.role,
                                                                    name: emp.name,
                                                                    employeeId: emp.employeeId,
                                                                })
                                                            }
                                                            disabled={deletingId === emp._id}
                                                            title="Delete Employee"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-50"
                                                        >
                                                            {deletingId === emp._id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents */
/* -------------------------------------------------------------------------- */

function StatCard({
    title,
    count,
    icon,
    subtitle,
    active,
    onClick,
}: {
    title: string;
    count: number;
    icon: React.ReactNode;
    subtitle: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-2xl border p-5 text-left transition backdrop-blur-xl ${
                active
                    ? "border-rose-500/50 bg-slate-900 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700"
            }`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{title}</span>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">{icon}</div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white tracking-tight">{count}</p>
            <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
        </button>
    );
}

function TabButton({
    label,
    count,
    active,
    onClick,
}: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                active
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
        >
            <span>{label}</span>
            <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                    active ? "bg-rose-700 text-white" : "bg-slate-800 text-slate-400"
                }`}
            >
                {count}
            </span>
        </button>
    );
}

function RoleBadge({ role }: { role: EmployeeRole }) {
    const styles =
        role === "manager"
            ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
            : role === "developer"
            ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-400";

    return (
        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles}`}>
            {role}
        </span>
    );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return isActive ? (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Inactive
        </span>
    );
}