"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import {
    Users,
    Activity,
    Search,
    Loader2,
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
    Shield,
} from "lucide-react";
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

    const rawAllEmployees: EmployeeWithRole[] = [
        ...managers.map((m) => ({ ...m, role: "manager" as const })),
        ...developers.map((d) => ({ ...d, role: "developer" as const })),
        ...testers.map((t) => ({ ...t, role: "tester" as const })),
    ];

    const allEmployees: EmployeeWithRole[] = Array.from(
        new Map(
            rawAllEmployees
                .filter(Boolean)
                .map((emp) => [emp._id || emp.employeeId || emp.email, emp])
        ).values()
    ).sort(
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
        <div className="space-y-6 max-w-7xl mx-auto w-full">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl space-y-6 relative transform transition-all">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedEmployee(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-bold text-xl shadow-md shadow-rose-500/25">
                                {selectedEmployee.name?.charAt(0).toUpperCase() || "E"}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-slate-900">{selectedEmployee.name}</h3>
                                    {selectedEmployee.isVerified && (
                                        <BadgeCheck className="text-blue-600" size={18} />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <Mail size={12} className="text-slate-400" />
                                    {selectedEmployee.email}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</span>
                                <p className="text-sm font-bold text-slate-800 font-mono">{selectedEmployee.employeeId}</p>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Role</span>
                                <div>
                                    <RoleBadge role={selectedEmployee.role} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Status</span>
                                <div>
                                    <StatusBadge isActive={selectedEmployee.isActive} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joining Date</span>
                                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
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
                            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Manager Reference</span>
                                <p className="text-xs font-mono font-semibold text-slate-700">
                                    {selectedEmployee.managerEmplyId || selectedEmployee.managerId}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
                                className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                            >
                                <Trash2 size={15} />
                                Delete Employee
                            </button>

                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Page Header / Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Users className="text-rose-600" size={22} />
                        Company Employees Directory
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage roles, accounts, and directory access for all team members
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={fetchEmployees}
                        disabled={loading}
                        title="Refresh Data"
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-rose-600" : ""} />
                        <span>Refresh Data</span>
                    </button>
                </div>
            </div>
                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center justify-between text-rose-700 text-xs font-medium">
                            <div className="flex items-center gap-2">
                                <X size={16} />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={fetchEmployees}
                                className="underline hover:text-rose-900 font-semibold ml-4"
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
                            icon={<Users className="text-rose-600" size={20} />}
                            subtitle={`${activeCount} Active • ${inactiveCount} Inactive`}
                            active={activeTab === "all"}
                            onClick={() => setActiveTab("all")}
                        />
                        <StatCard
                            title="Managers"
                            count={managers.length}
                            icon={<Building2 className="text-indigo-600" size={20} />}
                            subtitle="Executive & Project Leads"
                            active={activeTab === "manager"}
                            onClick={() => setActiveTab("manager")}
                        />
                        <StatCard
                            title="Developers"
                            count={developers.length}
                            icon={<Layers className="text-blue-600" size={20} />}
                            subtitle="Frontend, Backend & Systems"
                            active={activeTab === "developer"}
                            onClick={() => setActiveTab("developer")}
                        />
                        <StatCard
                            title="Testers"
                            count={testers.length}
                            icon={<Shield className="text-amber-600" size={20} />}
                            subtitle="QA & Automated Testing"
                            active={activeTab === "tester"}
                            onClick={() => setActiveTab("tester")}
                        />
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
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
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:outline-none transition shadow-xs"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs text-slate-600 shadow-xs">
                                <Filter size={13} className="text-slate-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e: any) => setStatusFilter(e.target.value)}
                                    className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Employee Directory Table */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-6 py-4 gap-2 bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {activeTab === "all"
                                        ? "All Employees List"
                                        : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List`}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Showing {filteredEmployees.length} of {allEmployees.length} total staff records
                                </p>
                            </div>

                            {/* Create Buttons Quick Links */}
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/admin/createmanager"
                                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-xs"
                                >
                                    + Manager
                                </Link>
                                <Link
                                    href="/admin/createdeveloper"
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
                                >
                                    + Developer
                                </Link>
                                <Link
                                    href="/admin/createtester"
                                    className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs"
                                >
                                    + Tester
                                </Link>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                                <p className="text-xs font-semibold">Fetching company staff records...</p>
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="p-16 text-center space-y-3">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <Users size={24} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">No employees match criteria</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    {searchQuery
                                        ? `No results found for "${searchQuery}". Try clearing search keywords.`
                                        : "There are currently no registered staff members in this role view."}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="mt-2 text-xs font-semibold text-rose-600 hover:underline"
                                    >
                                        Clear Search Query
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[10px] font-bold text-slate-500">
                                            <th className="px-6 py-4">Employee ID</th>
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Joined Date</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEmployees.map((emp) => (
                                            <tr
                                                key={`${emp.role}-${emp._id}`}
                                                className="hover:bg-slate-50/80 transition group"
                                            >
                                                <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                                                    {emp.employeeId || "N/A"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 border border-slate-200 text-xs">
                                                            {emp.name?.charAt(0).toUpperCase() || "E"}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 group-hover:text-rose-600 transition">
                                                                {emp.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    {emp.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <RoleBadge role={emp.role} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge isActive={emp.isActive} />
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-medium">
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
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 transition shadow-xs"
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
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition disabled:opacity-50 shadow-xs"
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
            className={`rounded-2xl border p-5 text-left transition shadow-xs ${
                active
                    ? "border-rose-300 bg-rose-50/60 shadow-md ring-2 ring-rose-500/20"
                    : "border-slate-200/80 bg-white hover:bg-slate-50/50 hover:border-slate-300"
            }`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{title}</span>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">{icon}</div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight">{count}</p>
            <p className="mt-1 text-[11px] text-slate-400 font-medium">{subtitle}</p>
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
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                active
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
            <span>{label}</span>
            <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active ? "bg-rose-700 text-white" : "bg-slate-100 text-slate-600"
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
            ? "border-indigo-200/80 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/10"
            : role === "developer"
            ? "border-blue-200/80 bg-blue-50 text-blue-700 ring-1 ring-blue-500/10"
            : "border-amber-200/80 bg-amber-50 text-amber-800 ring-1 ring-amber-500/10";

    return (
        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${styles}`}>
            {role}
        </span>
    );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return isActive ? (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-rose-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Inactive
        </span>
    );
}