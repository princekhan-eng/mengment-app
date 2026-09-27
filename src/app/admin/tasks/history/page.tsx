"use client";

import React, { Suspense, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, History, Clock, Loader2, CheckCircle2, Shield } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useAllTasks } from "@/hooks/useTasks";

function AdminTasksHistoryContent() {
    const { data: rawTasks = [], isLoading: loading } = useAllTasks();

    const tasks = useMemo(() => {
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const item of rawTasks) {
            const key = item._id || item.taskId || JSON.stringify(item);
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        }
        return deduped;
    }, [rawTasks]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-xs">
                        <History size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Company Task History & Logs
                            <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-full">
                                Audit Trail
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500">
                            Historical lifecycle record of all team tasks and assignments
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin/tasks"
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline px-2 py-1"
                >
                    Active Tasks →
                </Link>
            </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Task Log Timeline</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {tasks.length} total historical entries recorded
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
                            <p className="font-semibold text-slate-700 text-sm">Loading task history...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                            <History size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="font-semibold text-slate-700 text-sm">No task history found</p>
                            <p className="text-xs text-slate-400 mt-1">Logs will appear as tasks are created and updated.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {tasks.map((task: any) => (
                                <div key={task._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900 text-sm">{task.title}</h3>
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                #{task.taskId || "TASK"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{task.description || "No description provided."}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                                            <span>Assignee: <strong className="text-slate-700">{task.developer?.name || task.assignedTo?.name || "Unassigned"}</strong></span>
                                            <span>•</span>
                                            <span>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "N/A"}</span>
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

export default function AdminTasksHistoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading task history...
            </div>
        }>
            <AdminTasksHistoryContent />
        </Suspense>
    );
}
