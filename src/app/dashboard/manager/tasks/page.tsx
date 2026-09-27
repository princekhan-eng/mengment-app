"use client";

import React, { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Briefcase,
    Search,
    Plus,
    CalendarDays,
    ChevronRight,
    Loader2,
    RefreshCw,
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useAllTasks } from "@/hooks/useTasks";

function ManagerTasksContent() {
    const { data: rawTasks = [], isLoading: loading } = useAllTasks();
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Deduplicate
    const tasks = useMemo(() => {
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const t of rawTasks) {
            const key = t._id || t.taskId;
            if (key && !seen.has(key)) {
                seen.add(key);
                deduped.push(t);
            }
        }
        return deduped;
    }, [rawTasks]);

    const filteredTasks = tasks.filter((task) => {
        const matchesStatus = filterStatus === "all" || task.status === filterStatus;
        const matchesSearch =
            task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (task.employeeId && task.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Assigned Team Tasks
                            <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                                {tasks.length} Total
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500">
                            Monitor developer and tester tasks assigned across your department
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/dashboard/manager/createtask"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs transition"
                    >
                        <Plus size={15} />
                        Assign New Task
                    </Link>
                </div>
            </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {[
                            { id: "all", label: "All Tasks" },
                            { id: "pending", label: "Pending" },
                            { id: "in-progress", label: "In Progress" },
                            { id: "completed", label: "Completed" },
                        ].map((st) => (
                            <button
                                key={st.id}
                                onClick={() => setFilterStatus(st.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs ${
                                    filterStatus === st.id
                                        ? "bg-indigo-600 text-white shadow-indigo-600/20"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    {loading ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                            <p className="text-xs font-semibold">Loading team tasks...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 text-xs">
                            No tasks found matching your filters.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                                >
                                    <div className="space-y-1 max-w-xl">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900 text-sm">
                                                {task.title}
                                            </h3>
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                #{task.taskId || "TASK"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {task.description || "No description provided."}
                                        </p>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                                            <span>Assignee: <strong className="text-slate-700">{task.developer?.name || task.assignedTo?.name || "Unassigned"}</strong></span>
                                            <span>•</span>
                                            <span className="capitalize">Role: <strong className="text-slate-700">{task.assignedToRole || "Developer"}</strong></span>
                                            {task.dueDate && (
                                                <>
                                                    <span>•</span>
                                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                            task.status === "completed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : task.status === "in-progress"
                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}>
                                            {task.status || "pending"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
        </div>
    );
}

export default function ManagerTasksPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading team tasks...
            </div>
        }>
            <ManagerTasksContent />
        </Suspense>
    );
}
