"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import axios from "axios";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    Search,
    RefreshCw,
    UserRound,
    XCircle,
    CalendarDays,
    Shield,
    Sparkles,
    Briefcase,
    Code,
    Bug,
    X,
} from "lucide-react";
import apiClient from "@/lib/apiClient";

interface TaskEmployee {
    _id?: string;
    name?: string;
    employeeId?: string;
    role?: "developer" | "tester" | string;
}

interface TaskManager {
    _id?: string;
    name?: string;
    employeeId?: string;
}

interface Task {
    _id: string;
    taskId: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in-progress" | "completed";
    dueDate?: string;
    createdAt: string;
    developer?: TaskEmployee;
    tester?: TaskEmployee;
    assignedTo?: TaskEmployee;
    manager?: TaskManager;
}

interface TasksResponse {
    success: boolean;
    message?: string;
    tasks: Task[];
}

type StatusFilter = "all" | Task["status"];
type PriorityFilter = "all" | Task["priority"];

const statusConfig = {
    pending: {
        label: "Pending",
        icon: Clock3,
        className: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
    },
    "in-progress": {
        label: "In Progress",
        icon: RefreshCw,
        className: "bg-blue-50 text-blue-700 border-blue-200/80",
        dot: "bg-blue-500",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
    },
};

const priorityConfig = {
    low: "bg-slate-100 text-slate-700 border-slate-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    urgent: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
};

function AdminTasksContent() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchTasks = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await axios.get<TasksResponse>("/API/admin/getalltask");

            if (response.data.success && Array.isArray(response.data.tasks)) {
                // Deduplicate tasks by unique _id or taskId
                const seen = new Set<string>();
                const deduped: Task[] = [];
                for (const t of response.data.tasks) {
                    const key = t._id || t.taskId || JSON.stringify(t);
                    if (!seen.has(key)) {
                        seen.add(key);
                        deduped.push(t);
                    }
                }
                setTasks(deduped);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error("Admin tasks fetch error:", error);
            setTasks([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const statistics = useMemo(() => {
        return {
            total: tasks.length,
            pending: tasks.filter((t) => t.status === "pending").length,
            inProgress: tasks.filter((t) => t.status === "in-progress").length,
            completed: tasks.filter((t) => t.status === "completed").length,
            urgent: tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length,
        };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const employee = task.assignedTo || task.developer || task.tester;

            const matchesSearch =
                !query ||
                task.taskId?.toLowerCase().includes(query) ||
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                employee?.name?.toLowerCase().includes(query) ||
                employee?.employeeId?.toLowerCase().includes(query);

            const matchesStatus = statusFilter === "all" || task.status === statusFilter;
            const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, search, statusFilter, priorityFilter]);

    const getEmployee = (task: Task) => {
        return task.assignedTo || task.developer || task.tester || null;
    };

    const getEmployeeRole = (task: Task) => {
        const employee = getEmployee(task);
        if (employee?.role) return employee.role;
        if (task.developer) return "developer";
        if (task.tester) return "tester";
        return "employee";
    };

    const formatDate = (date?: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <Loader2 size={36} className="animate-spin text-rose-600 mx-auto" />
                    <p className="mt-3 text-slate-700 font-semibold">Loading company tasks...</p>
                    <p className="text-xs text-slate-400 mt-1">Fetching latest team assignments</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header & Refresh Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="text-rose-600" size={22} />
                        Company Task Directory
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Track cross-department tasks, assignments, and milestones
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => fetchTasks(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900 transition shadow-xs disabled:opacity-60"
                    >
                        <RefreshCw size={14} className={refreshing ? "animate-spin text-rose-600" : "text-slate-500"} />
                        <span>Refresh Tasks</span>
                    </button>
                </div>
            </div>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <StatCard
                        title="Total Tasks"
                        value={statistics.total}
                        icon={<FileText size={20} className="text-slate-700" />}
                        badgeBg="bg-slate-100 border-slate-200"
                        accentColor="border-l-4 border-l-slate-400"
                    />
                    <StatCard
                        title="Pending"
                        value={statistics.pending}
                        icon={<Clock3 size={20} className="text-amber-600" />}
                        badgeBg="bg-amber-50 border-amber-200"
                        accentColor="border-l-4 border-l-amber-500"
                    />
                    <StatCard
                        title="In Progress"
                        value={statistics.inProgress}
                        icon={<RefreshCw size={20} className="text-blue-600" />}
                        badgeBg="bg-blue-50 border-blue-200"
                        accentColor="border-l-4 border-l-blue-500"
                    />
                    <StatCard
                        title="Completed"
                        value={statistics.completed}
                        icon={<CheckCircle2 size={20} className="text-emerald-600" />}
                        badgeBg="bg-emerald-50 border-emerald-200"
                        accentColor="border-l-4 border-l-emerald-500"
                    />
                    <StatCard
                        title="Urgent"
                        value={statistics.urgent}
                        icon={<AlertCircle size={20} className="text-rose-600" />}
                        badgeBg="bg-rose-50 border-rose-200"
                        accentColor="border-l-4 border-l-rose-500"
                    />
                </div>

                {/* Filters Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, ID, or employee name..."
                                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-slate-50/50 text-slate-900 transition"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs text-slate-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition cursor-pointer"
                        >
                            <option value="all">All Statuses ({tasks.length})</option>
                            <option value="pending">Pending ({statistics.pending})</option>
                            <option value="in-progress">In Progress ({statistics.inProgress})</option>
                            <option value="completed">Completed ({statistics.completed})</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs text-slate-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition cursor-pointer"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent Priority</option>
                        </select>
                    </div>
                </div>

                {/* Task List Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Task Overview</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
                            </p>
                        </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                                <XCircle size={24} />
                            </div>
                            <h3 className="font-semibold text-slate-800 text-sm">No tasks matched</h3>
                            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5">Task Info</th>
                                            <th className="px-5 py-3.5">Assigned To</th>
                                            <th className="px-5 py-3.5">Priority</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="px-5 py-3.5">Due Date</th>
                                            <th className="px-5 py-3.5">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {filteredTasks.map((task) => {
                                            const employee = getEmployee(task);
                                            const role = getEmployeeRole(task);
                                            const status = statusConfig[task.status] || statusConfig.pending;
                                            const StatusIcon = status.icon;

                                            return (
                                                <tr
                                                    key={task._id}
                                                    onClick={() => setSelectedTask(task)}
                                                    className="hover:bg-slate-50/70 cursor-pointer transition"
                                                >
                                                    <td className="px-5 py-4 max-w-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-slate-900 truncate">
                                                                {task.title}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                #{task.taskId}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                            {task.description || "No description provided"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                                                                <UserRound size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-800">
                                                                    {employee?.name || "Unassigned"}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 capitalize">
                                                                    {employee?.employeeId || "N/A"} • {role}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium border capitalize ${
                                                                priorityConfig[task.priority] || priorityConfig.medium
                                                            }`}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${status.className}`}
                                                        >
                                                            <StatusIcon size={12} />
                                                            {status.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-slate-600">
                                                        {formatDate(task.dueDate)}
                                                    </td>

                                                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                                                        {formatDate(task.createdAt)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile / Tablet Cards */}
                            <div className="lg:hidden divide-y divide-slate-100">
                                {filteredTasks.map((task) => {
                                    const employee = getEmployee(task);
                                    const role = getEmployeeRole(task);
                                    const status = statusConfig[task.status] || statusConfig.pending;
                                    const StatusIcon = status.icon;

                                    return (
                                        <div
                                            key={task._id}
                                            onClick={() => setSelectedTask(task)}
                                            className="p-4 hover:bg-slate-50/70 cursor-pointer space-y-2.5"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="font-semibold text-slate-900 text-sm">
                                                        {task.title}
                                                    </span>
                                                    <span className="ml-2 text-[10px] font-mono text-slate-400">
                                                        #{task.taskId}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.className}`}
                                                >
                                                    <StatusIcon size={10} />
                                                    {status.label}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {task.description || "No description"}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                                <span>Assignee: <strong className="text-slate-700">{employee?.name || "Unassigned"}</strong></span>
                                                <span className="capitalize">{task.priority}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setSelectedTask(null)}
                >
                    <div
                        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-mono text-slate-400">
                                    #{selectedTask.taskId}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                                    {selectedTask.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Description
                            </p>
                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                                {selectedTask.description || "No description provided."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                                <p className="text-slate-400 text-[11px]">Status</p>
                                <p className="font-semibold text-slate-800 capitalize mt-0.5">
                                    {statusConfig[selectedTask.status]?.label || selectedTask.status}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                                <p className="text-slate-400 text-[11px]">Priority</p>
                                <p className="font-semibold text-slate-800 capitalize mt-0.5">
                                    {selectedTask.priority}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                                <p className="text-slate-400 text-[11px]">Created</p>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                    {formatDate(selectedTask.createdAt)}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                                <p className="text-slate-400 text-[11px]">Due Date</p>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                    {formatDate(selectedTask.dueDate)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                                <UserRound size={16} />
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400">Assigned Employee</p>
                                <p className="font-semibold text-slate-900 text-xs">
                                    {getEmployee(selectedTask)?.name || "Unassigned"}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    {getEmployee(selectedTask)?.employeeId || "N/A"} • {getEmployeeRole(selectedTask)}
                                </p>
                            </div>
                        </div>

                        {selectedTask.manager && (
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                                    <Briefcase size={16} />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400">Assigned by Manager</p>
                                    <p className="font-semibold text-slate-900 text-xs">
                                        {selectedTask.manager.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        Manager ID: {selectedTask.manager.employeeId || "N/A"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 text-center">
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    badgeBg,
    accentColor,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    badgeBg: string;
    accentColor: string;
}) {
    return (
        <div className={`bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs ${accentColor}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${badgeBg}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function AdminTasksPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading tasks...
            </div>
        }>
            <AdminTasksContent />
        </Suspense>
    );
}
