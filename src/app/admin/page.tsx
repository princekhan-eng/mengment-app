"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Users,
    MessageSquare,
    UserPlus,
    Activity,
    Search,
    Loader2,
    Trash2,
} from "lucide-react";
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

    const allEmployees: Employee[] = Array.from(
        new Map(
            [...managers, ...developers, ...testers]
                .filter(Boolean)
                .map((emp) => [emp._id || emp.employeeId || emp.email, emp])
        ).values()
    ).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const filteredEmployees = allEmployees.filter(
        (emp) =>
            emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
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
                    {/* Stat Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow space-y-1">
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Employees</p>
                            <p className="text-2xl font-black text-slate-900">{loading ? "..." : allEmployees.length}</p>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Across all departments</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow space-y-1">
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Active Managers</p>
                            <p className="text-2xl font-black text-indigo-600">{loading ? "..." : managers.length}</p>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Department leaders</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow space-y-1">
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Developers</p>
                            <p className="text-2xl font-black text-blue-600">{loading ? "..." : developers.length}</p>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Software engineers</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow space-y-1">
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">QA Testers</p>
                            <p className="text-2xl font-black text-amber-600">{loading ? "..." : testers.length}</p>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Verification team</p>
                        </div>

                        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow space-y-1">
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Tasks</p>
                            <p className="text-2xl font-black text-rose-600">{loading ? "..." : tasksCount}</p>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Company tasks logged</p>
                        </div>
                    </div>

                    {/* Company Employees Directory */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Users size={18} className="text-rose-600" />
                                    Company Employees Directory
                                </h3>
                            </div>

                            <div className="relative w-full sm:w-72">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search name, email, ID..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:outline-none transition shadow-xs"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                            {loading ? (
                                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
                                    Loading employees...
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="p-12 text-center text-slate-500 font-medium">No employees found.</div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="p-4">Employee ID</th>
                                                    <th className="p-4">Name</th>
                                                    <th className="p-4">Email</th>
                                                    <th className="p-4">Role</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs">
                                                {filteredEmployees.map((emp) => (
                                                    <tr key={emp._id} className="hover:bg-slate-50/80 transition">
                                                        <td className="p-4 font-mono text-slate-700 font-semibold">{emp.employeeId || "N/A"}</td>
                                                        <td className="p-4 font-bold text-slate-900">{emp.name}</td>
                                                        <td className="p-4 text-slate-600">{emp.email}</td>
                                                        <td className="p-4">
                                                            <span
                                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                    emp.role === "manager"
                                                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 ring-1 ring-indigo-500/10"
                                                                        : emp.role === "developer"
                                                                        ? "bg-blue-50 text-blue-700 border border-blue-200/80 ring-1 ring-blue-500/10"
                                                                        : "bg-amber-50 text-amber-700 border border-amber-200/80 ring-1 ring-amber-500/10"
                                                                }`}
                                                            >
                                                                {emp.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ring-1 ring-emerald-500/10">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <Link
                                                                href={`/admin/messages?employeeId=${emp._id}`}
                                                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition inline-block shadow-xs"
                                                            >
                                                                Message
                                                            </Link>

                                                            <button
                                                                disabled={deletingId === emp._id}
                                                                onClick={() => setDeleteTarget({ id: emp._id, role: emp.role, name: emp.name })}
                                                                className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition disabled:opacity-50 inline-flex items-center gap-1 font-semibold shadow-xs"
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
                                    <div className="md:hidden divide-y divide-slate-100">
                                        {filteredEmployees.map((emp) => (
                                            <div key={emp._id} className="p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                                                        <p className="text-xs text-slate-500">{emp.email}</p>
                                                    </div>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                                            emp.role === "manager"
                                                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 ring-1 ring-indigo-500/10"
                                                                : emp.role === "developer"
                                                                ? "bg-blue-50 text-blue-700 border border-blue-200/80 ring-1 ring-blue-500/10"
                                                                : "bg-amber-50 text-amber-700 border border-amber-200/80 ring-1 ring-amber-500/10"
                                                        }`}
                                                    >
                                                        {emp.role}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                                    <span className="font-mono text-slate-700 font-semibold">ID: {emp.employeeId || "N/A"}</span>
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ring-1 ring-emerald-500/10">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                                    <Link
                                                        href={`/admin/messages?employeeId=${emp._id}`}
                                                        className="flex-1 text-center py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                                                    >
                                                        Message
                                                    </Link>

                                                    <button
                                                        disabled={deletingId === emp._id}
                                                        onClick={() => setDeleteTarget({ id: emp._id, role: emp.role, name: emp.name })}
                                                        className="flex-1 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 font-semibold text-xs shadow-xs"
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
                    </div>
                
       
    );
    }


export default function AdminDashboardPage() {
    return <AdminDashboardContent />;
}
